var BMapExt,BDMap,myChart,bdGEO,hospitals,stations;
$(document).ready(function(){
	require.config({
	    paths: {

	    	echarts:'./js',
	    },
	    packages: [
	               {
	                   name: 'BMap',
	                   location: './js/BMap/src',
	                   main: 'main'
	               },
	               {
	            	   name:'zrender',
	            	   location:'./js',
	            	   main:'zrender'
	               }
	           ]
	    });
	
	loadBDExtMap('厦门');

});
//加载指定城市的百度地图
var loadBDExtMap=function(cityname){
	require(
		    [
		        'echarts',
		        'BMap',
		        'echarts/chart/map'
		    ],
		    function (echarts, BMapExtension) {

		        // 初始化地图
		        BMapExt = new BMapExtension($('#allmap')[0], BMap, echarts,{
		            enableMapClick: true
		        });
		        BDMap = BMapExt.getMap();
		        BDMap.centerAndZoom(cityname,12);
		        BDMap.enableScrollWheelZoom(true);
		        BDMap.enableDragging();
		        bdGEO=new BMap.Geocoder();
		    }
		    );

};

//批量获取医院数据
var batchHospitals=function(){
	$.ajax({'url':'../data/hospitals.csv',
		'dataType':'text',
		'type':'POST',
		}).done(function(csvdata){
		var rows=csvdata.split('\n');
		hospitals=[];
		for(r in rows){
			if(r==0)
				continue;
				var add=rows[r].split(',');
				searchPoint(add, '厦门');
			}
});

}
//下载医院数据
var downLoadHospitals=function(alink){
	if(hospitals!=undefined&&stations!=undefined){
		var csv=[];
		var title=['医院名称','医院地址','区域','归属','医院经度','医院纬度','公交站','公交站经度','公交站纬度','经停线路','步行距离(米)','步行时间(秒)','步行路径'];
		csv.push(title.join(','));
		for(var h in hospitals){
			var add=hospitals[h][0];
			var p=hospitals[h][1];
			var st=stations[add[0]];
			for(s in st){
				var r=[];
				r.push(add.join(','));
				r.push(p.lng);
				r.push(p.lat);
				r.push(s);
				r.push(st[s].join(','));
				csv.push(r.join(',').replace('\n','').replace('\r',''));
			}
			
		}

		var csvstr=csv.join('\n');
		csvstr=encodeURIComponent(csvstr);
		alink.href="data:text/csv;charset=utf-8,\ufeff"+csvstr;
		alink.download='hospitals.csv';
		alink.click();
		
	}
}
//显示医院坐标点
var showHospitals=function(){
	if(hospitals==undefined)
		return;
	var geolist={},geodata=[];
	for(i in hospitals){
		var add=hospitals[i][0];
		var point=hospitals[i][1];
		if(point==null)
		{
			console.log(add,'找不到');
			continue;
		}
		geolist[add[0]+','+add[1]]=[point.lng,point.lat];
		geodata.push({name:add[0]+','+add[1]});
	}
	var hospseries=makeSeries('医院', geolist, geodata);
	hospseries.markPoint.effect.show=true;
	var hosoption=makeOption('厦门市老人服务设施分布图', [hospseries]);
    var container = BMapExt.getEchartsContainer();
    myChart = BMapExt.initECharts(container);
    window.onresize = myChart.resize;    
    BMapExt.setOption(hosoption, true);
	
}
//根据地址搜索坐标
var searchPoint=function(add,cityname){
	bdGEO.getPoint(add[1],function(point){
		var row=[];
		row.push(add);
		row.push(point);
		hospitals.push(row);
		if(hospitals.length%20==0||hospitals.length>110)
			showHospitals();

	},cityname);
}
//搜索医院周边公交站
var searchStation=function(hospital){
	var s={};
	var j=1;
	var searchOptions={
			onSearchComplete:function(results){
				if (localsearch.getStatus() == BMAP_STATUS_SUCCESS){
					for (var i = 0; i < results.getCurrentNumPois(); i ++){
						s[results.getPoi(i).title]=[results.getPoi(i).point.lng,results.getPoi(i).point.lat,results.getPoi(i).address];
						stations[hospital[0][0]]=s;
						searchWalk(hospital,s[results.getPoi(i).title],results.getPoi(i).title);
					}
	                if(results.getPageIndex!=results.getNumPages())  
	                {
	                        localsearch.gotoPage(j);
	                        j=j+1;
	                }
	                
	                showStations();
	                
				}
			}
		
		};
	var localsearch=new BMap.LocalSearch(hospital[1],searchOptions);
	localsearch.searchNearby('公交站',hospital[1],400);
}

//批量搜索公交站
var batchStations=function(){
	stations={};
	for(var i in hospitals){
		searchStation(hospitals[i]);
	}
}
//显示公交站
var showStations=function(){
	if(stations==undefined)
		return;
	var geolist={},geodata=[];
	for(i in stations){

		for(s in stations[i]){

			st=stations[i][s];
			geolist[s+','+st[2]]=[st[0],st[1]];
			geodata.push({name:s+','+st[2]});
		}
	}
	var oldseries=myChart.getSeries()[0];

	var stationseries=makeSeries('公交站', geolist, geodata);
	stationseries.markPoint.symbol='triangle';
	stationseries.markPoint.symbolSize=1;
	var newoption=makeOption('厦门市老人服务设施分布图', [oldseries,stationseries]);
    window.onresize = myChart.resize;    
    BMapExt.setOption(newoption, true);
	
}
//创建echart选项
var makeOption=function(title,series){

	var legendname=[];
	for(var s in series){
		legendname.push(series[s].name);
	}
	return mkoption={
		title:{
			text:title,
			x:'center',
			textStyle:{
				fontSize:18,
				fontWeight:'bolder',
			},
			backgroundColor:'rgba(152,245,255,50)',
		},
		tooltip:{
			trigger:'item'
		},
		legend:{
			orient: 'vertical',
	        x:'left',
	        data:legendname,
		},
		toolbox:{
			show:false,
		},
		series:series
		
	};
}
//创建图表系列
var makeSeries=function(serialname,geolist,geodata){
	return mkseries={
	    	name:serialname,
	    	type:'map',
	    	mapType:'none',
	    	data:[],
	    	geoCoord:geolist,
	    	markPoint:{
	    		symbol:'diamond',
	            symbolSize : 3,
                effect : {
                    show: false,
                    shadowBlur : 0
                },
                itemStyle:{
                    normal:{
                        label:{show:false},
                    }
                },
                data:geodata,
	    	}
	    };  
}


//查找从医院到公交站的步行路径
var searchWalk=function(hospital,station,stationTitle){
	var add=hospital[0];
	var hpoint=hospital[1];
	var stpoint=new BMap.Point(station[0],station[1]);
	var walkOptions={
			onSearchComplete:function(result){
				if (walking.getStatus() == BMAP_STATUS_SUCCESS){
				var rp=result.getPlan(0);
				var distance=rp.getDistance(false);
				var duration=rp.getDuration(false);
				//获得步行路径
				var route=rp.getRoute(0);
				//获得路径坐标
				var paths=route.getPath();
				var pathstr='';
				for(var i in paths){
					pathstr+=paths[i].lng+'|'+paths[i].lat+';'
				}
				
				var newstation=station;
				newstation.push(distance);
				newstation.push(duration);
				newstation.push(pathstr);
				stations[add[0]][stationTitle]=newstation;
				
				}
			}
	};
	var walking=new BMap.WalkingRoute(BDMap,walkOptions);
	walking.search(hpoint,stpoint);
	walking.disableAutoViewport();	
}
//数据分析
var hospitalAnalyze=function(){
	$('#modalChart').on('shown.bs.modal',function(e){
		$(this).find('.modal-title').text('医院便利性分析');
		require([
		         'echarts',
		         'echarts/chart/radar',],
		         function(ec){
			var modalchart=ec.init($('#modalchartbody')[0]);
			var resdata=makeAnalyzeData();
			var result=resdata[0];
			var maxdata=resdata[1];
			var modaloption = {
				    color : (function (){
				        var zrColor = require('zrender/tool/color');
				        return zrColor.getStepColors('yellow', 'red', 28);
				    })(),
				    title : {
				        text: '医院与周边公交站位置分析',
				        x:'right',
				        y:'bottom'
				    },
				    tooltip : {
				        trigger: 'item',
				        backgroundColor : 'rgba(0,0,250,0.2)'
				    },
				    legend: {
				       // orient : 'vertical',
				        //x : 'center',
				    	show:false,
				        data: function (){
				                var list = [];
				               for(var h in result){
				            	   list.push(h);
				               }
				                return list;
				            }()
				    },
				    toolbox: {
				        show : true,
				        orient : 'vertical',
				        y:'center',
				        feature : {
				            mark : {show: true},
				            dataView : {show: true, readOnly: false},
				            restore : {show: true},
				            saveAsImage : {show: true}
				        }
				    },
				   polar : [
				       {
				           indicator : [
				               { text: '站点数量', max: maxdata[0]},
				               { text: '公交线路数', max: maxdata[1]},
				               { text: '500米可选择数', max: maxdata[2]},
				               { text: '300秒可选择数', max: maxdata[3]}
				            ],
				            center : ['50%', 200],
				            radius : 150
				        }
				    ],
				    calculable : false,
				    series : (function (){
				    	
				        var series = [];
				        for (var h in result) {
				            series.push({
				                name:h+'与周边公交站分析',
				                type:'radar',
				                symbol:'none',
				                itemStyle: {
				                    normal: {
				                        lineStyle: {
				                          width:1
				                        }
				                    },
				                    emphasis : {
				                        areaStyle: {color:'rgba(0,250,0,0.3)'}
				                    }
				                },
				                data:[
				                  {
				                    value:[
				                        result[h][0],
				                        result[h][1],
				                        result[h][2],
				                        result[h][3]
				                    ],
				                    name:h
				                  }
				                ]
				            })
				        }
				        return series;
				    })()
				};
			
			window.onresize = modalchart.resize;
			modalchart.setOption(modaloption);
			
		});
	}).modal();
}

var makeAnalyzeData=function(){
	var result={},maxstcnt=0,maxbuscnt=0,maxbuschoice=0,maxtimechoice=0;
	for(var h in stations){
		var stcnt=0,buscnt=0,buschoice=0,timechoice=0;
		station=stations[h];
		result[h]=[];
		for(var st in station){
			if(station[st][3]==undefined)
				continue;
			//站点数量
			stcnt++;
			//公交线路数
			buscnt+=station[st][2].split(';').length;
			//可选择的公交线路数的距离系数
			buschoice+=station[st][2].split(';').length/(station[st][3]);
			//可选择的公交线路数的时间系数
			timechoice+=station[st][2].split(';').length/(station[st][4]);
		}
		if(maxstcnt<stcnt) maxstcnt=stcnt;
		if(maxbuscnt<buscnt) maxbuscnt=buscnt;
		buschoice=Math.round(500*buschoice/stcnt);
		if(buschoice>buscnt) buschoice=buscnt;
		
		timechoice=Math.round(300*timechoice/stcnt)
		if(timechoice>buscnt) timechoice=buscnt;
		
		if(maxbuschoice<buschoice) maxbuschoice=buschoice;
		if(maxtimechoice<timechoice) maxtimechoice=timechoice;
		result[h].push(stcnt);
		result[h].push(buscnt);
		result[h].push(buschoice);
		result[h].push(timechoice);
	}
	return [result,[maxstcnt,maxbuscnt,maxbuschoice,maxtimechoice]];
}






