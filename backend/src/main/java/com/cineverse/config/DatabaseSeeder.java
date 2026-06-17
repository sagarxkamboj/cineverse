package com.cineverse.config;

import com.cineverse.entity.*;
import com.cineverse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, MovieRepository movieRepository,
                          TheatreRepository theatreRepository, ShowRepository showRepository,
                          ReviewRepository reviewRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.theatreRepository = theatreRepository;
        this.showRepository = showRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded.");
            return;
        }

        System.out.println("Seeding database...");

        // 1. Create Users
        User user = new User();
        user.setName("John Doe");
        user.setEmail("user@cineverse.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(Role.USER);
        userRepository.save(user);

        User owner = new User();
        owner.setName("Alice Owner");
        owner.setEmail("owner@cineverse.com");
        owner.setPassword(passwordEncoder.encode("password"));
        owner.setRole(Role.THEATRE_OWNER);
        owner = userRepository.save(owner);

        User admin = new User();
        admin.setName("Admin Cineverse");
        admin.setEmail("admin@cineverse.com");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // 2. Create Movies
        List<Movie> movies = new ArrayList<>();
        
        Movie m1 = new Movie();
        m1.setTitle("Interstellar");
        m1.setDescription("When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.");
        m1.setGenre("Sci-Fi");
        m1.setDuration(169);
        m1.setRating(8.6);
        m1.setPosterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop");
        m1.setReleaseDate(LocalDate.of(2014, 11, 7));
        movies.add(movieRepository.save(m1));

        Movie m2 = new Movie();
        m2.setTitle("Inception");
        m2.setDescription("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.");
        m2.setGenre("Action / Sci-Fi");
        m2.setDuration(148);
        m2.setRating(8.8);
        m2.setPosterUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop");
        m2.setReleaseDate(LocalDate.of(2010, 7, 16));
        movies.add(movieRepository.save(m2));

        Movie m3 = new Movie();
        m3.setTitle("The Dark Knight");
        m3.setDescription("When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.");
        m3.setGenre("Action / Drama");
        m3.setDuration(152);
        m3.setRating(9.0);
        m3.setPosterUrl("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop");
        m3.setReleaseDate(LocalDate.of(2008, 7, 18));
        movies.add(movieRepository.save(m3));

        Movie m4 = new Movie();
        m4.setTitle("Dune: Part Two");
        m4.setDescription("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.");
        m4.setGenre("Sci-Fi / Adventure");
        m4.setDuration(166);
        m4.setRating(8.7);
        m4.setPosterUrl("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop");
        m4.setReleaseDate(LocalDate.of(2024, 3, 1));
        movies.add(movieRepository.save(m4));

        // 3. Create Theatres
        List<Theatre> theatres = new ArrayList<>();
        
        Theatre t1 = new Theatre();
        t1.setName("IMAX Grand Dome");
        t1.setLocation("New York");
        t1.setOwnerId(owner.getId());
        theatres.add(theatreRepository.save(t1));

        Theatre t2 = new Theatre();
        t2.setName("Starlight Premium Cinema");
        t2.setLocation("Los Angeles");
        t2.setOwnerId(owner.getId());
        theatres.add(theatreRepository.save(t2));

        // 4. Create Shows
        LocalDateTime baseTime = LocalDateTime.now().withHour(12).withMinute(0).withSecond(0).withNano(0);
        
        // Seeding 3 shows per movie in different theatres
        for (int i = 0; i < movies.size(); i++) {
            Movie movie = movies.get(i);
            
            // Show 1: Afternoon at IMAX Grand Dome
            Show s1 = new Show();
            s1.setMovieId(movie.getId());
            s1.setTheatreId(theatres.get(0).getId());
            s1.setShowTime(baseTime.plusDays(1).plusHours(2 * i)); // Afternoon / Evening tomorrow
            s1.setPrice(15.99);
            s1.setAvailableSeats(100);
            showRepository.save(s1);

            // Show 2: Night at Starlight Premium
            Show s2 = new Show();
            s2.setMovieId(movie.getId());
            s2.setTheatreId(theatres.get(1).getId());
            s2.setShowTime(baseTime.plusDays(1).plusHours(2 * i + 6)); // Late night tomorrow
            s2.setPrice(12.50);
            s2.setAvailableSeats(80);
            showRepository.save(s2);

            // Show 3: Weekend afternoon
            Show s3 = new Show();
            s3.setMovieId(movie.getId());
            s3.setTheatreId(theatres.get(0).getId());
            s3.setShowTime(baseTime.plusDays(2).plusHours(2 * i + 1)); // Afternoon day after
            s3.setPrice(18.00);
            s3.setAvailableSeats(100);
            showRepository.save(s3);
        }

        // 5. Create Reviews
        Review r1 = new Review();
        r1.setUserId(user.getId());
        r1.setMovieId(movies.get(0).getId()); // Interstellar
        r1.setRating(5);
        r1.setComment("A absolute masterpiece. Hans Zimmer's soundtrack was mind-bending and Nolan outdid himself.");
        reviewRepository.save(r1);

        Review r2 = new Review();
        r2.setUserId(user.getId());
        r2.setMovieId(movies.get(1).getId()); // Inception
        r2.setRating(4);
        r2.setComment("Incredible concept and cinematography. Mind twisting until the very last frame!");
        reviewRepository.save(r2);

        System.out.println("Seeding database complete.");
    }
}
