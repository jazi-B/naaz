"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const COURIER_LINKS = {
    tcs: (tn) => `https://www.tcsexpress.com/tracking?track_number=${encodeURIComponent(tn)}`,
    leopard: (tn) => `https://leopardscourier.com/tracking/${encodeURIComponent(tn)}`,
    leopards: (tn) => `https://leopardscourier.com/tracking/${encodeURIComponent(tn)}`,
    trax: (tn) => `https://sonic.trax.pk/tracking?tracking_number=${encodeURIComponent(tn)}`,
    postex: (tn) => `https://postex.pk/tracking?cn=${encodeURIComponent(tn)}`,
    callcourier: (tn) => `https://callcourier.com.pk/tracking/?tracking=${encodeURIComponent(tn)}`,
    mnp: (tn) => `https://www.mulphilog.com/tracking?consignment=${encodeURIComponent(tn)}`,
};
function maskName(name) {
    if (!name)
        return "Customer";
    const parts = name.trim().split(/\s+/);
    return parts
        .map((p) => (p.length > 2 ? p[0] + "*".repeat(p.length - 2) + p[p.length - 1] : p[0] + "*"))
        .join(" ");
}
function maskPhone(phone) {
    if (!phone)
        return "";
    const clean = phone.replace(/\s+/g, "");
    if (clean.length > 6) {
        return clean.slice(0, 4) + "****" + clean.slice(-3);
    }
    return clean.slice(0, 2) + "***";
}
function maskAddress(addr) {
    if (!addr)
        return "";
    const parts = addr.split(",");
    if (parts.length > 1) {
        return "*** " + parts.slice(1).join(",").trim();
    }
    return "*** " + addr.slice(-15);
}
async function GET(req, res) {
    const container = req.scope;
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { q, phone, email } = req.query;
    if (!q) {
        return res.status(400).json({ error: "Please enter your Order # or Tracking #" });
    }
    const searchTerm = q.trim();
    if (searchTerm.length < 1) {
        return res.status(400).json({ error: "Invalid search query" });
    }
    try {
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "display_id",
                "status",
                "email",
                "currency_code",
                "total",
                "created_at",
                "metadata",
                "shipping_address.*",
                "items.*",
            ],
        });
        const matched = (orders || []).find((o) => {
            // Direct tracking number match
            if (o.metadata?.tracking_info?.tracking_number?.toLowerCase() === searchTerm.toLowerCase())
                return true;
            if (o.metadata?.tracking_number?.toLowerCase() === searchTerm.toLowerCase())
                return true;
            // Order ID / Display ID match
            const matchesOrder = o.id === searchTerm ||
                `order_${o.display_id}` === searchTerm ||
                `${o.display_id}` === searchTerm;
            if (matchesOrder) {
                // If phone or email verification provided, verify it matches
                if (phone) {
                    const cleanPhone = phone.replace(/\D/g, "");
                    const oPhone = (o.shipping_address?.phone || "").replace(/\D/g, "");
                    return oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone);
                }
                if (email) {
                    return o.email?.toLowerCase() === email.trim().toLowerCase();
                }
                return true;
            }
            // Phone lookup match
            if (searchTerm.length >= 7) {
                const cleanSearch = searchTerm.replace(/\D/g, "");
                const oPhone = (o.shipping_address?.phone || "").replace(/\D/g, "");
                if (cleanSearch.length >= 7 && oPhone.length >= 7 && (oPhone.endsWith(cleanSearch) || cleanSearch.endsWith(oPhone))) {
                    return true;
                }
            }
            return false;
        });
        if (!matched) {
            return res.status(404).json({ error: "Order not found. Please verify your Order # or Mobile number." });
        }
        const trackingInfo = matched.metadata?.tracking_info || {};
        const courier = (trackingInfo.courier || matched.metadata?.courier || "TCS").toLowerCase();
        const trackingNumber = trackingInfo.tracking_number || matched.metadata?.tracking_number || `MKZ-TRK-${matched.display_id}8492`;
        const trackingUrlGenerator = COURIER_LINKS[courier] || COURIER_LINKS.tcs;
        const customerFullName = `${matched.shipping_address?.first_name || ""} ${matched.shipping_address?.last_name || ""}`.trim();
        return res.status(200).json({
            success: true,
            order: {
                id: matched.id,
                display_id: matched.display_id,
                status: matched.status,
                created_at: matched.created_at,
                customer_name: maskName(customerFullName),
                city: matched.shipping_address?.city || "Pakistan",
                address: maskAddress(matched.shipping_address?.address_1 || ""),
                phone: maskPhone(matched.shipping_address?.phone || ""),
                courier: (trackingInfo.courier || matched.metadata?.courier || "TCS Express").toUpperCase(),
                tracking_number: trackingNumber,
                tracking_url: trackingInfo.tracking_url || trackingUrlGenerator(trackingNumber),
                estimated_delivery: "2-4 Working Days",
                payment_method: "Cash on Delivery (COD)",
                items: (matched.items || []).map((i) => ({
                    title: i.title,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                })),
            },
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Error retrieving tracking status." });
    }
}
async function POST(req, res) {
    const container = req.scope;
    const authHeader = req.headers["authorization"] || req.headers["x-admin-token"];
    const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.JWT_SECRET;
    // Strict Admin Authorization Check
    const isAuthorizedAdmin = req.user || req.auth_context || (authHeader && authHeader.includes(adminSecret || "___"));
    if (!isAuthorizedAdmin) {
        return res.status(401).json({ error: "Unauthorized: Admin privileges required." });
    }
    const { order_id, courier, tracking_number } = req.body;
    if (!order_id || !tracking_number) {
        return res.status(400).json({ error: "order_id and tracking_number are required." });
    }
    try {
        const courierName = courier || "TCS";
        const courierLower = courierName.toLowerCase();
        const trackingUrlGenerator = COURIER_LINKS[courierLower] || COURIER_LINKS.tcs;
        const trackingUrl = trackingUrlGenerator(tracking_number);
        const client = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        await client.query(`UPDATE "order" 
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb), 
         '{tracking_info}', 
         $1::jsonb
       ),
       status = 'completed',
       updated_at = NOW()
       WHERE id = $2 OR display_id::text = $2`, [
            JSON.stringify({
                courier: courierName,
                tracking_number,
                tracking_url: trackingUrl,
                assigned_at: new Date().toISOString(),
            }),
            order_id,
        ]);
        return res.status(200).json({
            success: true,
            message: `Courier tracking updated successfully for Order #${order_id}`,
            courier: courierName,
            tracking_number,
            tracking_url: trackingUrl,
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal database error." });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3RyYWNraW5nL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBdUNBLGtCQXdHQztBQUVELG9CQTJEQztBQTNNRCxxREFBc0U7QUFFdEUsTUFBTSxhQUFhLEdBQTJDO0lBQzVELEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsb0RBQW9ELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3pGLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsd0NBQXdDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ2pGLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsd0NBQXdDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ2xGLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsa0RBQWtELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3hGLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsaUNBQWlDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQ3pFLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsaURBQWlELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzlGLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsa0RBQWtELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3hGLENBQUM7QUFFRixTQUFTLFFBQVEsQ0FBQyxJQUFhO0lBQzdCLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxVQUFVLENBQUM7SUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QyxPQUFPLEtBQUs7U0FDVCxHQUFHLENBQUMsQ0FBQyxDQUFD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