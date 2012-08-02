var common = new coreApi.Common();
var notificationIDs = [];

function formatNotification(item){
	return	"<div class='Notification'>"
			+ "<a href='' class='Close' onclick='return selectNotification(this);'>Close</a>"
			+ "<a href='' class='user' style='display:none;'>" + item.user.uuid + "</a>"
			+ "<a href='' class='target' style='display:none;'>" + item.notificationListener.target + "</a>"
			+ "<h1>" + item.user.firstName + " " + item.user.lastName + " commented:" + "</h1>"
			+ "<span>" + item.notification.description + "</span>"
			+ "</div>";
}

function updateNotificationList(user) {	
	var notificationLists = $(".Notifications");
	//notificationLists.empty();	
	//console.log(notificationIDs);	
	
	common.userNotifications(user, function(data) {
		//console.log('notification data')
		if (data) {								
			for(var i = 0; i < data.notification.length; ++i) {
				var contains = $.inArray(data.notification[i].notification.id, notificationIDs);

				// need a better way to check whether the notification is worth listening too
				if (contains === -1) {				
					if (data.notification[i].notification && data.notification[i].user) {	
						notificationIDs.push(data.notification[i].notification.id);					
						notificationLists.append(formatNotification(data.notification[i]));
					}
				}

			}			
		}
	});	
	
}

function selectNotification(selectedNotification) {	
	var selected = $(selectedNotification).parent();
	var user = $(selected).children("a.user").text();
	var target = $(selected).children("a.target").text();
	console.log(user);
	
	/*
	common.removeCommentNotifier(user,target,function(result){
		console.log(result);
		selected.remove();	
	})
	*/
	selected.remove();	
	
	
	
	return false;
}

/*
setInterval(function() {
	var sessionUser = $("#Session .Components a.UUID").text().replace(/^\s+|\s+$/g, '');	
	updateNotificationList(sessionUser);
}, 4000);
*/