# Lavanya Collections — Store Administrator & Business Operations Guide

Welcome to the **Lavanya Collections Store Operations Guide**. This guide is written for boutique owners, store managers, and staff to manage daily retail, rentals, bespoke custom orders, and customer communication without needing technical assistance.

---

## 1. Accessing the Admin Dashboard

1. Open your web browser and navigate to:
   `http://localhost:5173/admin/login` (or your live domain `/admin/login`)
2. Enter your administrator credentials:
   - **Email**: `admin@lavanyacollections.com`
   - **Password**: `LavanyaAdmin@2026!`
3. Click **Sign In to Dashboard**. You will be directed to the primary administrative overview.

---

## 2. Dashboard Overview & Business Metrics

The main dashboard provides real-time business visibility:
- **Total Revenue (₹)**: Aggregate value of all confirmed orders and rentals.
- **Advance Collections (₹)**: Upfront cash collected via Razorpay.
- **Pending Receivables (₹)**: Balance amounts due upon delivery or in-store pickup.
- **Active Orders**: Orders currently pending processing or shipment.
- **Active Rentals**: Outfits and decor items currently out with customers.
- **Pending Custom Requests**: Customer design submissions awaiting quotation.
- **Low Stock Alerts**: Items with stock falling below 3 units.

---

## 3. Product & Inventory Management

Navigate to **Products** in the sidebar.

### 3.1 Adding a New Product
1. Click **+ Add New Product**.
2. Fill in the core product information:
   - **Product Name**: E.g. *"Handcrafted Kundan Bridal Choker Set"*
   - **Category**: Select from dropdown (Jewellery, Photoshoot Frocks, Doll Sets, etc.).
   - **Purchase Price (₹)**: Regular retail price.
   - **Stock**: Physical units available.
   - **Product Images**: Upload 1 to 5 clear photographs (JPEG, PNG, WebP).
3. **Configure Rental Availability**:
   - Check the **Available for Rent** box if the item can be hired.
   - Enter **Rental Fee Per Day (₹)**.
   - Enter **Refundable Security Deposit (₹)** (e.g. ₹2,000 held against damages).
4. **Configure Payment Mode**:
   - **Full Payment Only**: Customer must pay 100% online at checkout.
   - **Advance Payment Only**: Customer pays an upfront deposit; balance due upon delivery.
   - **Both (Customer Choice)**: Customer chooses whether to pay full or advance.
   - **Advance Percentage**: E.g., `20%` or `50%`.
5. Click **Save Product**.

---

## 4. Managing Orders & Deliveries

Navigate to **Orders** in the sidebar.

### 4.1 Processing an Order
1. Click on any order in the table to view its full details, customer shipping address, and line item snapshots.
2. As you prepare the package, update the **Fulfillment Status**:
   - `processing` ➔ Package is being packed or crafted.
   - `shipped` ➔ Dispatched with courier. Enter Courier Partner (e.g. *Blue Dart*) and Tracking Number.
   - `delivered` ➔ Successfully handed over to customer.

### 4.2 Recording Offline Balance Settlements
When a customer who opted for an **advance payment** (e.g., paid 20% online) receives their parcel and pays the remaining 80% via cash, card machine, or store UPI:
1. Open the Order details.
2. In the **Payment & Balance** card, click **Record Offline Balance**.
3. Enter amount, payment method (*Cash* or *Direct UPI*), and click **Confirm Settlement**.
4. The system immediately sets `Balance Due = ₹0` and updates the order status to `fully_paid`.

---

## 5. Managing Rental Bookings

Navigate to **Rentals** in the sidebar.

1. **Viewing Upcoming Bookings**: View reserved dates for frocks, bridal jewellery, and wedding decor. The system automatically locks these dates to prevent double-booking.
2. **Item Pickup / Dispatch**: When the customer collects the item, update status to `picked_up`.
3. **Item Return & Condition Inspection**:
   - When returned, mark status as `returned`.
   - Inspect the item for stains, tears, or missing stones. Record any notes in the inspection field.
4. **Refunding Security Deposit**:
   - If the item is in pristine condition, click **Release Deposit Refund**.
   - If damages occurred, enter deduction amount with notes before releasing remainder.

---

## 6. Handling Custom Design Requests (Bespoke Orders)

Navigate to **Custom Requests** in the sidebar.

Customers often upload photos from Pinterest, Instagram, or weddings requesting custom photoshoot frocks, personalized doll sets, or tailor-made jewellery.

### 5-Step Quotation Workflow:
1. **Review**: Click on the request to inspect customer reference images, requested delivery date, and budget notes.
2. **Provide Quotation**:
   - Enter **Quoted Price (₹)**.
   - Enter **Advance Required (₹)** (typically 30% to 50% for bespoke work).
   - Enter **Estimated Crafting Time (Days)**.
   - Add designer notes (e.g. *"Will use pure mulberry raw silk with antique gold zardozi embroidery"*).
   - Click **Send Quotation**.
3. **Customer Alert**: The customer receives an automated WhatsApp and in-app alert.
4. **Customer Approval**: Once the customer approves and pays the advance, status changes to `accepted`.
5. **Milestone Tracking**: As your artisans work, advance the status:
   `in_production` ➔ `ready_for_dispatch` ➔ `delivered`.

---

## 7. Updating Store Profile, Contact & Policies

Navigate to **Settings** in the sidebar.

You can modify your boutique's operational details at any time without developer assistance:
- **Store Name & Tagline**: Updates the website header and footer.
- **Contact Phone & WhatsApp**: Updates the direct chat link on the storefront.
- **Boutique Address & GSTIN**: Displayed on digital invoices and footer.
- **Social Media Links**: Instagram, Facebook, and YouTube channels.
- **Customer Policies**:
  - Shipping & Delivery timeline policies.
  - Return, exchange, and cancellation rules.
  - Rental terms & deposit agreement text.
