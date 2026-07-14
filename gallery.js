import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
apiKey:"AIzaSyCJ_fqSqfni6mBojtjWGQogufE54kr9NRw",
authDomain:"rohila-e-mitra.firebaseapp.com",
projectId:"rohila-e-mitra",
storageBucket:"rohila-e-mitra.firebasestorage.app",
messagingSenderId:"630734393676",
appId:"1:630734393676:web:1b1ef5130167f0c09ebfe9"
};

const app=initializeApp(firebaseConfig);

const storage=getStorage(app);

window.uploadImage=async()=>{

const file=document.getElementById("image").files[0];

if(!file){

alert("Select Image");

return;

}

const storageRef=ref(storage,"gallery/"+file.name);

await uploadBytes(storageRef,file);

alert("Image Uploaded");

loadGallery();

}

async function loadGallery(){

const listRef=ref(storage,"gallery");

const res=await listAll(listRef);

let html="";

for(const item of res.items){

const url=await getDownloadURL(item);

html+=`
<img src="${url}" style="width:250px;margin:10px;border-radius:10px;">
`;

}

document.getElementById("gallery").innerHTML=html;

}

loadGallery();
