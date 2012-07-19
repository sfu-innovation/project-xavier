var routesCommon = require('./../common/routesCommon.js');

exports.index = function(req, res){
	if (req.session && req.session.user) {
		res.render("rqra/questionsPage", { 	title: "SFU RQRA",
			user : req.session.user,
			courses : req.session.courses,
			status : "logged in" }, function(err, rendered){

				// console.log(rendered);
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(rendered);

		})
	}
	else {
		//to avoid login to testing, this is comment out, using fake user instead
//		res.redirect("/login");
		res.redirect("/demo");
		//login with demo user, remove when everything is set.
	}

};

// frontend
exports.header = function(request, response) {
	response.render('rqra/component/header', { title: "Demo" });
}

exports.courseList = function(request, response) {
	response.render('rqra/component/courseList', { title: "Demo" });
}

exports.timeline = function(request, response) {
	response.render('rqra/component/timeline', { title: "Demo" });
}

exports.questionList = function(request, response) {
	response.render('rqra/component/questionList', { title: "Demo" });
}

exports.questionListPage = function(request, response) {
	response.render('rqra/questionsPage', { title: "Demo" });
}

exports.questionDetails = function(request, response) {
	response.render('rqra/component/questionDetails', { title: "Demo" });
}

exports.questionDetailsPage = function(request, response) {
	response.render('rqra/questionDetailsPage', { title: "Demo" });
}

exports.questionForm = function(request, response) {
	response.render('rqra/component/questionForm', { title: "Demo" });
}

exports.questionFormPage = function(request, response) {
	response.render('rqra/questionFormPage', { title: "Demo" });
}

exports.notificationList = function(request, response) {
	response.render('rqra/component/notificationList', { title: "Demo" });
}

// backend
//login
exports.login = function(request, response){
	routesCommon.login(0, request, response);
}


exports.questionViewCount = function(request, response){
	routesCommon.questionViewCountRoute(0, request, response);
}

exports.instructorQuestions = function(request, response){
	routesCommon.instructorQuestionsRoute(0, request, response);
}

exports.question = function(request, response) {
	routesCommon.questionRoute(0, request, response);
}

//get all questions
exports.questions = function(request, response) {
	routesCommon.questionsRoute(0,request,response);
}

exports.questionsUnanswered = function(request, response){
	routesCommon.questionsUnansweredRoute(0, request, response);
}

exports.questionsNew = function(request, response){
	routesCommon.questionsNewRoute(0, request, response);
}

exports.questionsAnswered = function(request, response){
	routesCommon.questionsAnsweredRoute(0, request, response);
}

exports.questionsByUser = function(request, response) {
	routesCommon.questionsByUserRoute(0, request, response);
}

exports.followQuestion = function(request, response) {
	routesCommon.followQuestionRoute(0, request, response);
}

exports.unfollowQuestion = function(request, response) {
	routesCommon.unfollowQuestionRoute(0, request, response);
}

exports.questionStatus = function(request, response) {
	routesCommon.questionStatusRoute(0, request, response);
}

exports.comment = function(request, response) {
	routesCommon.commentRoute(0, request, response);
}

//get all comments
exports.comments = function(request, response) {
	routesCommon.commentsRoute(0,request,response);
}

exports.commentsByUser = function(request, response) {
	routesCommon.commentsByUserRoute(0, request, response);
}

exports.commentVote = function(request, response) {
	routesCommon.commentVoteRoute(0, request, response);
}

exports.commentAnswered = function(request, response) {
	routesCommon.commentAnsweredRoute(0, request, response);
}

exports.commentsByQuestion = function(request, response) {
	routesCommon.commentsByQuestionRoute(0, request, response);
}

exports.commentCount = function(request, response){
	routesCommon.commentCount(0, request, response);
}

exports.search = function(request, response) {
	routesCommon.searchRoute(0, request, response);
}

/***NEW ROUTES */
exports.searchQuestions = function(request, response){
	routesCommon.searchQuestions(0, request, response);
}