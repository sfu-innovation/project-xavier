var fs = require('fs');
var UserProfile = require(__dirname + "/../models/userProfile");
var User = require(__dirname + "/../models/user");
var notification = require(__dirname + "/../controller/NotificationAction");
var routesCommon = require(__dirname + "/../routes/common/routesCommon");

var settings = exports.settings = function( req, callback ) {
	var profile = { },
		bio = req.session.Profile.bio, 
		pName = req.session.user.preferedName,
		img = req.session.Profile.profilePicture,
		format="",
		msg="";

	var likes = ["","","",""];
	var comments = ["","","",""];

	var args = {
		user: req.session.user.uuid,
		app: 2
	};
	
	notification.createUserNotificationSettings(args, function(err, data) {
		args['notificationOnComment'] = data.notificationOnComment;//*used
		args['notificationOnLike'] = data.notificationOnLike;//*used
		args['notificationOnStar'] = data.notificationOnStar;
		args['notificationOnNewResource'] = data.notificationOnNewResource;

		likes[data.notificationOnLike] = "checked"
		comments[data.notificationOnComment] = "checked"
	//	console.log(JSON.stringify(args))
		console.log(data)

		if(req.method === 'POST') { //probably notification settings
				//notification settings

			
			var body = req.body;
			if (body.length > 0){
				likes = ["","","",""];
				comments = ["","","",""];
				var changes = Object.getOwnPropertyNames(body);

				changes.forEach(function(item){	//items = likes, comments
					args[item] = body[item];
					if(item === 'notificationOnComment')
						comments[body[item]] = "checked"
					if(item === 'notificationOnLike')
						likes[body[item]] = "checked"

				})

				//console.log(args)
				
				notification.updateUserNotificationSettings(args, function(err, updates){});


				msg="Notification changes saved.";
			}

			if(req.files !== undefined){

				var filepath, path;

					/***
					 *	Need to find proper way to limit upload size. 
					 ***/

				  if(req.files.upload.size > 0) { //upload --> preview
				  	msg = "";

					if(req.files.upload.size < 5242880) {

						var upload = req.files.upload.type.split('/'),
							type = upload[0];

						if (type === 'image'){

							format = upload[1];
							path = req.files.upload.path;
							filepath = './public/images/avatars/donotremove/'+req.session.user.uuid+'.'+format;

							img = '/images/avatars/donotremove/'+req.session.user.uuid+'.'+format;
						} else {
							msg = "Error: Profile picture must be an image file."
						}
					} else {
						msg = "Error: Profile picture must be less than 5MB in size."
					
					}
				} else if (req.body.helper === 'del') { //delete --> preview

					msg = "";
					format = 'png';
					path = './public/images/engage/default_profile.png';
					filepath = './public/images/avatars/donotremove/'+req.session.user.uuid+'.'+format;
					img = '/images/engage/default_profile.png';
				
				} else { //saves

					if(req.body.helper !== ''){ //has format, otherwise keep current img

						var name = req.session.user.uuid+'.'+req.body.helper;
						path = './public/images/avatars/donotremove/'+name;
						filepath = './public/images/avatars/'+name;
						img = '/images/avatars/'+name;
					}	

					User.setPreferedName(req.session.user.uuid, req.body.pref_name,function(err, res){
						if (err)
							console.log(err)
					});
					UserProfile.updateProfile(req.session.user.uuid, {
						profilePicture: img,
						bio: req.body.bio
					}, function(err, data) {	
						if (err)
							console.log(err)
					})

					req.session.user.preferedName = req.body.pref_name;
					req.session.Profile.profilePicture = img;
					req.session.Profile.bio = req.body.bio;
					msg = 'Your changes have been saved.'
					
				}

				if(path){
					fs.readFile(path, function (err, data) {
					 	fs.writeFile(filepath, data, function (err) {
					 		if(err)
					 			console.log(err)
					 	});
					});
				}

				pName = req.body.pref_name;
				bio = req.body.bio;
			}
		}

		console.log('likes: '+likes)
		console.log('comments: '+comments)
		profile.pName = pName;
		profile.bio = bio;
		profile.img = img;
		profile.format = format;
		profile.msg = msg;
		profile.likes = likes;
		profile.comments = comments;
		callback(profile);

	})	
}