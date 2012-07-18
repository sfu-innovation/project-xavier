var closeTimer = 0;
var menuItem = 0;

// open menu
function openMenu(id) {
	if (menuItem) {
		menuItem.style.visibility = 'hidden';
	}
	
	menuItem = document.getElementById(id);
	menuItem.style.visibility = 'visible';
}

// close menu
function closeMenu() {
	if(menuItem) {
		menuItem.style.visibility = 'hidden';
	}
}

document.onclick = closeMenu;