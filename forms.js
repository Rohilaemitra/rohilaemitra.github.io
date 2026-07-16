const searchInput = document.getElementById("searchForm");
const formCards = document.querySelectorAll(".form-card");

searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    formCards.forEach(card => {

        const title = card.querySelector("h3").textContent.toLowerCase();

        if (title.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});

// Total Forms Counter
console.log("Forms Page Loaded Successfully");

// Future Ready
// You can add 100+ forms by copying this HTML block:
//
// <div class="form-card">
//   <h3>Form Name</h3>
//   <a href="forms/file.pdf" download>Download PDF</a>
// </div>
