# Order Service

A REST API for order management built with Hexagonal Architecture and Domain-Driven Design.

This project is structured as a **monorepo** to support multiple microservices and simplify the creation of additional services.

## Quick Start

### Running with Docker Compose

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### Running Locally

**Prerequisites:**
- Node.js 20+
- MongoDB running locally (default: `mongodb://localhost:27017`)
- RabbitMQ running locally (default: `amqp://localhost:5672`)

**Setup:**

```bash
# Navigate to the order-service folder
cd order-service

# Copy and configure environment variables
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`

## Stack

- **Runtime**: Node.js 22
- **Language**: TypeScript 5.9
- **Framework**: Express 4.18
- **Database**: MongoDB 7.0
- **Message Broker**: RabbitMQ 3.12
- **Testing**: Jest 29.7
- **Validation**: Zod 3.22
- **Architecture**: Hexagonal (Ports & Adapters)

## Test Coverage

```
Statements: 79.02%
Branches:   99.15%
Functions:  74.68%
Lines:      79.02%
Total Tests: 210
```


## Key Technical Decisions

1. **Hexagonal Architecture** - Clear separation of concerns
2. **Domain-Driven Design** - Business rules in the domain layer
3. **State Machine** - Order status transitions (CREATED → PROCESSING → SHIPPED → DELIVERED)
4. **Dependency Injection** - Manual container for explicit control
5. **Event-Driven** - RabbitMQ for event publishing
6. **UUID IDs** - Generated in domain layer

## API Endpoints

```bash
# Create Order
POST /orders
Response: 201 Created

# Get Order Status
GET /orders/:id
Response: 200 OK

# Update Order Status
PATCH /orders/:id/status
Response: 200 OK
```

## API Documentation (Swagger)

Access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- Schema validation details
- Try-it-out functionality for all endpoints

## Testing

```bash
# Navigate to order-service
cd order-service

# Run tests
npm test

# View coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## CI/CD Pipeline

Automated tests with GitHub Actions using Docker Compose.

**Runs on:** Every push to `main`

**What it does:**
1. Starts Docker Compose (API, MongoDB, RabbitMQ)
2. Runs all tests
3. Checks test coverage
4. Stops services

See `.github/CI_CD.md` for details.

## Project Structure - Monorepo

This is a monorepo structure designed to support multiple microservices:

### Why Monorepo?

- **Easier to manage** - All services in one repository
- **Simplified setup** - Single docker-compose for local development
- **Consistent patterns** - All services follow the same architecture (Hexagonal + DDD)
- **Scalable** - Easy to add new microservices (user-service, payment-service, etc.)
