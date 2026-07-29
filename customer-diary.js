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

const COLLECTION = 'customerDiary';
const $ = (id) => document.getElementById(id);
const form = $('entryForm');
const tbody = $('tbody');
const statusBox = $('status');

let rows = [];
let editId = null;

const num = (value) => Number(value || 0);
const money = (value) =>
  '₹' + num(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const esc = (value) =>
  String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[char]);

function show(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = `status show ${type}`;
}

function normalizeRecord(id, raw) {
  return {
    id,
    ...raw,
    service: raw.service || raw.details || '',
    workStatus: raw.workStatus || 'Pending',
    note: raw.note || ''
  };
}

function calculateDue() {
  $('due').value = Math.max(
    0,
    num($('total').value) - num($('paid').value)
  ).toFixed(2);
}

function resetForm() {
  editId = null;
  form.reset();
  $('date').value = new Date().toISOString().slice(0, 10);
  $('paid').value = 0;
  calculateDue();
  $('saveBtn').textContent = 'Save';
}

async function loadRecords() {
  show('पुराना Customer Diary data loading...');
  const snapshot = await getDocs(collection(db, COLLECTION));

  rows = snapshot.docs
    .map((item) => normalizeRecord(item.id, item.data()))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  render();
  show(`Customer Diary के ${rows.length} रिकॉर्ड मिल गए`, 'ok');
}

function filteredRows() {
  const keyword = $('search').value.toLowerCase();
  const selectedStatus = $('filterStatus').value;

  return rows.filter((item) => {
    const matchesStatus =
      !selectedStatus || item.workStatus === selectedStatus;

    const searchable = [
      item.name,
      item.mobile,
      item.service,
      item.details
    ].join(' ').toLowerCase();

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
          <button class="btn light edit" data-id="${item.id}">Edit</button>
          <button class="btn danger del" data-id="${item.id}">Delete</button>
        </td>
      </tr>
    `).join('')
    : '<tr><td class="empty" colspan="9">No records</td></tr>';

  const total = rows.reduce((sum, item) => sum + num(item.total), 0);
  const paid = rows.reduce((sum, item) => sum + num(item.paid), 0);
  const due = rows.reduce((sum, item) => sum + num(item.due), 0);

  $('count').textContent = rows.length;
  $('totalSum').textContent = money(total);
  $('paidSum').textContent = money(paid);
  $('dueSum').textContent = money(due);
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

    if (editId) {
      await updateDoc(doc(db, COLLECTION, editId), data);
    } else {
      await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: serverTimestamp()
      });
    }

    resetForm();
    await loadRecords();
  } catch (error) {
    show(error.message, 'error');
  }
});

tbody.addEventListener('click', async (event) => {
  const id = event.target.dataset.id;
  if (!id) return;

  if (event.target.classList.contains('edit')) {
    const item = rows.find((row) => row.id === id);
    if (!item) return;

    editId = id;
    $('date').value = item.date || '';
    $('name').value = item.name || '';
    $('mobile').value = item.mobile || '';
    $('service').value = item.service || item.details || '';
    $('total').value = item.total ?? '';
    $('paid').value = item.paid ?? '';
    $('workStatus').value = item.workStatus || 'Pending';
    $('note').value = item.note || '';
    calculateDue();
    $('saveBtn').textContent = 'Update';
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (
    event.target.classList.contains('del') &&
    confirm('यह रिकॉर्ड हटाएँ?')
  ) {
    await deleteDoc(doc(db, COLLECTION, id));
    await loadRecords();
  }
});

['total', 'paid'].forEach((id) =>
  $(id).addEventListener('input', calculateDue)
);

$('search').addEventListener('input', render);
$('filterStatus').addEventListener('change', render);
$('clearBtn').addEventListener('click', resetForm);
$('printBtn').addEventListener('click', () => print());

$('csvBtn').addEventListener('click', () => {
  const lines = [
    ['Date', 'Name', 'Mobile', 'Service', 'Total', 'Paid', 'Due', 'Status'],
    ...rows.map((item) => [
      item.date,
      item.name,
      item.mobile,
      item.service,
      item.total,
      item.paid,
      item.due,
      item.workStatus
    ])
  ];

  const csv = lines
    .map((row) =>
      row.map((value) =>
        '"' + String(value ?? '').replaceAll('"', '""') + '"'
      ).join(',')
    )
    .join('\n');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(
    new Blob(['\ufeff' + csv], { type: 'text/csv' })
  );
  link.download = 'customer-diary.csv';
  link.click();
});

requireAdmin(() => {
  resetForm();
  loadRecords().catch((error) => show(error.message, 'error'));
});
