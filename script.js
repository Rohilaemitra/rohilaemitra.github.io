document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
