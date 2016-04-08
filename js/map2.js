/**
 * 
 */
/**
 * Created by admin on 2016-3-29.
 */

var map2=new BMap.Map("map2");
$("#map2").width(width*0.8).height(height *0.9);
map2.centerAndZoom("厦门",12);
map2.enableScrollWheelZoom(true);
map2.enablePinchToZoom(true);
$.getJSON("js/park_hospital.json",function(data){
  var points=data.points;
  //console.log(points);
  if(!isSupportCanvas()){
    	alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
    }
	//判断浏览区是否支持canvas
    function isSupportCanvas() {
     var elem = document.createElement('canvas');
     return !!(elem.getContext && elem.getContext('2d'));
    }
    showHoney(map2,points);

});

