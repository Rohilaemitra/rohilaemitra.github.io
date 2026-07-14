import { auth, db } from "./firebase.js";

import {
signOut
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

window.logout=function(){

signOut(auth).then(()=>{

window.location.href="login.html";

});

}

async function loadData(){

const querySnapshot=await getDocs(collection(db,"contacts"));

let html="";

querySnapshot.forEach((doc)=>{

const d=doc.data();

html+=`
<tr>

<td>${d.name}</td>

<td>${d.mobile}</td>

<td>${d.email}</td>

<td>${d.message}</td>

</tr>
`;

});

document.getElementById("data").innerHTML=html;

}

loadData();
