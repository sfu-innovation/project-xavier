var fs = require('fs');
var UserProfile = require(__dirname + "/../models/userProfile");
var User = require(__dirname + "/../models/user");



var settings = exports.settings = function( req, callback ) {
	var profile = { },
		bio = req.session.Profile.bio, 
		pName = req.session.user.preferedName,
		img = req.session.Profile.profilePicture,
		format="";
	

		if( req.method === 'POST') {
			var filepath, path;

			if(req.files.upload.size > 0) { //upload --> preview
				format = req.files.upload.type.split('/')[1];

				path = req.files.upload.path;
				filepath = './public/images/avatars/tmp/'+req.session.user.uuid+'.'+format;

				img = '/images/avatars/tmp/'+req.session.user.uuid+'.'+format;


			} else if (req.body.helper === 'del') { //delete --> preview
				format = 'png'

				path = './public/images/SFUEngage_profile.png';
				filepath = './public/images/avatars/tmp/'+req.session.user.uuid+'.'+format;

				img = '/images/SFUEngage_profile.png';
			
			} else { //save
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
				
			}

			if(path){
				fs.readFile(path, function (err, data) {
				 	fs.writeFile(filepath, data, function (err) {});
				});
			}

				pName = req.body.pref_name;
				bio = req.body.bio;		

		}
		profile.pName = pName;
		profile.bio = bio;
		profile.img = img;
		profile.format = format;
		callback(profile);
	
}