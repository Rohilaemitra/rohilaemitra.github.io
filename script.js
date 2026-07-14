// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "rohila-e-mitra.firebaseapp.com",
  projectId: "rohila-e-mitra",
  storageBucket: "rohila-e-mitra.firebasestorage.app",
  messagingSenderId: "630734393676",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// =============================
// ROHILA E-MITRA CENTER
// script.js
// =============================

// Footer Year
document.addEventListener("DOMContentLoaded", function () {

    const footer = document.querySelector("footer");

    if (footer) {
        footer.innerHTML =
            "© " +
            new Date().getFullYear() +
            " ROHILA E-MITRA CENTER | All Rights Reserved";
    }

});

//
// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Navbar Active Link
const links = document.querySelectorAll("nav a");

links.forEach(link => {

    link.addEventListener("click", function () {

        links.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});

// Service Card Animation
const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";
        card.style.transition = ".3s";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// Contact Form
const form = document.querySelector("form");

if(form){

form.addEventListener("submit",function(e){

e.preventDefault();

alert("Thank You! Your message has been submitted.");

form.reset();

});

}

// Scroll to Top Button
const topBtn=document.createElement("button");

topBtn.innerHTML="⬆";

topBtn.id="topBtn";

document.body.appendChild(topBtn);

topBtn.style.cssText=`
position:fixed;
bottom:90px;
right:20px;
width:50px;
height:50px;
border:none;
border-radius:50%;
background:#0d47a1;
color:white;
font-size:22px;
cursor:pointer;
display:none;
box-shadow:0 5px 10px rgba(0,0,0,.3);
`;

window.onscroll=function(){

if(document.documentElement.scrollTop>300){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

};

topBtn.onclick=function(){

window.scrollTo({

top:0,

behavior:"smooth"

});

};










import { db } from "./firebase.js";

import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function loadNotice(){

const snap =
await getDoc(doc(db,"website","notice"));

if(snap.exists()){

document.getElementById("noticeArea").innerHTML =
snap.data().text;

}

}

loadNotice();
// Console Message
console.log("ROHILA E-MITRA CENTER Loaded Successfully");
