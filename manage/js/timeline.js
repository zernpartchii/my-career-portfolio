import { Create, setDocs, readTimelineData } from './firebase.js'

function getTimelineData() {
    return {
        username: username,
        timlineOrder: timlineOrder.value,
        timlineYear: timlineYear.value,
        timlineTitle: timlineTitle.value,
        timlineStatus: timlineStatus.value,
        timlineDescription: timlineDescription.value
    }
}

function resetFields() {
    timlineOrder.value = '';
    timlineYear.value = '';
    timlineTitle.value = '';
    timlineStatus.value = '';
    timlineDescription.value = '';
    btnAddTimline.innerHTML = "Add Timeline";
    exampleModalLabel.innerHTML = 'Add Timeline';
}

btnResetTimline.addEventListener('click', resetFields)
btnAddNewTimeline.addEventListener('click', resetFields)

btnAddTimline.addEventListener('click', () => {
    if (!timlineYear.value || !timlineTitle.value || !timlineStatus.value || !timlineDescription.value) {
        alert('All fields are required!');
        return;
    }

    if (btnAddTimline.innerText === 'Save Changes') {
        if (!confirm('Are you sure you want to save changes?')) return;
        setDocs('Timeline', timelineID.value, getTimelineData());
    } else {
        if (!confirm('Are you sure you want to add it?')) return;
        Create('Timeline', getTimelineData());
    }

    resetFields();
    loadTimelineData();
    btnAddNewTimeline.click();
});

async function loadTimelineData() {
    await readTimelineData(timelineContainer, username);
}

loadTimelineData();
