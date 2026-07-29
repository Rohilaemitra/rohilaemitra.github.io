import { auth, db } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { requireAdmin } from './auth-guard.js';

const money = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });

requireAdmin(async () => {
  try {
    const [customers, milk] = await Promise.all([
      getDocs(collection(db, 'customerDiary')),
      getDocs(collection(db, 'milkDiary'))
    ]);

    let collectionTotal = 0;
    let customerDue = 0;
    let milkDue = 0;

    customers.forEach((item) => {
      const data = item.data();
      collectionTotal += Number(data.paid || 0);
      customerDue += Number(data.due || 0);
    });

    milk.forEach((item) => {
      const data = item.data();
      milkDue += Number(data.due || 0);
    });

    document.getElementById('customerCount').textContent = customers.size;
    document.getElementById('collectionTotal').textContent = money(collectionTotal);
    document.getElementById('customerDue').textContent = money(customerDue);
    document.getElementById('milkDue').textContent = money(milkDue);

    const status = document.getElementById('status');
    status.textContent = 'पुराना data Firebase से load हो गया';
    status.className = 'status show ok';
  } catch (error) {
    const status = document.getElementById('status');
    status.textContent = 'Data load error: ' + error.message;
    status.className = 'status show error';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  location.replace('login.html');
});
