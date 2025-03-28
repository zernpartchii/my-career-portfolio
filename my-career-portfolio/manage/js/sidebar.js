import { insertProfileData } from './profile.js'

edit_profile.addEventListener("click", async () => {
    if (edit_profile.classList.contains("bi-pencil-square")) {
        edit_profile.textContent = " Save Profile";
        edit_profile.classList.remove("bi-pencil-square");
        edit_profile.classList.add("bi-save");
        profilea_imageAdress.disabled = false;
        // profile_username.disabled = false;
        profilePassword.disabled = false;
        profile_resumeLink.disabled = false;
        profile_name.disabled = false;
        profile_bio.disabled = false;
        profile_description.disabled = false;
        aboutMe.disabled = false;
    } else {
        await insertProfileData();
        image_profile.src = profilea_imageAdress.value
        edit_profile.textContent = " Edit Profile";
        edit_profile.classList.add("bi-pencil-square");
        edit_profile.classList.remove("bi-save");
        profilea_imageAdress.disabled = true;
        // profile_username.disabled = true;
        profile_resumeLink.disabled = true;
        profile_name.disabled = true;
        profilePassword.disabled = true;
        profile_bio.disabled = true;
        profile_description.disabled = true;
        aboutMe.disabled = true;
    }
});

document.querySelectorAll("#sidebar ul li, .bottom-bar ul li a").forEach(function (item) {
    item.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default anchor behavior

        // Get the target section ID
        var targetId = item.getAttribute("data-target") || item.parentElement.getAttribute("data-target");

        if (!targetId) return; // Prevent errors if there's no target

        // Hide all sections
        document.querySelectorAll("#mainContent > div").forEach(function (section) {
            section.classList.add("d-none");
        });

        // Show the selected section
        document.getElementById(targetId).classList.remove("d-none");

        // Hide sidebar menu (for mobile)
        document.querySelector('#sidebar ul').classList.remove('show');
    });
});

// Show 'Profile' by default
document.getElementById('profile').classList.remove("d-none");

// Toggle sidebar menu on mobile
document.getElementById("manage").addEventListener("click", () => {
    document.querySelector('#sidebar ul').classList.toggle('show');
});
