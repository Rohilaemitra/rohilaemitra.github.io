import { auth } from "./firebase.js";
import { signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

window.login = function () {

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

signInWithEmailAndPassword(auth,email,password)

.then(()=>{

alert("Login Successful");

window.location.href="admin.html";

})

.catch((error)=>{

document.getElementById("error").innerHTML=
error.message;

});

}
