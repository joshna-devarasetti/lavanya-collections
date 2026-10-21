# Lavanya Collections — REST API Documentation

The Lavanya Collections backend exposes a comprehensive RESTful API built on Node.js and Express.

---

## 1. General Principles

### Base URL
- Local Development: `http://localhost:5000/api`
- Vite Client Proxy: `/api`

### Content Types
- Standard Requests: `application/json`
- File Uploads: `multipart/form-data`

### Authentication Scheme
Authentication uses JSON Web Tokens (JWT) passed via standard HTTP headers:
```http
Authorization: Bearer <your_jwt_token>
```

### Standard Response Format
Successful Response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error Response:
```json
{
  "success": false,
  "message": "Human-readable description of the error",
  "errors": [ ... ]
}
```

---

## 2. Authentication & User Management

### 2.1 Register New Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Ananya Rao",
    "email": "ananya@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "60d0fe4f...",
      "name": "Ananya Rao",
      "email": "ananya@example.com",
      "phone": "+91 9876543210",
      "role": "customer"
    }
  }
  ```

### 2.2 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "lavanyacollections@gmail.com",
    "password": "lavanyacollect"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "60d0fe4f...",
      "name": "Lavanya Administrator",
      "email": "lavanyacollections@gmail.com",
      "role": "admin"
    }
  }
  ```

### 2.3 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`customer` or `admin`)
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Product Catalog & Categories

### 3.1 List Categories
- **Endpoint**: `GET /api/categories`
- **Access**: Public
- **Response (200 OK)**: Array of active categories including name, slug, description, and display order.

### 3.2 List Products (Filtering & Search)
- **Endpoint**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 12)
  - `search` (string, matches name, description, tags)
  - `category` (string, category slug or ObjectId)
  - `type` (`all`, `buy`, `rent`)
  - `minPrice` & `maxPrice` (numbers)
  - `inStock` (boolean)
  - `featured` (boolean)
  - `sort` (`featured`, `price-asc`, `price-desc`, `newest`, `rating`)

### 3.3 Get Product By ID or Slug
- **Endpoint**: `GET /api/products/:id`
- **Access**: Public

### 3.4 Create Product
- **Endpoint**: `POST /api/products`
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Fields**:
  - `name`: String
  - `description`: String
  - `price`: Number
  - `category`: ObjectId
  - `stock`: Number
  - `isRentalAvailable`: Boolean
  - `rentalPrice`: Number (if rental enabled)
  - `rentalSecurityDeposit`: Number
  - `paymentMode`: `advance_only` | `full_only` | `both`
  - `advancePercentage`: Number (e.g. 20)
  - `images`: 1 to 5 image files

---

## 4. Rentals & Real-time Date Checking

### 4.1 Check Date Availability
- **Endpoint**: `GET /api/rentals/check-availability`
- **Access**: Public
- **Query Parameters**:
  - `productId`: ObjectId
  - `startDate`: ISO 8601 Date (`YYYY-MM-DD`)
  - `endDate`: ISO 8601 Date (`YYYY-MM-DD`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "available": true,
    "conflicts": []
  }
  ```

### 4.2 List Active Rentals
- **Endpoint**: `GET /api/rentals/active`
- **Access**: Admin only

---

## 5. Orders & Checkout

### 5.1 Create Order
- **Endpoint**: `POST /api/orders`
- **Access**: Public (Supports both guest checkout and logged-in customers)
- **Headers**: Optional `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "customer": {
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "+91 9876543210"
    },
    "shippingAddress": {
      "street": "Flat 302, Green Valley Apartments",
      "city": "Hyderabad",
      "state": "Telangana",
      "pincode": "500081",
      "country": "India"
    },
    "items": [
      {
        "productId": "6ad856d56aecb157e5f7239f",
        "quantity": 1,
        "isRental": false,
        "selectedPaymentOption": "advance"
      }
    ],
    "notes": "Handle with care, wedding gift"
  }
  ```
- **Response (201 Created)**: Returns saved order containing verified snapshots, calculated `totalAmount`, `advanceRequired`, `balanceDue`, and initial status `pending_payment`.

### 5.2 Get Customer Order History
- **Endpoint**: `GET /api/orders/my-orders`
- **Access**: Authenticated Customer

### 5.3 Admin: List All Orders
- **Endpoint**: `GET /api/orders`
- **Access**: Admin only
- **Query Parameters**: `status`, `search`, `page`, `limit`

### 5.4 Admin: Update Order Status & Tracking
- **Endpoint**: `PUT /api/orders/:id/status`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "orderStatus": "shipped",
    "deliveryPartner": "Blue Dart Express",
    "trackingNumber": "BLUEDART89214798"
  }
  ```

### 5.5 Admin: Record Offline Balance Payment
- **Endpoint**: `POST /api/orders/:id/record-balance`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "amount": 2800,
    "paymentMethod": "cash",
    "notes": "Collected cash on delivery"
  }
  ```

---

## 6. Payments & Razorpay Integration

### 6.1 Create Razorpay Order
- **Endpoint**: `POST /api/payments/create-order`
- **Access**: Public / Authenticated
- **Request Body**:
  ```json
  {
    "orderId": "6ad856d56aecb157e5f7239a",
    "paymentType": "advance"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "razorpayOrderId": "order_mock_1729501827",
    "amount": 70000,
    "currency": "INR",
    "keyId": "rzp_test_MOCK_LAVANYA_2026",
    "isMock": true
  }
  ```

### 6.2 Verify Razorpay Signature
- **Endpoint**: `POST /api/payments/verify`
- **Access**: Public / Authenticated
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_mock_1729501827",
    "razorpay_payment_id": "pay_mock_98234123",
    "razorpay_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "orderId": "6ad856d56aecb157e5f7239a"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified and order confirmed",
    "orderStatus": "processing"
  }
  ```

---

## 7. Custom Design Requests (Bespoke Orders)

### 7.1 Submit Custom Design Request
- **Endpoint**: `POST /api/custom-requests`
- **Access**: Authenticated or Guest with contact details
- **Headers**: `Content-Type: multipart/form-data`
- **Fields**:
  - `title`: String
  - `category`: String
  - `description`: String
  - `budgetMin` & `budgetMax`: Numbers
  - `targetDeliveryDate`: Date string
  - `images`: Up to 5 reference photos

### 7.2 Admin: Provide Quotation
- **Endpoint**: `PUT /api/custom-requests/:id/quote`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "quotedPrice": 12500,
    "advanceRequired": 3750,
    "estimatedDays": 14,
    "notes": "Hand-stitched zari work on premium pure raw silk"
  }
  ```

### 7.3 Customer: Accept / Reject Quotation
- **Endpoints**:
  - `POST /api/custom-requests/:id/accept-quote`
  - `POST /api/custom-requests/:id/reject-quote`
- **Access**: Authenticated Request Owner

---

## 8. Business Analytics & Settings

### 8.1 Admin Dashboard Metrics
- **Endpoint**: `GET /api/dashboard/stats`
- **Access**: Admin only
- **Returns**: Total revenue, advance collections, pending balances, total orders, active rentals, pending custom designs, low stock alert count.

### 8.2 Business Settings
- **Endpoint**: `GET /api/settings` (Public)
- **Endpoint**: `PUT /api/settings` (Admin only)
- **Settings Object**: Store name, tagline, GSTIN, phone, WhatsApp number, email, address, Instagram URL, minimum advance percentage, refund policy, rental agreement text.
