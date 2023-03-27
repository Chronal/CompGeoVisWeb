const button = document.getElementById('menubutton');
const sidebar = document.getElementById('sidebar');

let sideBarOpen = true;

function toggleSidebar() {
    sideBarOpen = !sideBarOpen;
    if (sideBarOpen) {
        sidebar.classList.remove("sidebar-closed");
        sidebar.classList.add("sidebar-open");
    } else {
        sidebar.classList.remove("sidebar-open");
        sidebar.classList.add("sidebar-closed");
    }
}

button.addEventListener("click", toggleSidebar);
