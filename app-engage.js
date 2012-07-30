process.setMaxListeners(0);//annoying.
var express = require('express');
var routesCommon = require('./routes/common/routesCommon.js');
var routesEngage = require('./routes/engage/routesEngage.js');

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.use(express.cookieParser());
	app.use(express.limit('5mb'));
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
//	app.use(function(req, res, next) {
//		if (req.session)
//			req.session.courses = [ ];
//		next();
//	})
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
//app.get('/api/course/:id/resources', routesCommon.courseResources); // get the list of course resources


app.get('/api/course/:id/week/:week', routesEngage.courseWeekInfo); // get the week info of a course

app.put('/api/week/:id', routesEngage.updateWeekInfo); // update the id





// follower
//TODO: remove this if not needed
app.put("/api/question/:uid/follow", routesEngage.followQuestion); // a follower follows a question
//TODO: remove this if not needed
app.put("/api/question/:uid/unfollow", routesEngage.unfollowQuestion); // a follower follows a question

// Resource

//comment
app.post('/api/comment',routesEngage.createComment);
app.put('/api/comment/:uid',routesEngage.updateComment);
app.post('/api/comment/:id/like',routesEngage.likeComment);

//resource listings

//TODO: need update this into document
app.get('/api/resources', routesEngage.resourcesInCourses); //get resources by the courses user enrolled, notice in Engage user can only see resources from the  course he is in.
app.get('/api/resources/week/:week', routesEngage.resourcesInCoursesByWeek);
//TODO: need update this into document

app.get('/api/resources/user/:id', routesEngage.resourcesOfUser);	//get all  resources by user id

app.get('/api/resources/my', routesEngage.resourcesOfCurrentUser);//get resources uploaded by current user;

app.get('/api/resources/starred', routesEngage.starredResources);	//get all starred resources


app.get('/api/course/:id/resources/',routesEngage.resourcesInCourse);  //get all resources in a course, not using common one as it does not meet engage requirement.
app.get('/api/course/:id/resources/week/:week',routesEngage.resourcesInCourseByWeek);


app.post('/api/resource', routesEngage.createResource);
//POST means create here
app.post('/api/resource/create', routesEngage.createResource);
app.get('/api/resource/:uuid', routesEngage.getResource);

app.delete('/api/resource/:uuid', routesEngage.deleteResource);

app.get('/api/resource/:uuid/likes', routesEngage.getLikes);



app.post('/api/resource/:id/star', routesEngage.starResource);		//star a resource
app.delete('/api/resource/:id/star', routesEngage.unstarResource);	//unstar a resource

//Like resources
app.post('/api/resource/:id/like', routesEngage.likeResource);		//like a resource
app.delete('/api/resource/:id/like', routesEngage.unlikeResource);	//unlike a resource

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


app.get('/api/resource/:id/comments',routesEngage.commentsByResourceUUID);


//non-REST calls
// routing
app.get('/login', routesEngage.login);
app.get('/logout', routesCommon.logout);





app.get('/', routesEngage.index);

//app.get('/preference', routesEngage.preference);

app.get('/starred', routesEngage.starred);

app.get('/mine', routesEngage.contributions);

app.get('/instructor', routesEngage.instructor);

app.get('/profile/:id', routesEngage.profile);

app.get('/preference', routesEngage.preference);
app.post('/preference',routesEngage.preference)

//article - this is resource
app.get('/course/:name', routesEngage.courseView);

app.get('/article/:id', routesEngage.articleView);

app.get('/demo', routesEngage.demoPage); //this will login you with a demo user
app.get('/prof', routesEngage.demoProf); //this will login you with a demo prof user

app.get('/404', routesEngage.notFound);



///HEDY&CATH ZONE

app.post('/design', routesEngage.design);
app.get('/design', routesEngage.design);


app.post('/resource/share', routesEngage.shareResource);
app.post('/resource/upload', routesEngage.uploadResource);
