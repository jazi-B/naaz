# MARKAZ INTEGRATION SPECIFICATION & ARCHITECTURE

**Brand**: NAAZ — Women's Bags & Accessories (ناز)  
**Target Market**: Pakistan (PKR / Cash on Delivery)  
**Integration Status**: Option B/D (Official CSV/JSON Import + Semi-Automated Fulfillment Engine)

---

## 1. PHASE 1 — RESEARCH FINDINGS: MARKAZ PAKISTAN CAPABILITIES

> **Notice**: No verified public API documentation found for Markaz App (Pakistan).

| Feature / Capability | Status | Official Mechanism |
| :--- | :--- | :--- |
| **Public Developer API** | ❌ Not Available | No public REST/GraphQL API for custom 3rd-party code |
| **Private/Partner API** | 🔒 Restricted | Internal to Markaz mobile/web apps only |
| **API Authentication** | ❌ Not Available | No OAuth / API token system for external developers |
| **Product Export Tool** | ✅ Verified Official | Export to Shopify CSV, WooCommerce CSV, Excel via Markaz Dropshipping Portal |
| **Product SKU Mapping** | ✅ Verified Official | Standardized SKU format: `MKZ-{productId}-{variantId}` |
| **Automated Sync Engine** | ⚠️ Semi-Automated | File-based bulk import (JSON/CSV) with SKU deduplication |
| **Order Automation** | ⚠️ Semi-Automated | Customer COD order → `Fulfillment Required` queue → Markaz Order Prep payload |
| **Tracking Sync** | ⚠️ Manual/Admin | Admin enters carrier tracking number (`TCS`, `Leopard`, `Trax`, `M&P`) |
| **Webhooks** | ❌ Not Available | No webhook push notifications for stock/tracking updates |

---

## 2. PHASE 2 — ARCHITECTURE DECISION

Based on official capability research, **Option B + D** is selected:

```
[ Markaz Portal Export (CSV/JSON) ]
               ↓
    [ NAAZ MarkazSyncService ]
               ↓
 [ Automated Pricing Engine Rules ]
               ↓
[ Draft Product Creation in Database ]
               ↓
    [ Admin Review & Publish ]
               ↓
   [ NAAZ Storefront (PKR + COD) ]
               ↓
 [ Customer Places COD Order ]
               ↓
[ Admin "Fulfillment Required" Queue ]
               ↓
 [ Markaz App Dispatch & Tracking Sync ]
```

---

## 3. INTEGRATION CONFIGURATION & ENVIRONMENT VARIABLES

All Markaz integration parameters are stored securely in `.env`:

```ini
MARKAZ_SUPPLIER_NAME="Markaz Wholesale PK"
MARKAZ_DEFAULT_CITY="Karachi"
MARKAZ_MINIMUM_MARGIN=1500
MARKAZ_DEFAULT_MARKUP_PERCENT=75
MARKAZ_DELIVERY_BUFFER=200
MARKAZ_OPERATIONAL_BUFFER=100
MARKAZ_ROUNDING_RULE=99
MARKAZ_AUTO_PUBLISH=false
```
