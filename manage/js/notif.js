
// Function to show the notification with progress bar
function showNotif(message, type) {
    const notification = document.querySelector('.notif');
    const color = {
        'success': '#68de68',
        'error': '#FF5757',
        'warning': '#FFCC15',
        'dark': '#161818',
        'light': '#fff'
    }

    // Add slide-in animation
    notification.classList.add('slide-in');
    notification.classList.add('fw-bold');
    notification.textContent = message
    notification.style.backgroundColor = `${color[type]}`;
    notification.style.color = `${color['dark']}`;
    notification.style.border = `2px solid ${color[type]}`

    // After 3 seconds, hide the notification
    setTimeout(() => {
        notification.classList.add('hide');
    }, 5000); // Hide after the progress bar is done (3 seconds)

    notification.classList.remove('hide');
}
