// ===== Smooth Scroll =====
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Hero Image Slider =====
const heroImages = [
    "images/banner1.jpg",
    "images/banner2.jpg",
    "images/banner3.jpg"
];

let currentImage = 0;
const hero = document.querySelector(".hero");

function changeHeroImage() {
    if (!hero) return;

    currentImage++;
    if (currentImage >= heroImages.length) {
        currentImage = 0;
    }

    hero.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url('${heroImages[currentImage]}')`;
}

setInterval(changeHeroImage, 4000);

// ===== Contact Form Validation =====
const form = document.getElementById("contactForm");

if (form) {
    form.addEventListener("submit", function(e) {

        const name = document.getElementById("name").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name.length < 3) {
            alert("Enter valid name");
            e.preventDefault();
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert("Enter valid mobile number");
            e.preventDefault();
            return;
        }

        if (message.length < 5) {
            alert("Message is too short");
            e.preventDefault();
            return;
        }
    });
}
// ===== Scroll To Top Button =====

const topBtn = document.createElement("button");

topBtn.innerHTML = "↑";

topBtn.id = "topBtn";

document.body.appendChild(topBtn);

topBtn.style.position = "fixed";
topBtn.style.bottom = "20px";
topBtn.style.left = "20px";
topBtn.style.padding = "10px 15px";
topBtn.style.fontSize = "20px";
topBtn.style.display = "none";
topBtn.style.cursor = "pointer";
topBtn.style.zIndex = "999";

window.addEventListener("scroll", () => {

if(window.scrollY > 300){

topBtn.style.display = "block";

}else{

topBtn.style.display = "none";

}

});

topBtn.onclick = () => {

window.scrollTo({

top:0,

behavior:"smooth"

});

};

// ===== Fade Animation =====

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.style.opacity = "1";

entry.target.style.transform = "translateY(0)";

}

});

});

sections.forEach(sec => {

sec.style.opacity = "0";

sec.style.transform = "translateY(40px)";

sec.style.transition = "0.8s";

observer.observe(sec);

});

// ===== Visitor Console =====

console.log("ROHILA E-MITRA Website Loaded Successfully");


function updateDateTime() {
    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const date = now.toLocaleDateString("en-IN", options);
    const time = now.toLocaleTimeString("en-IN");

    document.getElementById("datetime").innerHTML =
        "📅 " + date + " | 🕒 " + time;
}

updateDateTime();
setInterval(updateDateTime, 1000);
const today = new Date();

const month = today.getMonth()+1;

const day = today.getDate();

const banner = document.getElementById("festivalBanner");

function showFestival(msg,color){

banner.style.display="block";

banner.style.background=color;

banner.innerHTML=msg;

}

// Republic Day
if(month==1 && day==26){

showFestival("🇮🇳 Happy Republic Day 🇮🇳","#ff6f00");

}

// Holi
else if(month==3 && day==14){

showFestival("🌈 Happy Holi 🌈","#e91e63");

}

// Independence Day
else if(month==8 && day==15){

showFestival("🇮🇳 Happy Independence Day 🇮🇳","#2e7d32");

}

// Gandhi Jayanti
else if(month==10 && day==2){

showFestival("🙏 Gandhi Jayanti 🙏","#1976d2");

}

// Diwali (Date change every year)
else if(month==10 && day==20){

showFestival("🪔 Happy Diwali 🪔","#ff9800");

}

// Christmas
else if(month==12 && day==25){

showFestival("🎄 Merry Christmas 🎄","#c62828");

}

// New Year
else if(month==1 && day==1){

showFestival("🎉 Happy New Year 🎉","#6a1b9a");

}
const banner = document.getElementById("festivalBanner");

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;

function festival(msg, cssClass){

banner.classList.add("show");
banner.classList.add(cssClass);

banner.innerHTML = msg;

document.body.classList.add("theme-"+cssClass);

}

// New Year
if(month==1 && day==1){
festival("🎉 Happy New Year 🎉","newyear");
}

// Republic Day
if(month==1 && day==26){
festival("🇮🇳 Happy Republic Day 🇮🇳","republic");
}

// Holi (Date Change Every Year)
if(month==3 && day==14){
festival("🌈 Happy Holi 🌈","holi");
}

// Independence Day
if(month==8 && day==15){
festival("🇮🇳 Happy Independence Day 🇮🇳","independence");
}

// Gandhi Jayanti
if(month==10 && day==2){
festival("🙏 Gandhi Jayanti 🙏","independence");
}

// Diwali (Change Every Year)
if(month==10 && day==20){
festival("🪔 Happy Diwali 🪔","diwali");
}

// Christmas
if(month==12 && day==25){
festival("🎄 Merry Christmas 🎄","christmas");
}
function updateDateTime() {
    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const date = now.toLocaleDateString("en-IN", options);
    const time = now.toLocaleTimeString("en-IN");

    document.getElementById("datetime").innerHTML =
        "📅 " + date + " | 🕒 " + time;
}

updateDateTime();
setInterval(updateDateTime, 1000);
