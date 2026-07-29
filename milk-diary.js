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

const COLLECTION = 'milkDiary';
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

function calculate() {
  const total = num($('quantity').value) * num($('rate').value);
  $('total').value = total.toFixed(2);
  $('due').value = Math.max(
    0,
    total - num($('paid').value)
  ).toFixed(2);
}

function resetForm() {
  editId = null;
  form.reset();
  $('date').value = new Date().toISOString().slice(0, 10);
  $('paid').value = 0;
  calculate();
  $('saveBtn').textContent = 'Save';
}

async function loadRecords() {
  show('पुराना Milk Diary data loading...');
  const snapshot = await getDocs(collection(db, COLLECTION));

  rows = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  render();
  show(`Milk Diary के ${rows.length} रिकॉर्ड मिल गए`, 'ok');
}

function filteredRows() {
  const keyword = $('search').value.toLowerCase();
  const month = $('monthFilter').value;

  return rows.filter((item) => {
    const matchesMonth =
      !month || String(item.date || '').startsWith(month);

    const searchable = [
      item.customerName,
      item.mobile
    ].join(' ').toLowerCase();

    return matchesMonth && searchable.includes(keyword);
  });
}

function render() {
  const list = filteredRows();

  tbody.innerHTML = list.length
    ? list.map((item) => `
      <tr>
        <td>${esc(item.date)}</td>
        <td>${esc(item.customerName)}</td>
        <td>${esc(item.mobile)}</td>
        <td>${esc(item.shift)}</td>
        <td>${esc(item.milkType)}</td>
        <td>${num(item.quantity).toFixed(2)} L</td>
        <td>${money(item.rate)}</td>
        <td>${money(item.total)}</td>
        <td>${money(item.paid)}</td>
        <td>${money(item.due)}</td>
        <td class="no-print">
          <button class="btn light edit" data-id="${item.id}">Edit</button>
          <button class="btn danger del" data-id="${item.id}">Delete</button>
        </td>
      </tr>
    `).join('')
    : '<tr><td class="empty" colspan="11">No records</td></tr>';

  $('count').textContent = list.length;
  $('milkSum').textContent =
    list.reduce((sum, item) => sum + num(item.quantity), 0).toFixed(2) + ' L';
  $('amountSum').textContent =
    money(list.reduce((sum, item) => sum + num(item.total), 0));
  $('dueSum').textContent =
    money(list.reduce((sum, item) => sum + num(item.due), 0));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = {
    date: $('date').value,
    customerName: $('customerName').value.trim(),
    mobile: $('mobile').value.trim(),
    shift: $('shift').value,
    milkType: $('milkType').value,
    quantity: num($('quantity').value),
    rate: num($('rate').value),
    total: num($('total').value),
    paid: num($('paid').value),
    due: num($('due').value),
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
    ['date', 'customerName', 'mobile', 'shift', 'milkType', 'quantity', 'rate', 'paid']
      .forEach((key) => {
        $(key).value = item[key] ?? '';
      });

    calculate();
    $('saveBtn').textContent = 'Update';
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (
    event.target.classList.contains('del') &&
    confirm('यह दूध रिकॉर्ड हटाएँ?')
  ) {
    await deleteDoc(doc(db, COLLECTION, id));
    await loadRecords();
  }
});

['quantity', 'rate', 'paid'].forEach((id) =>
  $(id).addEventListener('input', calculate)
);

$('search').addEventListener('input', render);
$('monthFilter').addEventListener('change', render);
$('allBtn').addEventListener('click', () => {
  $('monthFilter').value = '';
  render();
});
$('clearBtn').addEventListener('click', resetForm);
$('printBtn').addEventListener('click', () => print());

$('csvBtn').addEventListener('click', () => {
  const list = filteredRows();
  const lines = [
    ['Date', 'Customer', 'Mobile', 'Shift', 'Type', 'Quantity', 'Rate', 'Total', 'Paid', 'Due'],
    ...list.map((item) => [
      item.date,
      item.customerName,
      item.mobile,
      item.shift,
      item.milkType,
      item.quantity,
      item.rate,
      item.total,
      item.paid,
      item.due
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
  link.download = 'milk-diary.csv';
  link.click();
});

requireAdmin(() => {
  resetForm();
  loadRecords().catch((error) => show(error.message, 'error'));
});
