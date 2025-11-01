# 🍳 Recipe Sharing REST API

A **NestJS-based RESTful API** for a **Recipe Sharing Platform**, where users can create, explore, and share cooking recipes.  
The project is designed with a **modular architecture**, **robust authentication**, **structured logging**, and **scalability** in mind.

This API is currently under active development, with future plans including **OAuth2 authentication with Google**, **commenting system**, and **user social interactions**.

---

## 🚀 Features

- User registration and authentication (JWT)
- Role-based access control and privacy settings
- Recipe management (CRUD)
- Pagination, filtering, and case-insensitive search
- Detailed request logging and async context tracking
- Swagger documentation
- Dual database setup (MongoDB + PostgreSQL)
- Dockerized environment for easy deployment

---

## 🧩 Architecture Overview

The application is structured in **independent, feature-based modules**, each handling a specific domain or concern.  
All modules are wired together through **NestJS dependency injection**, ensuring scalability and testability.

## 🧭 Roadmap

- [✔️] **Integration & Unit Testing**
- [✔️] **User Modules**
- [✔️] **Auth Module**
- [✔️] **Recipe CRUD Module**
- [✔️] **Logger + Context Modules**
- [ ] **Comment Module**
- [ ] **Favorite Recipes**
- [ ] **Search History**
- [ ] **Reports & Moderation**
- [ ] **OAuth2 with Google**
- [ ] **User follower functionality**

## 🧠 Core Modules

#### **Auth Module**
- Handles authentication using **email/password** via Passport local strategy.
- Issues **JWT tokens** for secure session management.
- Includes login and registration endpoints.
- Designed to integrate future **Google OAuth2** authentication.

#### **User Module**
- Manages user profiles, roles, and privacy settings.
- Provides endpoints to retrieve and update user data.
- Supports nested structures such as social networks and addresses.

#### **Recipe Module**
- Central module of the platform.
- Allows users to **create, update, delete, and explore recipes**.
- Each recipe includes ingredients, steps, categories, tags, and privacy configuration.
- Implements pagination, filtering, and query-based search.
- Supports population of author data using Mongoose virtuals.

#### **Comments Module**
- Manages the interaction between users and recipes through **comments and ratings**.
- Allows users to **post, update, and delete comments** on public or authorized recipes.
- Supports a **rating system** (1 to 5 stars) to evaluate recipe quality.
- Each comment stores the **author reference**, **recipe reference**, and **timestamp**.
- Designed to integrate seamlessly with the **Recipe Module** for displaying community feedback.
- In future updates, moderation and report features will be implemented.

---

## 🧰 Common Modules

#### **Logger Module**
- Custom logging service that stores logs in **PostgreSQL**.
- Captures details such as HTTP method, request path, user info, and stack traces.
- Supports multiple log levels (info, warn, error, debug).

#### **Context Module**
- Uses **asynchronous local storage** to maintain contextual information per request.
- Passes request metadata automatically to the Logger module for enhanced observability.
- Metadata includes protocol, host, route, HTTP method, authenticated user, and more.

---

## 🗃️ Databases

The API uses a **dual-database approach** for optimal separation of concerns:

| Database | Purpose | Technology |
|-----------|----------|------------|
| **MongoDB** | Stores domain entities such as users, recipes, and comments. | Mongoose ODM |
| **PostgreSQL** | Dedicated to structured logging and analytics data. | PG |

This setup allows **high performance** for document-heavy data (recipes, comments) and **strong consistency** for logs and operational metrics.

---

## 📦 Entities Overview

### 👤 User
```json
{
  "_id": "ObjectId",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "privacy": "public | private",
  "profile": {
    "firstname": "string",
    "lastname": "string",
    "biography": "string",
    "avatar": "string",
    "birthDate": "Date",
    "socialNetworks": {
      "instagram": "string",
      "youtube": "string",
      "x": "string",
      "facebook": "string"
    },
    "address": {
      "country": "string"
    }
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 👤 Recipes
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "description": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "kg | gr | onz | pound..."
    }
  ],
  "steps": [
    {
      "order": "number",
      "instruction": "string"
    }
  ],
  "prepTime": "number",
  "portions": "number",
  "category": "string",
  "images": ["string"],
  "tags": ["string"],
  "privacy": "public | private",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 👤 Comments
```json
{
  "_id": "ObjectId",
  "recipeId": "ObjectId",
  "userId": "ObjectId",
  "text": "string",
  "rating": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## ⚙️ Environment Variables

Before running the application, create a `.env` file in the root directory with the following variables:

```env
# App Configuration
APP_PORT=5000

# MongoDB Configuration
# (Used for the main application data — recipes, users, comments, etc.)
MONGO_USER=recipeUser
MONGO_PASSWORD=recipePass
MONGO_PORT=27017
MONGO_HOST=localhost
MONGO_DATABASE=recipeDB

# PostgreSQL Configuration
# (Used for logging and application context metadata)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=neto
POSTGRES_PASSWORD=neto
POSTGRES_DB=recipe_logs_db

# JWT Configuration
JWT_SECRET=EXC'89&&55jkl'

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

## ⚙️ Installation & Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/ernesto-1998/recipe-sharing-nestapp.git
cd recipe-sharing-nestapp
```

### 2. Start the containers
#### The project includes a docker-compose.yml file to spin up the required databases.
```bash
docker-compose up -d
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the development server
```bash
npm run start:dev
```

### 5. Access the Swagger documentation
```bash
http://localhost:{APP_PORT}/api
```

## 🧰 Tech Stack

| **Category** | **Technologies** |
|---------------|------------------|
| **Language** | TypeScript |
| **Framework** | NestJS |
| **Databases** | MongoDB, PostgreSQL |
| **Authentication** | JWT, Local Strategy |
| **Containerization** | Docker, Docker Compose |
| **ORM/ODM** | Mongoose |
| **Documentation** | Swagger |
| **Logging** | Custom Logger Module + PostgreSQL |
| **Platform** | Node.js |
| **Future Enhancements** | OAuth2 (Google), Comments, Favorites, Ratings |

## 🧑‍💻 Author

**Ernesto Magaña**  
Software Engineer | Node.js & NestJS Developer  
🔗 [GitHub Profile](https://github.com/ernesto-1998)

---

## 📄 License

This project is licensed under the **MIT License**.






