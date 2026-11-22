const REPO = "laurentdonini-beep/les-chenes-de-l-aven";
const FILE = "src/_data/disponibilites.json";

exports.handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Connexion requise (Netlify Identity)." }) };
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { statusCode: 500, headers, body: JSON.stringify({ error: "GITHUB_TOKEN non configure sur Netlify." }) };

  const api = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
  const gh = async (method, url, body) => {
    const r = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "les-chenes-de-l-aven-bo"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const t = await r.text();
    if (!r.ok) throw new Error(t || r.status);
    return t ? JSON.parse(t) : null;
  };

  try {
    if (event.httpMethod === "GET") {
      const data = await gh("GET", api + "?ref=main");
      return { statusCode: 200, headers, body: JSON.stringify({ content: Buffer.from(data.content, "base64").toString("utf-8"), sha: data.sha }) };
    }
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!Array.isArray(body.reservations)) return { statusCode: 400, headers, body: JSON.stringify({ error: "Format invalide." }) };
      for (const r of body.reservations) {
        if (!r.chambre || !r.du || !r.au) return { statusCode: 400, headers, body: JSON.stringify({ error: "chambre/du/au requis." }) };
      }
      const cur = await gh("GET", api + "?ref=main");
      const content = JSON.stringify({ reservations: body.reservations }, null, 2) + "\n";
      await gh("PUT", api, {
        message: "Mise à jour des disponibilités (backoffice /bo)",
        content: Buffer.from(content).toString("base64"),
        sha: cur.sha,
        branch: "main"
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 405, headers, body: "" };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String((e && e.message) || e) }) };
  }
};
