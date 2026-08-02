# Pioneer Finance API

A RESTful backend application built with **Java**, **Spring Boot**, and **Spring Data JPA** for managing financial transactions.

## Features

- Create transactions
- View all transactions
- Retrieve a transaction by ID
- Update existing transactions
- Delete transactions
- Global exception handling
- Unit tests with JUnit

## Technologies

- Java 21
- Spring Boot
- Spring Data JPA
- Maven
- H2 Database
- JUnit 5

## Project Structure

```
src
├── main
│   ├── controller
│   ├── model
│   ├── repository
│   ├── service
│   └── exception
└── test
```

## Running the Project

Clone the repository:

```bash
git clone https://github.com/CamNuckels9/pioneer-finance.git
```

Run the application:

```bash
mvn spring-boot:run
```

The application starts on:

```
http://localhost:8080
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | Retrieve all transactions |
| GET | `/transactions/{id}` | Retrieve a transaction |
| POST | `/transactions` | Create a transaction |
| PUT | `/transactions/{id}` | Update a transaction |
| DELETE | `/transactions/{id}` | Delete a transaction |

## Author

**Cameron Nuckels**