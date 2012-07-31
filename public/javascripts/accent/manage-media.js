var common = new coreApi.Common();

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
	$('select[name|="section"]').empty();
	common.sectionsInCourse(courseID, function(data){
		if (data && data.errorcode === 0){
			for(var i = 0; i < data.sectionsInCourse.length; ++i){
				var s = data.sectionsInCourse[i];
				$('select[name|="section"]').append("<option value=\"" + s.uuid + "\">" +
					s.title + "</option>");
			}
			setFormCourse();
			setFormSection();
			getMedia(courseID);
		}
	})
}

function setFormCourse(){
	$('#uploadFormCourse').val($('select[name|="course"]').val())
}

function setFormSection(){
	$('#uploadFormSection').val($('select[name|="section"]').val())
	console.log("VAL " + $('#uploadFormSection').val())
}

function showUploadForm(){
	$('#uploadForm').css('display','block');
	return false;
}

function hideUploadForm(){
	$('#uploadForm').css('display','none');
	return false;
}

$('select[name|="course"]').change(fillSectionDD);
$('select[name|="section"]').change(setFormSection);
fillCourseDD();