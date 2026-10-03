# BistroByte Hospitality - Multi-Channel Restaurant Management & Kitchen Execution System
**Course**: `24SDCS03R - SOA PROGRAMMING AND MICROSERVICES`  
**Problem Statement**: `PS002 - Multi-Channel Restaurant Management & Kitchen Execution System`

---

## 1. System Architecture Overview

BistroByte Hospitality is a cloud-native, microservices-driven food discovery, kitchen operations, and dining platform. It combines real-time GPS location discovery, hybrid partner routing, AI-driven taste personalization, kitchen execution display (KDS), digital invoicing, verified customer reviews, and multilingual conversational AI.

```
                                  [ User Browser ]
                                         │
                   Direct URLs & Static Web UI (http://localhost:8000 / :5173)
                                         ▼
                     ┌──────────────────────────────────────┐
                     │     Spring Cloud API Gateway         │
                     │          (Port :8000)                │
                     └──────────────────┬───────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │ Routes: /api/auth/**       │ Routes: /api/menu/**       │ Routes: /api/orders/**
           │ Routes: /api/auth/staff/** │ Routes: /api/restaurants/**│ Routes: /api/payments/**
           │                            │ Routes: /api/chatbot/**    │ Routes: /api/reviews/**
           ▼                            ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│    Auth Service     │      │    Menu Service     │      │    Order Service    │
│    (Port :8081)     │      │    (Port :8082)     │      │    (Port :8083)     │
│  • Role-based JWT   │      │  • Hybrid Discovery │      │  • Multi-Channel    │
│  • 7 Demo Roles     │      │  • Overpass OSM API │      │  • Kitchen KDS      │
│  • Staff Operations │      │  • Haversine Calc   │◄─────┤  • Real Payments    │
│  • AI Taste Profile │      │  • Multilingual AI  │Inter │  • Digital Invoices │
└──────────┬──────────┘      └──────────┬──────────┘Check └──────────┬──────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   Netflix Eureka Registry   │
                         │        (Port :8761)         │
                         └─────────────────────────────┘
                                        ▲
                                        │
                         ┌─────────────────────────────┐
                         │  PostgreSQL (restaurant_db) │
                         │        (Port :5432)         │
                         └─────────────────────────────┘
```

---

## 2. Microservices Directory & Port Map

| Microservice | Port | Database | Primary Responsibility |
|---|---|---|---|
| **Eureka Server** | `8761` | N/A | Service Discovery, dynamic instance registry |
| **API Gateway** | `8000` | N/A | Edge reverse proxy, static frontend host, routing |
| **Auth Service** | `8081` | PostgreSQL (`restaurant_db`) | 7 Security roles, user taste preferences, staff shift & role management |
| **Menu Service** | `8082` | PostgreSQL (`restaurant_db`) | Hybrid places discovery (Partner vs Discovery), OpenStreetMap engine, multilingual BistroBot |
| **Order Service** | `8083` | PostgreSQL (`restaurant_db`) | Multi-channel orders, KDS live pipeline, real payment settlement, digital tax invoices, verified reviews |
| **Frontend UI** | `8000` / `5173` | N/A | Responsive Vite React app, GPS location states, multilingual translation (7 languages) |

---

## 3. University Presentation Demo Accounts (One-Click Login)

The login screen (`/login`) includes **1-Click Quick Demo Login** buttons for all presentation roles:

| Role | Email | Password | Intended Workflow |
|---|---|---|---|
| **Customer** | `customer@bistrobyte.com` | `customer123` | GPS location, discover nearby kitchens, build meals, place order, pay, track, download invoice, submit review |
| **Kitchen Staff** | `kitchen@bistrobyte.com` | `kitchen123` | KDS queue (`/kitchen`), accept new orders, transition to Preparing, mark as Ready |
| **Delivery Staff** | `delivery@bistrobyte.com` | `delivery123` | Delivery portal (`/staff-portal`), accept orders for dispatch, mark Delivered |
| **Restaurant Owner** | `owner@bistrobyte.com` | `owner123` | Overview of kitchen performance, staff management, dining table reservations |
| **Chef** | `chef@bistrobyte.com` | `chef123` | Kitchen execution, recipe management, dietary prep |
| **Admin** | `admin@bistrobyte.com` | `admin123` | System oversight, all user profiles, financial metrics |

---

## 4. Key Upgraded Features

### A. Real GPS Location & 5 Explicit UI States
- Implements `navigator.geolocation.getCurrentPosition` with high accuracy.
- Handles all 5 states gracefully:
  1. `LOCATION_NOT_SELECTED`: Prompts user with "Detect Location" or "Enter Area / City".
  2. `LOCATION_LOADING`: Interactive radar pulse with status banner.
  3. `LOCATION_SUCCESS`: Real latitude/longitude formatted with address badge.
  4. `LOCATION_PERMISSION_DENIED`: Clean fallback with manual address modal (City, Area, Landmark).
  5. `LOCATION_UNAVAILABLE`: Graceful retry with OpenStreetMap Nominatim geocoding.

### B. Live Hybrid Discovery Engine (No Hardcoding, No Fake Distances)
- **Partner Restaurants (`partnerStatus = "PARTNER"`)**: Fully integrated into BistroByte for in-app ordering, table bookings, digital payments, and instant kitchen ticket dispatch.
- **Discovery Only (`partnerStatus = "DISCOVERY"`)**: Discovered in real-time using OpenStreetMap Overpass API or Google Places API within the user's GPS radius. Shows "Discovery Only" badge, exact Haversine distance (`650 m`, `1.2 km`), and direct link to Google Maps.

### C. Real Payment State Machine & Digital Invoices
- Payment status transitions: `PENDING` -> `SUCCESS`.
- On payment confirmation, order transitions to `CONFIRMED` and generates a verifiable invoice number (`INV-2026-XXXX`).
- Printable, downloadable digital GST tax invoice modal available directly from the order history.

### D. Verified Customer Reviews
- Reviews can only be submitted for `DELIVERED` or `COMPLETED` orders.
- Customers rate Food, Restaurant, Taste, and Packaging with star ratings and comments.
- Reviews appear dynamically under the restaurant's "Reviews" tab with a "Verified Order" badge.

### E. Multilingual AI BistroBot & Voice Recognition
- Supports 7 languages: **English, Telugu (తెలుగు), Hindi (हिंदी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Bengali (বাংলা)**.
- Voice search using Web Speech API (`SpeechRecognition`).
- Auto-detects Telugu ("naku biryani kavali") and Hindi ("kuch spicy khana chahiye") queries.
- Live bot actions: "Add to Cart" and "Track Order".

### F. Staff Operations Portal (`/staff-portal`)
- **Kitchen KDS**: Real-time incoming, preparing, and ready queue with instant status updates.
- **Delivery Dispatch**: Assign riders and monitor dispatch status.
- **Dining Tables**: Manage indoor/outdoor reservations.
- **Staff Directory**: Add, update, and manage shift staff for individual partner branches.

---

## 5. Direct Browser URL Testing (No Postman Required!)

All endpoints can be clicked and tested directly in your web browser:

### A. Dynamic Menu & Discovery Service (`/api/restaurants` & `/api/menu`)
- **View All Partner Restaurants**:  
  `http://localhost:8000/api/restaurants/all`
- **Nearby Real Places Discovery (Haversine)**:  
  `http://localhost:8000/api/restaurants/nearby?lat=17.3850&lon=78.4867&radius=15`
- **View All Menu Items**:  
  `http://localhost:8000/api/menu/all`
- **Check Dish Availability**:  
  `http://localhost:8000/api/menu/check-availability?id=1`
- **Toggle Sold-Out State**:  
  `http://localhost:8000/api/menu/toggle-availability?id=1`

### B. Order, Payments & Kitchen Service (`/api/orders`, `/api/payments`, `/api/reviews`)
- **List All Orders**:  
  `http://localhost:8000/api/orders/all`
- **Active Kitchen Pipeline (KDS Queue)**:  
  `http://localhost:8000/api/orders/kitchen/active`
- **Digital Tax Invoice Data**:  
  `http://localhost:8000/api/orders/1/invoice`
- **Live Order Tracking**:  
  `http://localhost:8000/api/orders/track?orderNumber=BB-1021`
- **Restaurant Reviews**:  
  `http://localhost:8000/api/reviews/restaurant/1`

### C. Role-Based JWT Auth Service (`/api/auth`)
- **View All Users**:  
  `http://localhost:8000/api/auth/users`
- **Get Ready-to-Use JWT Tokens**:  
  `http://localhost:8000/api/auth/demo-tokens`
- **Quick Login as Admin via URL**:  
  `http://localhost:8000/api/auth/quick-login?role=ADMIN`
- **Quick Login as Kitchen Staff via URL**:  
  `http://localhost:8000/api/auth/quick-login?role=KITCHEN_STAFF`
- **Quick Login as Customer via URL**:  
  `http://localhost:8000/api/auth/quick-login?role=CUSTOMER`

---

## 6. Interactive Swagger / OpenAPI Documentation

You can test and inspect all API endpoints interactively using Swagger UI:

| Documentation Interface | Direct Link | Description |
|---|---|---|
| **Unified Gateway Swagger UI** | **`http://localhost:8000/swagger-ui.html`** | Aggregated view of all 3 microservices with top-right dropdown selector |
| **Auth & Identity Service Swagger** | **`http://localhost:8081/swagger-ui/index.html`** | User auth, 7 roles, JWT issuance, staff & taste preferences |
| **Menu & Discovery Service Swagger** | **`http://localhost:8082/swagger-ui/index.html`** | Dynamic menus, GPS Haversine discovery, multilingual BistroBot |
| **Order & Kitchen Service Swagger** | **`http://localhost:8083/swagger-ui/index.html`** | Orders, KDS queue, payments, digital invoices, customer reviews |

*Raw OpenAPI 3.0 JSON specifications:*
- Auth Service: `http://localhost:8081/v3/api-docs` (or via Gateway: `http://localhost:8000/v3/api-docs/auth-service`)
- Menu Service: `http://localhost:8082/v3/api-docs` (or via Gateway: `http://localhost:8000/v3/api-docs/menu-service`)
- Order Service: `http://localhost:8083/v3/api-docs` (or via Gateway: `http://localhost:8000/v3/api-docs/order-service`)

---

## 7. How to Run the System

### Option A: One-Click Startup (Recommended)
Double-click `start-all.bat` in the project root:
1. Launches **Eureka Server** (:8761) and waits for registry readiness.
2. Launches **Auth Service** (:8081), **Menu Service** (:8082), and **Order Service** (:8083).
3. Launches **API Gateway** (:8000) hosting the embedded production web UI.
4. Open your browser to: **`http://localhost:8000`**

### Option B: Running with Vite Dev Server (Hot Reloading)
1. Start microservices via `start-all.bat`.
2. In a separate terminal:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Open **`http://localhost:5173`**.

To stop all services:
Double-click `stop-all.bat` to gracefully terminate ports 8761, 8000, 8081, 8082, 8083, and 5173.

---

## 8. PostgreSQL Database Configuration

The services connect to your local PostgreSQL instance:
- **Host**: `localhost:5432`
- **Database**: `restaurant_db`
- **User**: `postgres`
- **Password**: `sainikhil@0207`

Managed entities:
- `restaurant_users`: User credentials, security roles, preferred language, spice level, food & cuisine preferences.
- `restaurant_staff`: Staff member records, restaurant association, roles (`CHEF`, `KITCHEN_STAFF`, `DELIVERY_STAFF`, `MANAGER`), shift status.
- `restaurants`: Partner and discovery places, coordinates, external place IDs, partner status.
- `menu_items`: Regional dishes, meal types (`Tiffin`, `Lunch`, `Snacks`, `Dinner`), prices, availability.
- `restaurant_orders`: Orders with channels, status machine (`PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`), invoice numbers, payment status.
- `order_payments`: Payment transaction records, payment methods, gateway transaction IDs.
- `order_reviews`: Verified customer ratings and feedback linked to completed orders.
