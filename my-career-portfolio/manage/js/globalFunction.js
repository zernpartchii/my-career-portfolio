
function checkDuplicateValues(containers, elementName) {
    // Get all tech names from all the containers
    const existingTechNames = containers.flatMap(container =>
        Array.from(container.querySelectorAll('.card h5'))
    );

    return duplicate = existingTechNames.some((element) => {
        return element.textContent.trim().toLowerCase() === elementName.value.toLowerCase();
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
