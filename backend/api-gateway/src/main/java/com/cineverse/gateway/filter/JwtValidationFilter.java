package com.cineverse.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtValidationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret:9a4f2c8d3b7a1e6f45c8a0b3f267d8b1d4e6f3c8a9d2b5f8e3a9c8b5f6v8a3d9}")
    private String secret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Bypass authentication for auth endpoints and public movie/theatre/shows endpoints
        if (path.startsWith("/auth/") || 
            (path.startsWith("/movies") && request.getMethod().name().equals("GET")) ||
            (path.startsWith("/shows") && request.getMethod().name().equals("GET")) ||
            (path.startsWith("/theatres") && request.getMethod().name().equals("GET")) ||
            (path.startsWith("/reviews") && request.getMethod().name().equals("GET"))) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "No JWT token found in request headers", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            SecretKey signingKey = Keys.hmacShaKeyFor(keyBytes);
            
            Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token);
        } catch (Exception e) {
            return onError(exchange, "Invalid JWT token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // High priority filter
    }
}
