import { Create, checkUsername } from "./firebase.js";

const btnCreateAccount = document.getElementById('btnCreateAccount');
btnCreateAccount.addEventListener('click', async () => {
    const username = prompt("Enter your username");

    if (username === null) return;

    if (username.trim() === "") {
        alert("Please enter your username!");
        return;
    } else {

        if (username.length < 3) {
            alert("Username must be at least 3 characters long!");
            return;
        }

        const loginContainer = document.getElementById('loginContainer');
        const loader = document.getElementById('loader');

        loginContainer.classList.add('d-none');
        loader.classList.remove('d-none');

        const result = await checkUsername(username);

        if (result == true) {
            alert("Username already exists!");

            loginContainer.classList.remove('d-none');
            loader.classList.add('d-none');
        } else {

            if (confirm("Do you want to create an account?")) {

                const data = {
                    imageAddress: '',
                    username: username,
                    password: '',
                    name: '',
                    bio: '',
                    description: '',
                    aboutMe: ''
                }

                await Create('Profile', data);

                localStorage.setItem('username', username);
                window.location.href = "./manage/portfolio";

            } else {
                loginContainer.classList.remove('d-none');
                loader.classList.add('d-none');
            }
        }
    }
});
