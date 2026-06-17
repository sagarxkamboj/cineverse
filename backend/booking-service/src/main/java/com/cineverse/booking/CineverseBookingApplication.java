package com.cineverse.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CineverseBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(CineverseBookingApplication.class, args);
    }
}
