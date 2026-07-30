const $ = (id) => document.getElementById(id);

function showStatus(id, message, type = 'info') {
  const el = $(id);
  el.className = `status show ${type}`;
  el.textContent = message;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('फाइल नहीं चुनी गई।'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('फोटो नहीं खुली।')); };
    img.src = url;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function downloadCanvas(canvas, name, mime = 'image/jpeg', quality = 0.92) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, mime, quality);
}

$('makePassport')?.addEventListener('click', async () => {
  try {
    const file = $('passportFile').files[0];
    const img = await loadImage(file);
    const canvas = $('passportCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1800;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const count = Number($('sheetCount').value);
    const isTwoInch = $('passportSize').value === '2x2';
    const photoW = isTwoInch ? 520 : 413;
    const photoH = isTwoInch ? 520 : 531;
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const gap = 22;
    const totalW = cols * photoW + (cols - 1) * gap;
    const totalH = rows * photoH + (rows - 1) * gap;
    const startX = Math.max(20, (canvas.width - totalW) / 2);
    const startY = Math.max(20, (canvas.height - totalH) / 2);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (photoW + gap);
      const y = startY + row * (photoH + gap);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, photoW, photoH);
      ctx.clip();
      drawCover(ctx, img, x, y, photoW, photoH);
      ctx.restore();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, photoW, photoH);
    }
    $('downloadPassport').classList.remove('hidden');
    showStatus('passportStatus', 'Passport photo sheet तैयार है।', 'ok');
  } catch (err) {
    showStatus('passportStatus', err.message || 'फोटो बनाने में समस्या आई।', 'error');
  }
});

$('downloadPassport')?.addEventListener('click', () => downloadCanvas($('passportCanvas'), 'rohila-passport-photo-sheet.jpg'));

$('resizeQuality')?.addEventListener('input', (e) => $('qualityText').textContent = `${e.target.value}%`);

$('resizeFile')?.addEventListener('change', async (e) => {
  try {
    const img = await loadImage(e.target.files[0]);
    $('resizeWidth').value = img.width;
    $('resizeHeight').value = img.height;
    showStatus('resizeStatus', `Original size: ${img.width} × ${img.height}px`, 'info');
  } catch (_) {}
});

$('resizeBtn')?.addEventListener('click', async () => {
  try {
    const img = await loadImage($('resizeFile').files[0]);
    const width = Math.max(1, Number($('resizeWidth').value));
    const height = Math.max(1, Number($('resizeHeight').value));
    const canvas = $('resizeCanvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    $('downloadResize').classList.remove('hidden');
    showStatus('resizeStatus', `नई फोटो: ${width} × ${height}px`, 'ok');
  } catch (err) {
    showStatus('resizeStatus', err.message || 'Resize नहीं हुआ।', 'error');
  }
});

$('downloadResize')?.addEventListener('click', () => {
  const mime = $('resizeFormat').value;
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const quality = Number($('resizeQuality').value) / 100;
  downloadCanvas($('resizeCanvas'), `rohila-resized-photo.${ext}`, mime, quality);
});

$('jpgToPdfBtn')?.addEventListener('click', async () => {
  try {
    const files = [...$('jpgFiles').files];
    if (!files.length) throw new Error('कम से कम एक फोटो चुनें।');
    if (!window.jspdf?.jsPDF) throw new Error('PDF library load नहीं हुई। Internet चालू रखें।');
    showStatus('jpgPdfStatus', 'PDF बन रही है...', 'info');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    for (let i = 0; i < files.length; i++) {
      const img = await loadImage(files[i]);
      if (i > 0) pdf.addPage();
      const pageW = 210, pageH = 297, margin = 10;
      const ratio = Math.min((pageW - margin * 2) / img.width, (pageH - margin * 2) / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      const temp = document.createElement('canvas');
      temp.width = img.width;
      temp.height = img.height;
      temp.getContext('2d').drawImage(img, 0, 0);
      pdf.addImage(temp.toDataURL('image/jpeg', 0.9), 'JPEG', x, y, w, h);
    }
    pdf.save('rohila-images.pdf');
    showStatus('jpgPdfStatus', 'PDF डाउनलोड हो गई।', 'ok');
  } catch (err) {
    showStatus('jpgPdfStatus', err.message || 'PDF नहीं बनी।', 'error');
  }
});

$('mergePdfBtn')?.addEventListener('click', async () => {
  try {
    const files = [...$('mergeFiles').files];
    if (files.length < 2) throw new Error('कम से कम दो PDF चुनें।');
    if (!window.PDFLib) throw new Error('PDF library load नहीं हुई। Internet चालू रखें।');
    showStatus('mergeStatus', 'PDF जोड़ी जा रही हैं...', 'info');
    const merged = await PDFLib.PDFDocument.create();
    for (const file of files) {
      const source = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }
    const bytes = await merged.save();
    downloadBytes(bytes, 'rohila-merged.pdf', 'application/pdf');
    showStatus('mergeStatus', 'Merged PDF डाउनलोड हो गई।', 'ok');
  } catch (err) {
    showStatus('mergeStatus', err.message || 'PDF merge नहीं हुई।', 'error');
  }
});

function parsePages(text, total) {
  const result = new Set();
  for (const tokenRaw of text.split(',')) {
    const token = tokenRaw.trim();
    if (!token) continue;
    if (token.includes('-')) {
      const [a, b] = token.split('-').map(Number);
      if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('पेज नंबर सही लिखें।');
      for (let p = Math.min(a, b); p <= Math.max(a, b); p++) if (p >= 1 && p <= total) result.add(p - 1);
    } else {
      const p = Number(token);
      if (!Number.isInteger(p)) throw new Error('पेज नंबर सही लिखें।');
      if (p >= 1 && p <= total) result.add(p - 1);
    }
  }
  return result;
}

$('deletePagesBtn')?.addEventListener('click', async () => {
  try {
    const file = $('deletePdfFile').files[0];
    if (!file) throw new Error('PDF चुनें।');
    if (!window.PDFLib) throw new Error('PDF library load नहीं हुई। Internet चालू रखें।');
    const source = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const total = source.getPageCount();
    const remove = parsePages($('pagesToDelete').value, total);
    if (!remove.size) throw new Error('हटाने वाले पेज लिखें।');
    if (remove.size >= total) throw new Error('सभी पेज नहीं हटाए जा सकते।');
    const keep = source.getPageIndices().filter((i) => !remove.has(i));
    const out = await PDFLib.PDFDocument.create();
    const pages = await out.copyPages(source, keep);
    pages.forEach((page) => out.addPage(page));
    downloadBytes(await out.save(), 'rohila-pages-removed.pdf', 'application/pdf');
    showStatus('deleteStatus', `${remove.size} पेज हटाकर PDF डाउनलोड हो गई।`, 'ok');
  } catch (err) {
    showStatus('deleteStatus', err.message || 'पेज delete नहीं हुए।', 'error');
  }
});

function downloadBytes(bytes, name, mime) {
  const blob = new Blob([bytes], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
