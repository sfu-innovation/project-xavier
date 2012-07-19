var rqra = new coreApi.Presenter();

function PostQuestion() {
	var questionTitle = document.getElementById("questionField").value;
	var questionBody = document.getElementById("descriptionField").value;
	rqra.createQuestion(questionTitle, questionBody, function(data) {
		console.log(data);
		
		if (data && data.errorcode === 0) {
			
		}
	});
}