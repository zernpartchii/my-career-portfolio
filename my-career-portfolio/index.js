import { db, getDocs, query, collection, onSnapshot, where, readProfileData, readSkillsData, limit } from './manage/js/firebase.js'

// Porfolio Elements
const profile = document.getElementById('profile');
const btnResume = document.getElementById('btnResume');
const myName = document.getElementById('myName');
const myBio = document.getElementById('myBio');
const myDescription = document.getElementById('myDescription');
const myAbout = document.getElementById('myAbout');

const techContainer = document.getElementById('techContainer');
const toolContainer = document.getElementById('toolContainer');
const softContainer = document.getElementById('softContainer');
const othersContainer = document.getElementById('othersContainer');

const projectContainer = document.getElementById('projectContainer');
const timelineContainer = document.getElementById('timelineContainer');
const certificateContainer = document.getElementById('certificateContainer');
const contactContainer = document.getElementById('contactContainer');
const contactContainerModal = document.getElementById('contactContainerModal');

const containers = [techContainer, toolContainer, softContainer, othersContainer];
const buttons = [];

const url = new URL(window.location.href);
const params = url.search.substring(1).split('&')[0]; // Get the first query parameter

const username = params;

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayProfileData(data) {
    profile.innerHTML = `<img id="myProfile" height="300" width="300" src="${data.imageAddress}" class="img-fluid profile mb-3"></img>`;

    btnResume.href = data.resumeLink ? data.resumeLink : '#';
    // Toggle visibility class
    btnResume.classList.toggle('d-none', data.btnResume);

    myName.innerHTML = data.name;
    myBio.innerHTML = data.bio;
    myDescription.innerHTML = data.description;
    myAbout.innerHTML = data.aboutMe;
}

async function settings() {
    const q = query(collection(db, 'Settings'), where("__name__", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Check if elements exist before modifying classListconst data = doc.data();
            const elements = {
                switchTech: "myTechStack",
                switchTools: "myTools",
                switchSoft: "mySoftSkill",
                switchOthers: "myOthers"
            };

            let allFalse = 0;
            for (const key in elements) {
                const el = document.getElementById(elements[key]);
                if (el) el.classList.toggle("d-none", !data[key]);

                if (data[key]) allFalse++;
            }

            // This code rune only if all skills are hidden
            if (allFalse === 0) {
                for (const key in elements) {
                    const content = document.getElementById(elements[key]);
                    content.classList.toggle('d-none', false)
                }
                containers.forEach((container) => {
                    const content = document.getElementById(container.id);
                    if (content) {
                        content.innerHTML = "";
                        for (let i = 0; i < 3; i++) { // Show 5 skeleton loaders as placeholders
                            const skeletonTemplate = `
                        <div class="skeleton-card">
                            <div class="skeleton-img"></div>
                            <div class="skeleton-text"></div>
                        </div> `;
                            content.innerHTML += skeletonTemplate;
                        }
                    }
                })
            }
        });
    }
}

async function displayProjectData() {
    try {
        projectContainer.innerHTML = '';
        const querySnapshot = await getDocs(query(collection(db, 'Projects'),
            where("username", "==", username || ''),
            // ...(showAllProjects ? [] : [limit(3)]) // Apply limit(3) only when showing limited projects
        ));

        if (!querySnapshot.empty) {
            const sortedDocs = querySnapshot.docs
                .map(doc => ({ docID: doc.id, ...doc.data() }))
                .sort((a, b) => b.projectName.localeCompare(a.projectName)); // 🔤 Sort A-Z by name

            for (const data of sortedDocs) {
                let temp = '';

                await Promise.all(data.projectComponents.map(async (skillsID) => {
                    const querySkillSnapshot = await getDocs(query(
                        collection(db, 'Skills'),
                        where("__name__", "==", skillsID)
                    ));

                    if (!querySkillSnapshot.empty) {
                        querySkillSnapshot.forEach(skillDoc => {
                            const skillData = skillDoc.data();
                            temp += `
                            <div class="card d-flex flex-row align-items-center py-1 px-2 gap-2 popUp">
                                <img width="20" src="${skillData.textImage}" alt="${skillData.techName}">
                                <h6 class="m-0">${skillData.techName}</h6>
                            </div>`;
                        });
                    }
                }));

                const github_icon = "https://cdn2.iconfinder.com/data/icons/black-white-social-media/64/github_social_media_logo-64.png";
                const gdrive_icon = "https://cdn4.iconfinder.com/data/icons/logos-brands-in-colors/48/google-drive-64.png";
                const dropbox_icon = "https://cdn0.iconfinder.com/data/icons/social-circle-3/72/Dropbox-256.png";
                const mediafire_icon = "https://static.mediafire.com/images/backgrounds/header/mf_logo_u1_full_color_reversed.svg";
                const mega_icon = "https://mega.io/wp-content/themes/megapages/megalib/images/megaicon.svg";
                const unknown_icon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

                let icon = '';
                let icon_visit = 'https://cdn4.iconfinder.com/data/icons/web-mobile-1-3/20/6-256.png';
                if (data.projectSourceCode.includes("github.com")) {
                    icon = github_icon;
                } else if (data.projectSourceCode.includes("drive.google.com")) {
                    icon = gdrive_icon;
                } else if (data.projectSourceCode.includes("www.dropbox.com")) {
                    icon = dropbox_icon;
                } else if (data.projectSourceCode.includes("mega.io")) {
                    icon = mega_icon;
                } else if (data.projectSourceCode.includes("www.mediafire.com")) {
                    icon = mediafire_icon;
                } else {
                    icon = unknown_icon;
                }

                let linkVisit = data.btnVisitDisabled ? '#' : data.projectLink;
                let disabledVisit = data.btnVisitDisabled ? 'disabled' : '';

                let linkSource = data.btnSourceDisabled ? '#' : data.projectSourceCode;
                let disabledSource = data.btnSourceDisabled ? 'disabled btn' : '';

                let disabledMsg1 = data.btnVisitDisabled === false ? '' : 'The owner has temporarily disabled visiting.';
                let disabledMsg2 = data.btnSourceDisabled === false ? '' : 'The owner has temporarily disabled access to the source code.';

                let imageUrl = "";  // Declare the variable
                await checkImageExpiration(data.projectImageAddress) ? imageUrl = data.projectImageAddress : imageUrl = "./img/unknown.png";

                const container = `
                <div class="my-5">
                    <div class="d-flex justify-content-center flex-wrap gap-3">
                        <img width="700" src="${imageUrl}" alt="${data.projectName}" class="project img-fluid popUp">
                        <div class="d-flex justify-content-center flex-column gap-3">
                            <a style="max-width: 30rem;" href="${linkVisit}" 
                            target="_blank" class="${disabledVisit} btn btn-Visit popUp rounded-5 w-100 p-3 fs-5 fw-bold">
                            <img width="40" src="" class="img-fluid me-3"/> Visit </a>
                            ${disabledMsg1 ? `<span class="text-danger">${disabledMsg1}</span>` : ''}

                            <a style="max-width: 30rem;" href="${linkSource}" 
                            target="_blank" class="${disabledSource} btnSource popUp rounded-5 w-100 p-2 fs-6 fw-bold text-decoration-none">
                            <img width="40" src="${icon}" class="img-fluid me-3"/> Source Code </a>  
                            ${disabledMsg2 ? `<span class="text-danger">${disabledMsg2}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex-column w-100 px-3 mt-4">
                        <div class="d-flex align-items-center flex-wrap gap-2 flex-row mb-3">
                            <h3>${data.projectName}</h3>
                        </div> 
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            ${temp}
                        </div>
                        <p class="text-start">
                            ${data.projectDescription}
                        </p>
                    </div>
                </div>
                <hr class="bg-body pt-1">`;

                projectContainer.innerHTML += container;
            }

        } else {
            for (let i = 0; i < 5; i++) {
                projectContainer.innerHTML += `
                <div class="gap-3 my-5 skeleton-project-container">
                <div class="skeleton-project skeleton-project-image"></div>
                <div class="skeleton-project skeleton-project-button"></div>

                <div class="flex-column w-100 px-3 mt-4">
                    <div class="d-flex flex-row">
                        <div class="skeleton-project skeleton-project-title"></div>
                        <div class="skeleton-project skeleton-project-icon ms-auto"></div>
                    </div>

                    <div class="d-flex flex-wrap gap-3 mb-3">
                        <div class="skeleton-project skeleton-project-card"></div>
                        <div class="skeleton-project skeleton-project-card"></div>
                        <div class="skeleton-project skeleton-project-card"></div>
                    </div>

                    <div class="skeleton-project skeleton-project-text"></div>
                    <div class="skeleton-project skeleton-project-text"></div>
                </div>
            </div>

            <style>
                /* Skeleton-project Effect */
                .skeleton-project {
                    background: linear-gradient(90deg, #222 25%, #333 50%, #222 75%);
                    background-size: 200% 100%;
                    animation: skeleton-project-loading 1.5s infinite linear;
                    border-radius: 4px;
                }

                @keyframes skeleton-project-loading {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* Skeleton-project Components */
                .skeleton-project-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .skeleton-project-image {
                    width: 700px;
                    height: 400px;
                    border-radius: 8px;
                }

                .skeleton-project-button {
                    width: 120px;
                    height: 50px;
                    border-radius: 25px;
                }

                .skeleton-project-title {
                    width: 200px;
                    height: 32px;
                }

                .skeleton-project-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }

                .skeleton-project-card {
                    width: 100px;
                    height: 40px;
                    border-radius: 8px;
                }

                .skeleton-project-text {
                    width: 100%;
                    height: 16px;
                    margin-bottom: 8px;
                }
            </style>`;
            }
        }

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function displayTimelineData() {
    try {
        const querySnapshot = await getDocs(query(
            collection(db, 'Timeline'),
            where('username', '==', username || '')
        ));

        const sortedDocs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.timlineOrder - a.timlineOrder); // Sort in descending order

        if (sortedDocs.length) {
            timelineContainer.innerHTML = '';
            const counter = sortedDocs.length - 1;
            sortedDocs.forEach((data, index) => {
                const dotClass = index != counter ? "timeline-arrow" : "timeline-dot"; // Default class for middle items
                timelineContainer.innerHTML +=
                    `<div class="mt-5">
                    <div class="d-flex align-items-center flex-wrap flex-row gap-3 mb-2">
                        <span class="${dotClass}"></span>
                        <span class="badge bg-body text-dark rounded-4 px-3 py-2 fw-bold popUp">${data.timlineYear}</span>
                        <h4 class="m-0">${data.timlineTitle}</h4>
                        <p class="m-0 timeline">${data.timlineStatus}</p>
                    </div>
                    <p class="text-start">
                        ${data.timlineDescription}
                    </p>
                </div>`;
            });


        } else {
            timelineContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                timelineContainer.innerHTML += `
                <div class="mb-5">
                    <div class="d-flex align-items-center flex-row gap-3 mb-2">
                        <span class="timeline-dot skeleton"></span>
                        <span class="badge bg-body text-dark rounded-4 px-3 py-2 fw-bold skeleton-text"></span>
                        <h4 class="m-0 skeleton-text"></h4>
                        <p class="m-0 skeleton-text"></p>
                    </div>
                    <p class="text-start skeleton-text skeleton-paragraph"></p>
                </div>

                <style>
                    /* Skeleton Effect */
                    .skeleton {
                        background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
                        background-size: 200% 100%;
                        animation: skeleton-loading 1.5s infinite linear;
                        border-radius: 4px;
                    }

                    @keyframes skeleton-loading {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }

                    .skeleton-text {
                        width: 120px;
                        height: 20px;
                    }

                    .skeleton-paragraph {
                        width: 100%;
                        height: 40px;
                    }

                    .timeline-dot {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                    }
                </style>`;
            }
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function displayCertificatesData() {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'Certificates'),
            where("username", "==", username || ''),
        ));
        if (!querySnapshot.empty) {
            certificateContainer.innerHTML = '';
            // Convert snapshot to array and sort manually
            const sortedDocs = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() })) // Convert to array of objects
                .sort((a, b) => new Date(b.certificateDate) - new Date(a.certificateDate)); // Sort by date (desc)

            // Generate the sorted HTML
            sortedDocs.forEach(async (data) => {

                let imageUrl = "";  // Declare the variable
                await checkImageExpiration(data.certificateImageAddress) ? imageUrl = data.certificateImageAddress : imageUrl = "./img/unknown.png";

                certificateContainer.innerHTML += `
            <div class="card bg-dark popUp" id="certificate-${data.certificateName}">
                <div class="card-body text-white">
                    <img width="350" class="img-fluid" src="${imageUrl}" alt="${data.certificateName}">
                    <div class="text-start my-3">
                        <h5>${data.certificateName}</h5>
                        <div class="">
                            <p class="m-0">${data.certificateLocation}</p>
                            <p class="m-0">${formatDate(data.certificateDate)}</p>
                        </div>
                    </div>
                    <a href="${data.certificateImageLink}" target="_blank" class="d-flex justify-content-center border mt-3 py-2 rounded text-decoration-none">
                        <p class="m-0 text-white">
                            View Certificate <img class="ms-2" src="https://media.canva.com/v2/files/uri:ifs%3A%2F%2FM%2Fb60275a5-948d-43da-8689-da23cff47202?csig=AAAAAAAAAAAAAAAAAAAAAMAaLgXpA2nKuWaCrhpUdky_cDvwV6zbr0U84Moz3kFP&exp=1740039848&signer=media-rpc&token=AAIAAU0AJGI2MDI3NWE1LTk0OGQtNDNkYS04Njg5LWRhMjNjZmY0NzIwMgAAAAABlSJ1AEDE491UHRcGksWznSfHhE5QsSZ1EqryMU_jqElDgd76HQ" alt="">
                        </p> 
                    </a>
                </div>
            </div>`;
            });
        } else {
            certificateContainer.innerHTML = '';
            for (let i = 0; i < 2; i++) {
                certificateContainer.innerHTML += `
                <div class="card bg-dark certificate-container p-0">
                    <div class="card-body text-white">
                        <div class="skeleton-certificate skeleton-certificate-image"></div>
                        <div class="text-start my-3">
                            <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-title"></div>
                            <div class="cert-description">
                                <div
                                    class="skeleton-certificate skeleton-certificate-text skeleton-certificate-description">
                                </div>
                                <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-year"></div>
                            </div>
                        </div>
                        <div class="skeleton-certificate skeleton-certificate-text skeleton-certificate-link"></div>
                    </div>
                </div>`;
            }
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function displayContactData() {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'Contact'),
            where("username", "==", username || ''),
        ));
        if (!querySnapshot.empty) {
            contactContainer.innerHTML = '';
            contactContainerModal.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.docID = doc.id;
                const temp = `
                <a href="${data.contactLink}" target="_blank" class="text-decoration-none text-white text-center contact popUp">
                    <img src="${data.contactImage || defaultImageAddress}"
                        alt="${data.contactName}">
                    <p class="mt-2">${data.contactName}</p>
                </a>`;

                contactContainer.innerHTML += temp;
                contactContainerModal.innerHTML += temp;
            });

        } else {
            contactContainer.innerHTML = '';
            contactContainerModal.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const temp = `
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
                contactContainer.innerHTML += temp;
                contactContainerModal.innerHTML += temp;
            }
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
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

// Display Data
await Promise.all([
    displayProfileData(await readProfileData(username)),
    readSkillsData(containers, buttons, username),
    displayProjectData(),
    displayTimelineData(),
    displayCertificatesData(),
    displayContactData(),
    settings()
]);
