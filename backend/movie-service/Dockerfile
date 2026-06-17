# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom files
COPY pom.xml .
COPY auth-service/pom.xml auth-service/
COPY movie-service/pom.xml movie-service/
COPY booking-service/pom.xml booking-service/
COPY notification-service/pom.xml notification-service/
COPY api-gateway/pom.xml api-gateway/

# Copy sources for movie-service
COPY movie-service/src movie-service/src

# Compile and package movie-service
RUN mvn -pl movie-service -am clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/movie-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
