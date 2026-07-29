const REPO_API = 'https://api.github.com/repos/Rohilaemitra/rohilaemitra.github.io/contents/forms?ref=main';
const ALLOWED = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;

const list = document.getElementById('formsList');
const statusBox = document.getElementById('status');
const searchBox = document.getElementById('searchForm');
let allFiles = [];

function cleanName(name) {
  return name
    .replace(/\.(pdf|doc|docx|jpg|jpeg|png)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[ch]);
}

function render(files) {
  if (!files.length) {
    list.innerHTML = '<div class="empty">कोई फॉर्म नहीं मिला।</div>';
    return;
  }

  list.innerHTML = files.map(file => {
    const title = safeText(cleanName(file.name));
    const url = file.download_url || `forms/${encodeURIComponent(file.name)}`;
    return `
      <article class="form-card">
        <h3>📄 ${title}</h3>
        <div class="buttons">
          <a class="btn view" href="${url}" target="_blank" rel="noopener">Open</a>
          <a class="btn download" href="${url}" download>Download</a>
        </div>
      </article>`;
  }).join('');
}

async function loadAllForms() {
  try {
    statusBox.textContent = 'GitHub forms folder से सभी files loading...';
    const response = await fetch(REPO_API, { cache: 'no-store' });
    if (!response.ok) throw new Error(`GitHub API error ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Forms folder नहीं मिला');

    allFiles = data
      .filter(item => item.type === 'file' && ALLOWED.test(item.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

    statusBox.textContent = `कुल ${allFiles.length} फॉर्म मिले`;
    render(allFiles);
  } catch (error) {
    statusBox.className = 'status error';
    statusBox.textContent = `Forms load नहीं हुए: ${error.message}. Page refresh करें।`;
    list.innerHTML = '<div class="empty">GitHub folder से files पढ़ने में समस्या आई।</div>';
  }
}

searchBox.addEventListener('input', () => {
  const q = searchBox.value.trim().toLowerCase();
  const filtered = allFiles.filter(file => cleanName(file.name).toLowerCase().includes(q));
  render(filtered);
  statusBox.textContent = q ? `${filtered.length} matching forms` : `कुल ${allFiles.length} फॉर्म मिले`;
});

loadAllForms();
