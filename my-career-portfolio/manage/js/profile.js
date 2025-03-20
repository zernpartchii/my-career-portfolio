import { setDocs, deleteDocs, updateDocs, Create, checkUsername, readProfileData, db, collection, query, where, getDocs } from './firebase.js'
const profileID = localStorage.getItem('profileID');

export async function insertProfileData() {

    if (!confirm('Do you want to update your profile?')) return

    const data = {
        imageAddress: profilea_imageAdress.value || "",
        // username: profile_username.value || "",
        password: profilePassword.value || "",
        resumeLink: profile_resumeLink.value || "",
        name: profile_name.value || "",
        bio: profile_bio.value || "",
        description: profile_description.value || "",
        aboutMe: aboutMe.value || ""
    }

    await updateDocs('Profile', profileID, data);
}

btnShowHidePassword.addEventListener('click', () => {
    profilePassword.type = profilePassword.type == 'password' ? 'text' : 'password';
    btnShowHidePassword.textContent = profilePassword.type == 'password' ? 'Show' : 'Hide';
})

btnSaveUsername.addEventListener('click', updateUsername);

btnResume.addEventListener('change', async () => {
    await updateDocs('Profile', profileID, { btnResume: !btnResume.checked });
});

async function updateUsername() {

    const newUsername = profile_username.value;

    if (!newUsername.value) {
        alert('Please enter a username.');
        return;
    }

    const usernameExists = await checkUsername(newUsername);

    if (usernameExists) {
        alert("The username is already taken. Please choose another one.");
        return false; // Stop the process
    }

    if (confirm('Do you want to update your username?')) {

        localStorage.setItem('username', newUsername);
        await updateDocs('Profile', profileID, { username: newUsername });

        await deleteDocs('Settings', username);
        await setDocs("Settings", newUsername, {
            switchTech: switchTech.checked,
            switchTools: switchTools.checked,
            switchSoft: switchSoft.checked,
            switchOthers: switchOthers.checked
        });

        // Update all UserData
        const tablename = ['skills', 'Projects', 'Timeline', 'Certificates', 'Contact'];
        tablename.forEach(async (tableName) => {
            await updateUserDataByUsername(tableName, username);
        })

    } else {
        profile_username.value = username;
    }
}

async function updateUserDataByUsername(tableName, username) {
    // Step 1: Query Firestore to find the document with matching username
    const q = query(collection(db, tableName), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Step 1: Create an array of update promises
        const newUsername = profile_username.value;
        const updatePromises = querySnapshot.docs.map((docSnap) => {
            return updateDocs(tableName, docSnap.id, { username: newUsername });
        });

        // Step 2: Wait for all updates to complete
        await Promise.all(updatePromises);
    } else {
        console.log("User not found!");
    }
}

function displayProfileData(data) {
    if (!data.imageAddress) {
        profileSkeleton.innerHTML = `<div class="skeleton-profile skeleton-profile-image mb-3"></div>`;
        image_profile.classList.add('d-none');
    } else {
        image_profile.classList.remove('d-none');
        image_profile.src = data.imageAddress
        profileSkeleton.innerHTML = '';
    }

    localStorage.setItem('profileID', data.profileID);
    profilea_imageAdress.value = data.imageAddress || '';
    profile_username.value = data.username || '';
    profilePassword.value = data.password || '';
    profile_resumeLink.value = data.resumeLink || '';
    profile_name.value = data.name || '';
    profile_bio.value = data.bio || '';
    profile_description.value = data.description || '';
    aboutMe.value = data.aboutMe || '';
    btnViewPorfolio.href = `../../portfolio.html?${data.username || ''}`;

    // Set checkbox state
    btnResume.checked = !data.btnResume;
    disabledVisitButton.checked = !data.disabledVisitButton;
    disabledSourceCodeButton.checked = !data.disabledSourceCodeButton;
}

// Display Profile
async function loadProfileData() {
    const data = await readProfileData(username);
    if (data) {
        displayProfileData(data);
    } else {
        logout();
    }
}

loadProfileData();