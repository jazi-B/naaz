# NAAZ PAKISTAN ECOMMERCE DEPLOYMENT GUIDE

**Platform Stack**: Node.js v20+ / Express REST API / HTML5 Single Page Application (SPA)  
**Target OS**: Windows Server / Linux (Ubuntu 22.04 LTS / Debian)  
**Database**: Local JSON Database (`data/db.json`) + Mongoose MongoDB driver support  

---

## 1. System Requirements

- **Runtime**: Node.js v20.x or higher, NPM v10.x+
- **Memory**: Minimum 512MB RAM (1GB recommended)
- **Disk**: 500MB free disk space

---

## 2. Environment Setup

Create `.env` in the root directory:

```ini
PORT=8000
NODE_ENV=production

# Markaz Sourcing Configuration
MARKAZ_SUPPLIER_NAME="Markaz Wholesale PK"
MARKAZ_DEFAULT_CITY="Karachi"
MARKAZ_MINIMUM_MARGIN=1500
MARKAZ_DEFAULT_MARKUP_PERCENT=75
MARKAZ_DELIVERY_BUFFER=200
MARKAZ_OPERATIONAL_BUFFER=100
MARKAZ_ROUNDING_RULE=99
MARKAZ_AUTO_PUBLISH=false
```

---

## 3. Installation & Daemon Execution

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Automation Tests
```bash
node test/markaz_automation.test.js
```

### Step 3: Launch Production Process Daemon

#### Option A: PM2 Process Manager (Recommended for Linux/Windows Production)
```bash
npm install -g pm2
pm2 start server.js --name "naaz-store"
pm2 save
```

#### Option B: Standard Node Command
```bash
npm start
```

---

## 4. Active Endpoints

- 🌐 **Customer Storefront**: `http://localhost:8000`
- 🔐 **Admin Control Panel**: `http://localhost:8000/#admin`
- 📦 **Products API**: `http://localhost:8000/api/products`
- ⚙️ **Pricing Engine API**: `http://localhost:8000/api/admin/pricing-config`
- ⚡ **Markaz Batch Sync API**: `http://localhost:8000/api/admin/markaz/sync`
