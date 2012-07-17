var routesCommon = require('./../common/routesCommon.js');

exports.demo = function(request, response) {
	response.render('rqra/demo', { title: "Demo" });
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

exports.search = function(request, response) {
	routesCommon.searchRoute(0, request, response);
}
