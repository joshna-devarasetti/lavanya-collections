# Lavanya Collections — Complete E-Commerce, Rental & Custom Boutique Platform

[![Node.js CI](https://img.shields.io/badge/Node.js-v18+-68A063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Memory-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay_INR-0C2340?logo=razorpay&logoColor=blue)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

> A production-oriented web platform built specifically for Indian boutique businesses, handling traditional jewellery, photoshoot frocks, Kolu doll sets, wedding decorations, handmade gifts, and bespoke custom design orders with flexible payments and rental lifecycle management.

---

## 🌟 Key Highlights

- **Boutique Visual Identity**: Bespoke **"Classic & Elegant — Cream, Gold, and Dark Brown"** design theme with warm ivory tones, rich boutique gold accents, and deep brown typography.
- **Dual Business Model (Buy & Rent)**: Sell handcrafted treasures outright or rent photoshoot frocks, wedding sets, and temple jewellery with automated rental date collision avoidance and security deposit tracking.
- **Granular Payment Rules & Advance Options**: Per-product payment rules (`full_only`, `advance_only`, or `both`) with configurable percentage advances (e.g. 20% or 50% upfront, remaining balance collected offline on delivery/pickup).
- **Interactive 5-Step Custom Design Workflow**: Customers upload reference photos with target dates and budget ranges; the boutique owner reviews, quotes prices and turnaround times; customers approve, pay an advance, and track tailoring milestones.
- **Zero-Friction Local Development**: Built-in embedded in-memory MongoDB fallback (`mongodb-memory-server`) ensures the application starts and tests immediately without requiring a pre-installed `mongod` service or external Atlas credentials.
- **Comprehensive Test Suite & Payment Simulator**: Verified with 5 automated test suites covering authentication, advance calculation math in integer paise, rental overlap logic, and HMAC-SHA256 signature verification. Includes an interactive Razorpay simulator for end-to-end checkout testing.

---

## 🏛️ System Architecture

```
lavanya-collections/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── public/                 # Static assets & SVG boutique branding
│   ├── src/
│   │   ├── assets/             # Brand logos & icons
│   │   ├── components/         # Reusable boutique UI elements
│   │   ├── context/            # AuthContext, CartContext, NotificationContext
│   │   ├── layouts/            # CustomerLayout (Navbar, Footer, WhatsApp), AdminLayout
│   │   ├── pages/              # Customer Storefront & Admin Dashboard Views
│   │   │   ├── customer/       # Home, Shop, Detail, Cart, Checkout, Custom, Account
│   │   │   └── admin/          # Dashboard, Products, Orders, Rentals, Custom, Settings
│   │   ├── services/           # Axios-like API wrapper with auth interception
│   │   ├── styles/             # theme.css (tokens) & main.css (luxury styling)
│   │   ├── utils/              # Currency, date, and status formatters
│   │   ├── App.jsx             # React Router v6 routing declarations
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML shell with Google Fonts & Razorpay SDK
│   ├── vite.config.js          # Port 5173 with proxy to Express backend
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/                 # Database configuration with memory-server fallback
│   ├── controllers/            # Controller logic for all business domains
│   ├── middleware/             # JWT auth, role validation, error handling, Multer uploads
│   ├── models/                 # 9 Mongoose schemas with relational integrity
│   ├── routes/                 # REST routing declarations
│   ├── seed/                   # Pre-seeded boutique catalog, users & transactions
│   ├── services/               # Razorpay HMAC, Cloudinary, WhatsApp dispatchers
│   ├── tests/                  # Automated API integration and logic tests
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── docs/                       # Technical and Operational Manuals
│   ├── SETUP.md                # Local environment setup and VS Code instructions
│   ├── API.md                  # RESTful API endpoint specifications
│   ├── DATABASE.md             # MongoDB schemas, ER diagram, and indexes
│   ├── PAYMENTS.md             # Razorpay flows, integer paise math, and webhooks
│   ├── WHATSAPP.md             # Meta Cloud API templates and dispatch fallbacks
│   ├── ADMIN_GUIDE.md          # Business operations guide for boutique owners
│   └── DEPLOYMENT.md           # Production deployment on Atlas, Render, and Vercel
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### 1. Start Backend Server
```bash
cd server
npm install
npm test            # Run 5 automated test suites
npm run dev         # Launches Express API at http://localhost:5000
```
*Note: The server auto-detects if MongoDB is running locally. If not found, it automatically starts `mongodb-memory-server` and pre-seeds the catalog.*

### 2. Start Frontend Application
In a new terminal window:
```bash
cd client
npm install
npm run dev         # Launches Vite dev server at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Default Credentials

The platform initializes with pre-configured accounts:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `lavanyacollections@gmail.com` | `lavanyacollect` | Full Admin Dashboard (`/admin`) |
| **Test Customer** | `priya.sharma@example.com` | `Customer@2026!` | Customer Portal & Tracking (`/account`) |

---

## 🛍️ Customer Storefront Features

1. **Boutique Home Page**:
   - Hero banner with traditional Indian aesthetic.
   - Category showcases: Jewellery, Photoshoot Frocks, Kolu Doll Sets, Decorative Items, Wedding Decor, and Handmade Gifts.
   - Real-time cart drawer with badge counts.
   - Quick WhatsApp chat button pre-populated with customer inquiry.
2. **Faceted Shop Catalog**:
   - Filter by Category, Buy vs. Rent type, Price Range, and In-Stock status.
   - Instant live search by keyword and name.
   - Sorting by Price (Low to High, High to Low) and Newest Arrivals.
3. **Product Details & Rental Calendar**:
   - Dynamic Buy / Rent tabs.
   - Live date picker verifying real-time rental availability against existing reservations.
   - Flexible payment toggle: choose between paying **Full Price** or paying **Advance Deposit** upfront.
4. **Resilient Checkout & Payment Simulation**:
   - Guest and authenticated customer flows.
   - Complete Indian address capture (Pincode, State, City, Landmark).
   - Razorpay integration supporting UPI, Netbanking, and Cards.
   - Built-in **Payment Simulator** for immediate end-to-end testing without bank credentials.
5. **Custom Design Studio**:
   - Customers upload up to 5 reference photos for custom stitching or tailoring.
   - Specify target delivery dates (wedding, baby shower, photoshoot) and budget expectations.
   - Interactive quotation review with Accept / Reject controls.

---

## 💼 Admin Dashboard Capabilities

- **Real-Time KPIs**: Track total revenue, advance collections, pending balance receivables, active rentals, and pending custom orders.
- **Product & Inventory Management**: Add and edit products, manage rental terms (daily rate and security deposit), set payment modes (`advance_only`, `full_only`, `both`), and upload product images.
- **Order Fulfillment & Balance Settlement**: Update tracking numbers (Blue Dart, DTDC, India Post) and record offline cash/UPI balance payments upon delivery.
- **Rental Calendar & Return Inspections**: Manage reserved dates, check-in returned items, log damage inspection notes, and release refundable security deposits.
- **Custom Design Quotation Studio**: Review reference images, set quoted prices, required advances, crafting turnaround times, and designer notes.
- **Store Settings & Policies**: Update phone, WhatsApp number, store address, GSTIN, social media links, and customer policies (Returns, Cancellations, Rental Terms) on the fly.

---

## 🧪 Testing & Verification

The backend includes native automated tests verifying all business-critical invariants:

```bash
cd server
npm test
```

### Verified Scenarios:
1. **User Authentication**: Secure password hashing with bcrypt, JWT token generation, and role authorization.
2. **Granular Payment Rules**: Enforcing `full_only` and `advance_only` restrictions; verifying exact percentage math in integer paise.
3. **Order & Advance Calculations**: Correct computation of subtotal, advance required, and remaining balance due.
4. **Rental Collision Protection**: Preventing overlapping rental bookings on the same physical inventory item.
5. **Cryptographic Payment Verification**: Validating HMAC-SHA256 signature calculation matching Razorpay standards.

---

## 📚 Complete Documentation Suite

For detailed technical references, consult the dedicated guides in the [`docs/`](./docs) directory:
- [Setup & Local Development Guide](docs/SETUP.md)
- [REST API Specification](docs/API.md)
- [Database Schema & ER Models](docs/DATABASE.md)
- [Payment Gateway & Webhook Guide](docs/PAYMENTS.md)
- [WhatsApp Cloud API Integration Guide](docs/WHATSAPP.md)
- [Store Administrator Operations Guide](docs/ADMIN_GUIDE.md)
- [Cloud Production Deployment Guide](docs/DEPLOYMENT.md)

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details. Built with ❤️ for Indian boutique artisans and small businesses.
