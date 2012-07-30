var timeout;
var menuOpened = false;
var menu = document.getElementById("notificationList");
var rqra = new coreApi.Presenter();

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

var notificationUser = "";

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
				if (data.notification[i]) {
					var notificationType = "notificationRegular";
					if (data.notification[i].user.type === 1) {
						notificationType = "notificationInstructor";
					}

					if (data.notification[i].notification && data.notification[i].user) {
						notificationMenu.innerHTML += "<div class='" + notificationType + "' onclick='navToQuestion(this)'>"
							+ "<div class='notificationMessage'>" 
							+ "<span class='notificationSender'>" + data.notification[i].user.firstName + " " + data.notification[i].user.lastName + "</span>"
							+ "<span>  replied to your question</span>"
							+ "<div class='notificationTime'>" + jQuery.timeago(new Date(data.notification[i].notification.createdAt)) + "</div>"
							+ "<div class='notificationTarget' style='display:none;'>" + data.notification[i].notificationListener.target + "</div>"
							+ "</div></div>";
					}
				}
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