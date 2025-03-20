import { checkUsernamePassword } from "./firebase.js";

const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const btnLogin = document.getElementById('btnLogin');
btnLogin.addEventListener('click', async () => {

    const username = loginUsername.value;
    const password = loginPassword.value;

    if (username.trim() === "") {
        alert("Please enter your username!");
        return;
    } else {

        const loginContainer = document.getElementById('loginContainer');
        const loader = document.getElementById('loader');

        loginContainer.classList.add('d-none');
        loader.classList.remove('d-none');

        const result = await checkUsernamePassword(username, password);

        if (result == true) {
            localStorage.setItem('username', username);
            window.location.href = "./manage/portfolio";
        } else {
            alert("Wrong username or password!");

            loginContainer.classList.remove('d-none');
            loader.classList.add('d-none');
        }
    }
});

loginUsername.addEventListener("keydown", (event) => {
    pressEnter(event);
});

loginPassword.addEventListener("keydown", (event) => {
    pressEnter(event);
});

function pressEnter(event) {
    if (event.key === "Enter") {
        btnLogin.click();
    }
}

