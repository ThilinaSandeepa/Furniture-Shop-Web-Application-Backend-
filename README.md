# Furniture Website Backend API

Backend API for the Furniture e-commerce system, built with **Node.js**, **Express**, **Sequelize**, and **MySQL**.

## Features

- JWT-based authentication and role-based authorization
- Product and category management
- Cart management for authenticated users
- Order processing with invoice generation
- PDF invoice view/download endpoints
- Payment, analytics, and dashboard stats endpoints
- Contact email sending via Nodemailer (Gmail)

## Tech Stack

- Node.js + Express
- Sequelize ORM
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- Bcrypt
- Nodemailer
- PDFKit

## Project Structure

```text
config/         # DB config and Sequelize connection
controllers/    # Route handlers
middlewares/    # Auth middleware
migrations/     # SQL migration files
models/         # Sequelize models
routes/         # API route definitions
scripts/        # Utility scripts
services/       # Business logic
uploads/        # Generated invoices (PDF)
utils/          # Helpers (invoice generator, etc.)
server.js       # App entry point
```

## Prerequisites

- Node.js 18+ (recommended)
- MySQL 8+
- npm

## Setup

1. Clone and enter the project folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the following values:

```env
PORT=5000

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=thilina_ecommerce
DB_DIALECT=mysql

JWT_SECRET=your_super_secret_jwt_key

EMAIL_USERNAME=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Optional: if true, Sequelize runs sync({ alter: true }) at startup
DB_SYNC_ALTER=false
```

4. Start the server:

```bash
npm start
```

Server runs on:

```text
http://localhost:<PORT>
```

## Database Notes

- On startup, the backend checks whether the database in `DB_NAME` exists and creates it if missing.
- Sequelize sync runs on app start.
- If `DB_SYNC_ALTER=true`, it runs with alter mode (`sync({ alter: true })`).
- For invoice-related schema updates, see:
  - `migrations/002_add_invoice_system.sql`
  - `scripts/cleanup-invoice-constraint.js`

## Authentication

Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Admin-only routes require `req.user.role === "Admin"`.

## API Base URL

```text
/api
```

---

## API Endpoints

### User (`/api/user`)

- `POST /signup` - Register user
- `POST /login` - Login user
- `PUT /update` - Update current user details (auth required)
- `PUT /forgot-password` - Change password for current user (auth required)
- `GET /customer/all` - Get admin/customer order list (auth required)

### Product (`/api/product`)

- `POST /add` - Add product (auth + admin)
- `GET /all` - Get all products
- `POST /one` - Get product by ID
- `PUT /update` - Update product (auth + admin)
- `DELETE /delete` - Delete product (auth + admin)

### Category (`/api/category`)

- `POST /add` - Add category (auth + admin)
- `PUT /update` - Update category (auth + admin)
- `DELETE /delete` - Delete category (auth + admin)
- `POST /one` - Get category by ID (auth + admin)
- `GET /all` - Get all categories

### Cart (`/api/cart`)

- `POST /add` - Add product to cart (auth required)
- `PUT /update` - Update cart item quantity (auth required)
- `DELETE /remove` - Remove product from cart (auth required)
- `POST /one` - Get one cart item (auth required)
- `POST /all` - Get all cart items for current user (auth required)

### Order (`/api/order`)

- `POST /create` - Create order from items (auth required)
- `DELETE /cancel` - Cancel order (auth required)
- `POST /one` - Get single order (auth required)
- `GET /all` - Get all orders (auth + admin)
- `POST /user/all` - Get all orders for current user (auth required)
- `PUT /status` - Update order status (auth + admin)

#### Invoice Endpoints

- `GET /invoice/:invoiceNo/pdf` - View invoice PDF inline
- `GET /invoice/:invoiceNo/download` - Download invoice PDF
- `GET /invoice/:invoiceNo/details` - Get invoice metadata/details

### Payment (`/api/payment`)

- `GET /all` - Get all payments (auth + admin)
- `POST /one` - Get payment by ID (auth + admin)

### Stats (`/api/stats`)

- `GET /details` - Dashboard stats (auth + admin)

### Analytics (`/api/analytics`)

- `GET /all` - Analytics data (auth + admin)

### Email (`/api/email`)

- `POST /send-email` - Send contact form email

---

## Example Requests

### Signup

```http
POST /api/user/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "12345678",
  "role": "Customer"
}
```

### Login

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "12345678"
}
```

### Create Order

```http
POST /api/order/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "CARD",
  "items": [
    {
      "product_id": "<product-uuid>",
      "quantity": 2
    }
  ]
}
```

## Available Scripts

- `npm start` - Run server with nodemon (`server.js`)
- `npm test` - Placeholder test script (not implemented)

## Notes

- Invoice PDFs are stored under `uploads/invoices/`.
- CORS is enabled globally.
- Request body size limit is set to `10mb`.
- The email service currently sends contact emails to a fixed recipient configured in service logic.

## License

ISC
