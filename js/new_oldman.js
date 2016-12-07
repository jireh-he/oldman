var BMapExt,BDMap,myChart,bdGEO,hospitals,stations,exportdata;
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
	$("#navtabs a").click(function(e){
		e.preventDefault();
		tab=e.currentTarget.text;
		if(tab=='医院'){
			hospitalTree();
		}
		if(tab=='公园'){
			parkTree();
		}
	});
	$("#navtabs a").first().click();

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
		        var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
		        BDMap.addControl(top_left_navigation); 
		        bdGEO=new BMap.Geocoder();
		    }
		    );

};

//批量获取医院数据
var batchHospitals=function(node){
	if(hospitals){
		var topnode=$('#treeview-hospital').treeview('getNode',node.nodeId);
		topnode.tags=[hospitals.length];
	}
	$.ajax({'url':'data/hospitals.csv',
		'dataType':'text',
		'type':'GET',
		}).done(function(csvdata){
		var rows=csvdata.split('\n');
		hospitals=[];
		cnt=0;
		for(r in rows){
			if(r==0)
				continue;
			var row=rows[r].split(',');
			var mf=MedicalFacility(row);
			searchPoint(mf, '厦门');
			cnt++;
		}
		var topnode=$('#treeview-hospital').treeview('getNode',node.nodeId);
		topnode.tags=[cnt];
		topnode=$('#treeview-hospital').treeview('selectNode',node.nodeId);
		
		
});

}


//显示医院坐标点
var showHospitals=function(showNodes){
	if(showNodes.length==0)
	{	myChart.clear();
		return;
	}
	var geolist={},geodata=[];
	for(var i in showNodes){
		geolist[showNodes[i].FacilityName]=[showNodes[i].Longitude,showNodes[i].Latitude];
		geodata.push({name:showNodes[i].FacilityName,
			FacilityAddress:showNodes[i].FacilityAddress,
			FacilityType:showNodes[i].FacilityType,
			QualityClass:showNodes[i].QualityClass,
			AdminArea:   showNodes[i].AdminArea,   
			Affiliation: showNodes[i].Affiliation, 
			Beds:        showNodes[i].Beds,        
			StaffNum:    showNodes[i].StaffNum,    
			Floorspace:  showNodes[i].Floorspace,
			Longitude:showNodes[i].Longitude,
			Latitude:showNodes[i].Latitude
		});
		}
	var hospseries=makeSeries('医院', geolist, geodata);
	var hosoption=makeOption('厦门市老人服务设施分布图', [hospseries]);
	hospseries.tooltip={
			trigger:'item',
			formatter:function(params){
				//console.log(params);
				if(params.name.split('>').length==2){
					var start=$.trim(params.name.split('>')[0]);
					var end=$.trim(params.name.split('>')[1]);
					//console.log(start,end);
					var showstr=params.name+'<br/>'
					+'全程：'+stations[start][end].Distance+'（米）<br/>'
					+'花费：'+stations[start][end].Duration+'（秒）<br/>';
					return showstr;
				}
				var showstr='名称：'+params.name+'<br/>';
				showstr+='地址:'+params.data.FacilityAddress+'<br/>';
				showstr+='机构类别:'+params.data.FacilityType+'<br/>';
				showstr+='资质等级:'+params.data.QualityClass+'<br/>';
				showstr+='实有床位:'+params.data.Beds+'<br/>';
				showstr+='医护人数:'+params.data.StaffNum+'(人)<br/>';
				showstr+='建筑面积:'+params.data.Floorspace+'（平米)';
				return showstr;
			},
	};
    var container = BMapExt.getEchartsContainer();
    myChart = BMapExt.initECharts(container);
    window.onresize = myChart.resize;    
    BMapExt.setOption(hosoption, true);
    var bdp=new BMap.Point(showNodes[0].Longitude,showNodes[0].Latitude);
    BDMap.centerAndZoom(bdp,12);

    
    myChart.on('click',function(param){
    	//console.log(param);
    	var sname=param.seriesName;
    	var series=myChart.getSeries();
    	//点击连线出现详细路径
    	if(param.name.split('>').length==2)
    	{
    		showDetailRoute(param);
    		return;
    	}

    	//点击医院出现路径图
    	if(sname=='医院'){
    		console.log(param);
    		var hospoint=new BMap.Point(param.data.Longitude,param.data.Latitude);
    		BDMap.centerAndZoom(hospoint,16);
   
    	}
    });

}
//批量显示医院到车站的路径图
var showHospitaltoStations=function(showNodes){
	if(showNodes.length==0)
		return;
	if(!isEmptyObject(stations)){
		var linedata=[];
		for(var n in showNodes){
		var hospital=showNodes[n].FacilityName;
		var start={name:hospital};
    	var stls=stations[hospital];
    	for(var n in stls){
    		var r=[];
    		r.push(start);
    		r.push({name:n});
    		linedata.push(r);
    	}
		}
    	//console.log(linedata);
    	var series=myChart.getSeries();
		series[0].markLine={
				smooth:true,
                effect : {
                    show: true,
                    scaleSize: 1,
                    period: 30,
                    color: 'blue',
                    shadowBlur: 10
                },
                itemStyle : {
                    normal: {
                        borderWidth:1,
                        lineStyle: {
                            type: 'solid',
                            shadowBlur: 10
                        }
                    }
                },
                data:linedata,
                
		};
		myChart.setSeries(series);
		window.onresize = myChart.resize;
		BDMap.centerAndZoom('厦门',12);
	}
}

var showDetailRoute=function(param){
	//点击连线出现详细路径
		var geolist={},
		geodata=[];
		var start=$.trim(param.name.split('>')[0]);
		var end=$.trim(param.name.split('>')[1]);
		//console.log(start,end);
		var pathstr=$.trim(stations[start][end].Pathstr);
		if(pathstr.length==0)
			return false;
		var points=pathstr.split(';');
		for(var p=0;p<points.length;p++){
			//console.log(points[p]);
			if($.trim(points[p]).length==0)
				continue;
			var coord=points[p].split('|');
			
			//console.log(coord,geolist);
			geolist[param.name+''+p]=[coord[0],coord[1]];
			var r=[];
			if((p+1)<(points.length-1)){
			r.push({name:param.name+''+p});
			r.push({name:param.name+''+(p+1)});
			geodata.push(r);
			}
		}
		var series=myChart.getSeries();
		var pathseries={
		    	name:'详细路径',
		    	type:'map',
		    	mapType:'none',
		    	data:[],
		    	geoCoord:geolist,
				markLine:{
    					smooth:true,
    	                effect : {
    	                    show: true,
    	                    scaleSize: 1,
    	                    period: 30,
    	                    color: 'white',
    	                    shadowBlur: 10
    	                },
    	                itemStyle : {
    	                    normal: {
    	                        borderWidth:1,
    	                        lineStyle: {
    	                            type: 'solid',
    	                            shadowBlur: 10
    	                        }
    	                    }
    	                },
    	                data:geodata,
    	                
    			},
		}
		
		series.push(pathseries);
		myChart.setSeries(series);
		window.onresize = myChart.resize;
		var bdp=new BMap.Point(geolist[param.name+'1'][0],geolist[param.name+'0'][1]);
		BDMap.centerAndZoom(bdp,16);
		return true;						
		
}

//根据地址搜索坐标
var searchPoint=function(row,cityname){
	bdGEO.getPoint(row.FacilityAddress,function(point){
		//console.log(point);
		if(point){
		row.Latitude=point.lat;
		row.Longitude=point.lng;
		hospitals.push(row);
		}else{
			console.log(row);
		}
	},cityname);
}

var changeGps=function(tree,node){
	if((typeof(exportdata)=="undefined")||(exportdata.length==0)){
		exportdata=[];
	}else 
	{
		tree.treeview('getNode',node.nodeId).tags=[exportdata.length];
		return exportdata.length;
	}
	for(var h in hospitals){
		var st=stations[hospitals[h].FacilityName];
		for(s in st){
			bd2GPS(hospitals[h],st[s],tree,node);	
		}		
	}
}
var bd2GPS=function(hospital,station,tree,node){
	var r=[];
	//医院信息
	r.push(hospital.FacilityName);
	r.push(hospital.FacilityAddress);
	r.push(hospital.FacilityType);
	r.push(hospital.QualityClass);
	r.push(hospital.AdminArea);
	r.push(hospital.Affiliation);
	r.push(hospital.Beds);
	r.push(hospital.StaffNum);
	r.push(hospital.Floorspace);
	r.push(hospital.Longitude); //医院经度
	r.push(hospital.Latitude);  //医院纬度

	//公交站信息
	r.push(station.StationName);
	r.push(station.Longitude);    //车站经度
	r.push(station.Latitude);     //车站纬度
	r.push(station.BusLines);
	r.push(station.Distance);
	r.push(station.Duration);
	r.push(station.Pathstr);
	var hosbdpoint=new BMap.Point(r[9],r[10]);
	var busbdpoint=new BMap.Point(r[12],r[13]);
    
	//将百度坐标转换成GPS坐标
    var convertor = new BMap.Convertor();
    var pointArr = [];
    pointArr.push(hosbdpoint);
    pointArr.push(busbdpoint);
    convertor.translate(pointArr, 3, 5, function (data){
	      if(data.status === 0) {
		    	//console.log(data.points);
		    	r[9]=2*r[9]-data.points[0].lng;
		    	r[10]=2*r[10]-data.points[0].lat;
		    	r[12]=2*r[12]-data.points[1].lng;
		    	r[13]=2*r[13]-data.points[1].lat;
		    	exportdata.push(r.join(',').replace('\n','').replace('\r',''));
		    	tree.treeview('getNode',node.nodeId).tags=[exportdata.length];
		    	tree.treeview('selectNode',node.nodeId);
	      	}
		    });
}

//下载医院数据
var downLoadHospitals=function(){
	if(hospitals!=undefined&&stations!=undefined){
		var csv=[];
		var title=['医院名称','医院地址','机构类别','资质等级','行政区划','设置单位','实用床位','卫生技术人员','房屋面积(米)','医院经度','医院纬度','公交站','公交站经度','公交站纬度','经停线路','步行距离(米)','步行时间(秒)','步行路径'];
		csv.push(title.join(','));
		if(exportdata.length>600)
		{
			csv=csv.concat(exportdata);
			exportdata=[];
		}
		var csvstr=csv.join('\n');
		csvstr=encodeURIComponent(csvstr);
		var alink=document.createElement("a");
		alink.href="data:text/csv;charset=utf-8,\ufeff"+csvstr;
		alink.download='hospitals.csv';
		document.body.appendChild(alink);
		alink.click();
		document.body.removeChild(alink);
	}
}

//搜索医院周边公交站
//hospital模型就是MedicalFacility
var searchStation=function(hospital,tree,node){
	var s={};
	var j=1;
	var searchOptions={
			onSearchComplete:function(results){
				if (localsearch.getStatus() == BMAP_STATUS_SUCCESS){
					//console.log(results);
					for (var i = 0; i < results.getCurrentNumPois(); i ++){
						s[results.getPoi(i).title]=BusStation(results.getPoi(i));
						stations[hospital.FacilityName]=s;
						searchWalk(hospital,s[results.getPoi(i).title]);
					}
	                if(results.getPageIndex!=results.getNumPages())  
	                {
	                        localsearch.gotoPage(j);
	                        j=j+1;
	                }
	                //计算stations的数量
	                var cnt=0;
	                for(var e in stations){
	                	cnt++
	                }
	                tree.treeview('getNode',node.nodeId).tags=[cnt];
	                //tree.treeview('unselectNode',node.nodeId);
				}
			}
		
		};
	var point=new BMap.Point(hospital.Longitude,hospital.Latitude);
	var localsearch=new BMap.LocalSearch(point,searchOptions);
	localsearch.searchNearby('公交站',point,400);
}

//批量搜索公交站，更新总的公交站数量到目录树
var batchStations=function(tree,node){
	stations={};	

	for(var i in hospitals){
		searchStation(hospitals[i],tree,node);
	}

	
}
//显示公交站
var showStations=function(showNodes){
	if(showNodes.length==0)
		return;
	var geolist={},geodata=[];
	for(i in showNodes){
			st=stations[showNodes[i].FacilityName];
			for(var x in st){
				var station=st[x];
				geolist[station.StationName]=[station.Longitude,station.Latitude];
			geodata.push({name:station.StationName,
				Distance:station.Distance,
				Duration:station.Duration,
				BusLines:station.BusLines,
				Hospital:showNodes[i].FacilityName,
				Latitude:station.Latitude,
				Longitude:station.Longitude
				});
			}
	}
	var oldseries=myChart.getSeries()[0];

	var stationseries=makeSeries('公交站', geolist, geodata);
	stationseries.markPoint.symbol='image://./images/busstop.jpg';
	stationseries.markPoint.symbolSize=5;
	stationseries.tooltip={
			trigger:'item',
			formatter:function(params){
				showstr='公交站:'+params.name+'<br/>';
				showstr+='附近医院：'+params.data.Hospital+'<br/>';
				showstr+='步行距离：'+params.data.Distance+'(米）<br/>';
				showstr+='步行时间:'+params.data.Duration+'（秒)<br/>';
				var lines=params.data.BusLines.split(';');
				for(var l=0;l<lines.length;l++){
					if(l>0&&l%5==0){
						lines.splice(l,0,'<br/>');
					}
				}
				lines=lines.join(';');
				showstr+='途经公交：'+lines+'<br/>';
				return showstr;
			}
	}
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
	    		symbol:'image://./images/cross.jpg',
	            symbolSize :10,
                effect : {
                    show: false,
                    shadowBlur : false
                },
                itemStyle:{
                    normal:{
                        label:{show:true},
                    }
                },
                data:geodata,
	    	}
	    };  
}


//查找从医院到公交站的步行路径
var searchWalk=function(hospital,station){
	var hpoint=new BMap.Point(hospital.Longitude,hospital.Latitude);
	var stpoint=new BMap.Point(station.Longitude,station.Latitude);
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
				station.Distance=distance;
				station.Duration=duration;
				station.Pathstr=pathstr;
				stations[hospital.FacilityName][station.StationName]=station;			
				}
			}
	};
	var walking=new BMap.WalkingRoute(BDMap,walkOptions);
	walking.search(hpoint,stpoint);
	walking.disableAutoViewport();	
}
//数据分析
var hospitalAnalyze=function(leaves){
	if(leaves.length==0)
		return;
	$('#modalChart').on('shown.bs.modal',function(e){
		$(this).find('.modal-title').text('公交站便利性分析');
		makeScatters('modalchartbody',leaves);		
	}).modal();
};

//创建散点图
var makeScatters=function(showdiv,showNodes){
	if(showNodes.length==0)
		return;
	var seriesdata={}
	var avgfloor=6514;
	//生成数据seriesdata['行政区域']=[{name:'医院>公交站',value:[公交线路数,公交距离,医院面积]},...]
	for(i in showNodes){
			st=stations[showNodes[i].FacilityName];
			if(!seriesdata[showNodes[i].AdminArea])
				seriesdata[showNodes[i].AdminArea]=[];
			for(var x in st){
				var station=st[x];
				var size=showNodes[i].Floorspace*10/avgfloor;
				if(size>20)
					size=20;
				if(size<5)
					size=5;
				seriesdata[showNodes[i].AdminArea].push(
						{name:showNodes[i].FacilityName+'>'+station.StationName,
						value:[station.BusLines.split(';').length,station.Distance,size]});
			}
	}
	//console.log(seriesdata);
	var scatterseries=[];
	//生成series
	for(var n in seriesdata){
		var ss={
				'name':n,
				'type':'scatter',
				  markLine : {
                      data : [
                          {type : 'average', name: '平均距离', itemStyle:{normal:{borderColor:'blue'}}},
                          {type : 'average', name: '平均线路数', valueIndex :0, itemStyle:{normal:{borderColor:'blue'}}}
                      ]
                  },
                  markPoint : {
                      data : [
                          {type : 'max', name: '最大值'},
                          {type : 'min', name: '最小值'}
                      ]
                  },
                  symbolSize :function(value){
                	  return value[2];
                  },
                  'data':seriesdata[n],
		};
		scatterseries.push(ss);
	}
	var legend=[];
	for(var n in seriesdata){
		legend.push(n);
	}

	require([
        'echarts',
        'echarts/chart/scatter',],
        function(ec){
		var modalchart=ec.init($('#'+showdiv)[0]);
		var modaloption = {
		           title : {
		                'text':'公交线路数vs站点距离',
		            },
		            legend:{data:legend},
		            tooltip : {
		                trigger: 'axis',
		                showDelay : 0,
		                axisPointer:{
		                    show: true,
		                    type : 'cross',
		                    lineStyle: {
		                        type : 'dashed',
		                        width : 1
		                    }
		                },
		                formatter : function (params) {
		                	//console.log(params);
		                    if (params.value.length > 1) {
		                        return params.seriesName + ' :'+params.name+'<br/>'
		                           +'公交线路数:'+ params.value[0] + '条<br>' 
		                           +'医院到公交站距离:'+ params.value[1] + '米 ';
		                    }
		                  
		                },  
		            },
		            toolbox : {
		                'show':false, 
		            },
		            grid : {'y':80,'y2':100},
		            xAxis : [{
		                'type':'value',
		                'name':'公交线路数（条）'
		            }],
		            yAxis : [{
		                'type':'value',
		                'name':'站点距离(米)'
		            }],
		            series:scatterseries,
		            
		};
		modalchart.setOption(modaloption);
		window.onresize = modalchart.resize;
	});
}

//判断数据字典对象是否为空
function isEmptyObject(o){
	var t;
	for(t in o){
		return !1;
	}
	return !0;
}




