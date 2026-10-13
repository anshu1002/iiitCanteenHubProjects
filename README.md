# CS543 Project – IIIT Canteen Hub

**Team members**

| Name | Roll No. |
|---|---|
| Anshu Mala (Leader) | 20252651010 |
| Mritunjay Maurya | 20252651035 |
| Sanika Jain | 20252651046 |
| Annu Mishra | 20252651009 |



## 1. Project Description

IIIT Canteen Hub is a web service-based canteen management project developed as part of the CS543 course. It provides REST APIs for managing canteen food items and user accounts. The project demonstrates important web service concepts, including HTTP methods, status codes, request validation, caching, idempotency, rate limiting, JSON/XML responses, and API documentation.

The project is implemented using Node.js, Express.js, MongoDB, and supporting libraries. API requests and responses are tested using Postman.

## 2. Objectives

- To implement RESTful web services for the IIIT Canteen Hub project.
- To implement CRUD operations for food items.
- To handle HTTP requests and responses using appropriate status codes.
- To validate incoming JSON request data.
- To prevent duplicate POST requests using an Idempotency-Key.
- To implement ETag-based caching and conditional requests.
- To support JSON and XML response formats.
- To implement cursor-based pagination.
- To apply API rate limiting.
- To provide standardized error responses.
- To document the APIs using OpenAPI and Swagger UI.
- To implement user registration and login functionality.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend |
| Express.js | REST API development and routing |
| MongoDB | Database for user accounts |
| Mongoose | MongoDB object modeling |
| JavaScript | Backend programming |
| EJS | Server-side page rendering |
| HTML and CSS | Web page structure and styling |
| JSON | API request and response format |
| XML | Alternative API response format |
| AJV | JSON request validation |
| Postman | API testing and response verification |
| Swagger UI | Interactive API documentation |
| OpenAPI 3.0.3 | API specification |
| Git and GitHub | Version control and source code hosting |

## 4. Implemented Features

### 4.1 REST API and CRUD Operations

REST endpoints are implemented for food item management using standard HTTP methods.

- **GET:** Retrieve all food items or a specific food item.
- **POST:** Add a new food item.
- **PUT:** Replace all fields of an existing food item.
- **PATCH:** Update selected fields of a food item.
- **DELETE:** Remove a food item.

The APIs use appropriate HTTP status codes to communicate the result of each request.

### 4.2 HTTP Status Codes

The API implements status codes for successful requests, validation failures, missing resources, and other conditions.

| Status Code | Purpose |
|---|---|
| 200 OK | Request completed successfully |
| 201 Created | Food item or user account created |
| 304 Not Modified | Cached representation has not changed |
| 400 Bad Request | Invalid request data or parameters |
| 401 Unauthorized | Invalid login credentials |
| 404 Not Found | Requested resource or route not found |
| 406 Not Acceptable | Unsupported response format |
| 409 Conflict | Duplicate account or idempotency-key conflict |
| 429 Too Many Requests | API rate limit exceeded |
| 500 Internal Server Error | Unexpected server error |

### 4.3 JSON Request Validation Using AJV

AJV is used to validate food item request data against predefined JSON schemas.

Validation includes:

- Required fields: name, category, price, and rating.
- Name and category must be non-empty strings.
- Price must be greater than zero.
- Rating must be between 0 and 5.
- Additional unexpected properties are rejected.
- PATCH requests must contain at least one property.
- Invalid food IDs, pagination limits, and cursors are rejected.

Invalid requests receive a `400 Bad Request` response with an error code and message.

### 4.4 Idempotency-Key

The POST endpoint uses the `Idempotency-Key` request header to prevent duplicate food creation when the same request is submitted repeatedly.

- The API checks whether the header is present and valid.
- A unique key and request body are recorded after successful creation.
- Repeating the same request with the same key replays the stored response rather than creating another item.
- Reusing the same key with a different request body returns `409 Conflict`.
- The replayed response includes the `Idempotency-Replayed` header.

This feature demonstrates how APIs can handle repeated requests safely.

### 4.5 ETag and Conditional Requests

ETag-based caching is implemented for retrieving the food list.

- The server generates an ETag from the serialized response representation.
- The ETag is returned in the response header.
- A client can send the previously received ETag through the `If-None-Match` request header.
- If the representation has not changed, the server responds with `304 Not Modified`.
- Otherwise, the server returns the current representation with `200 OK`.

The GET endpoints also use the `Cache-Control: private, no-cache` header.

### 4.6 Cursor-Based Pagination

The food listing endpoint supports cursor-based pagination through the `limit` and `cursor` query parameters.

- The default page size is three items.
- The client can specify a limit between 1 and 100.
- The cursor represents the last food ID returned.
- The response includes the number of returned items, total item count, next cursor, `hasMore` indicator, and next-page link.
- Invalid limits and cursors return a `400 Bad Request` response.

### 4.7 JSON and XML Responses

The food APIs support both JSON and XML response formats using content negotiation.

- JSON responses are returned when JSON is requested.
- XML responses are generated when XML is requested.
- The `Accept` header determines the preferred response format.
- Unsupported response formats return `406 Not Acceptable`.
- The `Vary: Accept` header identifies the request header that affects response representation.

### 4.8 API Rate Limiting

Express Rate Limit middleware is applied to the versioned API routes.

- The rate-limit window is 15 minutes.
- A maximum of 100 requests is allowed within the configured window.
- Requests exceeding the limit receive `429 Too Many Requests`.
- Standard rate-limit headers are enabled.

This helps control excessive API requests.

### 4.9 Standardized Error Handling

The project uses structured error responses containing a success indicator and error details.

Error responses include:

- Error code
- Human-readable error message
- Appropriate HTTP status code

The application also provides a JSON response for unknown routes and a centralized error-handling middleware for unexpected server errors.

### 4.10 OpenAPI and Swagger UI Documentation

The API specification is maintained in `docs/openapi.yaml` using OpenAPI 3.0.3.

The documentation describes the food endpoints, request parameters, Idempotency-Key header, request body schema, and response status codes.

Swagger UI is configured to display the API documentation at:

`http://localhost:3000/api-docs`

### 4.11 User Registration and Login

The project includes user registration and login endpoints.

- User registration through `POST /api/auth/signup`.
- User login through `POST /api/auth/login`.
- Required fields are checked.
- Passwords must contain at least eight characters.
- Email addresses are normalized.
- Duplicate email registration is rejected.
- Passwords are hashed using bcrypt before storage.
- User accounts are stored in MongoDB through Mongoose.
- Invalid credentials return `401 Unauthorized`.

Passwords are not returned in the API responses.

## 5. API Endpoints

The following endpoints are implemented in the project.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/v1/foods` | Retrieve food items with pagination |
| POST | `/v1/foods` | Create a food item |
| GET | `/v1/foods/:id` | Retrieve a food item by ID |
| PUT | `/v1/foods/:id` | Replace a food item |
| PATCH | `/v1/foods/:id` | Partially update a food item |
| DELETE | `/v1/foods/:id` | Delete a food item |
| GET | `/api-docs` | Open Swagger API documentation |

## 6. Postman Testing and Verification

Postman is used to test the implemented APIs by sending HTTP requests and examining the returned responses.

The testing covers:

- Sending JSON request bodies.
- Verifying successful API responses.
- Testing food item creation, retrieval, updating, and deletion.
- Checking invalid request data and validation errors.
- Testing repeated POST requests using the same Idempotency-Key.
- Checking ETag and conditional GET behavior using `If-None-Match`.
- Verifying pagination using `limit` and `cursor`.
- Checking JSON and XML response formats.
- Testing invalid resource IDs and missing resources.
- Verifying rate-limit responses.
- Testing user registration, duplicate registration, and login.

The working demonstration and test results are provided through the Google Drive link below.

## 7. Project Structure

```text
IIITCanteenHub/
├── app.js
├── package.json
├── package-lock.json
├── docs/
│   └── openapi.yaml
├── middleware/
│   └── rateLimiter.js
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── foods.js
├── schemas/
│   └── foodSchema.js
├── public/
│   ├── script.js
│   └── style.css
└── views/
    └── home.ejs
```

## 8. How to Run the Project

### Prerequisites

- Node.js and npm
- MongoDB running locally
- Postman for API testing

### Installation

1. Clone the GitHub repository.
2. Open the project directory in the terminal.
3. Install the dependencies.
4. Start the application.
5. Open the API documentation or send requests using Postman.

```bash
npm install
npm start
```

The backend runs at:

`http://localhost:3000`

The Swagger documentation is available at:

`http://localhost:3000/api-docs`

## 9. Data Storage Note

User accounts are stored in MongoDB. Food item data is currently maintained in an in-memory array, and idempotency records are maintained in an in-memory map. Therefore, food items and idempotency records are not permanently persisted across server restarts.

## 10. GitHub Repository

**GitHub Repository Link:** [https://github.com/anshu1002/iiitCanteenHubProjects.git]

The repository contains the source code, API implementation, schemas, middleware, and OpenAPI documentation.

## 11. Working Demonstration

**Google Drive Demonstration Link:** [https://drive.google.com/file/d/1ZtBDE_J90D9FQex2LNkX9c4pj7RhPEV_/view?usp=sharing]

The demonstration includes the working project and Postman API testing.

Ensure the Google Drive sharing permission is set to **Anyone with the link**.

## 12. Assignment Coverage

This project implements web service concepts relevant to the CS543 project and Assignments 01 to 06, including REST API design, HTTP methods and status codes, validation, JSON/XML support, idempotency, ETag-based caching, pagination, rate limiting, and API documentation.

Refer to the repository and demonstration for the implemented functionality.

## 13. Group Submission

This submission is prepared for the CS543 project covering Assignments 01 to 06.

As specified in the assignment instructions, one submission is required per group and must be uploaded by the team leader.