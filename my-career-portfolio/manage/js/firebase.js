import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore, collection, doc, addDoc, getDoc, writeBatch, onSnapshot,
    setDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKMKVhUR1gmYf_7Dc98hqDTwbKptP2MGg",
    authDomain: "career-portfolio-d5ef1.firebaseapp.com",
    projectId: "career-portfolio-d5ef1",
    storageBucket: "career-portfolio-d5ef1.firebasestorage.app",
    messagingSenderId: "864868346927",
    appId: "1:864868346927:web:8e965ca35a55c2c6752ada",
    measurementId: "G-SKBS5VT83B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

const defaultImageAddress = "https://cdn1.iconfinder.com/data/icons/ui-set-6/100/Question_Mark-64.png";

// Create a new document with an auto-generated ID
async function Create(tableName, data) {
    try {
        const docRef = await addDoc(collection(db, tableName), data);
        // showNotif("Added Successfully!", "success")
        console.log("Document created with ID: ", docRef.id);
        return docRef.id;

    } catch (e) {
        console.error("Error adding document: ", e);
        // showNotif("Error adding document: " + e, "error")
    }
}

// Set document (with a specific document ID)
async function setDocs(tableName, docID, data) {
    try {
        await setDoc(doc(db, tableName, docID), data);
        showNotif("Updated Successfully!", "success")
        console.log("Document successfully written!");
    } catch (e) {
        console.error("Error writing document: ", e);
        showNotif("Error writing document: " + e, "error")
    }
}

async function updateDocs(tableName, target, data) {
    try {
        await updateDoc(doc(db, tableName, target), data);
        showNotif("Updated Successfully!", "success")
        console.log("Document successfully updated!");
    } catch (e) {
        console.error("Error updating document: ", e);
        showNotif("Error updating document: " + e, "error")
    }
}

// Function to delete a document by its ID
async function deleteDocs(tableName, docID) {
    try {
        // Get a reference to the document you want to delete
        const docRef = doc(db, tableName, docID);
        // Delete the document
        await deleteDoc(docRef);
        showNotif("Deleted Successfully!", "success")
        console.log(`Document with ID ${docID} deleted successfully`);
    } catch (error) {
        console.error("Error deleting document: ", error);
        showNotif("Error deleting document: " + error, 'error');
    }
}

export async function checkUsername(username) {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'Profile'), where("username", "==", username)));
        if (querySnapshot.size > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        return false;
    }
}

export async function checkUsernamePassword(username, password) {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'Profile'),
            where("username", "==", username),
            where("password", "==", password || ""),
        ));
        if (querySnapshot.size > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        return false;
    }
}

export async function getUsername() {
    try {
        const profile = doc(db, 'Profile', userID);
        const docSnap = await getDoc(profile);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.username;
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

export async function readProfileData(username) {
    try {
        const q = query(collection(db, 'Profile'), where("username", "==", username || ''));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Get the first document
            return { ...docSnap.data(), profileID: docSnap.id }; // Return data with the document ID
        } else {
            console.log("No user found.");
            profileSkeleton.innerHTML = `<div class="skeleton-profile skeleton-profile-image mb-3"></div>`;
            image_profile.classList.add('d-none');
            return null; // Return null to indicate no user was found
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        return null; // Return null in case of an error
    }
}

export async function readSkillsData(containers, element, username) {
    try {
        // Get a reference to the collection
        const skillTypes = ["TechStack & Design", "Tools", "Soft Skills", 'Others'];
        skillTypes.forEach(async (skillType, index) => {
            const querySnapshot = await getDocs(query(collection(db, 'Skills'),
                where("skillType", "==", skillType),
                where("username", "==", username),
            ))

            // if (containers[index] || element[index]) {
            displaySkillsData(querySnapshot, containers[index], element[index]);

            // if the button exists 
            if (element[index]) {
                const numberOfItems = `<span class="badge bg-danger ms-2">${querySnapshot.size}</span>`
                switch (containers[index].id) {
                    case 'techContainer':
                        element[index].innerHTML = `TechStack & Design: ${numberOfItems}`;
                        break;
                    case 'toolContainer':
                        element[index].innerHTML = `Tools: ${numberOfItems}`;
                        break;
                    case 'softContainer':
                        element[index].innerHTML = `Soft Skills: ${numberOfItems}`;
                        break;
                    case 'otherSkillsContainer':
                        element[index].innerHTML = `Others: ${numberOfItems}`;
                        break;
                    default:
                        // Handle any other case if needed
                        break;
                }
            }
            // }
        })

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

export async function readContactData(container, username) {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'Contact'),
            where("username", "==", username || ''),
            // orderBy('contactName', 'asc')
        ));
        if (!querySnapshot.empty) {
            container.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.docID = doc.id;
                container.innerHTML += `
                <div class="text-center p-3 contact" data-bs-toggle="modal" data-bs-target="#contact" data-id="${data.docID}">
                    <img src="${data.contactImage || defaultImageAddress}"
                        alt="${data.contactName}">
                    <p class="mt-2">${data.contactName}</p>
                </div>`;
            });

            const contactContainer = container.querySelectorAll('.contact');
            contactContainer.forEach((element) => {
                element.addEventListener('click', async () => {
                    const docID = element.getAttribute("data-id");

                    try {
                        const Contact = doc(db, 'Contact', docID);
                        const docSnap = await getDoc(Contact);

                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            contactID.value = docID;
                            contactName.value = data.contactName;
                            contactImage.value = data.contactImage;
                            contactLink.value = data.contactLink;
                            contactLabel.innerHTML = 'Edit Contact';
                            btnAddContact.innerHTML = 'Save Changes';
                            btnDeleteContact.classList.remove('d-none');
                        } else {
                            showNotif('No contact found.', 'warning');
                        }
                    } catch (error) {
                        console.error("Error fetching document:", error);
                    }
                });
            });

        } else {
            container.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                container.innerHTML += `
                <!-- Contact Section Skeleton-contact -->
                <div class="text-center p-3">
                    <div class="skeleton-contact skeleton-contact-image"></div>
                    <div class="skeleton-contact skeleton-contact-text skeleton-contact-name mt-2"></div>
                </div>

                <style>
                    .skeleton-contact {
                        background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
                        background-size: 200% 100%;
                        animation: skeleton-contact-loading 1.5s infinite linear;
                        border-radius: 5px;
                    }
                    .skeleton-contact-image { height: 100px; width: 100px; border-radius: 50%; display: inline-block; }
                    .skeleton-contact-text { height: 20px; width: 60%; margin: 10px auto; }

                    @keyframes skeleton-contact-loading {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                </style>`;
            }
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

export async function readProjectsData(container, projectType) {
    try {
        container.innerHTML = '';
        const constraints = [where("username", "==", username || '')];
        if (projectType !== 'All') {
            constraints.push(where("projectType", "==", projectType));
        }

        const projectsQuery = query(collection(db, 'Projects'), ...constraints);
        const querySnapshot = await getDocs(projectsQuery);
        if (!querySnapshot.empty) {

            const sortedDocs = querySnapshot.docs
                .map(doc => ({ docID: doc.id, ...doc.data() }))
                .sort((a, b) => b.projectName.localeCompare(a.projectName)); // 🔤 Sort A-Z by name

            for (const data of sortedDocs) {
                let imageUrl = "";  // Declare the variable
                await checkImageExpiration(data.projectImageAddress) ? imageUrl = data.projectImageAddress : imageUrl = "../../img/unknown.png";
                container.innerHTML += `
                <div class="card p-3 bg-dark text-white flex-fill col-4" id="projectContainer-${data.docID}">
                    <div class="d-flex justify-content-start">
                        <img class="img-fluid" width="200" src="${imageUrl}" alt="${data.projectName}" />
                    </div>
                    <h5 class="my-3 text-start">${data.projectName}</h5>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <div class="d-flex align-items-center gap-2 flex-wrap me-auto">
                            <input type="checkbox" class="btn-check btn-check-Visit" ${data.btnVisitDisabled === false ? 'checked' : ''} id="btnVisit-${data.docID}" autocomplete="off" data-id="${data.docID}|Visit">
                            <label class="btn btn-outline-secondary" for="btnVisit-${data.docID}">Visit</label>

                            <input type="checkbox" class="btn-check btn-check-Source" ${data.btnSourceDisabled === false ? 'checked' : ''} id="btnSource-${data.docID}" autocomplete="off" data-id="${data.docID}|Source">
                            <label class="btn btn-outline-secondary" for="btnSource-${data.docID}">Source Code</label>
                        </div>
                        <button id="btnEditProject" class="btn btn-primary btnEditProject bi-pencil-square" data-id="${data.docID}|Edit"></button>
                        <button class="btn btn-danger btnDeletProject bi-trash" data-id="${data.docID}|Delete"></button>
                    </div>
                </div>`;
            }

            const handleButtonToggle = async (button, selector, key) => {
                const cards = container.querySelectorAll(selector);

                for (const card of cards) {
                    const [docID, action] = card.getAttribute('data-id').split('|');
                    if (action === key) {
                        // Update Firestore
                        await updateDocs('Projects', docID, {
                            [key === 'Visit' ? 'btnVisitDisabled' : 'btnSourceDisabled']: !button.checked
                        });

                        // Update UI
                        card.checked = button.checked;
                    }
                }

            };

            // Event listeners
            const profileID = localStorage.getItem('profileID');
            disabledVisitButton.addEventListener('change', async () => {
                const visitLabel = document.querySelector('.disabledVisitButton'); // Selects the first element with this class
                if (visitLabel) {
                    visitLabel.textContent = disabledVisitButton.checked ? 'Enabled all Visit Buttons' : 'Disabled all Visit Buttons';
                    handleButtonToggle(disabledVisitButton, '.btn-check-Visit', 'Visit');
                    await updateDocs('Profile', profileID, { disabledVisitButton: !disabledVisitButton.checked });
                }
            });
            disabledSourceCodeButton.addEventListener('change', async () => {
                const sourceLabel = document.querySelector('.disabledSourceCodeButton'); // Selects the first element with this class
                if (sourceLabel) {
                    sourceLabel.textContent = disabledSourceCodeButton.checked ? 'Enabled all Source Code Buttons' : 'Disabled all Source Code Buttons';
                    handleButtonToggle(disabledSourceCodeButton, '.btn-check-Source', 'Source');
                    await updateDocs('Profile', profileID, { disabledSourceCodeButton: !disabledSourceCodeButton.checked });
                }
            });

            const cards = container.querySelectorAll('.btnDeletProject, .btnEditProject, .btn-check-Visit, .btn-check-Source');
            cards.forEach((button) => {
                button.addEventListener('click', async () => {
                    const dataId = button.getAttribute('data-id');
                    const [docID, action] = dataId.split('|');

                    if (action === 'Visit') {
                        await updateDocs('Projects', docID, { btnVisitDisabled: !button.checked });
                    } else if (action === 'Source') {
                        await updateDocs('Projects', docID, { btnSourceDisabled: !button.checked });
                    } else if (action === 'Delete') {
                        if (confirm('Are you sure you want to delete this project?')) {
                            deleteDocs('Projects', docID);
                            loadProjectData();
                        }
                    } else {
                        document.getElementById('btnAddProject').innerHTML = `Save Changes`;
                        document.getElementById('addProjectContainer').classList.remove('d-none');
                        document.getElementById('btnAddNewProject').classList.add('d-none')

                        const projects = await getDoc(doc(db, 'Projects', docID));
                        if (projects.exists()) {
                            const data = projects.data();
                            projectID.value = docID;
                            document.getElementById("projectType").value = data.projectType;
                            projectImageAddress.value = data.projectImageAddress || defaultImageAddress;
                            projectName.value = data.projectName || '';
                            projectSourceCode.value = data.projectSourceCode || '';
                            projectLink.value = data.projectLink || '';
                            projectDescription.value = data.projectDescription || '';

                            // First, uncheck all checkboxes
                            document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                                checkbox.checked = false;
                            });

                            // Reset all elements before updating
                            document.querySelectorAll('[id^="techContainer-"]').forEach((el) => {
                                el.className = ' '; // Reset to default classes
                            });

                            // Remove the 'border' class from all project containers
                            document.querySelectorAll('[id^="projectContainer-"]').forEach((el) => {
                                el.classList.remove('border');
                            });

                            document.getElementById(`projectContainer-${docID}`).classList.add('border');

                            btnResetProject.classList.add('d-none');

                            data.projectComponents.forEach((componentID) => {
                                // Find the checkbox with a matching ID
                                const element = document.getElementById(`${componentID}-project`);
                                element.checked = true;

                                const techContainer = document.getElementById(`techContainer-${componentID}-project`);
                                techContainer.classList.add('bg-danger', 'p-1', 'rounded');
                            });

                            btnVisitDisable.checked = data.btnVisitDisabled;
                            btnSourceDisable.checked = data.btnSourceDisabled;

                        } else {
                            alert('Project Not found!')
                        }
                    }
                });
            });
        } else {
            for (let i = 0; i < 5; i++) {
                container.innerHTML += `
                <div class="skeletonProject-container">
                    <!-- skeletonProject Loader -->
                    <div class="skeletonProject-card">
                        <div class="skeletonProject-image img-fluid"></div>
                        <div class="skeletonProject-text"></div>
                        <div class="skeletonProject-buttons">
                            <div class="skeletonProject-btn"></div>
                            <div class="skeletonProject-btn"></div>
                        </div>
                    </div>
                </div>`;
            }
        }

        return querySnapshot.size;

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

export async function loadProjectData() {
    totalAll.innerHTML = await readProjectsData(allContainer, 'All',);
    totalWeb.innerHTML = await readProjectsData(webContainer, 'Web',);
    totalMobile.innerHTML = await readProjectsData(mobileContainer, 'Mobile');
    totalDesktop.innerHTML = await readProjectsData(desktopContainer, 'Desktop');
    totalOthers.innerHTML = await readProjectsData(othersContainer, 'Others');
}

export async function readTimelineData(container, username) {
    try {
        const querySnapshot = await getDocs(query(
            collection(db, 'Timeline'),
            where('username', '==', username || '')
        ));

        const sortedDocs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.timlineOrder - a.timlineOrder); // Sort in descending order

        if (sortedDocs.length) {
            container.innerHTML = '';
            sortedDocs.forEach((data) => {
                container.innerHTML += `<div class="accordion-item">
                    <h2 class="accordion-header">
                        <button id="btnTech" class="accordion-button d-flex flex-wrap gap-2 bg-dark text-white" type="button" data-bs-toggle="collapse"
                            data-bs-target="#${data.id}" aria-expanded="true"
                            aria-controls="${data.id}">
                            <span class="badge bg-dark">Timeline Order: ${data.timlineOrder}</span>
                            <span class="badge bg-danger mx-2">${data.timlineYear}</span> 
                            ${data.timlineTitle} 
                        </button>
                    </h2>
                    <div id="${data.id}" class="accordion-collapse collapse">
                        <div class="accordion-body bg-dark">
                            <p class="text-white">${data.timlineDescription}</p>
                            <div class="d-flex justify-content-end gap-2 mt-3">
                                <button class="btn btn-primary btnEditTimeline bi-pencil-square" data-id="${data.id}|Edit" data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"></button>
                                <button class="btn btn-danger btnDeleteTimeline bi-trash" data-id="${data.id}|Delete"></button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });

            const btns = container.querySelectorAll('.btnDeleteTimeline, .btnEditTimeline');
            btns.forEach((buttons) => {
                buttons.addEventListener('click', async () => {
                    const dataID = buttons.getAttribute("data-id");
                    const [docID, action] = dataID.split('|');

                    if (action === 'Delete') {
                        if (confirm('Are you sure you want to delete it?')) {
                            deleteDocs('Timeline', docID);
                            readTimelineData(timelineContainer);
                        }
                    } else {
                        try {
                            const tableName = 'Timeline'
                            const Timeline = doc(db, tableName, docID);
                            const docSnap = await getDoc(Timeline);

                            if (docSnap.exists()) {
                                const data = docSnap.data();
                                timelineID.value = docID;
                                timlineOrder.value = data.timlineOrder || '0';
                                timlineYear.value = data.timlineYear || 'N/A';
                                timlineTitle.value = data.timlineTitle || 'N/A';
                                timlineStatus.value = data.timlineStatus || 'N/A';
                                timlineDescription.value = data.timlineDescription || 'N/A';
                                btnAddTimline.innerHTML = "Save Changes";
                                exampleModalLabel.innerHTML = 'Edit Timeline';
                            } else {
                                showNotif('Record not found.', 'warning');
                            }
                        } catch (error) {
                            console.error("Error fetching document:", error);
                        }
                    }

                });
            });

        } else {
            container.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                container.innerHTML += `
                <!-- Accordion Item Skeleton-timeline -->
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button bg-dark text-white" type="button" disabled>
                                <span class="skeleton-timeline skeleton-timeline-badge"></span>
                                <span class="skeleton-timeline skeleton-timeline-badge mx-2"></span>
                            </button>
                        </h2>
                        <div class="accordion-collapse collapse show">
                            <div class="accordion-body bg-dark">
                                <div class="skeleton-timeline skeleton-timeline-text"></div>
                                <div class="d-flex justify-content-end gap-2 mt-3">
                                    <div class="skeleton-timeline skeleton-timeline-button"></div>
                                    <div class="skeleton-timeline skeleton-timeline-button"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>
                        .skeleton-timeline {
                            background: linear-gradient(90deg, #444 25%, #333 50%, #444 75%);
                            background-size: 200% 100%;
                            animation: skeleton-timeline-loading 1.5s infinite linear;
                            border-radius: 5px;
                        }
                        .skeleton-timeline-badge { height: 20px; width: 40px; display: inline-block; }
                        .skeleton-timeline-text { height: 16px; width: 80%; margin: 10px 0; }
                        .skeleton-timeline-button { height: 35px; width: 50px; }

                        @keyframes skeleton-timeline-loading {
                            0% { background-position: -200% 0; }
                            100% { background-position: 200% 0; }
                        }
                    </style>`;
            }
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

export async function readCertificateData(container, username) {

    const querySnapshot = await getDocs(query(collection(db, 'Certificates'),
        where("username", "==", username || ''),
        // orderBy('certificateDate', 'desc')
    ));
    if (!querySnapshot.empty) {
        container.innerHTML = '';
        // Convert snapshot to array and sort manually
        const sortedDocs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() })) // Convert to array of objects
            .sort((a, b) => new Date(b.certificateDate) - new Date(a.certificateDate)); // Sort by date (desc)

        // Generate the sorted HTML
        sortedDocs.forEach(async (data) => {
            let imageUrl = "";  // Declare the variable
            await checkImageExpiration(data.certificateImageAddress) ? imageUrl = data.certificateImageAddress : imageUrl = "../../img/unknown.png";
            container.innerHTML += `
            <div class="card bg-dark" id="certificate-${data.certificateName}">
                <div class="card-body text-white">
                    <img class="img-fluid" width="270" src="${imageUrl}" alt="${data.certificateName}">
                    <div class="text-start my-3">
                        <h5 class="cert-title">${data.certificateName}</h5>
                        <div class="">
                            <p class="m-0">${data.certificateLocation}</p>
                            <p class="m-0">${formatDate(data.certificateDate)}</p>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2 justify-content-end gap-2 mt-3">
                        <a class="btn btn-outline-light me-auto "
                            href="${data.certificateImageLink}"
                            target="_blank">
                            View Certificate <img src="https://media.canva.com/v2/files/uri:ifs%3A%2F%2FM%2Fb60275a5-948d-43da-8689-da23cff47202?csig=AAAAAAAAAAAAAAAAAAAAAP1j0_SeDOBvYRjYUiNddbe4JOBhd0KBlSUPOAQ5ORD9&exp=1740061448&signer=media-rpc&token=AAIAAU0AJGI2MDI3NWE1LTk0OGQtNDNkYS04Njg5LWRhMjNjZmY0NzIwMgAAAAABlSO-l0DVGHlih8OvohJ9avmsNKpwcnGQ7e8AmnIdMYy6qnGRyg" alt="">
                        </a>
                        <button class="btn btn-primary btnEditCertificates bi-pencil-square"
                            data-id="${data.id}|Edit" data-bs-toggle="modal"
                            data-bs-target="#certificateModal"></button>
                        <button class="btn btn-danger btnDeleteCertificates bi-trash"
                            data-id="${data.id}|Delete"></button>
                    </div>
                </div>
            </div>`;
        });

        const btns = container.querySelectorAll('.btnDeleteCertificates, .btnEditCertificates');
        btns.forEach((buttons) => {
            buttons.addEventListener('click', async () => {
                const dataID = buttons.getAttribute("data-id");
                const [docID, action] = dataID.split('|');

                if (action === 'Delete') {
                    if (confirm('Are you sure you want to delete it?')) {
                        deleteDocs('Certificates', docID);
                        // readCertificateData(certificateContainer);
                    }
                } else {
                    try {
                        const tableName = 'Certificates'
                        const Certificates = doc(db, tableName, docID);
                        const docSnap = await getDoc(Certificates);

                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            certificateID.value = docID;
                            certificateName.value = data.certificateName || 'N/A';
                            certificateImageAddress.value = data.certificateImageAddress || 'N/A';
                            certificateImageLink.value = data.certificateImageLink || 'N/A';
                            certificateLocation.value = data.certificateLocation || 'N/A';
                            certificateDate.value = data.certificateDate || 'N/A';
                            btnAddCertificate.innerHTML = 'Save Changes'
                            certificateModalLabel.innerHTML = 'Edit Certificate';
                        } else {
                            showNotif('Record not found.', 'warning');
                        }
                    } catch (error) {
                        console.error("Error fetching document:", error);
                    }
                }

            });
        });
    } else {
        container.innerHTML = '';
        for (let i = 0; i < 2; i++) {
            container.innerHTML += `
             <div class="card bg-dark certificate-container p-0">
                <div class="card-body text-white">
                    <div class="skeleton-certificate skeleton-certificate-image"></div>
                    <div class="text-start my-3">
                        <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-title">
                        </div>
                        <div class="cert-description">
                            <div
                                class="skeleton-certificate skeleton-certificate-text skeleton-certificate-description">
                            </div>
                            <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-year">
                            </div>
                        </div>
                    </div>
                    <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-link"></div>
                </div>
            </div>`;
        }
    }
}

function displaySkillsData(querySnapshot, container, visible) {

    container.innerHTML = '';

    // Check if the querySnapshot is empty (no documents)
    if (!querySnapshot.empty) {
        // Iterate over the documents
        querySnapshot.forEach((docSnap) => {
            // docSnap is a DocumentSnapshot
            const data = docSnap.data();  // Get document data
            data.docID = docSnap.id;  // Get document ID

            const itemID = (container.id === 'listOfTech' || container.id === 'listOfTools' || container.id === 'listOfSoftSkills' || container.id === 'listOfOtherSkills') ? `${data.docID}-project` : data.docID;

            const templete =
                `<div id="techContainer-${itemID}" class="techContainer">
                    <label for="${itemID}" class="card cursor d-flex flex-row align-items-center p-2 gap-2 popUp" data-id="${itemID}">
                        <input type="checkbox" id="${itemID}" class="form-check-input ${visible === false ? '' : 'd-none'}" value="${data.docID}">
                        <img width="25"
                            src="${data.textImage || defaultImageAddress}"
                            alt="${data.techName}">
                        <h5 class="m-0">${data.techName}</h5>
                    </label>
                </div>`

            container.innerHTML += templete
        });


        // Add event listeners after the elements are added to the DOM
        const cards = container.querySelectorAll(`.card`);
        cards.forEach((card) => {
            card.addEventListener('click', function () {
                const docID = card.getAttribute('data-id');
                // Find the data for the clicked card (using the ID or storing data in the card)
                const clickedData = querySnapshot.docs.find(doc => doc.id === docID).data();
                showData(clickedData, docID);  // Call your function with the data

                // Remove the background class from all other cards
                cards.forEach(c => c.classList.remove('bg-secondary-subtle'));

                // Add the background class to the clicked card
                this.classList.add('bg-secondary-subtle');
            });
        });
    } else {
        for (let i = 0; i < 3; i++) { // Show 5 skeleton loaders as placeholders
            const skeletonTemplate = `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-text"></div>
            </div> `;
            container.innerHTML += skeletonTemplate;
        }
    }
}

// Display data in the input fields
function showData(data, docID) {
    techID.value = docID;
    skillType.value = data.skillType;
    skillType.selected = true;
    techName.value = data.techName;
    textImage.value = data.textImage || defaultImageAddress;
    techAction.classList.remove('d-none');
}

function checkImageExpiration(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            // Image exists and is accessible (status 200)
            resolve(true); // Image is valid (not expired)
        };
        img.onerror = function () {
            // Image is either not found or server error (status 404 or 410)
            resolve(false); // Image is expired or unavailable
        };
        img.src = url; // Set the image source to trigger the request
    });
}

export {
    Create, setDocs, updateDocs, deleteDocs, db, collection, doc, addDoc, getDoc, writeBatch,
    setDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, onSnapshot,
    auth, GoogleAuthProvider, signInWithPopup, signOut
}