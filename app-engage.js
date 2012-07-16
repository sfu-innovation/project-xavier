var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesEngage = require('./routes/engage/routesEngage.js');

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: "keyboard cat",
			store: express.session.MemoryStore({ reapInterval: 60000 })
		}));
	//app.use(express.csrf());
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

app.dynamicHelpers({
	token: function(request, response) {
		return request.session._csrf;
	}
});



// user
app.get('/api/user/courses', routesCommon.userCourses); // gets a list of all the users courses
app.get('/api/user/:id', routesCommon.user); // get user by id
app.post('/api/users/', routesCommon.userQuery); // get a list of users based on a custom query
app.put('/api/user/setPreferedName', routesCommon.userPreferredName); // update users prefered name

app.get('/api/course/:id/members', routesCommon.courseMembers);

// course
app.get('/api/course/:id', routesCommon.course); // get course by id
app.post('/api/courses/', routesCommon.courseQuery); // get a list of courses based on a custom query
app.get('/api/course/:id/instructor', routesCommon.courseInstructor); // get the instructor of a course



// follower
//TODO: need update this into document
app.put("/api/question/:uid/follow", routesEngage.followQuestion); // a follower follows a question
//TODO: need update this into document
app.put("/api/question/:uid/unfollow", routesEngage.unfollowQuestion); // a follower follows a question

// Resource
app.post('/api/resource', routesEngage.createResource);
//POST means create here
app.post('/api/resource/create', routesEngage.createResource);
app.get('/api/resource/:uuid', routesEngage.getResource);
app.del('/api/resource/:uuid/delete', routesEngage.deleteResource);
app.get('/api/resource/:uuid/likes', routesEngage.getLikes);

//Star resources
app.get('/api/star', routesEngage.starredResources);	//get all starred resources
app.post('/api/star', routesEngage.starResource);		//star a resource
app.delete('/api/star', routesEngage.unstarResource);	//unstar a resource

//Like resources
app.post('/api/like', routesEngage.likeResource);		//like a resource
app.delete('/api/like', routesEngage.unlikeResource);	//unlike a resource

//userprofile

app.get("/api/user/:id/profile",routesCommon.userProfile); //get user profile by id
app.put("/api/user/:id/profile",routesCommon.userProfile); //update user profile by id

/*FEEL FREE TO REMOVE THESE calls
 ================================*/
//tests for sectionMaterial
app.post("/api/sectionMaterial", routesCommon.addResourceToSection);
app.put("/api/sectionMaterial", routesCommon.updateResourceFromSectionToSection);
app.delete("/api/sectionMaterial", routesCommon.removeResourceFromSection);

//tests for section
app.post("/api/section", routesCommon.addSection);
app.put("/api/section", routesCommon.updateSection);
app.delete("/api/section", routesCommon.removeSection);

//misc
app.post("/api/section/course", routesCommon.sectionsInCourse);
app.post("/api/section/resources", routesCommon.engageResourcesInSection);
app.post("/api/course/resources", routesCommon.numberOfResourcesInCourse);



//very important, do not touch!

//non-REST calls
// routing
app.get('/login', routesCommon.login);

app.get('/', routesEngage.index);


//article - this is resource

app.get('/article/:id', routesEngage.articleView);
