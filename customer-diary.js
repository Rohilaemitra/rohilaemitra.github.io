import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Form Elements

const date=document.getElementById("date");
const name=document.getElementById("name");
const mobile=document.getElementById("mobile");
const details=document.getElementById("details");
const total=document.getElementById("total");
const paid=document.getElementById("paid");
const due=document.getElementById("due");

const saveBtn=document.getElementById("saveBtn");

const tbody=document.querySelector("#customerTable tbody");

const search=document.getElementById("search");

// Global Variable

let editId=null;

// Auto Due

function calculateDue(){

let t=parseFloat(total.value)||0;

let p=parseFloat(paid.value)||0;

due.value=t-p;

}

total.addEventListener("input",calculateDue);

paid.addEventListener("input",calculateDue);// =========================
// SAVE CUSTOMER
// =========================

saveBtn.addEventListener("click", async () => {

    if(name.value.trim()==""){

        alert("Enter Customer Name");
        return;

    }

    await addDoc(collection(db,"customerDiary"),{

        date:date.value,
        name:name.value,
        mobile:mobile.value,
        details:details.value,
        total:Number(total.value),
        paid:Number(paid.value),
        due:Number(due.value),
        created:new Date().toLocaleString()

    });

    clearForm();

    loadCustomers();

});

// =========================
// CLEAR FORM
// =========================

function clearForm(){

    date.value="";
    name.value="";
    mobile.value="";
    details.value="";
    total.value="";
    paid.value="";
    due.value="";

}

// =========================
// LOAD CUSTOMERS
// =========================

async function loadCustomers(){

    tbody.innerHTML="";

    const snapshot=await getDocs(collection(db,"customerDiary"));

    snapshot.forEach((customer)=>{

        const d=customer.data();

        tbody.innerHTML+=`

<tr>

<td>${d.date||""}</td>

<td>${d.name||""}</td>

<td>${d.mobile||""}</td>

<td>${d.details||""}</td>

<td>${d.total||0}</td>

<td>${d.paid||0}</td>

<td>${d.due||0}</td>

<td>

<button onclick="editCustomer('${customer.id}')">
✏ Edit
</button>

<button onclick="deleteCustomer('${customer.id}')">
🗑 Delete
</button>

</td>

</tr>

`;

    });

}

loadCustomers();
