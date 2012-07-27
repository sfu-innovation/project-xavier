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
			fillSectionDD();
		}
	})
}

function fillSectionDD(){
	var courseID = $('select[name|="course"]').val();
	common.sectionsInCourse(courseID, function(data){
		if (data && data.errorcode === 0){
			for(var i = 0; i < data.sectionsInCourse.length; ++i){
				var s = data.sectionsInCourse[i];
				$('select[name|="section"]').append("<option value=\"" + s.uuid + "\">" +
					s.title + "</option>");
			}
		}
	})
}

$('select[name|="course"]').change(fillSectionDD);
fillCourseDD();