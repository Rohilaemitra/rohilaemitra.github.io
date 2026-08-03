import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const dateInput = document.getElementById("date");
const customerSelect = document.getElementById("customerSelect");
const customerNameInput = document.getElementById("customerName");
const mobileInput = document.getElementById("mobile");
const shiftInput = document.getElementById("shift");
const milkTypeInput = document.getElementById("milkType");
const quantityInput = document.getElementById("quantity");
const rateInput = document.getElementById("rate");
const totalInput = document.getElementById("total");
const paidInput = document.getElementById("paid");
const dueInput = document.getElementById("due");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("search");
const excelBtn = document.getElementById("excelBtn");
const tbody = document.querySelector("#milkTable tbody");
const totalRecordsEl = document.getElementById("totalRecords");
const totalMilkEl = document.getElementById("totalMilk");
const totalAmountEl = document.getElementById("totalAmount");
const totalDueEl = document.getElementById("totalDue");
const monthFilterInput = document.getElementById("monthFilter");
const showMonthBtn = document.getElementById("showMonthBtn");
const showAllBtn = document.getElementById("showAllBtn");
const ledgerSearchInput = document.getElementById("ledgerSearch");
const ledgerTbody = document.querySelector("#ledgerTable tbody");
const activeCustomerNote = document.getElementById("activeCustomerNote");

let editId = null;
let milkRecordsCache = [];
let saving = false;
let customerProfiles = new Map();
let activeCustomerKey = "";
let lastVisibleRecords = [];

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

function formatQuantity(value) {
  return `${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} L`;
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

function calculateTotal() {
  totalInput.value = (numberValue(quantityInput) * numberValue(rateInput)).toFixed(2);
  calculateDue();
}

function calculateDue() {
  dueInput.value = Math.max(0, numberValue(totalInput) - numberValue(paidInput)).toFixed(2);
}

function setTodayDate() {
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function setSavingState(isSaving) {
  saving = isSaving;
  saveBtn.disabled = isSaving;
  saveBtn.textContent = isSaving
    ? "Please wait..."
    : editId
      ? "💾 Update Milk Record"
      : "💾 Save Milk Record";
}

function buildCustomerProfiles(records) {
  customerProfiles = new Map();

  [...records]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .forEach((record) => {
      const name = String(record.customerName || "").trim();
      const mobile = String(record.mobile || "").trim();
      if (!name) return;

      const key = customerKey(name, mobile);
      if (!customerProfiles.has(key)) {
        customerProfiles.set(key, {
          key,
          name,
          mobile,
          rate: Number(record.rate || 0),
          milkType: record.milkType || "Cow",
          shift: record.shift || "Morning"
        });
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
      customerNameInput.value = "";
      mobileInput.value = "";
      rateInput.value = "";
      customerNameInput.focus();
    }
    return;
  }

  const profile = customerProfiles.get(key);
  if (!profile) return;

  customerNameInput.value = profile.name;
  mobileInput.value = profile.mobile;
  rateInput.value = profile.rate || "";
  milkTypeInput.value = profile.milkType || "Cow";
  shiftInput.value = profile.shift || "Morning";
  calculateTotal();
}

function clearForm(options = {}) {
  const keepKey = options.keepCustomerKey || "";
  setTodayDate();
  shiftInput.value = "Morning";
  milkTypeInput.value = "Cow";
  quantityInput.value = "";
  rateInput.value = "";
  totalInput.value = "";
  paidInput.value = "";
  dueInput.value = "";
  editId = null;

  if (keepKey && customerProfiles.has(keepKey)) {
    customerSelect.value = keepKey;
    chooseCustomer(keepKey);
    quantityInput.value = "";
    totalInput.value = "";
    paidInput.value = "";
    dueInput.value = "";
  } else {
    customerSelect.value = "";
    customerNameInput.value = "";
    mobileInput.value = "";
  }

  setSavingState(false);
}

function aggregateLedger(records) {
  const ledger = new Map();

  records.forEach((record) => {
    const name = String(record.customerName || "").trim();
    const mobile = String(record.mobile || "").trim();
    if (!name) return;

    const key = customerKey(name, mobile);
    if (!ledger.has(key)) {
      ledger.set(key, {
        key,
        customer: name,
        mobile,
        records: 0,
        milk: 0,
        total: 0,
        paid: 0,
        due: 0
      });
    }

    const row = ledger.get(key);
    row.records += 1;
    row.milk += Number(record.quantity || 0);
    row.total += Number(record.total || 0);
    row.paid += Number(record.paid || 0);
    row.due += Number(record.due || 0);
  });

  return [...ledger.values()].sort((a, b) => a.customer.localeCompare(b.customer, "hi"));
}

function updateSummary(records) {
  let milkTotal = 0;
  let amountTotal = 0;
  let dueTotal = 0;

  records.forEach((record) => {
    milkTotal += Number(record.quantity || 0);
    amountTotal += Number(record.total || 0);
    dueTotal += Number(record.due || 0);
  });

  totalRecordsEl.textContent = records.length;
  totalMilkEl.textContent = formatQuantity(milkTotal);
  totalAmountEl.textContent = formatMoney(amountTotal);
  totalDueEl.textContent = formatMoney(dueTotal);
}

function renderMilkTable(records) {
  lastVisibleRecords = [...records];
  tbody.innerHTML = "";

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="11">कोई Milk Record नहीं मिला।</td></tr>`;
    return;
  }

  [...records]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(record.date)}</td>
        <td>${escapeHtml(record.customerName)}</td>
        <td>${escapeHtml(record.mobile)}</td>
        <td>${escapeHtml(record.shift)}</td>
        <td>${escapeHtml(record.milkType)}</td>
        <td>${formatQuantity(record.quantity)}</td>
        <td>${formatMoney(record.rate)}</td>
        <td>${formatMoney(record.total)}</td>
        <td>${formatMoney(record.paid)}</td>
        <td class="due-amount">${formatMoney(record.due)}</td>
        <td class="action-column">
          <button class="edit-btn" data-action="edit" data-id="${record.id}">✏ Edit</button>
          <button class="delete-btn" data-action="delete" data-id="${record.id}">🗑 Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
}

function renderLedger(records) {
  const keyword = normalize(ledgerSearchInput.value);
  const items = aggregateLedger(records).filter((item) =>
    !keyword ||
    normalize(item.customer).includes(keyword) ||
    String(item.mobile || "").includes(keyword)
  );

  ledgerTbody.innerHTML = "";

  if (!items.length) {
    ledgerTbody.innerHTML = `<tr><td colspan="8">कोई Customer Ledger नहीं मिला।</td></tr>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.customer)}</td>
      <td>${escapeHtml(item.mobile)}</td>
      <td>${item.records}</td>
      <td>${formatQuantity(item.milk)}</td>
      <td>${formatMoney(item.total)}</td>
      <td>${formatMoney(item.paid)}</td>
      <td class="due-amount">${formatMoney(item.due)}</td>
      <td class="action-column"><button class="view-btn" data-ledger-key="${escapeHtml(item.key)}">हिसाब देखें</button></td>
    `;
    ledgerTbody.appendChild(row);
  });
}

function applyFilters() {
  const keyword = normalize(searchInput.value);
  const selectedMonth = monthFilterInput.value;

  const records = milkRecordsCache.filter((item) => {
    if (selectedMonth && !String(item.date || "").startsWith(selectedMonth)) {
      return false;
    }

    if (activeCustomerKey && customerKey(item.customerName, item.mobile) !== activeCustomerKey) {
      return false;
    }

    if (!keyword) return true;

    return [
      item.customerName,
      item.mobile,
      item.date,
      item.shift,
      item.milkType,
      item.quantity,
      item.rate,
      item.total,
      item.paid,
      item.due
    ].join(" ").toLowerCase().includes(keyword);
  });

  renderMilkTable(records);
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

async function loadMilkRecords(preferredKey = "") {
  try {
    const snapshot = await getDocs(collection(db, "milkDiary"));

    milkRecordsCache = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));

    buildCustomerProfiles(milkRecordsCache);
    populateCustomerSelect();
    renderLedger(milkRecordsCache);
    applyFilters();

    if (preferredKey && customerProfiles.has(preferredKey)) {
      customerSelect.value = preferredKey;
      chooseCustomer(preferredKey);
    }
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="11">Data load नहीं हुआ। Internet और Firebase connection जांचें।</td></tr>`;
    ledgerTbody.innerHTML = `<tr><td colspan="8">Ledger load नहीं हुआ।</td></tr>`;
  }
}

quantityInput.addEventListener("input", calculateTotal);
rateInput.addEventListener("input", calculateTotal);
paidInput.addEventListener("input", calculateDue);

customerSelect.addEventListener("change", () => {
  chooseCustomer(customerSelect.value);
});

clearBtn.addEventListener("click", () => clearForm());

saveBtn.addEventListener("click", async () => {
  if (saving) return;

  const customerName = customerNameInput.value.trim();
  const mobile = mobileInput.value.trim();

  if (!customerName) {
    alert("Customer Name डालें।");
    customerNameInput.focus();
    return;
  }

  if (mobile && !/^[0-9]{10}$/.test(mobile)) {
    alert("10 अंकों का सही Mobile Number डालें।");
    mobileInput.focus();
    return;
  }

  calculateTotal();
  const keyToKeep = customerKey(customerName, mobile);

  const record = {
    date: dateInput.value,
    customerName,
    mobile,
    shift: shiftInput.value,
    milkType: milkTypeInput.value,
    quantity: numberValue(quantityInput),
    rate: numberValue(rateInput),
    total: numberValue(totalInput),
    paid: numberValue(paidInput),
    due: numberValue(dueInput),
    updatedAt: serverTimestamp()
  };

  setSavingState(true);

  try {
    if (editId) {
      await updateDoc(doc(db, "milkDiary", editId), record);
      alert("Milk Record Update हो गया।");
    } else {
      await addDoc(collection(db, "milkDiary"), {
        ...record,
        createdAt: serverTimestamp()
      });
      alert("Milk Record Save हो गया।");
    }

    editId = null;
    await loadMilkRecords(keyToKeep);
    clearForm({ keepCustomerKey: keyToKeep });
  } catch (error) {
    console.error(error);
    alert("Record Save नहीं हुआ। Internet और Firebase permissions जांचें।");
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
      const snapshot = await getDoc(doc(db, "milkDiary", id));
      if (!snapshot.exists()) {
        alert("Milk Record नहीं मिला।");
        return;
      }

      const data = snapshot.data();
      editId = id;
      dateInput.value = data.date || "";
      customerNameInput.value = data.customerName || "";
      mobileInput.value = data.mobile || "";
      shiftInput.value = data.shift || "Morning";
      milkTypeInput.value = data.milkType || "Cow";
      quantityInput.value = Number(data.quantity || 0);
      rateInput.value = Number(data.rate || 0);
      totalInput.value = Number(data.total || 0);
      paidInput.value = Number(data.paid || 0);
      dueInput.value = Number(data.due || 0);

      const key = customerKey(data.customerName, data.mobile);
      if (customerProfiles.has(key)) customerSelect.value = key;

      setSavingState(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Record Edit के लिए नहीं खुला।");
    }
  }

  if (action === "delete") {
    if (!confirm("क्या यह Milk Record Delete करना है?")) return;

    try {
      await deleteDoc(doc(db, "milkDiary", id));
      alert("Milk Record Delete हो गया।");
      await loadMilkRecords();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Milk Record Delete नहीं हुआ।");
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

searchInput.addEventListener("input", applyFilters);
ledgerSearchInput.addEventListener("input", () => renderLedger(milkRecordsCache));

showMonthBtn.addEventListener("click", () => {
  if (!monthFilterInput.value) {
    alert("पहले Month चुनें।");
    return;
  }
  applyFilters();
});

showAllBtn.addEventListener("click", () => {
  monthFilterInput.value = "";
  activeCustomerKey = "";
  searchInput.value = "";
  applyFilters();
});

window.printMilkDiary = function () {
  window.print();
};

excelBtn.addEventListener("click", () => {
  const rows = [
    ["Date","Customer","Mobile","Shift","Milk Type","Quantity","Rate","Total","Paid","Due"],
    ...lastVisibleRecords.map((item) => [
      item.date || "",
      item.customerName || "",
      item.mobile || "",
      item.shift || "",
      item.milkType || "",
      Number(item.quantity || 0),
      Number(item.rate || 0),
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
  link.download = `milk-diary-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
});

setTodayDate();
loadMilkRecords();
