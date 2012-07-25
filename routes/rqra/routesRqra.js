var routesCommon = require('./../common/routesCommon.js');
var notification = require('../../controller/NotificationAction.js')

//TODO: remove when everything is setup
var fakeUserNotification = function(callback){
	var args= {
		app:0,
		user:"jrf2"
	}
	notification.createUserNotificationSettings(args, function(err, result){
		if(err)
			console.log(err);

		if(result)
			console.log("created: " + result)

		callback();
	});
}

exports.index = function(req, res){
	if (req.session && req.session.user) {

		res.render("rqra/questionsPage", { 	title: "SFU RQRA",
			user : req.session.user,
			courses : req.session.courses,
			status : "logged in" }, function(err, rendered){

			fakeUserNotification(function(){
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(rendered);
			})
		})
	}
	else {
		//to avoid login to testing, this is comment out, using fake user instead
//		res.redirect("/login");

		//login with demo user, remove when everything is set.
		fakeUserNotification(function(){
			console.log("redirect");
			res.redirect("/questions");
		})
	}

};

// frontend
exports.header = function(request, response) {
	response.render('rqra/component/header', { title: "Demo", user: request.session.user });
}

exports.courseList = function(request, response) {
	response.render('rqra/component/courseList', { title: "Demo" });
}

exports.timeline = function(request, response) {
	response.render('rqra/component/timeline', { title: "Demo", user: { uuid: "sadf", name: "jordan" } });
}

exports.questionList = function(request, response) {
	response.render('rqra/component/questionList', { title: "Demo" });
}

exports.questionListPage = function(request, response) {
	response.render('rqra/questionsPage', { title: "Demo", user: request.session.user });
}

exports.questionDetails = function(request, response) {
	response.render('rqra/component/questionDetails', { title: "Demo" });
}

exports.questionDetailsPage = function(request, response) {
	response.render('rqra/questionDetailsPage', { title: "Demo", user: request.session.user });
}

exports.questionForm = function(request, response) {
	response.render('rqra/component/questionForm', { title: "Demo" });
}

exports.questionFormPage = function(request, response) {
	response.render('rqra/questionFormPage', { title: "Demo", user: request.session.user });
}

exports.notificationList = function(request, response) {
	response.render('rqra/component/notificationList', { title: "Demo" });
}

exports.updateUserNotifications = function(request, response){
	routesCommon.updateUserNotifications(0, request, response);
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
exports.searchQuestionsRoute = function(request, response){
	routesCommon.searchQuestionsRoute(0, request, response);
}

exports.getWeekByCourseId = function(request, response){
	routesCommon.getWeekByCourseId(0, request, response);
}

exports.addWeek = function(request, response){
	routesCommon.addWeek(0, request, response);
}