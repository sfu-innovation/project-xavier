var common = new coreApi.Common();
var rqra = new coreApi.Presenter();

function fillCourseDD(){
	common.getUserCourses(function(data){				
		if (data && data.errorcode === 0){
			for(var i = 0; i < data.courses.length; ++i){
				var c = data.courses[i];
				$('select[name|="course"]').append("<option value=\"" + c.uuid + "\">" +
					c.subject + " " + c.number + "</option>");
			}
		}
	})
}

function fillSectionDD(){

}

fillCourseDD();
fillSectionDD();