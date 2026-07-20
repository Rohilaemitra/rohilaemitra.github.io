// ================================
// ROHILA E-MITRA CENTER
// Clean Script - Part 1
// ================================
alert("Script Loaded");
// ===== Smooth Scroll =====
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        if (href && href.startsWith("#")) {
            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
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

if (hero) {
    changeHeroImage();
    setInterval(changeHeroImage, 4000);
}

// ===== Contact Form Validation =====
const form = document.getElementById("contactForm");

if (form) {

    form.addEventListener("submit", function (e) {

        const name =
            document.getElementById("name").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const message =
            document.getElementById("message").value.trim();

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

// ===== Scroll To Top =====

const topBtn = document.createElement("button");

topBtn.id = "topBtn";

topBtn.innerHTML = "↑";

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

    if (window.scrollY > 300) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

topBtn.onclick = () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};// ================================
// Clean Script - Part 2
// ================================

// ===== Fade Animation =====

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }

    });

}, {
    threshold: 0.15
});

sections.forEach((section) => {

    section.style.opacity = "0";
    section.style.transform = "translateY(40px)";
    section.style.transition = "all .8s ease";

    observer.observe(section);

});

// ===== Visitor Console =====

console.log("ROHILA E-MITRA Website Loaded Successfully");

// ===== Festival Banner =====

const banner = document.getElementById("festivalBanner");

if (banner) {

    const today = new Date();

    const month = today.getMonth() + 1;

    const day = today.getDate();

    function showFestival(message, color) {

        banner.style.display = "block";
        banner.style.background = color;
        banner.innerHTML = message;

    }

    if (month === 1 && day === 1) {

        showFestival("🎉 Happy New Year 🎉", "#6a1b9a");

    } else if (month === 1 && day === 26) {

        showFestival("🇮🇳 Happy Republic Day 🇮🇳", "#ff6f00");

    } else if (month === 3 && day === 14) {

        showFestival("🌈 Happy Holi 🌈", "#e91e63");

    } else if (month === 8 && day === 15) {

        showFestival("🇮🇳 Happy Independence Day 🇮🇳", "#2e7d32");

    } else if (month === 10 && day === 2) {

        showFestival("🙏 Gandhi Jayanti 🙏", "#1976d2");

    } else if (month === 10 && day === 20) {

        showFestival("🪔 Happy Diwali 🪔", "#ff9800");

    } else if (month === 12 && day === 25) {

        showFestival("🎄 Merry Christmas 🎄", "#c62828");

    } else {

        banner.style.display = "none";

    }

}// ================================
// Clean Script - Part 3
// ================================

// ===== Live Date & Time =====

function updateDateTime() {

    const dt = document.getElementById("datetime");

    if (!dt) return;

    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    dt.innerHTML = `📅 ${date} | 🕒 ${time}`;
}

// पहली बार चलाएँ
updateDateTime();

// हर सेकंड अपडेट करें
setInterval(updateDateTime, 1000);

// ===== Website Loaded =====

window.addEventListener("load", () => {

    console.log("ROHILA E-MITRA CENTER Loaded Successfully ✅");

});
