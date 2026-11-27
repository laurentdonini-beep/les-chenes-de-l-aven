package com.leschenesdelaven.api.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

/**
 * Sécurité :
 * - /api/admin/** et /api/auth/me|logout exigent une session authentifiée
 * - /api/public/** et le front statique sont publics
 * - login par formulaire JSON (POST /api/auth/login) -> session + cookie JSESSIONID
 * - CSRF via cookie XSRF-TOKEN (lu automatiquement par le HttpClient d'Angular)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        // écrit le cookie XSRF-TOKEN dès le premier GET et expose le token brut :
                        // le HttpClient d'Angular renvoie ensuite ce cookie en en-tête X-XSRF-TOKEN
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler(csrfRepository)))
                .cors(cors -> cors.configurationSource(corsConfigurationSource(null)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, ex) -> res.setStatus(HttpServletResponse.SC_NO_CONTENT)))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password,
            PasswordEncoder encoder) {
        UserDetails admin = User.withUsername(email)
                .password(encoder.encode(password))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:4200}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split("\\s*,\\s*")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Handler CSRF pour SPA : expose le token brut en attribut de requête et réécrit
     * systématiquement le cookie XSRF-TOKEN dans la réponse, afin que le HttpClient
     * d'Angular (qui renvoie ce cookie en en-tête X-XSRF-TOKEN) soit accepté dès la
     * première requête.
     */
    static final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

        private final CsrfTokenRepository tokenRepository;

        SpaCsrfTokenRequestHandler(CsrfTokenRepository tokenRepository) {
            this.tokenRepository = tokenRepository;
        }

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response,
                           Supplier<CsrfToken> deferredCsrfToken) {
            CsrfToken token = deferredCsrfToken.get();
            this.tokenRepository.saveToken(token, request, response);
            request.setAttribute(CsrfToken.class.getName(), token);
            request.setAttribute(token.getParameterName(), token);
        }
    }
}
