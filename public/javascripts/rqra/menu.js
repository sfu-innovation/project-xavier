var closeTimer = 0;
var menuItem = 0;

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

// open menu
function openMenu(id) {
	if (menuItem) {
		menuItem.style.visibility = 'hidden';
	}
	
	menuItem = document.getElementById(id);
	menuItem.style.visibility = 'visible';
}

// close menu
function closeMenu() {
	if(menuItem) {
		menuItem.style.visibility = 'hidden';
	}
}

document.onclick = closeMenu;