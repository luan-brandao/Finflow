package com.finflow.userservice.config;

import com.finflow.userservice.security.JwtAuthenticationFilter;
import com.finflow.userservice.tdo.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(authorize -> authorize

                        // =========================
                        // ROTAS PÚBLICAS
                        // =========================

                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users"
                        )
                        .permitAll()

                        // =========================
                        // USUÁRIO LOGADO
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/me"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/me"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/users/me"
                        )
                        .authenticated()

                        // =========================
                        // ADMIN
                        // =========================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/*"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/*"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/users/admin/**"
                        )
                        .hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                )

                // =========================
                // TRATAMENTO DE 401 E 403
                // =========================

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint((request, response, authException) -> {

                            ErrorResponse error = new ErrorResponse(
                                    HttpServletResponse.SC_UNAUTHORIZED,
                                    "Autenticação necessária.",
                                    LocalDateTime.now(),
                                    request.getRequestURI()
                            );

                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                            objectMapper.writeValue(
                                    response.getOutputStream(),
                                    error
                            );
                        })

                        .accessDeniedHandler((request, response, accessDeniedException) -> {

                            ErrorResponse error = new ErrorResponse(
                                    HttpServletResponse.SC_FORBIDDEN,
                                    "Você não possui permissão para acessar este recurso.",
                                    LocalDateTime.now(),
                                    request.getRequestURI()
                            );

                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                            objectMapper.writeValue(
                                    response.getOutputStream(),
                                    error
                            );
                        })
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}