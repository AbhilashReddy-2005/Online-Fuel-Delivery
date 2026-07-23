async function pay() {
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const amount  = params.get('amount');

  if (orderId) document.getElementById('orderId').value = orderId;
  if (amount)  document.getElementById('amount').value  = amount;

  if (!orderId || !amount) {
    alert('Missing Order ID or Amount in URL');
    return;
  }

  const res = await fetch('http://localhost:5000/api/payments/upi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount })
  });

  const data = await res.json();

  // ✅ Detect mobile vs desktop
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const baseParams = data.upiUrl.includes('?') ? data.upiUrl.split('?')[1] : data.upiUrl;
  const upiId      = new URLSearchParams(baseParams).get('pa') || '';

  const appButtonsHTML = isMobile ? `
    <div class="upi-apps">
      <a href="phonepe://pay?${baseParams}"><button>📱 PhonePe</button></a>
      <a href="tez://upi/pay?${baseParams}"><button>💳 Google Pay</button></a>
      <a href="paytmmp://pay?${baseParams}"><button>💰 Paytm</button></a>
      <a href="upi://pay?${baseParams}"><button>ın BHIM</button></a>
    </div>
    <p class="mobile-note">Tap an app above or scan the QR code.</p>
  ` : `
    <div style="
      background:#f0f1ff;
      border:1.5px solid #d8daff;
      border-radius:14px;
      padding:16px 20px;
      text-align:center;
      width:100%;
    ">
      <p style="font-size:0.82rem;color:#666;margin-bottom:8px;">
        📌 You're on desktop — open any UPI app on your phone and pay to:
      </p>
      <p style="font-size:1.1rem;font-weight:700;color:#4a4de6;margin-bottom:12px;">
        ${upiId}
      </p>
      <button onclick="copyUpiId('${upiId}')" style="
        padding:9px 22px;
        background:#4a4de6;
        color:#fff;
        border:none;
        border-radius:50px;
        font-weight:600;
        font-size:0.88rem;
        cursor:pointer;
      ">📋 Copy UPI ID</button>
      <p style="font-size:0.75rem;color:#aaa;margin-top:10px;">
        Or scan the QR code above with your phone camera.
      </p>
    </div>
  `;

  document.getElementById('qrBox').innerHTML = `
    ${appButtonsHTML}
    <button class="confirm-btn" onclick="confirmPayment('${orderId}')">
      ✅ I Have Completed Payment
    </button>
    <p class="mobile-note">After paying, click the button above to confirm.</p>
  `;
}

function copyUpiId(upiId) {
  navigator.clipboard.writeText(upiId).then(() => {
    alert('UPI ID copied: ' + upiId);
  }).catch(() => {
    prompt('Copy this UPI ID:', upiId);
  });
}

async function confirmPayment(orderId) {
  try {
    const res = await fetch('http://localhost:5000/api/payments/confirm/' + orderId, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Server error');
    alert('Payment Successful ✅');
    window.location = 'success.html';
  } catch (err) {
    alert('Could not confirm payment. Please try again.');
    console.error(err);
  }
}

async function manualPaymentDone() {

  const orderId = document.getElementById("orderId").value;
  const amount  = document.getElementById("amount").value;

  if (!orderId) {
    alert("Order ID missing ❌");
    return;
  }

  try {
    await fetch("/api/payments/confirm/" + orderId, {
      method: "POST"
    });
  } catch (e) {
    console.error(e);
  }

  // allow tracking page
  sessionStorage.setItem("trackingAccess", "true");

  // redirect
  window.location.href = `/tracking.html?orderId=${orderId}`;
}
