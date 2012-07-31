function timelineMouseOver(timeline) {
	if (window.event.target !== timeline) {
		window.event.target.style.width='4.5em'; 
		window.event.target.style.color = 'rgba(255,255,255,255)';
	}
}

function timelineMouseOut(timeline) {
	if (window.event.target !== timeline) {
		window.event.target.style.width = '0.8em'; 
		window.event.target.style.color = 'rgba(0,0,0,0)';
	}
}

function timelineClicked(timeline) {
	if (window.event.target !== timeline) {
		var targetNode = window.event.target;
		HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
		QuestionCommon.setWeek(targetNode.parentNode.children.indexOf(targetNode));
		refreshQuestionsList();
		QuestionCommon.refreshDefaultHeader();
	}
}