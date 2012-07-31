var common = new coreApi.Common();

function fillCourseDD(){
	common.getUserCourses(function(data){				
		if (data && data.errorcode === 0){
			for(var i = 0; i < data.courses.length; ++i){
				var c = data.courses[i];
				$('select[name|="courseSelect"]').append("<option value=\"" + c.uuid + "\">" +
					c.subject + " " + c.number + "</option>");
			}
			fillSectionDD();
		}
	})
}

function fillSectionDD(){
	var courseID = $('select[name|="courseSelect"]').val();
	$('select[name|="sectionSelect"]').empty();
	common.sectionsInCourse(courseID, function(data){
		if (data && data.errorcode === 0){
			console.log(JSON.stringify(data));
			for(var i = 0; i < data.sectionsInCourse.length; ++i){
				var s = data.sectionsInCourse[i];
				$('select[name|="sectionSelect"]').append("<option value=\"" + s.uuid + "\">" +
					s.title + "</option>");
			}
			getMedia(courseID);
		}
	})
}

function fillFormCourseDD(){
	common.getUserCourses(function(data){				
		if (data && data.errorcode === 0){
			for(var i = 0; i < data.courses.length; ++i){
				var c = data.courses[i];
				$('select[name|="course"]').append("<option value=\"" + c.uuid + "\">" +
					c.subject + " " + c.number + "</option>");
			}
			fillFormSectionDD();
		}
	})
}

function fillFormSectionDD(){
	var courseID = $('select[name|="course"]').val();
	$('select[name|="section"]').empty();
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

function showUploadForm(){
	$('#UploadForm').css('display','block');
	return false;
}

function hideUploadForm(){
	$('#UploadForm').css('display','none');
	return false;
}

$('select[name|="courseSelect"]').change(fillSectionDD);
$('select[name|="course"]').change(fillFormSectionDD);
fillCourseDD();
fillFormCourseDD();