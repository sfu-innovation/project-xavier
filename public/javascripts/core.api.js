var coreApi = {}
coreApi._construct = function()
{

	function Accent()
	{

		this.publicMethod = function()
		{
			alert('!');
		}
	}

	function Engage()
	{

		this.publicMethod = function()
		{

		}
	}

	function Presenter()
	{

		this.createQuestion = function(){
			console.log("API - setQuestionById");

		}

		this.readQuestionById = function(id,callback){
			console.log("API - getQuestionById");
			$.ajax({
				url: '/api/question/'+id,
				type: 'GET',
				success: function(data) {
					callback(data);
				}
			});
		}

		this.updateQuestionById = function(id, questionBody ,callback){
			console.log("API - updateQuestionById");
			var body= {};
			body.questionBody = questionBody;
			$.ajax({
				url: '/api/question/'+id,
				type: 'PUT',
				data : JSON.stringify(body),
				success: function(data) {
					callback(data);
				}
			});
		}



		this.deleteQuestionById = function(id, questionBody ,callback){
			console.log("API - updateQuestionById");
			var body= {};
			body.questionBody = questionBody;
			$.ajax({
				url: '/api/question/'+id,
				type: 'DELETE',
				success: function(data) {
					callback(data);
				}
			});
		}


	}




	this.Accent = Accent;
	this.Engage = Engage;
	this.Presenter = Presenter;
}

coreApi._construct();


var xx = new coreApi.Presenter();
//xx.getQuestionById('pJfzndwdadddQuOicWWAjx7F00',function(data){
//
//	console.log(data);
//
//});

//xx.updateQuestionById('pJfzndwdadddQuOicWWAjx7F00', "i have no clue" ,function(data){
//
//	console.log(data);
//
//});