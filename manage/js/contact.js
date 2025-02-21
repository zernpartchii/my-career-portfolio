import { setDocs, Create, deleteDocs, readContactData } from './firebase.js'

function resetFields() {
    contactName.value = '';
    contactImage.value = '';
    contactLink.value = '';
    contactLabel.innerHTML = 'Add Contact';
    btnAddContact.innerHTML = 'Add Contact';
    btnDeleteContact.classList.add('d-none');
    btnCloseContact.click();
}

function getContactData() {
    return {
        username: username,
        contactName: contactName.value,
        contactImage: contactImage.value,
        contactLink: contactLink.value,
    }
}

btnCloseContact.addEventListener('click', resetFields);

btnAddContact.addEventListener('click', () => {

    if (!contactName.value || !contactImage.value || !contactLink) {
        alert('All fields are required!');
        return;
    }

    if (contactLabel.innerText === 'Add Contact') {
        if (!confirm('Are you sure you want to add it?')) return;
        Create('Contact', getContactData());
    } else {
        if (!confirm('Are you sure you want to save changes?')) return;
        setDocs('Contact', contactID.value, getContactData());
    }

    resetFields();
    loadContactData();
});

btnDeleteContact.addEventListener('click', () => {
    deleteDocs('Contact', contactID.value);
    resetFields();
    loadContactData();
    btnCloseContact.click();
});

async function loadContactData() {
    await readContactData(contactContainer, username);
}

loadContactData();