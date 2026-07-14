import { db } from "./firebase.js";

import {
collection,
addDoc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form=document.getElementById("appointmentForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

await addDoc(collection(db,"appointments"),{

name:document.getElementById("name").value,

mobile:document.getElementById("mobile").value,

date:document.getElementById("date").value,

time:document.getElementById("time").value,

service:document.getElementById("service").value,

status:"Pending"

});

alert("Appointment Booked Successfully");

form.reset();

});
