import { setDocs, Create, readCertificateData } from './firebase.js'

function resetFields() {
    certificateName.value = '';
    certificateImageAddress.value = '';
    certificateImageLink.value = '';
    certificateLocation.value = '';
    certificateDate.value = '';
    btnAddCertificate.innerHTML = 'Add Certificate'
    certificateModalLabel.innerHTML = 'Add Certificate';
}

function getCertificateValue() {
    return {
        username: username,
        certificateName: certificateName.value,
        certificateImageAddress: certificateImageAddress.value,
        certificateImageLink: certificateImageLink.value,
        certificateLocation: certificateLocation.value,
        certificateDate: certificateDate.value,
    };
}

btnCloseCertificate.addEventListener('click', resetFields);

btnAddCertificate.addEventListener('click', () => {
    if (!certificateName.value || !certificateImageAddress.value || !certificateImageLink.value || !certificateLocation.value || !certificateDate.value) {
        alert('All fields are required!');
        return;
    }

    if (btnAddCertificate.innerText === 'Add Certificate') {

        if (!confirm('Are you sure you want to add it?')) return;

        const duplicate = checkDuplicateValues([certificateContainer], certificateName);

        if (duplicate) {
            if (!confirm("This certificate name is already exists! Do you want to still add it?")) return;
        }

        Create('Certificates', getCertificateValue());

    } else {
        if (!confirm('Are you sure you want to save changes?')) return;

        setDocs('Certificates', certificateID.value, getCertificateValue());
    }

    resetFields();
    loadCertificateData();
    btnAddNewCertificate.click();
});

async function loadCertificateData() {
    await readCertificateData(certificateContainer, username);
}

loadCertificateData();