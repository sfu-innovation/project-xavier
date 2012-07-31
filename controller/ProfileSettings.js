var fs = require('fs');
var UserProfile = require(__dirname + "/../models/userProfile");
var User = require(__dirname + "/../models/user");



var settings = exports.settings = function( req, callback ) {
	console.log('in profile settings')
	var profile = { },
		bio = req.session.Profile.bio, 
		pName = req.session.user.preferedName,
		img = req.session.Profile.profilePicture,
		format="",
		msg="";
	
		if( req.method === 'POST') {
			var filepath, path;


			/***
			 *	Need to find proper way to limit upload size. 
			 ***/
		//	console.log(req.files.upload)
			if(req.files.upload.size > 0) { //upload --> preview

				if(req.files.upload.size < 5242880) {
					var upload = req.files.upload.type.split('/'),
						type = upload[0];
					if (type === 'image'){
						format = upload[1];
						console.log('upload format: '+format)

						path = req.files.upload.path;
						filepath = './public/images/avatars/tmp/'+req.session.user.uuid+'.'+format;

						img = '/images/avatars/tmp/'+req.session.user.uuid+'.'+format;
					} else {
						msg = "Error: Profile picture must be an image file."
					}
				} else {
					msg = "Error: Profile picture must be less than 5MB in size."

				
				}
			} else if (req.body.helper === 'del') { //delete --> preview
				format = 'png';
				console.log('delete format: '+format)

				path = './public/images/engage/default_profile.png';
				filepath = './public/images/avatars/tmp/'+req.session.user.uuid+'.'+format;

				img = '/images/engage/default_profile.png';
			
			} else { //saves
				console.log('save format: '+format)
				if(req.body.helper !== ''){ //has format, otherwise keep current img
					var name = req.session.user.uuid+'.'+req.body.helper;
					path = './public/images/avatars/tmp/'+name;
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
		profile.pName = pName;
		profile.bio = bio;
		profile.img = img;
		profile.format = format;
		profile.msg = msg;
		callback(profile);
	
}