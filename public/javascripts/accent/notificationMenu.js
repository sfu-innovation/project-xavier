var common = new coreApi.Common();

function updateNotificationList(user) {
	console.log('being updated...');
	console.log(user);	
	common.userNotifications(user, function(data) {
		if (data) {			
			console.log('user notification:');
			console.log(data);
					
			for(var i = 0; i < data.notification.length; ++i) {
				var notificationType = "notificationRegular";
				if (data.notification[i].user.type === 1) {
					notificationType = "notificationInstructor";
				}
			
				if (data.notification[i].notification && data.notification[i].user) {
					
				}
			}
		}
	});
}

setInterval(function() {
	var sessionUser = $("#Session .Components a.UUID").text().replace(/^\s+|\s+$/g, '');	
	updateNotificationList(sessionUser);
}, 4000);