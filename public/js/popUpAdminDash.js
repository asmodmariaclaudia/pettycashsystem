function showPopup() {
    const popup = document.getElementById('admin-popup');
    popup.style.display = 'flex'; // Show popup
}

function hidePopup() {
    const popup = document.getElementById('admin-popup');
    popup.style.display = 'none'; // Hide popup
}

// Optional: Hide popup when clicking outside of it
window.onclick = function (event) {
    const popup = document.getElementById('admin-popup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
};
