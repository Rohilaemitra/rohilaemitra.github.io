import { auth, db } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { requireAdmin } from './auth-guard.js';
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
requireAdmin(async()=>{try{const [c,m]=await Promise.all([getDocs(collection(db,'customers')),getDocs(collection(db,'milkRecords'))]);let collectionTotal=0,customerDue=0,milkDue=0;c.forEach(d=>{const x=d.data();collectionTotal+=Number(x.paid||0);customerDue+=Number(x.due||0)});m.forEach(d=>{const x=d.data();milkDue+=Number(x.due||0)});document.getElementById('customerCount').textContent=c.size;document.getElementById('collectionTotal').textContent=money(collectionTotal);document.getElementById('customerDue').textContent=money(customerDue);document.getElementById('milkDue').textContent=money(milkDue);const s=document.getElementById('status');s.textContent='Dashboard ready';s.className='status show ok'}catch(e){const s=document.getElementById('status');s.textContent='Data load error: '+e.message;s.className='status show error'}});
document.getElementById('logoutBtn').addEventListener('click',async()=>{await signOut(auth);location.replace('login.html')});
