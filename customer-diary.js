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


// =========================
// HTML ELEMENTS
// =========================

const dateInput = document.getElementById("date");
const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const detailsInput = document.getElementById("details");

const totalInput = document.getElementById("total");
const paidInput = document.getElementById("paid");
const dueInput = document.getElementById("due");

const saveBtn = document.getElementById("saveBtn");
const searchInput = document.getElementById("search");

const tbody = document.querySelector("#customerTable tbody");

const totalCustomersEl =
  document.getElementById("totalCustomers");

const totalCollectionEl =
  document.getElementById("totalCollection");

const totalPaidEl =
  document.getElementById("totalPaid");

const totalDueEl =
  document.getElementById("totalDue");

const exportBtn =
  document.getElementById("exportBtn");

const excelBtn =
  document.getElementById("excelBtn");


// =========================
// VARIABLES
// =========================

let editId = null;

let customersCache = [];

let saving = false;


// =========================
// NUMBER FUNCTION
// =========================

function numberValue(input) {

  const value = Number(input.value);

  return Number.isFinite(value) ? value : 0;

}


// =========================
// MONEY FORMAT
// =========================

function formatMoney(value) {

  return `₹${Number(value || 0).toLocaleString("en-IN")}`;

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
// AUTO DUE CALCULATION
// =========================

function calculateDue() {

  const total = numberValue(totalInput);

  const paid = numberValue(paidInput);

  const due = Math.max(0, total - paid);

  dueInput.value = due;

}


// =========================
// CLEAR FORM
// =========================

function clearForm() {

  dateInput.value = "";

  nameInput.value = "";

  mobileInput.value = "";

  detailsInput.value = "";

  totalInput.value = "";

  paidInput.value = "";

  dueInput.value = "";

  editId = null;

  saveBtn.textContent = "💾 Save Customer";

}


// =========================
// SAVE BUTTON STATE
// =========================

function setSavingState(isSaving) {

  saving = isSaving;

  saveBtn.disabled = isSaving;

  if (isSaving) {

    saveBtn.textContent = "Please wait...";

  } else if (editId) {

    saveBtn.textContent = "💾 Update Customer";

  } else {

    saveBtn.textContent = "💾 Save Customer";

  }

}


// =========================
// AUTO DUE EVENTS
// =========================

totalInput.addEventListener(
  "input",
  calculateDue
);

paidInput.addEventListener(
  "input",
  calculateDue
);
// =========================
// UPDATE SUMMARY
// =========================

function updateSummary(records) {

  let totalAmount = 0;
  let paidAmount = 0;
  let dueAmount = 0;

  records.forEach((item) => {

    totalAmount += Number(item.total || 0);

    paidAmount += Number(item.paid || 0);

    dueAmount += Number(item.due || 0);

  });

  if (totalCustomersEl) {

    totalCustomersEl.textContent = records.length;

  }

  if (totalCollectionEl) {

    totalCollectionEl.textContent =
      formatMoney(totalAmount);

  }

  if (totalPaidEl) {

    totalPaidEl.textContent =
      formatMoney(paidAmount);

  }

  if (totalDueEl) {

    totalDueEl.textContent =
      formatMoney(dueAmount);

  }

}


// =========================
// RENDER CUSTOMER TABLE
// =========================

function renderCustomers(records) {

  tbody.innerHTML = "";

  if (records.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          No customer records found.
        </td>
      </tr>
    `;

    return;

  }

  records.forEach((customer) => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(customer.date)}</td>

      <td>${escapeHtml(customer.name)}</td>

      <td>${escapeHtml(customer.mobile)}</td>

      <td>${escapeHtml(customer.details)}</td>

      <td>${formatMoney(customer.total)}</td>

      <td>${formatMoney(customer.paid)}</td>

      <td>${formatMoney(customer.due)}</td>

      <td>

        <button
          class="edit"
          data-action="edit"
          data-id="${customer.id}"
        >
          ✏ Edit
        </button>

        <button
          class="delete"
          data-action="delete"
          data-id="${customer.id}"
        >
          🗑 Delete
        </button>

      </td>
    `;

    tbody.appendChild(row);

  });

}


// =========================
// LOAD CUSTOMERS
// =========================

async function loadCustomers() {

  try {

    const snapshot = await getDocs(
      collection(db, "customerDiary")
    );

    customersCache = snapshot.docs.map((item) => {

      return {

        id: item.id,

        ...item.data()

      };

    });

    customersCache.sort((a, b) => {

      const firstDate = String(a.date || "");

      const secondDate = String(b.date || "");

      return secondDate.localeCompare(firstDate);

    });

    renderCustomers(customersCache);

    updateSummary(customersCache);

  } catch (error) {

    console.error(
      "Customer load failed:",
      error
    );

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          Data load नहीं हुआ।
          Internet और Firebase connection जांचें।
        </td>
      </tr>
    `;

  }

}
// =========================
// SAVE / UPDATE CUSTOMER
// =========================

saveBtn.addEventListener("click", async () => {

  if (saving) {
    return;
  }

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

  const customerData = {

    date: dateInput.value,

    name: name,

    mobile: mobile,

    details: detailsInput.value.trim(),

    total: numberValue(totalInput),

    paid: numberValue(paidInput),

    due: numberValue(dueInput),

    updatedAt: serverTimestamp()

  };

  setSavingState(true);

  try {

    if (editId) {

      await updateDoc(

        doc(db, "customerDiary", editId),

        customerData

      );

      alert("Customer record update हो गया।");

    } else {

      await addDoc(

        collection(db, "customerDiary"),

        {

          ...customerData,

          createdAt: serverTimestamp()

        }

      );

      alert("Customer save हो गया।");

    }

    clearForm();

    await loadCustomers();

  } catch (error) {

    console.error(
      "Customer save failed:",
      error
    );

    alert(
      "Save नहीं हुआ। Internet और Firebase permissions जांचें।"
    );

  } finally {

    setSavingState(false);

  }

});
// =========================
// EDIT / DELETE CUSTOMER
// =========================

tbody.addEventListener("click", async (event) => {

  const button = event.target.closest(
    "button[data-action]"
  );

  if (!button) {
    return;
  }

  const id = button.dataset.id;

  const action = button.dataset.action;


  // =========================
  // EDIT CUSTOMER
  // =========================

  if (action === "edit") {

    try {

      const snapshot = await getDoc(
        doc(db, "customerDiary", id)
      );

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

      totalInput.value =
        Number(data.total || 0);

      paidInput.value =
        Number(data.paid || 0);

      calculateDue();

      saveBtn.textContent =
        "💾 Update Customer";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {

      console.error(
        "Edit load failed:",
        error
      );

      alert(
        "Record Edit के लिए नहीं खुला।"
      );

    }

  }


  // =========================
  // DELETE CUSTOMER
  // =========================

  if (action === "delete") {

    const confirmDelete = confirm(
      "क्या यह रिकॉर्ड Delete करना है?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteDoc(
        doc(db, "customerDiary", id)
      );

      alert("Record Delete हो गया।");

      await loadCustomers();

    } catch (error) {

      console.error(
        "Delete failed:",
        error
      );

      alert(
        "Record Delete नहीं हुआ।"
      );

    }

  }

});
// =========================
// SEARCH CUSTOMER
// =========================

searchInput.addEventListener("input", () => {

  const query =
    searchInput.value.trim().toLowerCase();

  const filteredCustomers =
    customersCache.filter((item) => {

      const searchableText = [

        item.date,

        item.name,

        item.mobile,

        item.details,

        item.total,

        item.paid,

        item.due

      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);

    });

  renderCustomers(filteredCustomers);

});


// =========================
// PRINT DIARY
// =========================

window.printDiary = function () {

  window.print();

};


// =========================
// EXPORT PDF
// =========================

if (exportBtn) {

  exportBtn.addEventListener("click", () => {

    window.print();

  });

}


// =========================
// EXPORT EXCEL / CSV
// =========================

if (excelBtn) {

  excelBtn.addEventListener("click", () => {

    const rows = [

      [
        "Date",
        "Name",
        "Mobile",
        "Details",
        "Total",
        "Paid",
        "Due"
      ],

      ...customersCache.map((item) => [

        item.date || "",

        item.name || "",

        item.mobile || "",

        item.details || "",

        Number(item.total || 0),

        Number(item.paid || 0),

        Number(item.due || 0)

      ])

    ];

    const csv = rows

      .map((row) => {

        return row

          .map((cell) => {

            const safeCell =
              String(cell).replaceAll(
                '"',
                '""'
              );

            return `"${safeCell}"`;

          })

          .join(",");

      })

      .join("\n");

    const blob = new Blob(

      ["\uFEFF" + csv],

      {
        type: "text/csv;charset=utf-8;"
      }

    );

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      `customer-diary-${
        new Date()
          .toISOString()
          .slice(0, 10)
      }.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(link.href);

  });

}


// =========================
// START CUSTOMER DIARY
// =========================

loadCustomers();
