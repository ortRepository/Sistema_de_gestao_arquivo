

# File Management System

## Overview

**File Management System** is a Node.js-based backend application that provides API endpoints for managing an File Management System. It utilizes **PostgreSQL** (originally MySQL, but configuration indicates PostgreSQL) as the database and is configured using environment variables.

## Technologies Used

* **Node.js**
* **TypeScript**
* **Fastify**
* **PostgreSQL**
* **Prisma ORM**
* **Fastify Swagger**
* **Fastify Swagger UI**

## Installation

To set up the project on your local machine, follow these steps:

### Prerequisites

* Install [Node.js](https://nodejs.org/)
* Install [pnpm](https://pnpm.io/)
* Install PostgreSQL (or MySQL, depending on your configuration)

### Steps

1. Clone the repository:

   ```sh
   git clone -b backend https://github.com/ortRepository/sistema...
   ```

2. Navigate to the project directory:

   ```sh
   cd File-Management-System
   ```

3. Install dependencies:

   ```sh
   pnpm install
   ```

4. Configure environment variables:

   * Create a `.env` file in the root directory.
   * Add the following content:

     ```env
     # ==================================================
     # 🔗 Database Configuration (PostgreSQL)
     # ==================================================
     DATABASE_HOST=localhost
     DATABASE_PORT=5432
     DATABASE_USER=postgres
     DATABASE_PASSWORD=root
     DATABASE_NAME=ordering_system_bd
     DATABASE_URL="postgresql://postgres:root@localhost:5432/file_management_system_bd"

     # ==================================================
     # ✉️ Email Configuration
     # ==================================================
     EMAIL=FileManagementSystem@gmail.com
     EMAIL_PASSWORD=
     EMAIL_SERVICE=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_HOST=smtp.gmail.com
     EMAIL_SECURE=false

     # ==================================================
     # 🌐 Server Configuration
     # ==================================================
     SERVER_HOST=localhost
     SERVER_PORT=3000

     # ==================================================
     # 🧪 Alternative Databases (optional, not in use)
     # ==================================================
     # For MySQL (not active)
     # DATABASE_USER=root
     # DATABASE_PORT=3306
     # DATABASE_URL="mysql://root:@localhost:3306/golden_skin_system_bd"

     SQLITE_URL=
     MONGO_URL=

     # ==================================================
     # 👤 Admin User (auto-created on init)
     # ==================================================
     ADMIN_EMAIL=File Management System@gmail.com
     ADMIN_PASSWORD=12345678
     ADMIN_NAME="Sabor Express"
     ADMIN_PHONE_NUMBER=123456789

     # ==================================================
     # 🔐 Security Key
     # ==================================================
     SECRET_KEY=DJMFAJHUFUJITREO8TIHUVJNIGTOLPAJ64Y5HF

     # ==================================================
     # 🗄️ Storage Service (optional)
     # ==================================================
     STORAGE_BASE_URL=
     STORAGE_BASE_PROTOCOL=
     ```

## Running the Application

To start the development server:

```sh
pnpm run dev
```

To build and run in production:

```sh
pnpm run build
pnpm start
```

## Database Migration

To apply database migrations:

```sh
pnpm prisma migrate dev --name init
```

## API Endpoints

The application exposes various API endpoints. You can test them using tools like Postman or cURL.

## API Documentation

API documentation is available at [`/docs`](http://localhost:3000/docs) when the server is running.


