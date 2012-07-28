var common = new coreApi.Common();

function formatNotification(item){
	return	"<div class='Notification'>"
			+ "<a href='' class='Close' onclick='return selectNotification(this);'>Close</a>"
			+ "<h1>" + item.user.firstName + " " + item.user.lastName + " commented:" + "</h1>"
			+ "<span>" + item.notification.description + "</span>"
			+ "</div>";
}

function updateNotificationList(user) {	
	var notificationLists = $(".Notifications");
	notificationLists.empty();	
	
	common.userNotifications(user, function(data) {
		if (data) {								
			for(var i = 0; i < data.notification.length; ++i) {
				var notificationType = "notificationRegular";
				if (data.notification[i].user.type === 1) {
					notificationType = "notificationInstructor";
				}
			
				if (data.notification[i].notification && data.notification[i].user) {
					notificationLists.append(formatNotification(data.notification[i]));
				}
			}
		}
	});	
}

function selectNotification(selectedNotification) {	
	var selected = $(selectedNotification).parent();
	selected.remove();	
	// need to update the notification...
	
	return false;
}

setInterval(function() {
	var sessionUser = $("#Session .Components a.UUID").text().replace(/^\s+|\s+$/g, '');	
	updateNotificationList(sessionUser);
}, 4000);