import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
const form=document.getElementById('loginForm'), status=document.getElementById('status');
const show=(msg,type='info')=>{status.textContent=msg;status.className=`status show ${type}`};
onAuthStateChanged(auth,u=>{if(u) location.replace('admin.html')});
form.addEventListener('submit',async e=>{e.preventDefault();show('Login हो रहा है...');try{await signInWithEmailAndPassword(auth,document.getElementById('email').value.trim(),document.getElementById('password').value);location.replace('admin.html')}catch(err){show('Login नहीं हुआ: '+err.message,'error')}});
