
const btnLogout = document.getElementById('btnLogout');
btnLogout.addEventListener('click', () => {
    if (confirm("Are you sure you want to logout?")) {
        logout();
    }
});

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('profileID');
    window.location.href = "../../index.html";
}