import { db } from './firebase.js';
import { requireAdmin } from './auth-guard.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const READ_COLLECTIONS = ['customers', 'customerDiary'];
const WRITE_COLLECTION = 'customers';

const $ = (id) => document.getElementById(id);
const form = $('entryForm');
const tbody = $('tbody');
const statusBox = $('status');

let rows = [];
let editRef = null;
let sourceCounts = {};

const num = (value) => Number(value || 0);
const money = (value) =>
  '₹' + num(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);

function show(message, type = 'info') {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.className = `status show ${type}`;
}

function normalizeRecord(collectionName, item) {
  const raw = item.data();
  return {
    id: item.id,
    sourceCollection: collectionName,
    rowKey: `${collectionName}:${item.id}`,
    ...raw,
    date: raw.date || '',
    name: raw.name || '',
    mobile: raw.mobile || '',
    service: raw.service || raw.details || '',
    total: num(raw.total ?? raw.amount),
    paid: num(raw.paid),
    due: num(raw.due ?? (num(raw.total ?? raw.amount) - num(raw.paid))),
    workStatus: raw.workStatus || raw.status || 'Pending',
    note: raw.note || ''
  };
}

function dateValue(value) {
  const text = String(value || '').trim();
  const iso = Date.parse(text);
  if (!Number.isNaN(iso)) return iso;
  const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
  return 0;
}

function calculateDue() {
  $('due').value = Math.max(0, num($('total').value) - num($('paid').value)).toFixed(2);
}

function resetForm() {
  editRef = null;
  form.reset();
  $('date').value = new Date().toISOString().slice(0, 10);
  $('paid').value = 0;
  calculateDue();
  $('saveBtn').textContent = 'Save';
}

async function readCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  sourceCounts[collectionName] = snapshot.size;
  return snapshot.docs.map((item) => normalizeRecord(collectionName, item));
}

async function loadRecords() {
  show('Firebase से पुराना Customer data खोज रहे हैं...');
  sourceCounts = {};

  const results = await Promise.allSettled(
    READ_COLLECTIONS.map((name) => readCollection(name))
  );

  const errors = [];
  rows = [];

  results.forEach((result, index) => {
    const name = READ_COLLECTIONS[index];
    if (result.status === 'fulfilled') {
      rows.push(...result.value);
    } else {
      sourceCounts[name] = 0;
      errors.push(`${name}: ${result.reason?.message || 'load error'}`);
    }
  });

  rows.sort((a, b) => dateValue(b.date) - dateValue(a.date));
  render();

  const detail = READ_COLLECTIONS
    .map((name) => `${name}: ${sourceCounts[name] || 0}`)
    .join(' | ');

  if (errors.length) {
    show(`कुछ data load नहीं हुआ — ${detail} — ${errors.join(' ; ')}`, 'error');
  } else if (rows.length === 0) {
    show(`0 रिकॉर्ड मिले — ${detail}. Firebase Console में सही collection नाम जाँचें।`, 'error');
  } else {
    show(`कुल ${rows.length} रिकॉर्ड मिले — ${detail}`, 'ok');
  }
}

function filteredRows() {
  const keyword = $('search').value.toLowerCase();
  const selectedStatus = $('filterStatus').value;

  return rows.filter((item) => {
    const matchesStatus = !selectedStatus || item.workStatus === selectedStatus;
    const searchable = [item.name, item.mobile, item.service, item.note]
      .join(' ')
      .toLowerCase();
    return matchesStatus && searchable.includes(keyword);
  });
}

function render() {
  const list = filteredRows();

  tbody.innerHTML = list.length
    ? list.map((item) => `
      <tr>
        <td>${esc(item.date)}</td>
        <td>${esc(item.name)}</td>
        <td>${esc(item.mobile)}</td>
        <td>${esc(item.service)}</td>
        <td>${money(item.total)}</td>
        <td>${money(item.paid)}</td>
        <td>${money(item.due)}</td>
        <td>${esc(item.workStatus)}</td>
        <td class="no-print">
          <button class="btn light edit" data-key="${esc(item.rowKey)}">Edit</button>
          <button class="btn danger del" data-key="${esc(item.rowKey)}">Delete</button>
        </td>
      </tr>
    `).join('')
    : '<tr><td class="empty" colspan="9">No records</td></tr>';

  $('count').textContent = rows.length;
  $('totalSum').textContent = money(rows.reduce((sum, item) => sum + num(item.total), 0));
  $('paidSum').textContent = money(rows.reduce((sum, item) => sum + num(item.paid), 0));
  $('dueSum').textContent = money(rows.reduce((sum, item) => sum + num(item.due), 0));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const service = $('service').value.trim();
  const data = {
    date: $('date').value,
    name: $('name').value.trim(),
    mobile: $('mobile').value.trim(),
    service,
    details: service,
    total: num($('total').value),
    paid: num($('paid').value),
    due: num($('due').value),
    workStatus: $('workStatus').value,
    note: $('note').value.trim(),
    updatedAt: serverTimestamp()
  };

  try {
    show('Saving...');
    if (editRef) {
      await updateDoc(doc(db, editRef.collectionName, editRef.id), data);
    } else {
      await addDoc(collection(db, WRITE_COLLECTION), {
        ...data,
        createdAt: serverTimestamp()
      });
    }
    resetForm();
    await loadRecords();
  } catch (error) {
    show(`Save error: ${error.message}`, 'error');
  }
});

tbody.addEventListener('click', async (event) => {
  const key = event.target.dataset.key;
  if (!key) return;

  const item = rows.find((row) => row.rowKey === key);
  if (!item) return;

  if (event.target.classList.contains('edit')) {
    editRef = { collectionName: item.sourceCollection, id: item.id };
    $('date').value = item.date || '';
    $('name').value = item.name || '';
    $('mobile').value = item.mobile || '';
    $('service').value = item.service || '';
    $('total').value = item.total ?? '';
    $('paid').value = item.paid ?? '';
    $('workStatus').value = item.workStatus || 'Pending';
    $('note').value = item.note || '';
    calculateDue();
    $('saveBtn').textContent = 'Update';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (event.target.classList.contains('del') && confirm('यह रिकॉर्ड हटाएँ?')) {
    try {
      await deleteDoc(doc(db, item.sourceCollection, item.id));
      await loadRecords();
    } catch (error) {
      show(`Delete error: ${error.message}`, 'error');
    }
  }
});

['total', 'paid'].forEach((id) => $(id).addEventListener('input', calculateDue));
$('search').addEventListener('input', render);
$('filterStatus').addEventListener('change', render);
$('clearBtn').addEventListener('click', resetForm);
$('printBtn').addEventListener('click', () => window.print());

$('csvBtn').addEventListener('click', () => {
  const lines = [
    ['Date', 'Name', 'Mobile', 'Service', 'Total', 'Paid', 'Due', 'Status', 'Source'],
    ...rows.map((item) => [
      item.date,
      item.name,
      item.mobile,
      item.service,
      item.total,
      item.paid,
      item.due,
      item.workStatus,
      item.sourceCollection
    ])
  ];

  const csv = lines
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
  link.download = 'customer-diary-all-data.csv';
  link.click();
  URL.revokeObjectURL(link.href);
});

requireAdmin(() => {
  resetForm();
  loadRecords().catch((error) => show(`Load error: ${error.message}`, 'error'));
});
