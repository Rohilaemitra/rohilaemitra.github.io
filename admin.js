import { auth, db } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { requireAdmin } from './auth-guard.js';

const money = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

async function readCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  return { name, size: snapshot.size, rows: snapshot.docs.map((item) => item.data()) };
}

requireAdmin(async () => {
  const status = document.getElementById('status');
  try {
    const names = ['customers', 'customerDiary', 'milkDiary', 'milkRecords'];
    const results = await Promise.allSettled(names.map(readCollection));
    const loaded = {};
    const errors = [];

    results.forEach((result, index) => {
      const name = names[index];
      if (result.status === 'fulfilled') loaded[name] = result.value;
      else {
        loaded[name] = { name, size: 0, rows: [] };
        errors.push(`${name}: ${result.reason?.message || 'load error'}`);
      }
    });

    const customerRows = [
      ...loaded.customers.rows,
      ...loaded.customerDiary.rows
    ];
    const milkRows = [
      ...loaded.milkDiary.rows,
      ...loaded.milkRecords.rows
    ];

    let collectionTotal = 0;
    let customerDue = 0;
    let milkDue = 0;

    customerRows.forEach((data) => {
      collectionTotal += Number(data.paid || 0);
      const total = Number(data.total ?? data.amount ?? 0);
      customerDue += Number(data.due ?? (total - Number(data.paid || 0)));
    });

    milkRows.forEach((data) => {
      const quantity = Number(data.quantity ?? data.litre ?? data.liters ?? 0);
      const total = Number(data.total ?? data.amount ?? (quantity * Number(data.rate || 0)));
      milkDue += Number(data.due ?? (total - Number(data.paid || 0)));
    });

    document.getElementById('customerCount').textContent = customerRows.length;
    document.getElementById('collectionTotal').textContent = money(collectionTotal);
    document.getElementById('customerDue').textContent = money(customerDue);
    document.getElementById('milkDue').textContent = money(milkDue);

    const detail = names.map((name) => `${name}: ${loaded[name].size}`).join(' | ');
    if (errors.length) {
      status.textContent = `कुछ collections load नहीं हुईं — ${detail} — ${errors.join(' ; ')}`;
      status.className = 'status show error';
    } else if (customerRows.length + milkRows.length === 0) {
      status.textContent = `किसी भी collection में रिकॉर्ड नहीं मिला — ${detail}`;
      status.className = 'status show error';
    } else {
      status.textContent = `Firebase data मिल गया — ${detail}`;
      status.className = 'status show ok';
    }
  } catch (error) {
    status.textContent = `Data load error: ${error.message}`;
    status.className = 'status show error';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  location.replace('login.html');
});
