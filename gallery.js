import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js';

const localPhotos = [
  { title: 'ROHILA E-Mitra Center', url: 'images/11.png' },
  { title: 'Customer Service', url: 'images/22.jpg' },
  { title: 'Office Interior', url: 'images/44.jpg' },
  { title: 'ROHILA Gallery', url: 'images/ChatGPT Image Jul 16, 2026, 05_02_17 PM.png' }
];

const $ = id => document.getElementById(id);
const grid = $('galleryGrid');
const status = $('status');
let admin = false;
let firebaseItems = [];

function show(message, type = 'info') {
  status.textContent = message;
  status.className = `status show ${type}`;
}

function card(photo, removable = false) {
  const article = document.createElement('article');
  article.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = photo.url;
  img.alt = photo.title || 'Gallery photo';
  img.loading = 'lazy';
  img.onerror = () => article.remove();
  const meta = document.createElement('div');
  meta.className = 'gallery-meta';
  meta.innerHTML = `<b>${photo.title || 'Photo'}</b>`;
  if (removable && admin) {
    const button = document.createElement('button');
    button.className = 'btn danger';
    button.textContent = 'Delete';
    button.style.marginTop = '8px';
    button.onclick = () => removeFirebasePhoto(photo);
    meta.appendChild(document.createElement('br'));
    meta.appendChild(button);
  }
  article.append(img, meta);
  return article;
}

function render() {
  grid.innerHTML = '';
  localPhotos.forEach(photo => grid.appendChild(card(photo, false)));
  firebaseItems.forEach(photo => grid.appendChild(card(photo, true)));
}

async function loadFirebasePhotos() {
  try {
    const snapshot = await getDocs(collection(db, 'gallery'));
    firebaseItems = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    render();
  } catch (error) {
    render();
    show('Local photos दिखाई जा रही हैं। Firebase gallery load नहीं हुई: ' + error.message, 'error');
  }
}

async function removeFirebasePhoto(photo) {
  if (!confirm('Photo delete करें?')) return;
  try {
    if (photo.path) await deleteObject(ref(storage, photo.path));
    await deleteDoc(doc(db, 'gallery', photo.id));
    await loadFirebasePhotos();
  } catch (error) {
    show(error.message, 'error');
  }
}

onAuthStateChanged(auth, user => {
  admin = Boolean(user);
  $('uploadPanel').classList.toggle('hidden', !admin);
  loadFirebasePhotos();
});

$('uploadForm').addEventListener('submit', async event => {
  event.preventDefault();
  const file = $('file').files[0];
  if (!file) return;
  try {
    show('Uploading...');
    const path = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, 'gallery'), {
      title: $('title').value.trim(), url, path, createdAt: serverTimestamp()
    });
    event.target.reset();
    show('Photo uploaded', 'ok');
    await loadFirebasePhotos();
  } catch (error) {
    show(error.message, 'error');
  }
});

render();
