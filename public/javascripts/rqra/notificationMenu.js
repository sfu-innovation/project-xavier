var timeout;
var menuOpened = false;
var menu = document.getElementById("notificationList");
var rqra = new coreApi.Presenter();

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

function updateNotificationList(user) {
	rqra.userNotifications(user, function(data) {
		if (data) {
			var newNotificationCount = document.getElementById("newNotificationCount");
			newNotificationCount.innerHTML = data.notification.length;
			if (data.notification.length === 0) {
				newNotificationCount.style.opacity = 0;
			} else {
				newNotificationCount.style.opacity = 1;
			}
		
			var notificationMenu = document.getElementById("notificationMenu");
			notificationMenu.innerHTML = "<div id='notificationHeader'>" + data.notification.length + " New notifications</div>";
			for(var i = 0; i < data.notification.length; ++i) {
				var notificationType = "notificationRegular";
				if (data.notification[i].user.type === 1) {
					notificationType = "notificationInstructor";
				}
			
				if (data.notification[i].notification && data.notification[i].user) {
					notificationMenu.innerHTML += "<div class='" + notificationType + "'>"
						+ "<div class='notificationMessage'>" 
						+ "<span class='notificationSender'>" + data.notification[i].user.firstName + " " + data.notification[i].user.lastName + "</span>"
						+ "<span>  replied to your question</span>"
						+ "<div>posted: \"" + data.notification[i].notification.description + "\"</div>"
						+ "<div class='notificationTime'>" + jQuery.timeago(new Date(data.notification[i].notification.createdAt)) + "</div>"
						+ "</div></div>";
				}
			}
		}
	});
}

setInterval(function() {
	updateNotificationList(notificationUser);
}, 4000);