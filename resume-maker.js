const q = (id) => document.getElementById(id);
function lines(value) { return value.split(/\n+/).map(v => v.trim()).filter(Boolean); }
function fillList(id, values) {
  const ul = q(id); ul.innerHTML = '';
  (values.length ? values : ['']).forEach(v => { const li = document.createElement('li'); li.textContent = v; ul.appendChild(li); });
}
function updateResume() {
  q('pName').textContent = q('rName').value.trim() || 'YOUR NAME';
  q('pContact').textContent = [q('rMobile').value.trim(), q('rEmail').value.trim()].filter(Boolean).join(' | ') || 'Mobile | Email';
  q('pAddress').textContent = q('rAddress').value.trim() || 'Address';
  q('pObjective').textContent = q('rObjective').value.trim();
  fillList('pEducation', lines(q('rEducation').value));
  fillList('pSkills', lines(q('rSkills').value));
  q('pExperience').textContent = q('rExperience').value.trim() || 'Fresher';
  q('pDob').textContent = q('rDob').value || '-';
  q('pMarital').textContent = q('rMarital').value;
  q('pLanguages').textContent = q('rLanguages').value.trim() || '-';
}
q('updateResume').addEventListener('click', updateResume);
updateResume();
