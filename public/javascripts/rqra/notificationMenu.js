var timeout;
var menuOpened = false;
var menu = document.getElementById("notificationList");

function showNotificationMenu() {
	menu.style.webkitAnimationPlayState = "running";
	menuTimer = 0;
	timeout = setTimeout(function() { menuOpened = true; }, 500);
}

function hideNotificationMenu(event) {
	if (menuOpened && timeout) {
		menuOpened = false;
		clearTimeout(timeout);
	}
}

document.onclick = hideNotificationMenu;

menu.addEventListener("webkitAnimationIteration", function() { 
	menu.style.webkitAnimationPlayState = "paused";
});