const API = "http://localhost:5000/api/admin";


// REGISTER ADMIN

document.getElementById("adminRegister").addEventListener("submit",async(e)=>{

e.preventDefault();

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(`${API}/register`,{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({name,email,password})

});

const data = await res.json();

alert(data.message);

});



