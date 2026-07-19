// ─────────────────────────────────────────────
//  payment.js  –  UPI Payment Helper
//  Place at: public/js/payment.js
//  ⚠ DELETE the old duplicate version if you had two
// ─────────────────────────────────────────────

/* SVG logos for each UPI app */
const UPI_LOGOS = {
  phonepe: `<svg width="22" height="22" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="14" fill="#5f259f"/>
    <path d="M44 21.5C44 17.36 40.64 14 36.5 14H18v32l8-8.08V35h10.5C40.64 35 44 31.64 44 27.5V21.5Z" fill="#fff"/>
    <path d="M26 35v7l8-8.08" fill="#cba3e8"/>
  </svg>`,

  gpay: `<svg width="22" height="22" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="14" fill="#fff" stroke="#e0e0e0" stroke-width="1.5"/>
    <text x="7" y="43" font-family="Arial" font-weight="900" font-size="27" fill="#4285F4">G</text>
    <text x="30" y="43" font-family="Arial" font-weight="700" font-size="27" fill="#EA4335">P</text>
  </svg>`,

  paytm: `<svg width="22" height="22" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="14" fill="#00BAF2"/>
    <rect x="10" y="10" width="17" height="17" rx="3" fill="#fff"/>
    <rect x="33" y="10" width="17" height="17" rx="3" fill="#fff"/>
    <rect x="10" y="33" width="17" height="17" rx="3" fill="#fff"/>
    <text x="32" y="48" font-family="Arial Black" font-weight="900" font-size="19" fill="#fff">P</text>
  </svg>`,

  bhim: `<svg width="22" height="22" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="14" fill="#00518C"/>
    <rect x="8" y="9"  width="44" height="7" rx="2" fill="#FF9933"/>
    <rect x="8" y="44" width="44" height="7" rx="2" fill="#138808"/>
    <circle cx="30" cy="30" r="8"  fill="none" stroke="#fff" stroke-width="1.8"/>
    <circle cx="30" cy="30" r="2"  fill="#fff"/>
    <line x1="30" y1="22" x2="30" y2="38" stroke="#fff" stroke-width="1.2"/>
    <line x1="22" y1="30" x2="38" y2="30" stroke="#fff" stroke-width="1.2"/>
    <line x1="24.3" y1="24.3" x2="35.7" y2="35.7" stroke="#fff" stroke-width="1"/>
    <line x1="35.7" y1="24.3" x2="24.3" y2="35.7" stroke="#fff" stroke-width="1"/>
  </svg>`
};

/* ── Render QR + UPI ID strip ── */
function renderQR(upiUrl, upiId) {
  const encoded = encodeURIComponent(upiUrl);
  const qrSrc   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&color=4a4de6&bgcolor=ffffff&margin=10`;

  const frame = document.getElementById("qrFrameWrap");
  if (!frame) return;

  const img = document.createElement("img");
  img.alt    = "UPI QR Code";
  img.width  = 180;
  img.height = 180;
  img.style.cssText = "border-radius:8px; display:none;";

  const upiStrip = document.createElement("div");
  upiStrip.style.cssText = `
    display:none; margin-top:14px; padding:10px 18px;
    background:#fff; border:1.5px solid #d8daff; border-radius:12px;
    text-align:center; width:100%; max-width:260px;
  `;
  upiStrip.innerHTML = `
    <p style="font-size:0.7rem;color:#999;margin-bottom:3px;text-transform:uppercase;
              letter-spacing:0.05em;font-weight:600;">UPI ID</p>
    <p style="font-size:0.98rem;font-weight:700;color:#4a4de6;
              margin-bottom:8px;word-break:break-all;">${upiId}</p>
    <button onclick="copyUpiId('${upiId}')"
      style="background:#4a4de6;color:#fff;border:none;border-radius:8px;
             padding:7px 16px;font-weight:600;font-size:0.82rem;cursor:pointer;">
      📋 Copy UPI ID
    </button>`;

  img.onload = () => {
    frame.querySelector(".qr-loading")?.remove();
    img.style.display = "block";
    if (upiId) upiStrip.style.display = "block";
  };
  img.onerror = () => {
    frame.innerHTML = '<p style="color:#f44;font-size:0.8rem;text-align:center;padding:10px;">QR failed to load.<br>Check your internet.</p>';
  };

  img.src = qrSrc;
  frame.appendChild(img);
  frame.appendChild(upiStrip);
}

/* ── Render UPI app buttons ── */
function renderAppButtons(baseParams) {
  const apps = [
    { id: "phonepeLink", href: `phonepe://pay?${baseParams}`, logo: UPI_LOGOS.phonepe, label: "PhonePe"    },
    { id: "gpayLink",    href: `tez://upi/pay?${baseParams}`, logo: UPI_LOGOS.gpay,    label: "Google Pay" },
    { id: "paytmLink",   href: `paytmmp://pay?${baseParams}`, logo: UPI_LOGOS.paytm,   label: "Paytm"      },
    { id: "bhimLink",    href: `upi://pay?${baseParams}`,     logo: UPI_LOGOS.bhim,    label: "BHIM UPI"   }
  ];

  apps.forEach(app => {
    const el = document.getElementById(app.id);
    if (!el) return;
    el.href = app.href;
    el.innerHTML = app.logo + app.label;
  });
}

function copyUpiId(upiId) {
  navigator.clipboard.writeText(upiId)
    .then(() => alert("✅ UPI ID copied!"))
    .catch(() => prompt("Copy this UPI ID:", upiId));
}

/* ════════════════════════════════════════════
   MAIN — runs on page load
════════════════════════════════════════════ */
async function pay() {
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const amount  = params.get("amount");

  // Populate hidden inputs and display elements
  if (orderId) {
    const hiddenEl  = document.getElementById("orderId");
    const displayEl = document.getElementById("orderIdShow");
    if (hiddenEl)  hiddenEl.value      = orderId;
    if (displayEl) displayEl.innerText = orderId;
  }
  if (amount) {
    const hiddenEl  = document.getElementById("amount");
    const displayEl = document.getElementById("amountShow");
    if (hiddenEl)  hiddenEl.value      = amount;
    if (displayEl) displayEl.innerText = "₹" + amount;
  }

  if (!orderId || !amount) {
    alert("Missing Order ID or Amount ❌");
    return;
  }

  let data;
  try {
    const res = await fetch("/api/payments/upi", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderId, amount })
    });
    data = await res.json();
  } catch (err) {
    console.error("Backend error:", err);
    // Fallback UPI URL if backend unreachable
    data = { upiUrl: `upi://pay?pa=6303247771@ybl&pn=FuelGo&am=${amount}&cu=INR&tn=Order-${orderId}` };
  }

  const upiUrl     = data.upiUrl || "";
  const baseParams = upiUrl.includes("?") ? upiUrl.split("?")[1] : upiUrl;
  const upiId      = new URLSearchParams(baseParams).get("pa") || "";

  renderQR(upiUrl, upiId);
  renderAppButtons(baseParams);
}

/* ════════════════════════════════════════════
   CONFIRM PAYMENT BUTTON
   Called when user clicks "I Have Completed Payment"
════════════════════════════════════════════ */
async function manualPaymentDone() {
  const orderId = document.getElementById("orderId")?.value;

  if (!orderId) {
    alert("Order ID missing ❌");
    return;
  }

  try {
    const res = await fetch(`/api/payments/confirm/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Server error");

  } catch (e) {
    console.error("Confirm error:", e);
    // Don't block the user — still redirect to tracking
  }

  // ✅ Save orderId for tracking page fallback
  localStorage.setItem("lastOrderId", orderId);

  // ✅ Set gate flag
  sessionStorage.setItem("trackingAccess", "true");

  // ✅ Redirect with orderId in URL so tracking.js can fetch it
  window.location.href = `/tracking.html?orderId=${orderId}`;
}

// ── Kick off ──
window.onload = pay;