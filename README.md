# NAAZ — Women's Bags & Accessories (ناز)

A high-converting, Pakistan-first ecommerce web application for luxury women's handbags and accessories, featuring Cash on Delivery (COD) nationwide fulfillment and automated supplier synchronization with Markaz Wholesale PK.

---

## 🌟 Key Features

- **Branding & Visual Excellence**: Hand-crafted calligraphic handbag mark (**"ناز"**) in gold foil, luxury typography (*Cinzel*, *Playfair Display*, *Inter*), responsive layouts.
- **Pakistan Localisation**: 100% PKR (`Rs.`), Cash on Delivery (COD), Pakistani city delivery dropdown (*Karachi, Lahore, Islamabad, Faisalabad, Multan, etc.*), and mobile validation (`03XXXXXXXXX`).
- **Markaz Automated Product Sync**: Reusable `MarkazSyncService` supporting batch JSON/CSV product imports with SKU deduplication (`MKZ-{id}`).
- **Configurable Pricing Engine**: Dynamic pricing formula with configurable minimum margins, markup percentages, operational buffers, and `.99` charm rounding.
- **Dedicated Product Detail View**: Markaz-style product detail page with breadcrumbs, gallery preview, quantity selector, and **"Suggested for You"** cross-selling catalog.
- **Admin Control Panel (`/#admin`)**:
  - Store metrics (Revenue, Total Orders, Active Products, Drafts).
  - Pricing Engine Strategy Controls.
  - Image Upload Uploader (File input from mobile/PC or SVG presets).
  - Product Catalog Management & One-Click Deletion.
  - COD Orders & Markaz Fulfillment Queue with Courier Tracking Entry (`TCS`, `Leopard`, `Trax`).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automation Tests
```bash
node test/markaz_automation.test.js
```

### 3. Start Server
```bash
npm start
```

- 🌐 Storefront: `http://localhost:8000`
- 🔐 Admin Control Panel: `http://localhost:8000/#admin`

---

## 📄 Documentation

- [MARKAZ_INTEGRATION.md](file:///c:/Users/m_jaz/Desktop/HandBags/MARKAZ_INTEGRATION.md) — Capability research & architecture decisions.
- [AUTOMATION.md](file:///c:/Users/m_jaz/Desktop/HandBags/AUTOMATION.md) — Pricing engine formulas & sync lifecycle.
- [DEPLOYMENT.md](file:///c:/Users/m_jaz/Desktop/HandBags/DEPLOYMENT.md) — Server & PM2 deployment instructions.
- [PROJECT_STATUS.md](file:///c:/Users/m_jaz/Desktop/HandBags/PROJECT_STATUS.md) — Full execution summary across all 22 phases.
