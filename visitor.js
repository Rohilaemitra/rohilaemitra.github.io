import { db } from "./firebase.js";

import {

doc,

getDoc,

setDoc,

updateDoc,

increment

}

from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function visitor(){

const ref=doc(db,"website","counter");

const snap=await getDoc(ref);

if(snap.exists()){

await updateDoc(ref,{

count:increment(1)

});

}else{

await setDoc(ref,{

count:1

});

}

const data=await getDoc(ref);

document.getElementById("visitor").innerHTML=

data.data().count;

}

visitor();
