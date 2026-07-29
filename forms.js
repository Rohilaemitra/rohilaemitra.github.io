const search = document.getElementById("searchForm");
const cards = [...document.querySelectorAll("#formsList .form-card")];
search?.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  cards.forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});
