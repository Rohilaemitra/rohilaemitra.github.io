import { db } from "./firebase.js";

import {
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

window.saveNotice = async () => {

const notice =
document.getElementById("notice").value;

await setDoc(doc(db,"website","notice"),{

text:notice

});

alert("Notice Saved");

loadNotice();

}

async function loadNotice(){

const snap =
await getDoc(doc(db,"website","notice"));

if(snap.exists()){

document.getElementById("showNotice").innerHTML =
snap.data().text;

}

}

loadNotice();
