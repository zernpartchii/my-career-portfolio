import { setDocs, deleteDocs, updateDocs, Create, checkUsername, readProfileData, db, collection, query, where, getDocs } from './firebase.js'
const profileID = localStorage.getItem('profileID');
let newUsername;

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

btnResume.addEventListener('change', async () => {
    await updateDocs('Profile', profileID, { btnResume: !btnResume.checked });
});

profile_username.addEventListener('input', (event) => {
    newUsername = event.target.value;

    if (!newUsername) {
        alert('Please enter a username.');
        return;
    }

});

btnSaveUsername.addEventListener('click', updateUsername);

async function updateUsername() {

    const usernameExists = await checkUsername(newUsername);

    if (usernameExists) {
        alert("The username is already taken. Please choose another one.");
        return false; // Stop the process
    } else {
        if (confirm('Do you want to update your username?')) {

            loader.classList.remove('d-none');
            btnViewPorfolio.classList.add('disabled');

            await updateDocs('Profile', profileID, { username: newUsername });

            // Update all UserData
            const tablename = ['Skills', 'Projects', 'Timeline', 'Certificates', 'Contact'];
            // Ensure all updates finish before moving on
            for (const tableName of tablename) {
                await updateUserDataByUsername(tableName, username); // Pass old username
            }

            await deleteDocs('Settings', username);
            await setDocs("Settings", newUsername, {
                switchTech: switchTech.checked,
                switchTools: switchTools.checked,
                switchSoft: switchSoft.checked,
                switchOthers: switchOthers.checked
            });

            username = newUsername;
            btnViewPorfolio.href = `../../portfolio.html?${newUsername || ''}`
            loader.classList.add('d-none');
            btnViewPorfolio.classList.remove('disabled');
        } else {
            profile_username.value = username;
        }
    }
}

async function updateUserDataByUsername(tableName, oldUsername) {
    // Step 1: Query Firestore using the old username
    const q = query(collection(db, tableName), where("username", "==", oldUsername));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Step 2: Create an array of update promises
        const updatePromises = querySnapshot.docs.map((docSnap) => {
            return updateDocs(tableName, docSnap.id, { username: newUsername });
        });

        // Step 3: Wait for all updates to complete
        await Promise.all(updatePromises);
    } else {
        console.log(`No user data found in ${tableName}`);
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
    newUsername = data.username || '';
    profilePassword.value = data.password || '';
    profile_resumeLink.value = data.resumeLink || '';
    profile_name.value = data.name || '';
    profile_bio.value = data.bio || '';
    profile_description.value = data.description || '';
    aboutMe.value = data.aboutMe || '';
    btnViewPorfolio.href = `../../portfolio.html?${newUsername || ''}`;

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