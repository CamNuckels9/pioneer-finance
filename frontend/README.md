# Pioneer Finance

**Forge Your Own Path**

Pioneer Finance is a full-stack personal finance application that allows users to securely manage financial accounts, track transactions, transfer funds between accounts, and monitor their overall financial activity through a centralized dashboard.

I built Pioneer Finance as a portfolio project to demonstrate full-stack software development using Java, Spring Boot, React, REST APIs, authentication, relational data, and modern frontend development.

## Features

- User registration and login
- JWT-based authentication
- BCrypt password hashing
- User-specific financial data
- Financial account management
- Create, edit, and delete accounts
- Transaction tracking
- Income and expense management
- Transfers between accounts
- Automatic account balance updates
- Credit card balance handling
- Dashboard with income, expenses, and current cash balance
- Transaction history
- Input validation and error handling
- Protection against deleting accounts with associated transactions
- Responsive user interface
- Custom Pioneer Finance branding

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- JWT authentication
- RESTful APIs

### Frontend

- React
- JavaScript
- Vite
- HTML
- CSS

### Database

- H2 for local development
- JPA/Hibernate persistence

### Development Tools

- IntelliJ IDEA
- Visual Studio Code
- Git
- GitHub
- Swagger / OpenAPI

## Application Architecture

Pioneer Finance uses a full-stack client-server architecture.

The React frontend communicates with a Spring Boot REST API. Spring Security and JWT authentication protect application endpoints, while Spring Data JPA and Hibernate manage persistence.

User ownership is enforced on financial data so authenticated users can access only their own accounts and transactions.

## Financial Logic

Pioneer Finance contains application logic for multiple account and transaction types.

Supported account types include:

- Checking
- Savings
- Credit Card
- Cash

Supported transaction types include:

- Income
- Expense
- Transfer

Transfers update both source and destination account balances. Credit card transactions use debt-based balance behavior, while checking, savings, and cash accounts use traditional asset balance behavior.

The dashboard calculates total income and expenses while displaying the combined balance of cash-based accounts.

## Security

Pioneer Finance implements:

- JWT bearer authentication
- BCrypt password hashing
- Stateless Spring Security configuration
- Protected REST API endpoints
- User-scoped account and transaction access
- Backend validation
- Centralized exception handling

## API Documentation

The backend includes Swagger/OpenAPI documentation for exploring and testing REST endpoints during development.

When the backend is running locally, Swagger UI is available at:

`http://localhost:8080/swagger-ui/index.html`

## Running the Project Locally

### Backend

Run the Spring Boot application from IntelliJ or with Maven.

The backend runs on:

`http://localhost:8080`

### Frontend

From the project directory:

```bash
cd frontend
npm install
npm run dev