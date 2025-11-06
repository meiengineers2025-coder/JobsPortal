// public/login.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const messageBox = document.getElementById("messageBox");

    form.addEventListener("submit", (e) => {
        if (!emailInput.value || !passwordInput.value) {
            e.preventDefault();
            showMessage("Please enter both email and password.");
        }
    });

    function showMessage(msg) {
        if (messageBox) {
            messageBox.style.display = "block";
            messageBox.innerText = msg;
        }
    }
});