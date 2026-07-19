document.addEventListener("DOMContentLoaded", loadOrders);

let map;

async function loadOrders() {

  const ordersDiv = document.getElementById("orders");
  ordersDiv.innerHTML = "Loading order...";

  const token = localStorage.getItem("token");

  if (!token) {
    ordersDiv.innerHTML = "Please login first ❌";
    setTimeout(() => { window.location = "/login.html"; }, 2000);
    return;
  }

  // ── GET ORDER ID FROM URL ──
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  console.log("🔍 Order ID from URL:", orderId);

  if (!orderId) {
    ordersDiv.innerHTML = "No Order ID found in URL ❌";
    return;
  }

  try {

    // ── FETCH SINGLE ORDER ──
    // ✅ FIXED: use "Bearer " prefix so backend auth middleware accepts it
    const res = await fetch(`/api/orders/${orderId}`, {
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    console.log("📡 Response status:", res.status);

    if (res.status === 401) {
      ordersDiv.innerHTML = "Session expired. Please login again ❌";
      setTimeout(() => { window.location = "/login.html"; }, 2000);
      return;
    }

    const result = await res.json();
    console.log("📦 API result:", result);

    const order = result.data;

    if (!order) {
      ordersDiv.innerHTML = `No Orders Found 📦`;
      return;
    }

    // ── DISPLAY ORDER ──
    ordersDiv.innerHTML = `
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Order No:</b> ${order.orderNumber || "—"}</p>
      <p><b>Fuel:</b> ${order.fuelType}</p>
      <p><b>Quantity:</b> ${order.quantity} Liters</p>
      <p><b>Location:</b> ${order.location}</p>
      <p><b>Payment:</b> ${order.paymentMethod}</p>
      <p><b>Status:</b> <span style="color:#4a4de6;font-weight:700">${order.status}</span></p>
      <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
    `;

    // ── SHOW MAP ──
    if (order.latitude && order.longitude) {
      showMap(order.latitude, order.longitude);
    }

  } catch (error) {
    console.error("❌ Tracking error:", error);
    ordersDiv.innerHTML = "Server Error ❌ Check console for details.";
  }
}

// ── MAP ──
function showMap(lat, lon) {
  if (map) { map.remove(); }

  map = L.map("map").setView([lat, lon], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup("Your Delivery Location 📍")
    .openPopup();
}