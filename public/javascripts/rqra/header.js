

// controls the default text in the ask a question box
$(document).ready(function() {
	$('#askQuestionInput').each(function() {
		var default_value = this.value;
		$(this).css('color', '#c6c6c6'); // this could be in the style sheet instead
		$(this).focus(function() {
			if(this.value == default_value) {
				this.value = '';
				$(this).css('color', '#4d4d4d');
			}
		});
		$(this).blur(function() {
			if(this.value == '') {
				$(this).css('color', '#c6c6c6');
				this.value = default_value;
			}
		});
	});
});