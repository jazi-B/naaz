# AUTOMATION & PRICING ENGINE ARCHITECTURE

## 1. Automated Pricing Engine Formula

NAAZ implements dynamic, configurable pricing strategy rules for all imported Markaz products:

$$\text{Calculated Price} = \text{Source Cost} + \text{Delivery Buffer} + \text{Operational Buffer} + \left( \text{Source Cost} \times \frac{\text{Markup } \%}{100} \right)$$

### Pricing Safeguards:
1. **Minimum Margin Enforcement**:
   - If $\text{Calculated Selling Price} - \text{Source Cost} < \text{Minimum Margin}$ (e.g. Rs. 1,500), the selling price is automatically adjusted upward to guarantee the minimum margin.
2. **Charm Rounding Rule**:
   - Round prices to ending in `99` (e.g. `Rs. 4,999`, `Rs. 6,499`) for luxury fashion positioning.

---

## 2. Product Synchronization Lifecycle

1. **Importing**:
   - Accepts CSV / JSON files or raw product arrays from Markaz.
   - Extracts title, description, color, material, dimensions, images, supplier city, source cost, and supplier SKU.
2. **Normalisation**:
   - Strips generic/redundant fashion keywords.
   - Preserves verified specifications without making false material claims.
3. **Deduplication**:
   - Matches against existing `supplier_sku` / `sku`. Updates price, stock, and specs if already present; creates new product if new.
4. **Draft Defaulting**:
   - All newly imported products are created with `status: "draft"` until reviewed or published by the administrator.

---

## 3. Order Fulfillment Workflow ("Fulfillment Required")

1. Customer places Cash on Delivery order on NAAZ (`NZ-ORDER-XXXX`).
2. Order is validated and stored with `status: "confirmed"`.
3. Order enters the **Admin Fulfillment Required Queue**:
   - Prepares exact Markaz Order payload (Supplier SKU, Customer Name, Phone `03XXXXXXXXX`, City, Shipping Address, COD Collection Amount).
4. Administrator dispatches order on Markaz app and inputs Markaz Order ID & Carrier Tracking Number (`TCS`, `Leopard`, `Trax`).
5. Order status updates to `shipped` and customer receives fulfillment tracking update.

---

## 4. Fail-Safe Inventory Controls

- If sync encounters corrupted inputs or network drops, existing active products **retain their last valid state**.
- Products are **never wiped** or automatically set to 0 stock on transient failure.
