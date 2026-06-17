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

# Copy sources for notification-service
COPY notification-service/src notification-service/src

# Compile and package notification-service
RUN mvn -pl notification-service -am clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/notification-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
