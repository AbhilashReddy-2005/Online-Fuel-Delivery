// ── LOAD PROFILE ON PAGE LOAD ──
document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("pd-name").innerText       = user.name  || "—";
    document.getElementById("pd-email-body").innerText = user.email || "—";
    document.getElementById("pd-email").innerText      = user.email || "—";
    document.getElementById("pd-phone").innerText      = user.phone || "—";
  }
});


// ── TOGGLE SIDE MENU ──
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu.style.right === "0px") {
    menu.style.right = "-320px";   // ← was -280px (wrong — drawer is 320px wide)
  } else {
    menu.style.right = "0px";
  }
}

// Close side menu when clicking outside
document.addEventListener("click", function (event) {
  const menu   = document.getElementById("dropdownMenu");
  const button = document.querySelector(".menu-btn");
  if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
    menu.style.right = "-320px";   // ← was -280px
  }
});


// ── TOGGLE PROFILE DROPDOWN ──
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const isOpen   = dropdown.classList.contains("open");

  if (!isOpen) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      document.getElementById("pd-name").innerText       = user.name  || "—";
      document.getElementById("pd-email-body").innerText = user.email || "—";
      document.getElementById("pd-email").innerText      = user.email || "—";
      document.getElementById("pd-phone").innerText      = user.phone || "—";
    }
  }

  dropdown.classList.toggle("open");

  // Close side menu if it was open
  document.getElementById("dropdownMenu").style.right = "-320px";   // ← was -280px
}

// Close profile dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown   = document.getElementById("profileDropdown");
  const profileBtn = document.querySelector(".profile-icon-btn");

  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    profileBtn &&
    !profileBtn.contains(event.target)
  ) {
    dropdown.classList.remove("open");
  }
});



// ── LOGOUT ──
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged Out");
  window.location = "login.html";
}


// ── CANCEL ORDERS ──
function cancelOrders() {
  if (confirm("Do you want to cancel your order?")) {
    alert("Feature connected with admin panel.");
  }
}