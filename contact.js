import { db } from "./firebase.js";

import {
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form=document.getElementById("contactForm");

if(form){

form.addEventListener("submit",async(e)=>{

e.preventDefault();

await addDoc(collection(db,"contacts"),{

name:document.getElementById("name").value,

mobile:document.getElementById("mobile").value,

email:document.getElementById("email").value,

message:document.getElementById("message").value,

date:new Date()

});

alert("Message Sent Successfully");

form.reset();

});

}
