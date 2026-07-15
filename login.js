import { auth } from "./firebase.js";

import {
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

const email = document.getElementById("email").value.trim();

const password = document.getElementById("password").value.trim();

const error = document.getElementById("error");

error.innerHTML = "";

if(email === "" || password === ""){

error.innerHTML = "Please enter email and password.";

return;

}

try{

await signInWithEmailAndPassword(auth, email, password);

window.location.href = "admin.html";

}catch(err){

error.innerHTML = err.message;

}

});
