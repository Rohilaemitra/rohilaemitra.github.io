function generateReceipt(){

const name=document.getElementById("name").value;
const mobile=document.getElementById("mobile").value;
const service=document.getElementById("service").value;
const total=Number(document.getElementById("total").value);
const paid=Number(document.getElementById("paid").value);

if(name=="" || mobile==""){
alert("Please fill all fields");
return;
}

const due=total-paid;

const receiptNo="RCPT-"+Date.now();

const date=new Date().toLocaleString();

document.getElementById("receipt").innerHTML=`

<h2 style="text-align:center;color:#1565c0;">
ROHILA E-MITRA CENTER
</h2>

<hr>

<p><b>Receipt No :</b> ${receiptNo}</p>

<p><b>Date :</b> ${date}</p>

<p><b>Name :</b> ${name}</p>

<p><b>Mobile :</b> ${mobile}</p>

<p><b>Service :</b> ${service}</p>

<p><b>Total Amount :</b> ₹${total}</p>

<p><b>Paid Amount :</b> ₹${paid}</p>

<p><b>Due Amount :</b> ₹${due}</p>

<hr>

<h3 style="text-align:center;">
Thank You
</h3>

<button onclick="window.print()"
style="
width:100%;
padding:12px;
background:green;
color:white;
border:none;
font-size:18px;
cursor:pointer;
">

🖨️ Print Receipt

</button>

`;

}
