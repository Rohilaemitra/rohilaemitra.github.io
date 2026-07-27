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


// =========================
// HTML ELEMENTS
// =========================

const dateInput = document.getElementById("date");

const customerNameInput =
  document.getElementById("customerName");

const mobileInput =
  document.getElementById("mobile");

const shiftInput =
  document.getElementById("shift");

const milkTypeInput =
  document.getElementById("milkType");

const quantityInput =
  document.getElementById("quantity");

const rateInput =
  document.getElementById("rate");

const totalInput =
  document.getElementById("total");

const paidInput =
  document.getElementById("paid");

const dueInput =
  document.getElementById("due");

const saveBtn =
  document.getElementById("saveBtn");

const clearBtn =
  document.getElementById("clearBtn");

const searchInput =
  document.getElementById("search");

const excelBtn =
  document.getElementById("excelBtn");

const tbody =
  document.querySelector("#milkTable tbody");

const totalRecordsEl =
  document.getElementById("totalRecords");

const totalMilkEl =
  document.getElementById("totalMilk");

const totalAmountEl =
  document.getElementById("totalAmount");

const totalDueEl =
  document.getElementById("totalDue");
const monthFilterInput =
  document.getElementById("monthFilter");

const showMonthBtn =
  document.getElementById("showMonthBtn");

const showAllBtn =
  document.getElementById("showAllBtn");


// =========================
// VARIABLES
// =========================

let editId = null;

let milkRecordsCache = [];

let saving = false;


// =========================
// NUMBER FUNCTION
// =========================

function numberValue(input) {

  const value = Number(input.value);

  return Number.isFinite(value)
    ? value
    : 0;

}


// =========================
// MONEY FORMAT
// =========================

function formatMoney(value) {

  return `₹${Number(value || 0)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

}


// =========================
// QUANTITY FORMAT
// =========================

function formatQuantity(value) {

  return `${Number(value || 0)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} L`;

}


// =========================
// SAFE HTML
// =========================

function escapeHtml(value) {

  return String(value ?? "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


// =========================
// AUTO TOTAL CALCULATION
// =========================

function calculateTotal() {

  const quantity =
    numberValue(quantityInput);

  const rate =
    numberValue(rateInput);

  const total =
    quantity * rate;

  totalInput.value =
    total.toFixed(2);

  calculateDue();

}


// =========================
// AUTO DUE CALCULATION
// =========================

function calculateDue() {

  const total =
    numberValue(totalInput);

  const paid =
    numberValue(paidInput);

  const due =
    Math.max(0, total - paid);

  dueInput.value =
    due.toFixed(2);

}


// =========================
// SET TODAY DATE
// =========================

function setTodayDate() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  dateInput.value = today;

}


// =========================
// CLEAR FORM
// =========================

function clearForm() {

  setTodayDate();

  customerNameInput.value = "";

  mobileInput.value = "";

  shiftInput.value = "Morning";

  milkTypeInput.value = "Cow";

  quantityInput.value = "";

  rateInput.value = "";

  totalInput.value = "";

  paidInput.value = "";

  dueInput.value = "";

  editId = null;

  saveBtn.textContent =
    "💾 Save Milk Record";

}


// =========================
// SAVE BUTTON STATE
// =========================

function setSavingState(isSaving) {

  saving = isSaving;

  saveBtn.disabled = isSaving;

  if (isSaving) {

    saveBtn.textContent =
      "Please wait...";

  } else if (editId) {

    saveBtn.textContent =
      "💾 Update Milk Record";

  } else {

    saveBtn.textContent =
      "💾 Save Milk Record";

  }

}


// =========================
// AUTO CALCULATION EVENTS
// =========================

quantityInput.addEventListener(
  "input",
  calculateTotal
);

rateInput.addEventListener(
  "input",
  calculateTotal
);

paidInput.addEventListener(
  "input",
  calculateDue
);


// =========================
// CLEAR BUTTON
// =========================

clearBtn.addEventListener(
  "click",
  clearForm
);


// =========================
// INITIAL DATE
// =========================

setTodayDate();
// =========================
// SAVE MILK RECORD
// =========================

saveBtn.addEventListener("click", async () => {

  if (saving) return;

  if (customerNameInput.value.trim() === "") {
    alert("Customer Name डालें");
    customerNameInput.focus();
    return;
  }

  const record = {

    date: dateInput.value,

    customerName: customerNameInput.value.trim(),

    mobile: mobileInput.value.trim(),

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

      await updateDoc(
        doc(db, "milkDiary", editId),
        record
      );

      alert("Milk Record Update हो गया");

    } else {

      await addDoc(
        collection(db, "milkDiary"),
        {
          ...record,
          createdAt: serverTimestamp()
        }
      );

      alert("Milk Record Save हो गया");

    }

    clearForm();

    await loadMilkRecords();

  } catch (err) {

    console.error(err);

    alert("Record Save नहीं हुआ");

  } finally {

    setSavingState(false);

  }

});


// =========================
// LOAD MILK RECORDS
// =========================

async function loadMilkRecords() {

  try {

    const snapshot =
      await getDocs(collection(db, "milkDiary"));

    milkRecordsCache =
      snapshot.docs.map(docItem => ({

        id: docItem.id,

        ...docItem.data()

      }));

    renderMilkTable(milkRecordsCache);

    updateSummary(milkRecordsCache);

  }

  catch(error){

    console.error(error);

    tbody.innerHTML=`
      <tr>
        <td colspan="11">
          कोई रिकॉर्ड उपलब्ध नहीं
        </td>
      </tr>
    `;

  }

}
// =========================
// UPDATE SUMMARY
// =========================

function updateSummary(records) {

  let milkTotal = 0;
  let amountTotal = 0;
  let dueTotal = 0;

  records.forEach((record) => {

    milkTotal += Number(record.quantity || 0);

    amountTotal += Number(record.total || 0);

    dueTotal += Number(record.due || 0);

  });

  if (totalRecordsEl) {

    totalRecordsEl.textContent =
      records.length;

  }

  if (totalMilkEl) {

    totalMilkEl.textContent =
      formatQuantity(milkTotal);

  }

  if (totalAmountEl) {

    totalAmountEl.textContent =
      formatMoney(amountTotal);

  }

  if (totalDueEl) {

    totalDueEl.textContent =
      formatMoney(dueTotal);

  }

}


// =========================
// RENDER MILK TABLE
// =========================

function renderMilkTable(records) {

  tbody.innerHTML = "";

  if (records.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="11">
          कोई Milk Record नहीं मिला।
        </td>
      </tr>
    `;

    return;

  }

  records
    .sort((a, b) =>
      String(b.date || "")
        .localeCompare(String(a.date || ""))
    )
    .forEach((record) => {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>
          ${escapeHtml(record.date)}
        </td>

        <td>
          ${escapeHtml(record.customerName)}
        </td>

        <td>
          ${escapeHtml(record.mobile)}
        </td>

        <td>
          ${escapeHtml(record.shift)}
        </td>

        <td>
          ${escapeHtml(record.milkType)}
        </td>

        <td>
          ${formatQuantity(record.quantity)}
        </td>

        <td>
          ${formatMoney(record.rate)}
        </td>

        <td>
          ${formatMoney(record.total)}
        </td>

        <td>
          ${formatMoney(record.paid)}
        </td>

        <td class="due-amount">
          ${formatMoney(record.due)}
        </td>

        <td class="action-column">

          <button
            type="button"
            class="edit-btn"
            data-action="edit"
            data-id="${record.id}"
          >
            ✏ Edit
          </button>

          <button
            type="button"
            class="delete-btn"
            data-action="delete"
            data-id="${record.id}"
          >
            🗑 Delete
          </button>

        </td>
      `;

      tbody.appendChild(row);

    });

}


// =========================
// EDIT / DELETE BUTTONS
// =========================

tbody.addEventListener("click", async (event) => {

  const button =
    event.target.closest(
      "button[data-action]"
    );

  if (!button) return;

  const id =
    button.dataset.id;

  const action =
    button.dataset.action;


  // =========================
  // EDIT RECORD
  // =========================

  if (action === "edit") {

    try {

      const snapshot =
        await getDoc(
          doc(db, "milkDiary", id)
        );

      if (!snapshot.exists()) {

        alert("Milk Record नहीं मिला।");

        return;

      }

      const data =
        snapshot.data();

      editId = id;

      dateInput.value =
        data.date || "";

      customerNameInput.value =
        data.customerName || "";

      mobileInput.value =
        data.mobile || "";

      shiftInput.value =
        data.shift || "Morning";

      milkTypeInput.value =
        data.milkType || "Cow";

      quantityInput.value =
        Number(data.quantity || 0);

      rateInput.value =
        Number(data.rate || 0);

      totalInput.value =
        Number(data.total || 0);

      paidInput.value =
        Number(data.paid || 0);

      dueInput.value =
        Number(data.due || 0);

      saveBtn.textContent =
        "💾 Update Milk Record";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {

      console.error(
        "Edit failed:",
        error
      );

      alert(
        "Record Edit के लिए नहीं खुला।"
      );

    }

  }


  // =========================
  // DELETE RECORD
  // =========================

  if (action === "delete") {

    const deleteConfirm =
      confirm(
        "क्या यह Milk Record Delete करना है?"
      );

    if (!deleteConfirm) return;

    try {

      await deleteDoc(
        doc(db, "milkDiary", id)
      );

      alert(
        "Milk Record Delete हो गया।"
      );

      await loadMilkRecords();

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );

      alert(
        "Milk Record Delete नहीं हुआ।"
      );

    }

  }

});
// =========================
// SEARCH
// =========================

searchInput.addEventListener("input", () => {

  const keyword = searchInput.value
    .trim()
    .toLowerCase();

  const filtered = milkRecordsCache.filter((item) => {

    return (
      (item.customerName || "").toLowerCase().includes(keyword) ||
      (item.mobile || "").toLowerCase().includes(keyword) ||
      (item.date || "").toLowerCase().includes(keyword) ||
      (item.shift || "").toLowerCase().includes(keyword) ||
      (item.milkType || "").toLowerCase().includes(keyword)
    );

  });

  renderMilkTable(filtered);

});


// =========================
// PRINT
// =========================

window.printMilkDiary = function () {

  window.print();

};


// =========================
// EXCEL EXPORT
// =========================

excelBtn.addEventListener("click", () => {

  let csv =
"Date,Customer,Mobile,Shift,Milk Type,Quantity,Rate,Total,Paid,Due\n";

  milkRecordsCache.forEach(item => {

    csv +=

`${item.date},
${item.customerName},
${item.mobile},
${item.shift},
${item.milkType},
${item.quantity},
${item.rate},
${item.total},
${item.paid},
${item.due}\n`;

  });

  const blob = new Blob([csv], {

    type: "text/csv"

  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "Milk-Diary.csv";

  a.click();

  URL.revokeObjectURL(url);

});


// =========================
// START
// =========================

loadMilkRecords();
const ledgerSearchInput =
  document.getElementById("ledgerSearch");

const ledgerTbody =
  document.querySelector("#ledgerTable tbody");
ledgerSearchInput.addEventListener("input", () => {

    const keyword =
        ledgerSearchInput.value.toLowerCase();

    const filtered =
        milkRecordsCache.filter(item =>

            item.customerName.toLowerCase().includes(keyword) ||

            item.mobile.includes(keyword)

        );

    renderLedger(filtered);

});
// =========================
// MONTHLY REPORT FILTER
// =========================

showMonthBtn.addEventListener("click", () => {

  const selectedMonth =
    monthFilterInput.value;

  if (!selectedMonth) {

    alert("पहले Month चुनें।");

    return;

  }

  const monthlyRecords =
    milkRecordsCache.filter((item) => {

      return String(item.date || "")
        .startsWith(selectedMonth);

    });

  renderMilkTable(monthlyRecords);

  renderLedger(monthlyRecords);

  updateSummary(monthlyRecords);

});


showAllBtn.addEventListener("click", () => {

  monthFilterInput.value = "";

  renderMilkTable(milkRecordsCache);

  renderLedger(milkRecordsCache);

  updateSummary(milkRecordsCache);

});
