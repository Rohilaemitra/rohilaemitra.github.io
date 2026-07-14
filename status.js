import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

window.checkStatus = async () => {

const appNo = document.getElementById("appNo").value;

const ref = doc(db, "applications", appNo);

const snap = await getDoc(ref);

if (snap.exists()) {
    document.getElementById("result").innerHTML =
        "Status : " + snap.data().status;
} else {
    document.getElementById("result").innerHTML =
        "Application Not Found";
}

}
