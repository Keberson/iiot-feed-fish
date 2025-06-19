# Swagger Documentation for Fish Feeding API

This project includes Swagger documentation for the Fish Feeding API.

## Setup and Installation

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Apply migrations:
   ```
   python manage.py migrate
   ```

3. Run the development server:
   ```
   python manage.py runserver
   ```

   Or use the provided batch file:
   ```
   setup_swagger.bat
   ```

## Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:

- **Swagger UI**: [http://localhost:8000/swagger/](http://localhost:8000/swagger/)
- **ReDoc**: [http://localhost:8000/redoc/](http://localhost:8000/redoc/)

## API Endpoints

The API includes the following endpoints:

### Authentication

- `POST /api/auth/login` - User authentication
- `POST /api/auth/token` - Token validation

### Feeding Management

- `GET /api/feeding/form-data` - Get form data for feeding configuration
- `GET /api/feeding` - List all feeding tasks
- `POST /api/feeding` - Create a new feeding task
- `GET /api/feeding/{id}` - Get a specific feeding task
- `PUT /api/feeding/{id}` - Update a specific feeding task
- `DELETE /api/feeding/{id}` - Delete a specific feeding task

## Data Models

The API uses the following main data models:

- **Pool** - Represents a fish pool
- **Feed** - Represents a type of fish feed
- **Period** - Represents a feeding period
- **FeedingTask** - Represents a scheduled feeding task
- **User** - Represents a system user
- **System** - Represents system configuration
- **Log** - Represents system logs
- **Timetable** - Represents feeding timetables
- **Feeding** - Represents a feeding event

## API Structure Diagram

See [API Structure Diagram](./api_diagram.md) for a visual representation of the API endpoints.

## Data Models Diagram

See [Data Models Diagram](./models_diagram.md) for a visual representation of the data models.

## Using Swagger UI

1. Open the Swagger UI at [http://localhost:8000/swagger/](http://localhost:8000/swagger/)
2. Explore the available endpoints
3. Try out the API by clicking on an endpoint and then clicking the "Try it out" button
4. Fill in the required parameters and click "Execute"
5. View the response

## Authentication

The API uses JWT (JSON Web Token) authentication. To authenticate:

1. Use the `/api/auth/login` endpoint with valid credentials
2. Include the received token in the Authorization header as `Bearer <token>`
3. You can validate tokens using the `/api/auth/token` endpoint

## Using with Docker

If you're using Docker, make sure to expose port 8000 in your Docker configuration. The Swagger UI will be available at `http://<your-docker-host>:8000/swagger/`. 