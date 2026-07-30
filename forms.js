const forms = [
  ["ASHA Soft Claim Form", "forms/ASHASoft-ClaimForm.pdf"],
  ["Add Ration Card Rajasthan", "forms/Add Ration-Card-Rajasthan.pdf"],
  ["Birth Certificate Form", "forms/birth certificate empty.pdf"],
  ["Form No. 6", "forms/Form No 6 New Formet.pdf"],
  ["Gram Sewak Report", "forms/gramsewak report.pdf"],
  ["Kund Form", "forms/kund.pdf"],
  ["New Ration Card Form", "forms/new ratoin card form.pdf"],
  ["Patwari EWS Form", "forms/patwari ews.pdf"],
  ["PCC & Passport Verification", "forms/pcc & passport verification offline form pdf vi.pdf"],
  ["PM Kisan Patwari Report", "forms/pm kisan patwari riport.pdf"],
  ["Police Verification Form", "forms/police verification offline form pdf.pdf"],
  ["SC/ST Certificate Form", "forms/sc-st.pdf"],
  ["OBC Certificate Form", "forms/OBC-STATE-AND-CENTRAL-FORM.pdf"],
  ["Shramik Scholarship Form", "forms/shramik-new-schoolership-form.pdf"],
  ["Virasat 5 Gawah Form", "forms/virasat 5 gawah.pdf"]
];

const grid = document.getElementById("formsGrid");
const search = document.getElementById("search");

function renderForms() {
  const query = search.value.trim().toLowerCase();
  const filtered = forms.filter(([name]) => name.toLowerCase().includes(query));

  if (!filtered.length) {
    grid.innerHTML = '<div class="panel"><p>कोई फॉर्म नहीं मिला।</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(([name, url]) => `
    <article class="card">
      <h3>📄 ${name}</h3>
      <a class="btn" href="${encodeURI(url)}" target="_blank" rel="noopener">देखें / डाउनलोड करें</a>
    </article>
  `).join("");
}

search.addEventListener("input", renderForms);
renderForms();
