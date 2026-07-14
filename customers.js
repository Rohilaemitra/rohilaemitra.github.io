import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

window.saveCustomer = async () => {

await addDoc(collection(db,"customers"),{

name:document.getElementById("name").value,

mobile:document.getElementById("mobile").value,

service:document.getElementById("service").value,

amount:document.getElementById("amount").value,

date:new Date()

});

alert("Customer Saved");

loadCustomers();

}

async function loadCustomers(){

const snapshot=await getDocs(collection(db,"customers"));

let html="";

snapshot.forEach((d)=>{

const c=d.data();

html+=`

<tr>

<td>${c.name}</td>

<td>${c.mobile}</td>

<td>${c.service}</td>

<td>${c.amount}</td>

<td>

<button onclick="deleteCustomer('${d.id}')">

Delete

</button>

</td>

</tr>

`;

});

document.getElementById("customerTable").innerHTML=html;

}

window.deleteCustomer=async(id)=>{

await deleteDoc(doc(db,"customers",id));

loadCustomers();

}

loadCustomers();
