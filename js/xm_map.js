/**
 * Created by admin on 2016-3-29.
 */

var map=new BMap.Map("map1");
$("#map1").width(width*0.8).height(height *0.9);
map.centerAndZoom("厦门",12);
map.enableScrollWheelZoom(true);
map.enablePinchToZoom(true);
$.getJSON("js/heat.json",function(data){
  var points=data;
  if(!isSupportCanvas()){
    	alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
    }
  
  	showHoney(map,points);
	//判断浏览区是否支持canvas
    function isSupportCanvas() {
     var elem = document.createElement('canvas');
     return !!(elem.getContext && elem.getContext('2d'));
    }

});

var showHoney=function(map,points){
	var mapv=new Mapv({drawTypeControl: true,map:map});
    // 创建一个图层
	var layer = new Mapv.Layer({
    zIndex: 3, // 图层的层级
    mapv: mapv, // 对应的mapv
    dataType: 'polygon', // 数据类型，point:点数据类型,polyline:线数据类型,polygon:面数据类型
    //数据，格式如下
    data: points,
    drawType: 'density', // 展示形式
    // 渲染数据参数
    drawOptions: {
        type: "honeycomb", // 网格类型，方形网格或蜂窝形
        size: 30, // 网格大小
        globalAlpha: 0.6,
        unit: 'px', // 单位
        label: { // 是否显示文字标签
            show: true,
        },
        gradient: { // 显示的颜色渐变范围
            '0': 'blue',
            '0.6': 'cyan',
            '0.7': 'lime',
            '0.8': 'yellow',
            '1.0': 'red'
        },
        events: {
            click: function(e, data) {
                var geoc = new BMap.Geocoder();
                geoc.getLocation(e.point, function (rs) {
                    var addComp = rs.addressComponents;
                    alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street
                    +"，老人出行人次:"+data);
                });
            },
        }
    }
	});
}

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

var showPano=function(d){

	var map3 = new BMap.Map('map3');
	$("#map3").width(width*0.8).height(height *0.9);
	map3.addControl(new BMap.NavigationControl());               // 添加平移缩放控件
	map3.addControl(new BMap.ScaleControl());                    // 添加比例尺控件
	map3.addControl(new BMap.OverviewMapControl());              //添加缩略地图控件
	map3.enableScrollWheelZoom();                            //启用滚轮放大缩小
	map3.addControl(new BMap.MapTypeControl());          //添加地图类型控件
	map3.disable3DBuilding();
	map3.addTileLayer(new BMap.PanoramaCoverageLayer());
	
	map3.centerAndZoom(new BMap.Point(d.lng, d.lat), 20);
	var point = new BMap.Point(d.lng, d.lat);
	var marker = new BMap.Marker(point);  // 创建标注
	map3.addOverlay(marker);              // 将标注添加到地图中
	var label = new BMap.Label(d.zdm,{offset:new BMap.Size(20,-10)});
	marker.setLabel(label);
	marker.addEventListener("click",function(e){
		var p=e.point;
		var panorama = new BMap.Panorama('map3');
		panorama.setPov({heading: -40, pitch: 6});
		panorama.setPosition(new BMap.Point(p.lng, p.lat));
	})

}

