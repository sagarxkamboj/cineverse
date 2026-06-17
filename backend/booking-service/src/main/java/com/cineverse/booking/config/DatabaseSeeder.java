package com.cineverse.booking.config;

import com.cineverse.booking.entity.Show;
import com.cineverse.booking.entity.Theatre;
import com.cineverse.booking.repository.ShowRepository;
import com.cineverse.booking.repository.TheatreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;

    public DatabaseSeeder(TheatreRepository theatreRepository, ShowRepository showRepository) {
        this.theatreRepository = theatreRepository;
        this.showRepository = showRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (theatreRepository.count() > 0) {
            System.out.println("Booking database already seeded.");
            return;
        }

        System.out.println("Seeding booking database...");

        // 1. Create Theatres
        List<Theatre> theatres = new ArrayList<>();
        
        Theatre t1 = new Theatre();
        t1.setName("IMAX Grand Dome");
        t1.setLocation("New York");
        t1.setOwnerId(2L); // User ID of Alice Owner (seeds user 2)
        theatres.add(theatreRepository.save(t1));

        Theatre t2 = new Theatre();
        t2.setName("Starlight Premium Cinema");
        t2.setLocation("Los Angeles");
        t2.setOwnerId(2L);
        theatres.add(theatreRepository.save(t2));

        // 2. Create Shows (For movies 1 to 4)
        LocalDateTime baseTime = LocalDateTime.now().withHour(12).withMinute(0).withSecond(0).withNano(0);
        
        for (long movieId = 1; movieId <= 4; movieId++) {
            // Show 1: Afternoon at IMAX Grand Dome
            Show s1 = new Show();
            s1.setMovieId(movieId);
            s1.setTheatreId(theatres.get(0).getId());
            s1.setShowTime(baseTime.plusDays(1).plusHours(2 * movieId));
            s1.setPrice(15.99);
            s1.setAvailableSeats(100);
            showRepository.save(s1);

            // Show 2: Night at Starlight Premium
            Show s2 = new Show();
            s2.setMovieId(movieId);
            s2.setTheatreId(theatres.get(1).getId());
            s2.setShowTime(baseTime.plusDays(1).plusHours(2 * movieId + 6));
            s2.setPrice(12.50);
            s2.setAvailableSeats(80);
            showRepository.save(s2);
        }

        System.out.println("Booking database seeding complete.");
    }
}
