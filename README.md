# Inventory & Order API

A backend REST API for managing users, products, inventory, and orders.

This project is built using **Node.js, Express.js, and MongoDB** and provides JWT-based authentication, product management, inventory handling, order management, validation, error handling, search, filtering, and pagination.

---

## 1. Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (JSON Web Token)
* bcryptjs
* Helmet
* CORS
* Morgan
* dotenv

---

## 2. Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Secure password hashing using bcrypt
* Protected Order APIs

### Product Management

* Create Product
* Get All Products
* Get Product By ID
* Update Product
* Delete Product
* Product name search
* Category filtering
* Stock availability filtering
* Pagination

### Order Management

* Create Order
* Get logged-in user's orders
* Get order by ID
* Multiple products in an order
* Automatic total amount calculation
* Automatic stock reduction
* Product existence validation
* Stock availability validation
* Invalid order handling

### Security & Validation

* JWT authentication
* Password hashing
* Request validation
* Centralized error handling
* Proper HTTP status codes
* Helmet security headers
* Environment variables for sensitive configuration
* CORS configuration

---

## 3. Project Structure

```text
inventory-order-api/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   └── order.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── order.routes.js
│   │
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── generateToken.js
│   │
│   └── app.js
│
├── postman/
│   └── Inventory-Order-API.postman_collection.json
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## 4. Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Go to the project directory:

```bash
cd inventory-order-api
```

Install dependencies:

```bash
npm install
```

---

## 5. Environment Variables

Create a `.env` file in the root directory.

You can use `.env.example` as a reference.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/inventory_order_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Important

Do not commit the actual `.env` file to GitHub.

The repository contains:

```text
.env.example
```

for configuration reference.

---

## 6. Run the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server will run on:

```text
http://localhost:5000
```

API base path:

```text
http://localhost:5000/api
```

---

# 7. API Documentation

## Authentication APIs

### Register

**POST**

```text
/api/auth/register
```

Request:

```json
{
  "name": "Prateek Mishra",
  "email": "prateek.test@gmail.com",
  "password": "Password@123"
}
```

---

### Login

**POST**

```text
/api/auth/login
```

Request:

```json
{
  "email": "prateek.test@gmail.com",
  "password": "Password@123"
}
```

The login response returns a JWT token.

Use this token for protected APIs:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 8. Product APIs

## Create Product

**POST**

```text
/api/products
```

Request:

```json
{
  "name": "Wireless Bluetooth Headphones",
  "description": "Noise cancelling wireless Bluetooth headphones",
  "price": 2499,
  "stockQuantity": 10,
  "category": "electronics"
}
```

---

## Get All Products

**GET**

```text
/api/products
```

---

## Search Products

**GET**

```text
/api/products?search=Samsung
```

---

## Filter By Category

**GET**

```text
/api/products?category=electronics
```

---

## Filter By Availability

### In Stock

```text
GET /api/products?inStock=true
```

### Out of Stock

```text
GET /api/products?inStock=false
```

---

## Pagination

```text
GET /api/products?page=1&limit=10
```

---

## Combined Search, Filter & Pagination

```text
GET /api/products?search=Samsung&category=electronics&inStock=true&page=1&limit=10
```

---

## Get Product By ID

**GET**

```text
/api/products/:id
```

Example:

```text
/api/products/PRODUCT_ID
```

---

## Update Product

**PATCH**

```text
/api/products/:id
```

Request:

```json
{
  "price": 2199,
  "stockQuantity": 15
}
```

---

## Delete Product

**DELETE**

```text
/api/products/:id
```

---

# 9. Order APIs

Order APIs require JWT authentication.

Add the following header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Create Order

**POST**

```text
/api/orders
```

Request:

```json
{
  "products": [
    {
      "product": "PRODUCT_ID",
      "quantity": 2
    }
  ]
}
```

The API:

* Verifies that the product exists
* Checks available stock
* Reduces stock
* Calculates subtotal
* Calculates total order amount
* Creates the order

---

## Create Multi-Product Order

**POST**

```text
/api/orders
```

Request:

```json
{
  "products": [
    {
      "product": "PRODUCT_ID_1",
      "quantity": 2
    },
    {
      "product": "PRODUCT_ID_2",
      "quantity": 1
    }
  ]
}
```

---

## Get Logged-in User Orders

**GET**

```text
/api/orders
```

Returns orders belonging to the authenticated user.

---

## Get Order By ID

**GET**

```text
/api/orders/:id
```

Example:

```text
/api/orders/ORDER_ID
```

---

# 10. Stock Management & Concurrency

When an order is created, stock is reduced using an atomic database update.

The stock update checks that sufficient stock exists before decreasing the quantity.

Conceptually:

```text
Available Stock >= Requested Quantity
            ↓
       Reduce Stock
            ↓
       Create Order
```

This prevents stock from becoming negative when multiple users try to purchase limited inventory simultaneously.

If sufficient stock is not available, the order is rejected.

---

# 11. Validation & Error Handling

The API handles:

* Missing required fields
* Invalid email
* Invalid product ID
* Invalid order data
* Invalid quantity
* Zero quantity
* Negative quantity
* Empty order
* Product not found
* Insufficient stock
* Duplicate user email
* Invalid login credentials
* Missing authentication token
* Invalid or expired JWT
* MongoDB validation errors
* Duplicate database records
* Invalid MongoDB ObjectId

The application uses centralized error handling and appropriate HTTP status codes.

Common status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 12. Postman Collection

A complete **Postman Collection** is included in the repository for API testing.

Location:

```text
postman/Inventory-Order-API.postman_collection.json
```

The collection contains requests for:

### Authentication

* Register
* Login

### Products

* Create Product
* Get All Products
* Search Products
* Category Filter
* Availability Filter
* Pagination
* Get Product By ID
* Update Product
* Delete Product

### Orders

* Create Order
* Create Multi-Product Order
* Get My Orders
* Get Order By ID

### Validation / Error Testing

* Insufficient Stock
* Invalid Quantity
* Empty Order
* Invalid Product
* Unauthorized Request
* Invalid Login
* Duplicate Registration

### Import Postman Collection

1. Open Postman.
2. Click **Import**.
3. Select:

```text
postman/Inventory-Order-API.postman_collection.json
```

4. Import the collection.
5. Start the backend server.
6. Execute the requests.

For protected APIs, provide the JWT token obtained from the Login API.

---

# 13. API Testing Flow

Recommended testing sequence:

```text
Register
   ↓
Login
   ↓
Get JWT Token
   ↓
Create Products
   ↓
Get Products
   ↓
Search / Filter / Pagination
   ↓
Get Product By ID
   ↓
Update Product
   ↓
Create Order
   ↓
Verify Stock Reduction
   ↓
Get My Orders
   ↓
Get Order By ID
   ↓
Validation & Error Testing
   ↓
Delete Product
```

---

# 14. Database

MongoDB is used as the database.

Database name:

```text
inventory_order_db
```

Main collections:

```text
users
products
orders
```

---

# 15. Security

The application implements basic security practices including:

* Password hashing with bcrypt
* JWT authentication
* Helmet security headers
* CORS configuration
* Environment variables
* Request body size limits
* Protected order endpoints
* Centralized error handling

Sensitive values such as:

```text
JWT_SECRET
MONGODB_URI
```

should be stored in `.env`.

---


---

# 17. Future Improvements

Possible future improvements include:

* Role-based authorization
* Admin-only product management
* Order cancellation with stock restoration
* Database transactions using MongoDB sessions
* Automated unit and integration tests
* API rate limiting
* API documentation using Swagger/OpenAPI
* Production deployment
* Docker support
* Advanced product sorting and filtering

---

# 18. Submission

The repository contains:

```text
Source Code
README.md
.env.example
.gitignore
package.json
Postman Collection
```

GitHub Repository:

```text
<YOUR_GITHUB_REPOSITORY_URL>
```

---

## Author

**Prateek Mishra**

Full Stack Web Developer (MERN Stack)
#   a s s i g n m e n t  
 