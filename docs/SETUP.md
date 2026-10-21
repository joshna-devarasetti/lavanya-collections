# Lavanya Collections — Local Setup & Development Guide

Welcome to **Lavanya Collections**, a full-stack e-commerce, product rental, custom design ordering, and boutique management platform built specifically for Indian boutique businesses.

---

## 1. System Requirements

Ensure the following tools are installed on your workstation:
- **Node.js**: v18.0.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher
- **Git**: (Optional, for version control)
- **Operating System**: Windows 10/11, macOS, or Linux
- **MongoDB** (Optional): A local `mongod` service or MongoDB Atlas cluster. *Note: If no MongoDB instance is running, the server automatically starts an embedded in-memory MongoDB engine (`mongodb-memory-server`), requiring zero manual database configuration for local testing and development.*

---

## 2. Repository Architecture

```
lavanya-collections/
├── client/              # React 18 + Vite frontend (Port 5173)
│   ├── src/             # Pages, layouts, context, hooks, boutique styling
│   ├── package.json
│   └── vite.config.js   # Proxies /api and /uploads to port 5000
├── server/              # Node.js + Express + Mongoose backend (Port 5000)
│   ├── config/          # Database connection & memory fallback
│   ├── controllers/     # Business logic & transaction handlers
│   ├── models/          # 9 Mongoose schemas
│   ├── routes/          # RESTful routing endpoints
│   ├── services/        # Razorpay, Cloudinary, WhatsApp dispatchers
│   ├── seed/            # Pre-populated boutique catalog & accounts
│   ├── tests/           # Automated API & logic tests
│   └── package.json
├── docs/                # Comprehensive technical and user manuals
├── README.md            # Master repository README
└── .gitignore
```

---

## 3. Step-by-Step Setup

### Step 3.1: Server Setup

1. Open your terminal in the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```
   *Review the default values in `.env`. By default, `PORT=5000`, `JWT_SECRET=lavanya_boutique_secure_jwt_secret_key_2026!`, and `MONGODB_URI` is left blank to use the built-in memory server.*

4. Run Automated Tests:
   Verify all backend logic, payment calculations, advance rules, rental overlap protections, and signature verifications:
   ```bash
   npm test
   ```
   *Expected output: 5 passing tests.*

5. Seed Sample Data (Optional — Server auto-seeds on first launch):
   ```bash
   npm run seed
   ```

6. Start Backend API Server:
   ```bash
   npm run dev
   # or for production mode:
   npm start
   ```
   *The server will start at `http://localhost:5000`.*
   *Verify health check at `http://localhost:5000/api/health`.*

---

### Step 3.2: Client Setup

1. Open a new terminal window in the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Client Environment:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```
   *By default, `VITE_API_BASE_URL` is blank or `/api`, leveraging the built-in Vite reverse proxy in `vite.config.js`.*

4. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   *Vite will start at `http://localhost:5173`.*

5. Build for Production (Verification):
   ```bash
   npm run build
   ```
   *Creates an optimized static bundle in `client/dist`.*

---

## 4. Default Seed Credentials

The database comes pre-loaded with an administrator account, a test customer account, 7 product categories, 6 sample boutique items (spanning buy, rent, and custom options), and sample transactions:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `lavanyacollections@gmail.com` | `lavanyacollect` | Full administrative access to dashboard, orders, rentals, custom designs, inventory, and settings |
| **Test Customer** | `priya.sharma@example.com` | `Customer@2026!` | Customer portal, shopping, rentals, custom requests, and order tracking |

---

## 5. Working in Visual Studio Code

### Recommended Extensions
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Thunder Client** or **REST Client** (for manual API testing)
- **MongoDB for VS Code** (if connecting to MongoDB Atlas)

### Debugging Configuration
Create `.vscode/launch.json` in the root folder to debug both client and server:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/server.js",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 6. Common Troubleshooting

1. **Port Conflicts (`EADDRINUSE: 5000` or `5173`)**:
   - Check if another application is using port 5000:
     - On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
     - On macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`
   - Alternatively, edit `PORT=5001` in `server/.env` and update the proxy port in `client/vite.config.js`.

2. **MongoDB Connection Failures**:
   - If your external MongoDB connection fails, leave `MONGODB_URI` empty or unset in `server/.env`. The application will automatically instantiate `mongodb-memory-server` and seed sample data.

3. **CORS / Proxy Issues**:
   - The Vite development server is configured to proxy all `/api` and `/uploads` requests directly to `http://localhost:5000`. Keep both servers running concurrently.
