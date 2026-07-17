<td>
<button onclick="printReceipt(
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
// ================= RECEIPT PRINT =================

window.printReceipt = function(name,mobile,service,total,paid,due,date){

const w = window.open("", "_blank", "width=700,height=700");

w.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Receipt</title>
<style>
body{
font-family:Arial;
padding:25px;
}
h2{
text-align:center;
color:#1565c0;
}
table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}
td{
border:1px solid #000;
padding:10px;
}
</style>
</head>
<body>

<h2>ROHILA E-MITRA CENTER</h2>
<h3 style="text-align:center;">Payment Receipt</h3>

<table>

<tr>
<td><b>Name</b></td>
<td>${name}</td>
</tr>

<tr>
<td><b>Mobile</b></td>
<td>${mobile}</td>
</tr>

<tr>
<td><b>Service</b></td>
<td>${service}</td>
</tr>

<tr>
<td><b>Total Amount</b></td>
<td>₹${total}</td>
</tr>

<tr>
<td><b>Paid</b></td>
<td>₹${paid}</td>
</tr>

<tr>
<td><b>Due</b></td>
<td>₹${due}</td>
</tr>

<tr>
<td><b>Date</b></td>
<td>${date}</td>
</tr>

</table>

<br><br>

<p style="text-align:center;">
Thank You For Visiting
</p>

</body>
</html>
`);

w.document.close();
w.print();

};
