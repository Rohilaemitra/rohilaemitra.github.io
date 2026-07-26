const table = document.getElementById("customerTable");

function addRow() {

    const row = table.insertRow(-1);

    row.innerHTML = `

<td><input type="date"></td>

<td><input type="text" placeholder="Customer Name"></td>

<td><input type="tel" placeholder="Mobile"></td>

<td><input type="text" placeholder="Details"></td>

<td><input type="number" placeholder="Total"></td>

<td><input type="number" placeholder="Paid"></td>

<td><input type="number" placeholder="Due"></td>

<td><button class="delete" onclick="deleteRow(this)">Delete</button></td>

`;

}

function deleteRow(btn){

btn.parentElement.parentElement.remove();

}
