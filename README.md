# CineVerse – Scalable Movie Ticket Booking & Entertainment Platform

CineVerse is a production-grade full-stack movie booking platform inspired by BookMyShow, IMDb, and Netflix. The application features user authentication, role-based access control, movie discovery, theatre selection, show scheduling, interactive seat booking, and user reviews.

---

## 🚀 Tech Stack

- **Frontend:** React, TailwindCSS, Vite, Lucide React, Axios
- **Backend:** Spring Boot (Java 17), Spring Security, Hibernate/JPA, JWT Security
- **Database:** PostgreSQL (Production: Neon PostgreSQL / Local: Dockerized Postgres)
- **Deployment:** Vercel (Frontend), Render (Backend), Neon (Database)
- **CI/CD & Containerization:** Docker, Docker Compose, GitHub Actions

---

## 🛠️ Local Setup Instructions

### Option 1: Using Docker Compose (Recommended)

To run the entire application, including the database, backend service, and frontend web server in containerized environments:

1. Ensure you have **Docker** and **Docker Compose** installed on your system.
2. In the project root directory, execute:
   ```bash
   docker compose up --build
   ```
3. Once running:
   - **Frontend UI** is accessible at `http://localhost:3000`
   - **Backend API** is running at `http://localhost:8080`
   - **Database** is running on port `5432`

---

### Option 2: Running Manually

#### Step 1: Database Setup
1. Create a local PostgreSQL database named `cineverse`.
2. Configure username and password (default fallback in the application is `postgres`/`sagarxkamboj`).

#### Step 2: Spring Boot Backend
1. Open a terminal inside the `/backend` directory.
2. Build and compile:
   ```bash
   # On Windows (using the packaged Maven CLI)
   .\tools\apache-maven-3.9.6\bin\mvn clean package
   
   # Or using standard Maven (if installed)
   mvn clean package
   ```
3. Run the Spring Boot application:
   ```bash
   # On Windows
   .\tools\apache-maven-3.9.6\bin\mvn spring-boot:run
   ```

#### Step 3: React Frontend
1. Open a terminal inside the `/frontend` directory.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

Follow these steps to deploy the application in production environments.

### 1. Database: Neon PostgreSQL
1. Sign up on [Neon Database](https://neon.tech/) and create a new PostgreSQL database project.
2. Retrieve your **Connection String** from the dashboard. (e.g., `postgresql://user:password@endpoint-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`).

---

### 2. Backend: Render
1. Sign up on [Render](https://render.com/).
2. Create a new **Web Service** and connect it to your GitHub repository.
3. Configure the build parameters:
   - **Runtime:** `Docker` (Render will automatically detect the `Dockerfile` inside the root or specific folder)
   - Alternatively, you can use the Maven build commands with standard environment:
     - **Build Command:** `mvn clean package -DskipTests` (set directory to `backend`)
     - **Start Command:** `java -jar target/*.jar`
4. Set the following **Environment Variables** in the service dashboard:
   - `DB_URL`: Neon JDBC connection string (e.g., `jdbc:postgresql://<neon-endpoint>:5432/neondb?sslmode=require`)
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: Database password
   - `JWT_SECRET`: A secure 256-bit secret key for signing tokens
   - `CORS_ALLOWED_ORIGINS`: Your production frontend URL (e.g., `https://cineverse-app.vercel.app`)

---

### 3. Frontend: Vercel
1. Sign up on [Vercel](https://vercel.com/).
2. Import a new project and select your repository.
3. Configure the following project parameters:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
4. Set the following **Environment Variables** in the project settings:
   - `VITE_API_URL`: Your backend URL deployed on Render (e.g., `https://cineverse-backend.onrender.com`)
5. Click **Deploy**. Vercel will automatically build the assets and handle routing via the bundled `vercel.json` rewrite configuration.

---

## 🔄 CI/CD Pipeline (GitHub Actions)

A GitHub Actions workflow is preconfigured in `.github/workflows/build-and-test.yml`.
This pipeline automatically runs on pushes and pull requests to:
1. Verify backend compiles successfully and dependencies build correctly.
2. Verify React frontend installs successfully and compiles cleanly to static web assets.
