import { setDocs, updateDocs, db, doc, getDoc, deleteDocs, Create, readSkillsData } from './firebase.js'

const containers = [techContainer, toolContainer, softContainer, otherSkillsContainer];
const buttons = [btnTech, btnTools, btnSoft, btnOtherSkills];
const tableName = 'Skills';

const defaultImageAddress = "https://cdn1.iconfinder.com/data/icons/ui-set-6/100/Question_Mark-64.png";

function resetFields() {
    techName.value = ''
    textImage.value = ''
    skillType.value = 'Select Type'
    skillType.selected = true
    techAction.classList.add('d-none')
}

btnResetTech.addEventListener('click', () => {
    resetFields()
})

btnAddNewTech.addEventListener('click', async () => {

    if (!techName.value) {
        alert('Name field is required!')
        return
    }

    if (skillType.value == 'Select Type') {
        alert('Please select skill type.')
        return
    }

    if (!confirm('Are you sure you want to add this one?')) return

    const duplicate = checkDuplicateValues(containers, techName);

    if (duplicate) {
        if (!confirm('This record already exists. Do you still want to add it?')) return; // Stop execution if a duplicate is found
    }

    Create(tableName, {
        username: username,
        skillType: skillType.value,
        techName: techName.value,
        textImage: textImage.value || defaultImageAddress,
    })

    resetFields();
    loadSkillsData();
})

btnEditTeck.addEventListener('click', async () => {

    if (!techName.value) {
        alert('Name field is required!')
        return
    }

    if (skillType.value == 'Select Type') {
        alert('Please select skill type.')
        return
    }

    if (!confirm('Are you sure you want to save this changes?')) return

    setDocs(tableName, techID.value, {
        username: username,
        skillType: skillType.value,
        techName: techName.value,
        textImage: textImage.value || defaultImageAddress,
    })

    loadSkillsData();
    resetFields();
})

btnDeleteTech.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this one?')) return
    await deleteDocs(tableName, techID.value)
    loadSkillsData();
    resetFields();
})

document.querySelectorAll("#switchContainer .form-check-input").forEach((input) => {
    input.addEventListener("change", function () {
        const switchId = this.id;
        const isChecked = this.checked;
        updateDocs("Settings", username, { [switchId]: isChecked });
    });
});

async function loadSkillsData() {
    await readSkillsData(containers, buttons, username);
}

async function inputCheck() {
    try {
        // Firestore document reference
        const docRef = doc(db, "Settings", username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.querySelectorAll("#switchContainer .form-check-input").forEach((input) => {
                if (data[input.id] !== undefined) {
                    input.checked = data[input.id]; // Apply saved state
                }
            });
        } else {
            setDocs("Settings", username, {
                switchTech: switchTech.checked,
                switchTools: switchTools.checked,
                switchSoft: switchSoft.checked,
                switchOthers: switchOthers.checked
            });
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

inputCheck();
loadSkillsData();