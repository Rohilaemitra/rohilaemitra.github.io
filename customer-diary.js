import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const dateInput = document.getElementById("date");
const customerSelect = document.getElementById("customerSelect");
const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const detailsInput = document.getElementById("details");
const totalInput = document.getElementById("total");
const paidInput = document.getElementById("paid");
const dueInput = document.getElementById("due");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("search");
const ledgerSearchInput = document.getElementById("ledgerSearch");
const showAllCustomerBtn = document.getElementById("showAllCustomerBtn");
const tbody = document.querySelector("#customerTable tbody");
const ledgerTbody = document.querySelector("#ledgerTable tbody");
const totalCustomersEl = document.getElementById("totalCustomers");
const totalCollectionEl = document.getElementById("totalCollection");
const totalPaidEl = document.getElementById("totalPaid");
const totalDueEl = document.getElementById("totalDue");
const exportBtn = document.getElementById("exportBtn");
const excelBtn = document.getElementById("excelBtn");
const activeCustomerNote = document.getElementById("activeCustomerNote");

let editId = null;
let customersCache = [];
let saving = false;
let activeCustomerKey = "";
let lastVisibleRecords = [];
let customerProfiles = new Map();

function numberValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function customerKey(name, mobile) {
  return `${normalize(name)}|${String(mobile || "").trim()}`;
}

function setTodayDate() {
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function calculateDue() {
  dueInput.value = Math.max(0, numberValue(totalInput) - numberValue(paidInput)).toFixed(2);
}

function setSavingState(isSaving) {
  saving = isSaving;
  saveBtn.disabled = isSaving;
  saveBtn.textContent = isSaving
    ? "Please wait..."
    : editId
      ? "💾 Update Record"
      : "💾 Save Record";
}

function buildProfiles(records) {
  customerProfiles = new Map();

  [...records]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .forEach((item) => {
      const name = String(item.name || "").trim();
      const mobile = String(item.mobile || "").trim();
      if (!name) return;
      const key = customerKey(name, mobile);
      if (!customerProfiles.has(key)) {
        customerProfiles.set(key, { key, name, mobile });
      }
    });
}

function populateCustomerSelect() {
  const previous = customerSelect.value;
  customerSelect.innerHTML = `
    <option value="">-- Customer चुनें --</option>
    <option value="__new__">➕ New Customer</option>
  `;

  [...customerProfiles.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hi"))
    .forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.key;
      option.textContent = profile.mobile
        ? `${profile.name} - ${profile.mobile}`
        : profile.name;
      customerSelect.appendChild(option);
    });

  if (previous && [...customerSelect.options].some(o => o.value === previous)) {
    customerSelect.value = previous;
  }
}

function chooseCustomer(key) {
  if (!key || key === "__new__") {
    if (key === "__new__") {
      nameInput.value = "";
      mobileInput.value = "";
      nameInput.focus();
    }
    return;
  }

  const profile = customerProfiles.get(key);
  if (!profile) return;

  nameInput.value = profile.name;
  mobileInput.value = profile.mobile;
}

function clearForm(options = {}) {
  const keepKey = options.keepCustomerKey || "";
  setTodayDate();
  detailsInput.value = "";
  totalInput.value = "";
  paidInput.value = "";
  dueInput.value = "";
  editId = null;

  if (keepKey && customerProfiles.has(keepKey)) {
    customerSelect.value = keepKey;
    chooseCustomer(keepKey);
  } else {
    customerSelect.value = "";
    nameInput.value = "";
    mobileInput.value = "";
  }

  setSavingState(false);
}

function aggregateCustomers(records) {
  const ledger = new Map();

  records.forEach((item) => {
    const name = String(item.name || "").trim();
    const mobile = String(item.mobile || "").trim();
    if (!name) return;

    const key = customerKey(name, mobile);
    if (!ledger.has(key)) {
      ledger.set(key, {
        key,
        name,
        mobile,
        entries: 0,
        total: 0,
        paid: 0,
        due: 0
      });
    }

    const row = ledger.get(key);
    row.entries += 1;
    row.total += Number(item.total || 0);
    row.paid += Number(item.paid || 0);
    row.due += Number(item.due || 0);
  });

  return [...ledger.values()].sort((a, b) => a.name.localeCompare(b.name, "hi"));
}

function updateSummary(records) {
  const unique = new Set();
  let totalAmount = 0;
  let paidAmount = 0;
  let dueAmount = 0;

  records.forEach((item) => {
    if (item.name) unique.add(customerKey(item.name, item.mobile));
    totalAmount += Number(item.total || 0);
    paidAmount += Number(item.paid || 0);
    dueAmount += Number(item.due || 0);
  });

  totalCustomersEl.textContent = unique.size;
  totalCollectionEl.textContent = formatMoney(totalAmount);
  totalPaidEl.textContent = formatMoney(paidAmount);
  totalDueEl.textContent = formatMoney(dueAmount);
}

function renderCustomers(records) {
  lastVisibleRecords = [...records];
  tbody.innerHTML = "";

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="8">कोई record नहीं मिला।</td></tr>`;
    return;
  }

  [...records]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(customer.date)}</td>
        <td>${escapeHtml(customer.name)}</td>
        <td>${escapeHtml(customer.mobile)}</td>
        <td>${escapeHtml(customer.details)}</td>
        <td>${formatMoney(customer.total)}</td>
        <td>${formatMoney(customer.paid)}</td>
        <td class="due">${formatMoney(customer.due)}</td>
        <td class="action-col">
          <button class="edit" data-action="edit" data-id="${customer.id}">✏ Edit</button>
          <button class="delete" data-action="delete" data-id="${customer.id}">🗑 Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
}

function renderLedger(records) {
  const keyword = normalize(ledgerSearchInput.value);
  const items = aggregateCustomers(records).filter((item) => {
    return !keyword ||
      normalize(item.name).includes(keyword) ||
      String(item.mobile || "").includes(keyword);
  });

  ledgerTbody.innerHTML = "";

  if (!items.length) {
    ledgerTbody.innerHTML = `<tr><td colspan="7">कोई customer नहीं मिला।</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.mobile)}</td>
      <td>${item.entries}</td>
      <td>${formatMoney(item.total)}</td>
      <td>${formatMoney(item.paid)}</td>
      <td class="due">${formatMoney(item.due)}</td>
      <td class="action-col">
        <button class="view" data-ledger-key="${escapeHtml(item.key)}">हिसाब देखें</button>
      </td>
    `;
    ledgerTbody.appendChild(row);
  });
}

function applyFilters() {
  const query = normalize(searchInput.value);

  let records = customersCache.filter((item) => {
    if (activeCustomerKey && customerKey(item.name, item.mobile) !== activeCustomerKey) {
      return false;
    }

    if (!query) return true;

    return [
      item.date,
      item.name,
      item.mobile,
      item.details,
      item.total,
      item.paid,
      item.due
    ].join(" ").toLowerCase().includes(query);
  });

  renderCustomers(records);
  updateSummary(records);

  if (activeCustomerKey && customerProfiles.has(activeCustomerKey)) {
    const p = customerProfiles.get(activeCustomerKey);
    activeCustomerNote.style.display = "block";
    activeCustomerNote.textContent = `अभी केवल ${p.name}${p.mobile ? " (" + p.mobile + ")" : ""} का हिसाब दिख रहा है।`;
  } else {
    activeCustomerNote.style.display = "none";
    activeCustomerNote.textContent = "";
  }
}

async function loadCustomers(preferredKey = "") {
  try {
    const snapshot = await getDocs(collection(db, "customerDiary"));

    customersCache = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    }));

    buildProfiles(customersCache);
    populateCustomerSelect();
    renderLedger(customersCache);
    applyFilters();

    if (preferredKey && customerProfiles.has(preferredKey)) {
      customerSelect.value = preferredKey;
      chooseCustomer(preferredKey);
    }
  } catch (error) {
    console.error("Customer load failed:", error);
    tbody.innerHTML = `<tr><td colspan="8">Data load नहीं हुआ। Internet और Firebase connection जांचें।</td></tr>`;
    ledgerTbody.innerHTML = `<tr><td colspan="7">Ledger load नहीं हुआ।</td></tr>`;
  }
}

totalInput.addEventListener("input", calculateDue);
paidInput.addEventListener("input", calculateDue);

customerSelect.addEventListener("change", () => {
  chooseCustomer(customerSelect.value);
});

clearBtn.addEventListener("click", () => clearForm());

saveBtn.addEventListener("click", async () => {
  if (saving) return;

  const name = nameInput.value.trim();
  const mobile = mobileInput.value.trim();

  if (!name) {
    alert("Customer Name डालें।");
    nameInput.focus();
    return;
  }

  if (mobile && !/^[0-9]{10}$/.test(mobile)) {
    alert("10 अंकों का सही Mobile Number डालें।");
    mobileInput.focus();
    return;
  }

  calculateDue();

  const keyToKeep = customerKey(name, mobile);

  const customerData = {
    date: dateInput.value,
    name,
    mobile,
    details: detailsInput.value.trim(),
    total: numberValue(totalInput),
    paid: numberValue(paidInput),
    due: numberValue(dueInput),
    updatedAt: serverTimestamp()
  };

  setSavingState(true);

  try {
    if (editId) {
      await updateDoc(doc(db, "customerDiary", editId), customerData);
      alert("Customer record update हो गया।");
    } else {
      await addDoc(collection(db, "customerDiary"), {
        ...customerData,
        createdAt: serverTimestamp()
      });
      alert("Customer record save हो गया।");
    }

    editId = null;
    await loadCustomers(keyToKeep);
    clearForm({ keepCustomerKey: keyToKeep });
  } catch (error) {
    console.error("Customer save failed:", error);
    alert("Save नहीं हुआ। Internet और Firebase permissions जांचें।");
  } finally {
    setSavingState(false);
  }
});

tbody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    try {
      const snapshot = await getDoc(doc(db, "customerDiary", id));
      if (!snapshot.exists()) {
        alert("Record नहीं मिला।");
        return;
      }

      const data = snapshot.data();
      editId = id;
      dateInput.value = data.date || "";
      nameInput.value = data.name || "";
      mobileInput.value = data.mobile || "";
      detailsInput.value = data.details || "";
      totalInput.value = Number(data.total || 0);
      paidInput.value = Number(data.paid || 0);
      calculateDue();

      const key = customerKey(data.name, data.mobile);
      if (customerProfiles.has(key)) customerSelect.value = key;

      setSavingState(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Edit load failed:", error);
      alert("Record Edit के लिए नहीं खुला।");
    }
  }

  if (action === "delete") {
    if (!confirm("क्या यह रिकॉर्ड Delete करना है?")) return;

    try {
      await deleteDoc(doc(db, "customerDiary", id));
      alert("Record Delete हो गया।");
      await loadCustomers();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Record Delete नहीं हुआ।");
    }
  }
});

ledgerTbody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-ledger-key]");
  if (!button) return;

  activeCustomerKey = button.dataset.ledgerKey;
  searchInput.value = "";
  applyFilters();
});

showAllCustomerBtn.addEventListener("click", () => {
  activeCustomerKey = "";
  searchInput.value = "";
  applyFilters();
});

searchInput.addEventListener("input", applyFilters);
ledgerSearchInput.addEventListener("input", () => renderLedger(customersCache));

window.printDiary = function () {
  window.print();
};

exportBtn.addEventListener("click", () => window.print());

excelBtn.addEventListener("click", () => {
  const rows = [
    ["Date", "Name", "Mobile", "Details", "Total", "Paid", "Due"],
    ...lastVisibleRecords.map((item) => [
      item.date || "",
      item.name || "",
      item.mobile || "",
      item.details || "",
      Number(item.total || 0),
      Number(item.paid || 0),
      Number(item.due || 0)
    ])
  ];

  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `customer-diary-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
});

setTodayDate();
loadCustomers();
