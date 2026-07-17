import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const customerTable = document.getElementById("customerTable");
const totalCustomers = document.getElementById("totalCustomers");
const totalServices = document.getElementById("totalServices");
const totalCollection = document.getElementById("totalCollection");
const pendingAmount = document.getElementById("pendingAmount");

window.saveCustomer = async function () {

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const service = document.getElementById("service").value;
  const total = Number(document.getElementById("total").value);
  const paid = Number(document.getElementById("paid").value);

  if (!name || !mobile || !total) {
    alert("Please fill all fields");
    return;
  }

  await addDoc(collection(db, "customers"), {
    name,
    mobile,
    service,
    total,
    paid,
    due: total - paid,
    date: new Date().toLocaleDateString()
  });

  alert("Customer Saved");

  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("total").value = "";
  document.getElementById("paid").value = "";

  loadCustomers();
};
async function loadCustomers() {

    const snapshot = await getDocs(collection(db, "customers"));

    let html = "";

    let customerCount = 0;
    let serviceCount = 0;
    let collectionAmount = 0;
    let pending = 0;

    snapshot.forEach((d) => {

        const c = d.data();

        customerCount++;
        serviceCount++;

        collectionAmount += Number(c.paid || 0);
        pending += Number(c.due || 0);

        html += `
        <tr>

        <td>${c.name}</td>

        <td>${c.mobile}</td>

        <td>${c.service}</td>

        <td>₹${c.total}</td>

        <td style="color:green;">₹${c.paid}</td>

        <td style="color:red;">₹${c.due}</td>

        <td>${c.date}</td>

        <td>
        <button class="receipt"
        onclick="printReceipt(
        '${c.name}',
        '${c.mobile}',
        '${c.service}',
        '${c.total}',
        '${c.paid}',
        '${c.due}',
        '${c.date}'
        )">
        🧾 Receipt
        </button>
        </td>

        <td>
        <button class="delete"
        onclick="deleteCustomer('${d.id}')">
        🗑 Delete
        </button>
        </td>

        </tr>
        `;

    });

    customerTable.innerHTML = html;

    totalCustomers.innerHTML = customerCount;

    totalServices.innerHTML = serviceCount;

    totalCollection.innerHTML = "₹" + collectionAmount;

    pendingAmount.innerHTML = "₹" + pending;

}

loadCustomers();
