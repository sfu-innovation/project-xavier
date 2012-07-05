
exports.index = function(request, response) {
	response.render('common/index', { title: "Homepage" });
}