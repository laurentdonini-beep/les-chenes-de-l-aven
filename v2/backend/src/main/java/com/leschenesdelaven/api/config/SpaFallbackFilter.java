package com.leschenesdelaven.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Fallback SPA : une navigation directe vers une route Angular (/chambres/pitchouline,
 * /bo, ...) est renvoyée vers /index.html pour laisser le routeur Angular décider.
 * On ne touche ni à /api/**, ni aux fichiers (chemin contenant un point), ni aux appels XHR.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class SpaFallbackFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean isApi = path.startsWith("/api/");
        boolean hasExtension = path.contains(".");
        boolean isGet = "GET".equalsIgnoreCase(request.getMethod());
        String accept = request.getHeader("Accept");
        boolean wantsHtml = accept != null && (accept.contains("text/html") || accept.contains("*/*"))
                && !"XMLHttpRequest".equals(request.getHeader("X-Requested-With"));

        if (isGet && !isApi && !hasExtension && wantsHtml) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }
        chain.doFilter(request, response);
    }
}
