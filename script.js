// =============================
// ROHILA E-MITRA CENTER
// script.js
// =============================

// Footer Year
document.addEventListener("DOMContentLoaded", function () {

    const footer = document.querySelector("footer");

    if (footer) {
        footer.innerHTML =
            "© " +
            new Date().getFullYear() +
            " ROHILA E-MITRA CENTER | All Rights Reserved";
    }

});

//