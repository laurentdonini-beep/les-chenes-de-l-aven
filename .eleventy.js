export default function (eleventyConfig) {
  eleventyConfig.addCollection("chambres", (collectionApi) =>
    collectionApi.getFilteredByGlob("_chambres/*.md").sort((a, b) => (a.data.ordre ?? 99) - (b.data.ordre ?? 99))
  );

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
}
