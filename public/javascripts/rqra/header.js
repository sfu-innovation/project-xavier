/*
	Header
	----------------------------
	Responsible for controlling and updating the header
	which appears on all pages
*/

var timeout;
var menuOpened = false;
var notificationUser = "";
var notificationCount = 0;

// controls the default text in the ask a question box
$(document).ready(function() {
	$('#askQuestionInput').each(function() {
		var default_value = this.value;
		$(this).focus(function() {
			if(this.value == default_value) {
				this.value = '';
				$(this).css('color', '#4d4d4d');
			}
		});
		$(this).blur(function() {
			if(this.value == '') {
				$(this).css('color', '#c6c6c6');
				this.value = default_value;
			}
		});
	});
});

/*
function updateSearch() {
	var inputbox = document.getElementById("askQuestionInput");
	if (inputbox.value != prevSearchQuery && inputbox.value != "Ask a Question") {
		//prevSearchQuery = inputbox.value;
		//changePage(0);
	}
}
setInterval(updateSearch, 500);
*/

function showNotificationMenu() {	
	var menu = document.getElementById("notificationList");
	menu.style.webkitAnimationPlayState = "running";
	menu.style.mozAnimationPlayState = "running";
	menuTimer = 0;
	timeout = setTimeout(function() { menuOpened = true; }, 500);
}

function hideNotificationMenu(event) {
	if (menuOpened && timeout) {
		menuOpened = false;
		clearTimeout(timeout);
	}
}

function refreshNotificationCounter() {
	var newNotificationCount = document.getElementById("newNotificationCount");
	if (newNotificationCount) {
		newNotificationCount.innerHTML = notificationCount;
		if (notificationCount <= 0) {
			newNotificationCount.style.opacity = 0;
		} else {
			newNotificationCount.style.opacity = 1;
		}
	} else {
		console.error("Header: could not find notification counter div element");
	}
}

function sortByDate(notifications) {
	return notifications.sort(function (e1, e2) {
		if (e1.notification.createdAt < e2.notification.createdAt) return 1;
		if (e1.notification.createdAt > e2.notification.createdAt) return -1;
		return 0;
	});
}

function updateNotificationList(user) {
	rqra.userNotifications(user, function(data) {
		if (data && data.notification) {
			data.notification = sortByDate(data.notification);
			notificationCount = Math.min(7, data.notification.length);
			refreshNotificationCounter();
			
			var notificationMenu = document.getElementById("notificationMenu");
			notificationMenu.innerHTML = "<div id='notificationHeader'>" + notificationCount + " New notifications</div>";
			for(var i = 0; i < notificationCount; ++i) {
				notificationMenu.innerHTML += ElementFactory.createNotificationItem(data.notification[i]);
			}
		}
	});
}

function navToQuestion(menuItem) {
	var targetUuid = menuItem.querySelector(".notificationTarget").innerHTML;
	window.location.href = "/question/" + targetUuid;
}

setInterval(function() {
	updateNotificationList(notificationUser);
}, 4000);

function initializeHeader(user_uuid) {
	notificationUser = user_uuid;
	updateNotificationList(user_uuid);
	
	var menu = document.getElementById("notificationList");
	menu.addEventListener("webkitAnimationIteration", function() { 
		menu.style.webkitAnimationPlayState = "paused";
	});
	menu.addEventListener("mozAnimationIteration", function() { 
		menu.style.mozAnimationPlayState = "paused";
	});
}