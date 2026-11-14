package wtf.tulahack.kickstarter.composition.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.identify.api.Accounts;

import java.util.Map;

@Configuration
public class SecurityConfiguration {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain security(HttpSecurity http, ObjectMapper json, Accounts accounts)
            throws Exception {
        http.authorizeHttpRequests(
                access ->
                        access.requestMatchers(
                                        "/",
                                        "/index.html",
                                        "/app.js",
                                        "/style.css",
                                        "/favicon.ico",
                                        "/error",
                                        "/api/auth/csrf",
                                        "/api/auth/register")
                                .permitAll()
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/projects",
                                        "/api/projects/*",
                                        "/api/projects/*/updates",
                                        "/api/organizations",
                                        "/api/organizations/*",
                                        "/api/organizations/*/members",
                                        "/api/organizations/*/reviews")
                                .permitAll()
                                .anyRequest()
                                .authenticated());
        http.formLogin(
                login ->
                        login.loginProcessingUrl("/api/auth/login")
                                .usernameParameter("email")
                                .successHandler(
                                        (request, response, authentication) -> {
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE);
                                            json.writeValue(
                                                    response.getOutputStream(),
                                                    accounts.get(authentication.getName()));
                                        })
                                .failureHandler(
                                        (request, response, exception) -> {
                                            response.setStatus(401);
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE);
                                            json.writeValue(
                                                    response.getOutputStream(),
                                                    Map.of(
                                                            "code",
                                                            "INVALID_CREDENTIALS",
                                                            "message",
                                                            "Неверный email или пароль"));
                                        }));
        http.logout(
                logout ->
                        logout.logoutUrl("/api/auth/logout")
                                .logoutSuccessHandler(
                                        (request, response, authentication) ->
                                                response.setStatus(204)));
        http.exceptionHandling(
                errors ->
                        errors.authenticationEntryPoint(
                                        (request, response, exception) -> {
                                            response.setStatus(401);
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE);
                                            json.writeValue(
                                                    response.getOutputStream(),
                                                    Map.of(
                                                            "code",
                                                            "UNAUTHORIZED",
                                                            "message",
                                                            "Войдите в аккаунт"));
                                        })
                                .accessDeniedHandler(
                                        (request, response, exception) -> {
                                            response.setStatus(403);
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE);
                                            json.writeValue(
                                                    response.getOutputStream(),
                                                    Map.of(
                                                            "code",
                                                            "FORBIDDEN",
                                                            "message",
                                                            "Нет прав или неверный CSRF-токен"));
                                        }));
        http.requestCache(cache -> cache.disable());
        return http.build();
    }
}
