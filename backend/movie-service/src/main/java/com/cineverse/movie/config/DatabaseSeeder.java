package com.cineverse.movie.config;

import com.cineverse.movie.entity.Movie;
import com.cineverse.movie.repository.MovieRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;

    public DatabaseSeeder(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() > 0) {
            System.out.println("Movie database already seeded.");
            return;
        }

        System.out.println("Seeding MongoDB movies...");

        Movie m1 = new Movie();
        m1.setId(1L);
        m1.setTitle("Interstellar");
        m1.setDescription("When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history.");
        m1.setGenre("Sci-Fi");
        m1.setDuration(169);
        m1.setRating(8.6);
        m1.setPosterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop");
        m1.setReleaseDate(LocalDate.of(2014, 11, 7));
        movieRepository.save(m1);

        Movie m2 = new Movie();
        m2.setId(2L);
        m2.setTitle("Inception");
        m2.setDescription("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.");
        m2.setGenre("Action / Sci-Fi");
        m2.setDuration(148);
        m2.setRating(8.8);
        m2.setPosterUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop");
        m2.setReleaseDate(LocalDate.of(2010, 7, 16));
        movieRepository.save(m2);

        Movie m3 = new Movie();
        m3.setId(3L);
        m3.setTitle("The Dark Knight");
        m3.setDescription("When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.");
        m3.setGenre("Action / Drama");
        m3.setDuration(152);
        m3.setRating(9.0);
        m3.setPosterUrl("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop");
        m3.setReleaseDate(LocalDate.of(2008, 7, 18));
        movieRepository.save(m3);

        Movie m4 = new Movie();
        m4.setId(4L);
        m4.setTitle("Dune: Part Two");
        m4.setDescription("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.");
        m4.setGenre("Sci-Fi / Adventure");
        m4.setDuration(166);
        m4.setRating(8.7);
        m4.setPosterUrl("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop");
        m4.setReleaseDate(LocalDate.of(2024, 3, 1));
        movieRepository.save(m4);

        System.out.println("MongoDB movies seeding complete.");
    }
}
