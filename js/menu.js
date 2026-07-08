const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const icon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {

    menu.classList.toggle("active");

    icon.className = menu.classList.contains("active")
        ? "bi bi-x-lg"
        : "bi bi-list";

});