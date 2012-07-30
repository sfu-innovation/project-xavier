/*
	Header
	----------------------------
	Responsible for controlling and updating the header
	which appears on all pages
*/

var timeout;
var menuOpened = false;
var notificationUser = "";

// controls the default text in the ask a question box
$(document).ready(function() {
	$('#askQuestionInput').each(function() {
		var default_value = this.value;
		$(this).css('color', '#c6c6c6'); // this could be in the style sheet instead
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

function showNotificationMenu() {	
	var menu = document.getElementById("notificationList");
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

var date_sort = function (element1, element2) {
	  if (element1.notification.createdAt < element2.notification.createdAt) return 1;
	  if (element1.notification.createdAt > element2.notification.createdAt) return -1;
	  return 0;
};

function updateNotificationList(user) {
	rqra.userNotifications(user, function(data) {
		if (data) {
			var newNotificationCount = document.getElementById("newNotificationCount");
			newNotificationCount.innerHTML = Math.min(7, data.notification.length);
			if (data.notification.length === 0) {
				newNotificationCount.style.opacity = 0;
			} else {
				newNotificationCount.style.opacity = 1;
			}
			
			data.notification = data.notification.sort(date_sort);
			
			var notificationMenu = document.getElementById("notificationMenu");
			notificationMenu.innerHTML = "<div id='notificationHeader'>" + Math.min(7, data.notification.length) + " New notifications</div>";
			for(var i = 0; i < 7; ++i) {
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
}