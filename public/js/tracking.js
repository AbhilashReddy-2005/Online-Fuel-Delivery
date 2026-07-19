// ─────────────────────────────────────────────
//  tracking.js  –  Order Tracking Page
//  Place at: public/js/tracking.js
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", loadOrder);

let map;

async function loadOrder() {
  const ordersDiv = document.getElementById("orders");

  // ✅ FIX 1: Read orderId from URL (set by payment.js and order.js redirects)
  //           e.g. /tracking.html?orderId=abc123
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId") || localStorage.getItem("lastOrderId");

  if (!orderId) {
    ordersDiv.innerHTML = `
      <p style="color:red; font-size:16px; padding:20px; text-align:center;">
        ⚠ No order found. <a href="/order.html">Place an order first →</a>
      </p>`;
    return;
  }

  ordersDiv.innerHTML = "⏳ Loading your order...";

  const token = localStorage.getItem("token");

  try {
    // ✅ FIX 2: Fetch SPECIFIC order by ID, not all orders
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token || ""}`
      }
    });

    // ✅ FIX 3: Controller returns {success, data} — NOT a plain array
    const result = await res.json();

    if (!result.success || !result.data) {
      ordersDiv.innerHTML = `
        <p style="color:red; font-size:16px; padding:20px; text-align:center;">
          ❌ Order not found in database.
        </p>`;
      return;
    }

    const o = result.data;

    // Status badge colour
    const statusColors = {
      "Pending":            "#f97316",
      "Confirmed":          "#2563eb",
      "Payment Completed":  "#10b981",
      "In Transit":         "#7c3aed",
      "Delivered":          "#10b981",
      "Cancelled":          "#ef4444"
    };
    const statusColor = statusColors[o.status] || "#4a4de6";

    ordersDiv.innerHTML = `
      <div class="card" style="padding:20px; line-height:2;">
        <p><b>📦 Order ID:</b>&nbsp; ${o.orderNumber || o._id}</p>
        <p><b>⛽ Fuel Type:</b>&nbsp; ${o.fuelType}</p>
        <p><b>🧪 Quantity:</b>&nbsp; ${o.quantity} Liters</p>
        <p><b>📍 Location:</b>&nbsp; ${o.location}</p>
        <p><b>💳 Payment:</b>&nbsp; ${o.paymentMethod}</p>
        <p><b>🕐 Date:</b>&nbsp; ${new Date(o.createdAt).toLocaleString("en-IN")}</p>
        <p>
          <b>📌 Status:</b>&nbsp;
          <span style="
            color: ${statusColor};
            font-weight: 700;
            font-size: 17px;
          ">${o.status}</span>
        </p>
      </div>`;

    // Show map only if coordinates exist
    if (o.latitude && o.longitude) {
      showMap(o.latitude, o.longitude);
    } else {
      document.getElementById("map").style.display = "none";
    }

  } catch (error) {
    console.error("Tracking error:", error);
    ordersDiv.innerHTML = `
      <p style="color:red; padding:20px; text-align:center;">
        ❌ Server Error. Please try again.
      </p>`;
  }
}

// ── Show Leaflet Map ──
function showMap(lat, lon) {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = L.map("map").setView([lat, lon], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 Fuel Delivery Location")
    .openPopup();
}