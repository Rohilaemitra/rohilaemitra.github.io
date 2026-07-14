let index=0;

const slides=document.querySelectorAll(".slide");

function slider(){

slides.forEach(s=>s.classList.remove("active"));

index++;

if(index>=slides.length){

index=0;

}

slides[index].classList.add("active");

}

setInterval(slider,3000);
