function doTimer()
	{
	if (!timer_is_on)
	  {
	  timer_is_on=1;
	  updateTime();
	  }
	}
	
function timer(){
	var k=setTimeout("doTimer()",5000);
	}
		
		
function autoChangeText()
	{
		changeText();
		t=setTimeout("updateTime()",5000);
		
		}
		