import { auth, db, storage } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js';
import { requireAdmin } from './auth-guard.js';

const $ = id => document.getElementById(id);
const grid = $('secretGrid');
const statusBox = $('status');
let items = [];
let currentUser = null;

function show(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = `status show ${type}`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[ch]);
}

async function loadSecretPhotos() {
  try {
    show('Private photos loading...');
    const snapshot = await getDocs(collection(db, 'secretGallery'));
    items = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(item => !item.ownerUid || item.ownerUid === currentUser.uid);

    grid.innerHTML = items.length
      ? items.map(item => `
        <article class="gallery-item">
          <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title || 'Private photo')}" loading="lazy">
          <div class="gallery-meta">
            <b>${escapeHtml(item.title || 'Private Photo')}</b>
            <div style="margin-top:8px">
              <button class="btn danger delete-secret" data-id="${item.id}" type="button">Delete</button>
            </div>
          </div>
        </article>`).join('')
      : '<p class="muted">अभी कोई private photo नहीं है।</p>';
    show('Secret Gallery ready', 'ok');
  } catch (error) {
    show(`Load error: ${error.message}`, 'error');
  }
}

requireAdmin(user => {
  currentUser = user;
  loadSecretPhotos();
});

$('uploadForm').addEventListener('submit', async event => {
  event.preventDefault();
  const file = $('file').files[0];
  const title = $('title').value.trim();
  if (!currentUser || !file || !title) return;
  if (!file.type.startsWith('image/')) {
    show('केवल image file चुनें।', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    show('Image 10 MB से छोटी रखें।', 'error');
    return;
  }

  try {
    show('Private photo uploading...');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `secret/${currentUser.uid}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, 'secretGallery'), {
      title,
      url,
      path,
      ownerUid: currentUser.uid,
      createdAt: serverTimestamp()
    });
    event.target.reset();
    show('Private photo uploaded', 'ok');
    await loadSecretPhotos();
  } catch (error) {
    show(`Upload error: ${error.message}`, 'error');
  }
});

grid.addEventListener('click', async event => {
  if (!event.target.classList.contains('delete-secret')) return;
  const item = items.find(x => x.id === event.target.dataset.id);
  if (!item || !confirm('यह private photo delete करें?')) return;
  try {
    show('Deleting...');
    if (item.path) await deleteObject(ref(storage, item.path));
    await deleteDoc(doc(db, 'secretGallery', item.id));
    await loadSecretPhotos();
  } catch (error) {
    show(`Delete error: ${error.message}`, 'error');
  }
});

$('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  location.replace('login.html');
});
