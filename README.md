# Order Service

A REST API for order management built with Hexagonal Architecture and Domain-Driven Design.

## Quick Start

### Running with Docker Compose

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### Running Locally

```bash
npm install
npm run dev
```

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

## Testing

```bash
# Run tests
npm test

# View coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```
