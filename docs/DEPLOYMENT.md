# Lavanya Collections — Production Deployment Guide

This guide details how to deploy Lavanya Collections to production using modern cloud platforms: **MongoDB Atlas** (Database), **Cloudinary** (Media CDN), **Render / Railway** (Express API), and **Vercel** (React Client).

---

## 1. Cloud Architecture Overview

```
                      [Custom Domain: lavanyacollections.com]
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
         [Vercel / Netlify]                        [Render / Railway]
       React 18 + Vite (SPA)                       Node.js + Express API
                  │                                         │
                  │ (REST API calls)                        ├─▶ MongoDB Atlas (Data)
                  └─────────────────────────────────────────┼─▶ Cloudinary (Photos)
                                                            ├─▶ Razorpay (Payments)
                                                            └─▶ Meta Cloud API (WhatsApp)
```

---

## 2. Step-by-Step Deployment Guide

### Step 2.1: Provision MongoDB Atlas Database
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Deploy a free **M0 Shared Cluster** (e.g., in AWS `ap-south-1` Mumbai region for lowest Indian latency).
3. Under **Database Access**, create a database user with `readWriteAnyDatabase` privileges.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so serverless and cloud hosting providers can connect.
5. Click **Connect > Drivers > Node.js** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/lavanya_prod?retryWrites=true&w=majority
   ```

---

### Step 2.2: Setup Cloudinary Media Storage
1. Register at [cloudinary.com](https://cloudinary.com).
2. From the Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

### Step 2.3: Deploy Backend API (Render)
1. Push your repository to GitHub or GitLab.
2. Log in to [render.com](https://render.com) and click **New > Web Service**.
3. Connect your repository.
4. Configure the service:
   - **Name**: `lavanya-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/lavanya_prod?retryWrites=true&w=majority
   JWT_SECRET=super_secret_production_jwt_key_at_least_32_chars!
   CLIENT_URL=https://lavanyacollections.com
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
   RAZORPAY_WEBHOOK_SECRET=zzzzzzzzzzzzzzzzzzzz
   WHATSAPP_PHONE_NUMBER_ID=109283746592817
   WHATSAPP_ACCESS_TOKEN=EAAG...
   WHATSAPP_BUSINESS_ACCOUNT_ID=982734918237491
   ```
6. Click **Deploy Web Service**. Once deployed, copy your API URL (e.g., `https://lavanya-api.onrender.com`).

---

### Step 2.4: Deploy Frontend Client (Vercel)
1. Log in to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your repository.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://lavanya-api.onrender.com/api
   ```
5. Create `client/vercel.json` to handle client-side routing rewrites for React Router:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**. Vercel will build and publish your storefront at your assigned domain.

---

## 3. Production Security Checklist

- [x] **Enforce HTTPS**: All production traffic must be served over TLS 1.3 / HTTPS.
- [x] **JWT Expiration & Secret Entropy**: Ensure `JWT_SECRET` is high-entropy (64+ random characters) and token expiry is enforced.
- [x] **CORS Origin Whitelisting**: Ensure `CLIENT_URL` in `server/.env` exactly matches your public frontend domain.
- [x] **Password Hashing**: bcrypt with 10 salt rounds is enforced by default in `server/models/User.js`.
- [x] **Payment Signature Verification**: HMAC-SHA256 signature verification protects against client-side manipulation of payment amounts.
- [x] **Image File Validation**: Multer middleware limits uploads to images only (JPEG, PNG, WebP) with max 5MB size limit.
- [x] **No Hardcoded Secrets**: All keys, passwords, and tokens are read strictly from `process.env`.
