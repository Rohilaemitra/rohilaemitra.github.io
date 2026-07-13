// ROHILA E-MITRA CENTER

// Current Year in Footer
const footer = document.querySelector("footer");
if (footer) {
  footer.innerHTML =
    "© " + new Date().getFullYear() + " ROHILA E-MITRA CENTER | All Rights Reserved";
}

// Smooth Scroll
document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});

// Service Card Hover
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-8px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0px)";
  });
});

// Welcome Message
window.onload = function () {
  console.log("Welcome to ROHILA E-MITRA CENTER");
};
