import { Create, setDocs, readSkillsData, loadProjectData } from './firebase.js'

const containers = [listOfTech, listOfTools, listOfSoftSkills, listOfOtherSkills];
const visible = [false, false, false, false];

// Function to get IDs of all selected checkboxes
function getSelectedIDs() {
    // Array to hold the selected checkbox values
    let selectedIDs = [];

    // Loop through each container (listOfTech, listOfTools, etc.)
    containers.forEach(container => {
        // Select all checked checkboxes inside the current container
        const selectedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked');

        // Add the 'value' of each checked checkbox to the selectedIDs array
        selectedCheckboxes.forEach(checkbox => {
            selectedIDs.push(checkbox.value);
        });
    });

    // Return the array of selected checkbox values
    return selectedIDs;
}

function resetFields() {
    projectType.value = 'Select Project Type';
    projectImageAddress.value = '';
    projectName.value = '';
    projectSourceCode.value = '';
    projectDescription.value = '';
    projectLink.value = '';
    btnCloseProject.click();

    // Loop through each container (listOfTech and listOfTools)
    containers.forEach(container => {
        // Select all checkboxes inside the current container
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');

        // Loop through each checkbox and uncheck it
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    // Reset all elements before updating
    document.querySelectorAll('[id^="techContainer-"]').forEach((el) => {
        el.className = ' '; // Reset to default classes
    });

    // document.getElementById('addProjectContainer').classList.remove('d-none');
    // btnAddNewProject.classList.add('d-none');
    // btnResetProject.classList.remove('d-none');

}

function showAddProject() {
    document.getElementById('btnAddProject').innerHTML = `Add Project`;
    document.getElementById('btnAddNewProject').classList.remove('d-none');
    document.getElementById('addProjectContainer').classList.add('d-none');
}

btnAddNewProject.addEventListener('click', () => {
    document.getElementById('addProjectContainer').classList.remove('d-none');
    btnAddNewProject.classList.add('d-none');
    btnResetProject.classList.remove('d-none');

    btnVisitDisable.checked = false;
    btnSourceDisable.checked = false;
});

btnCloseProject.addEventListener('click', () => {
    resetFields();
    showAddProject();
});

btnResetProject.addEventListener('click', () => {
    resetFields();
});

btnAddProject.addEventListener('click', () => {
    const selectedIDs = getSelectedIDs();
    const projectData = {
        username: username,
        projectType: projectType.value || "",
        projectImageAddress: projectImageAddress.value || "https://media.canva.com/v2/image-resize/format:PNG/height:298/quality:100/uri:ifs%3A%2F%2F%2Fcc1c4b4a-c947-4388-aab6-4799a6b592f8/watermark:F/width:500?csig=AAAAAAAAAAAAAAAAAAAAADroHAjahUatCoh_tCsbgoSL3A3qDYY8axrI9fooesb5&exp=1740038388&osig=AAAAAAAAAAAAAAAAAAAAAD8H24Fg-CT0diPO88kJHXGVaVMx1nzgmYStnYDM--jz&signer=media-rpc&x-canva-quality=thumbnail_large",
        projectName: projectName.value || "",
        projectSourceCode: projectSourceCode.value || "",
        projectLink: projectLink.value || "",
        projectDescription: projectDescription.value || "",
        projectComponents: selectedIDs,
        btnVisitDisabled: btnVisitDisable.checked,
        btnSourceDisabled: btnSourceDisable.checked
    };

    if (!projectType.value) {
        alert('Project Type is required!');
        return;
    }

    if (!projectName.value) {
        alert('Project Name is required!');
        return;
    }

    if (!projectSourceCode.value) {
        alert('Source Code Link is required!');
        return;
    }

    if (!projectLink.value) {
        alert('Project Link is required!');
        return;
    }

    if (!projectDescription.value) {
        alert('Project Description is required!');
        return;
    }

    if (selectedIDs.length === 0) {
        alert('Please select at least one TechStack & Design or Tools or Soft Skills.');
        return;
    }

    if (btnAddProject.textContent == 'Save Changes') {
        if (!confirm('Are you sure you want to Save Changes?')) return
        setDocs('Projects', projectID.value, projectData);
        showAddProject();
        resetFields();
    } else {
        if (!confirm('Are you sure you want to add this project?')) return

        // Get all tech names from all the containers
        const projectContainers = [webContainer, mobileContainer, desktopContainer];
        const duplicate = checkDuplicateValues(projectContainers, projectName);

        if (duplicate) {
            if (!confirm('This record already exists. Do you still want to add it?')) return; // Stop execution if a duplicate is found
        }
        Create('Projects', projectData);
    }
    resetFields();
    loadProjectData();
})

await readSkillsData(containers, visible, username);
loadProjectData();



