# Furniture Store — Backend API

A RESTful backend API for a furniture e-commerce platform, built with **Node.js**, **Express**, **Sequelize ORM**, and **MySQL**. Supports full shopping-cart checkout flow, PDF invoice generation, role-based access control, and an admin analytics/statistics dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
  - [Users](#users-apiuser)
  - [Products](#products-apiproduct)
  - [Categories](#categories-apicategory)
  - [Cart](#cart-apicart)
  - [Orders & Invoices](#orders--invoices-apiorder)
  - [Payments](#payments-apipayment)
  - [Statistics](#statistics-apistats)
  - [Analytics](#analytics-apianalytics)
  - [Email](#email-apiemail)
- [Data Models](#data-models)
- [Available Scripts](#available-scripts)
- [Notes](#notes)
- [License](#license)

---

## Features

- JWT-based authentication with role-based access control (Admin / Customer)
- Full product catalog management — products, images, features, and categories
- Per-user shopping cart (add, update, remove items)
- Order creation, cancellation, status updates, and history
- Automatic database creation on first run
- PDF invoice generation with view and download endpoints (PDFKit)
- Payment record management
- Dashboard statistics and analytics endpoints for admin
- Contact/enquiry email delivery via Nodemailer (Gmail)
- Request body size capped at 10 MB; CORS enabled globally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Database | MySQL 8 (`mysql2`) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | Bcrypt |
| Email | Nodemailer |
| PDF generation | PDFKit |
| Process manager | Nodemon |

---

## Project Structure

```
├── config/
│   ├── config.json          # Sequelize CLI config
│   └── database.js          # Sequelize connection + auto-create DB
├── controllers/
│   ├── analyticsController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── emailController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── productController.js
│   ├── statsController.js
│   └── userController.js
├── middlewares/
│   └── authMiddleware.js    # JWT verification middleware
├── migrations/
│   └── 002_add_invoice_system.sql
├── models/
│   ├── cart.js
│   ├── category.js
│   ├── order.js
│   ├── orderItem.js
│   ├── payment.js
│   ├── product.js
│   ├── productFeature.js
│   ├── productImage.js
│   └── user.js
├── routes/
│   ├── analyticsRoutes.js
│   ├── cartRoutes.js
│   ├── categoryRoutes.js
│   ├── emailRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── productRoutes.js
│   ├── statsRoutes.js
│   └── userRoutes.js
├── scripts/
│   └── cleanup-invoice-constraint.js
├── services/
│   ├── analyticsService.js
│   ├── cartService.js
│   ├── categoryService.js
│   ├── emailService.js
│   ├── orderService.js
│   ├── paymentService.js
│   ├── productService.js
│   ├── statsService.js
│   └── userService.js
├── uploads/
│   └── invoices/            # Generated PDF invoices
├── utils/
│   └── invoiceGenerator.js  # PDFKit invoice builder
└── server.js                # Application entry point
```

---

## Prerequisites

- **Node.js** 18 or higher
- **MySQL** 8 or higher
- **npm**

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Furniture-web-site-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```bash
npm start
```

The server starts at:

```
http://localhost:<PORT>
```

> The application automatically checks whether the target database exists and creates it if it does not. Sequelize then runs `sync()` to create or update tables.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000

# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=furniture_ecommerce
DB_DIALECT=mysql

# Set to true to run sync({ alter: true }) on startup
DB_SYNC_ALTER=false

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email (Gmail with App Password)
EMAIL_USERNAME=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

---

## Database

- On startup, `config/database.js` connects to MySQL and auto-creates the database named in `DB_NAME` if it does not already exist.
- Sequelize `sync()` runs at boot to create or validate all tables.
- Set `DB_SYNC_ALTER=true` to run `sync({ alter: true })`, which applies column-level schema changes without dropping data.
- For invoice system schema updates, apply `migrations/002_add_invoice_system.sql` manually, or run:

```bash
node scripts/cleanup-invoice-constraint.js
```

### Entity Overview

| Model | Table | Description |
|---|---|---|
| User | `users` | Registered users with role |
| Category | `categories` | Product categories |
| Product | `products` | Furniture items |
| ProductImage | `product_images` | Multiple images per product |
| ProductFeature | `product_features` | Feature list per product |
| Cart | `carts` | User shopping cart items |
| Order | `orders` | Customer orders with invoice info |
| OrderItem | `order_items` | Line items per order |
| Payment | `payments` | Payment records per order |

---

## Authentication & Authorization

Protected routes require a valid JWT in the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

| Role | Access |
|---|---|
| `Customer` | Own cart, create/view own orders, update profile |
| `Admin` | All customer permissions + product/category CRUD, all orders, payments, stats, analytics |

---

## API Reference

### Base URL

```
/api
```

---

### Users `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register a new user |
| `POST` | `/login` | — | Login and receive JWT |
| `PUT` | `/update` | Required | Update profile for the logged-in user |
| `PUT` | `/forgot-password` | Required | Change password for the logged-in user |
| `GET` | `/customer/all` | Admin | Get all customers with order summaries |

#### Example — Register

```http
POST /api/user/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "Customer"
}
```

#### Example — Login

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

---

### Products `/api/product`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/all` | — | Get all products (public) |
| `POST` | `/one` | — | Get a product by ID |
| `POST` | `/add` | Admin | Add a new product |
| `PUT` | `/update` | Admin | Update an existing product |
| `DELETE` | `/delete` | Admin | Delete a product |

---

### Categories `/api/category`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/all` | — | Get all categories (public) |
| `POST` | `/one` | Admin | Get a category by ID |
| `POST` | `/add` | Admin | Create a new category |
| `PUT` | `/update` | Admin | Update a category |
| `DELETE` | `/delete` | Admin | Delete a category |

---

### Cart `/api/cart`

All cart endpoints require authentication.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/add` | Add a product to the cart |
| `PUT` | `/update` | Update cart item quantity |
| `DELETE` | `/remove` | Remove a product from the cart |
| `POST` | `/one` | Get a specific cart item |
| `POST` | `/all` | Get all cart items for the current user |

---

### Orders & Invoices `/api/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create` | Required | Create a new order |
| `DELETE` | `/cancel` | Required | Cancel an order |
| `POST` | `/one` | Required | Get a single order |
| `POST` | `/user/all` | Required | Get all orders for the current user |
| `GET` | `/all` | Admin | Get all orders |
| `PUT` | `/status` | Admin | Update order status |

#### Invoice Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/invoice/:invoiceNo/pdf` | View invoice PDF inline in browser |
| `GET` | `/invoice/:invoiceNo/download` | Force-download invoice PDF |
| `GET` | `/invoice/:invoiceNo/details` | Get invoice metadata only |

#### Example — Create Order

```http
POST /api/order/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "CARD",
  "customer_name": "Jane Doe",
  "customer_phone": "0771234567",
  "customer_email": "jane@example.com",
  "delivery_address": "123 Main Street, Colombo",
  "items": [
    { "product_id": "<uuid>", "quantity": 2 },
    { "product_id": "<uuid>", "quantity": 1 }
  ]
}
```

---

### Payments `/api/payment`

Admin access required.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/all` | Get all payment records |
| `POST` | `/one` | Get a payment record by ID |

---

### Statistics `/api/stats`

Admin access required.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/details` | Dashboard summary (orders, revenue, users, etc.) |

---

### Analytics `/api/analytics`

Admin access required.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/all` | Full analytics data |

---

### Email `/api/email`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/send-email` | — | Send a contact/enquiry email |

#### Example — Send Contact Email

```http
POST /api/email/send-email
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "message": "I would like to enquire about custom furniture options."
}
```

---

## Data Models

### User

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String | Full name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt-hashed password |
| `role` | String | `Admin` or `Customer` |
| `province` | Text | Province |
| `district` | Text | District |
| `address` | Text | Street address |
| `postal_code` | Text | Postal code |
| `phone_number` | String | Contact number |
| `is_deleted` | Boolean | Soft-delete flag |

### Order

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `invoice_no` | String | Unique invoice number |
| `user_id` | UUID | Foreign key → User |
| `customer_name` | String | Delivery recipient name |
| `customer_phone` | String | Contact phone |
| `customer_email` | String | Contact email |
| `delivery_address` | Text | Delivery address |
| `subtotal` | Decimal | Order subtotal |
| `tax` | Decimal | Tax amount |
| `shipping` | Decimal | Shipping fee |
| `discount` | Decimal | Discount applied |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Start | `npm start` | Run server with nodemon (auto-restarts on changes) |
| Test | `npm test` | Placeholder — no tests implemented yet |

---

## Notes

- Generated invoice PDFs are stored under `uploads/invoices/`.
- CORS is enabled globally — restrict allowed origins in production.
- Default request body limit is **10 MB**.
- Email delivery uses Gmail SMTP; a Google App Password is required (enable 2FA on your Google account first).
- All passwords are hashed with **bcrypt** before storage.
- UUIDs (`UUIDV4`) are used as primary keys across all models.
- Sequelize query logging is disabled by default (set `logging: true` in `config/database.js` to enable).

---

## License

ISC
