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
