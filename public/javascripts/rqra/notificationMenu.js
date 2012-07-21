var timeout;
var menuOpened = false;

function showNotificationMenu() {
	var menu = document.getElementById("notificationList");
	menu.style.opacity = 1.0;
	menu.style.cursor = "pointer";
	menuTimer = 0;
	timeout = setTimeout(function() { menuOpened = true; }, 500);
}

function hideNotificationMenu(event) {
	if (menuOpened && timeout) {
		var menu = document.getElementById("notificationList");
		menu.style.opacity = 0.0;
		menu.style.cursor = "default";
		menuOpened = false;
		clearTimeout(timeout);
	}
}

document.onclick = hideNotificationMenu;