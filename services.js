import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

window.addService = async () => {

const service =
document.getElementById("serviceName").value;

const price =
document.getElementById("price").value;

if(service=="") return;

await addDoc(collection(db,"services"),{

service,

price

});

alert("Service Added");

loadServices();

}

async function loadServices(){

const snapshot =
await getDocs(collection(db,"services"));

let html="";

snapshot.forEach((d)=>{

const data=d.data();

html+=`

<tr>

<td>${data.service}</td>

<td>${data.price}</td>

<td>

<button
onclick="deleteService('${d.id}')">

Delete

</button>

</td>

</tr>

`;

});

document.getElementById("serviceTable").innerHTML=html;

}

window.deleteService=async(id)=>{

await deleteDoc(doc(db,"services",id));

loadServices();

}

loadServices();
