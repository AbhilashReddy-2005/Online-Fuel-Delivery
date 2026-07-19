document.addEventListener("DOMContentLoaded", function () {

let otpVerified = false;


// RESET WHEN EMAIL CHANGES
const emailInput = document.getElementById("email");

if(emailInput){

emailInput.addEventListener("input", function(){

otpVerified = false;

document.getElementById("sendOtpBtn").innerHTML = "Send OTP";
document.getElementById("sendOtpBtn").style.color = "#3b6df6";

document.getElementById("otp").value = "";

document.getElementById("otpStatus").style.display = "none";

document.getElementById("verifyBtn").innerHTML = "Verify";
document.getElementById("verifyBtn").style.display = "block";

});

}


// SEND OTP
window.sendOTP = async function(){

const email = document.getElementById("email").value;

if(!email){
alert("Enter email first");
return;
}

const res = await fetch("http://localhost:5000/api/otp/send-email-otp",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email})

});

const data = await res.json();

alert(data.message);

document.getElementById("sendOtpBtn").innerHTML="Sent!";
document.getElementById("sendOtpBtn").style.color="green";

document.getElementById("otpBox").style.display="block";
document.getElementById("otpLabel").style.display="block";

};


// RESET MESSAGE WHEN USER TYPES OTP
const otpInput = document.getElementById("otp");

if(otpInput){

otpInput.addEventListener("input",function(){

const status = document.getElementById("otpStatus");
const verifyBtn = document.getElementById("verifyBtn");

status.style.display="none";
verifyBtn.innerHTML="Verify";

});

}


// VERIFY OTP
window.verifyOTP = async function(){

const email = document.getElementById("email").value;
const otp = document.getElementById("otp").value;

const res = await fetch("http://localhost:5000/api/otp/verify-email-otp",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({email,otp})

});

const data = await res.json();

const status = document.getElementById("otpStatus");
const verifyBtn = document.getElementById("verifyBtn");

if(res.ok){

otpVerified = true;

status.style.display="block";
status.style.color="green";
status.innerHTML="✔ Email Verified";

verifyBtn.style.display="none";

}else{

otpVerified = false;

status.style.display="block";
status.style.color="red";
status.innerHTML="❌ Invalid OTP";

verifyBtn.innerHTML="Re-Verify";

}

};


// REGISTER
const registerForm = document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit", async function(e){

e.preventDefault();

if(!otpVerified){

alert("Please verify OTP first ❌");
return;

}

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const phone = document.getElementById("phone").value;

const res = await fetch("http://localhost:5000/api/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name,
email,
password,
phone
})

});

const data = await res.json();

if(res.ok){

document.getElementById("successPopup").style.display="block";

setTimeout(()=>{
window.location="login.html";
},5000);

}else{

alert(data.message);

}

});

}


// LOGIN
const loginForm = document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit", async function(e){

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch("http://localhost:5000/api/admin/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email,
password
})

});

const data = await res.json();

if(res.ok){

localStorage.setItem("token",data.token);
localStorage.setItem("user",JSON.stringify(data.user));

alert("Login Successful ✅");

window.location="dashboard.html";

}else{

alert(data.message);

}

});

}

});