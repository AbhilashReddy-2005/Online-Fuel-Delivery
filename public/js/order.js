// ─────────────────────────────────────────────
//  order.js  –  Place Fuel Order
//  Place at: public/js/order.js
// ─────────────────────────────────────────────

let userLat = null;
let userLon = null;
let map;

document.addEventListener("DOMContentLoaded", function () {

  const loader        = document.getElementById("loader");
  const locationInput = document.getElementById("location");
  const orderForm     = document.getElementById("orderForm");

  // ── GET USER LOCATION ──
  loader.style.display = "block";

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      async function (position) {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`
          );
          const data = await response.json();
          locationInput.value = data.display_name;
        } catch (e) {
          locationInput.value = `${userLat}, ${userLon}`;
        }

        loader.style.display = "none";

        // Init Leaflet map
        map = L.map("map").setView([userLat, userLon], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap"
        }).addTo(map);

        L.marker([userLat, userLon])
          .addTo(map)
          .bindPopup("Your Location")
          .openPopup();
      },

      function () {
        loader.innerText = "❌ Location permission denied. Please enter manually.";
      }
    );

  } else {
    loader.innerText = "Geolocation not supported by your browser.";
  }

  // ── SUBMIT ORDER ──
  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fuelType      = document.getElementById("fuelType").value;
    const quantity      = Number(document.getElementById("quantity").value);
    const location      = locationInput.value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!location) {
      alert("Please allow location access or enter your location.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          // ✅ Bearer prefix required by authMiddleware
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fuelType,
          quantity,
          location,
          paymentMethod,
          latitude:      userLat,
          longitude:     userLon,
          // ✅ FIX: send customer info so admin can see who ordered
          customerName:  (JSON.parse(localStorage.getItem("user") || "{}")).name || "Customer",
          customerPhone: (JSON.parse(localStorage.getItem("user") || "{}")).phone || ""
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Order failed ❌");
        return;
      }

      const orderId = data.orderId;

      // ✅ FIX: Always save orderId — tracking page needs this
      localStorage.setItem("lastOrderId", orderId);

      // ── CASH ON DELIVERY ──
      if (paymentMethod === "Cash") {
        alert("✅ Order Confirmed! (Cash on Delivery)");
        sessionStorage.setItem("trackingAccess", "true");
        // ✅ FIX: pass orderId in URL so tracking.js can fetch it
        window.location.href = `/tracking.html?orderId=${orderId}`;
      }

      // ── ONLINE PAYMENT ──
      else {
        // Price per litre (adjust if you have pricing API)
        const pricePerLitre = fuelType === "Diesel" ? 85 : 96;
        const amount = quantity * pricePerLitre;
        window.location.href = `/payment.html?orderId=${orderId}&amount=${amount}`;
      }

    } catch (err) {
      console.error("Order error:", err);
      alert("Server error. Please try again. ❌");
    }

  });

});