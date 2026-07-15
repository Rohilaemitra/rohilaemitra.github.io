import { auth } from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ===== Check Login =====

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
    }

});

// ===== Logout =====

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    if (confirm("Are you sure you want to logout?")) {

        try {

            await signOut(auth);

            alert("Logout Successful");

            window.location.href = "login.html";

        } catch (error) {

            alert(error.message);

        }

    }

});
