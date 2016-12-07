//递归执行操作
var  recurseNode=function(tree,node,action){
	tree.treeview(action,[node.nodeId,{silent:true}]);
	if(node.nodes){
		res=node.nodes.map(function(childnode){
		recurseNode(tree,childnode,action);	
	});
	};
};
//获取所有父节点的text
var getParents=function(tree,node){
	var res=[]
	p=node;
	while((p.text!='分析操作')&&(p.text!='行政区域')){
		res.push(p.text);
		p=tree.treeview('getParent',p);
	}
	//console.log(res.reverse())
	return res.reverse();
}
//获取节点条件下的详细记录
var detailNode=function(tree,node){
	parents=getParents(tree,node);
	searchobj={}
	if(parents.length>0){
		var i=0;
		for(i;i<parents.length;i++){
			searchobj[MedicalLevels[i+1]]=parents[i]
		}
	}else{
		searchobj['AdminArea']=node.text;
	}
	//console.log(searchobj);
	return searchKeyword(searchobj);
}

//根据关键字查找对应记录
var searchKeyword=function(obj){
	if(!hospitals||!obj){
		return [];
	}
	var res=[];
	for(var h in hospitals){
		var r=hospitals[h];
		var f=false;
		for(k in obj){
			if(r[k].indexOf(obj[k])>-1){
				f=true;
			}else{
				f=false;
				break;
			}
		}
		if(f){
			res.push(r);
		}
	}
	return res;
	
}

//更新被勾选的所有医院叶节点，并显示在地图上
var updateShowHospitals=function(tree){
	checkedNode=tree.treeview('getChecked',0);
	var leaves=[];
	for(var c in checkedNode){
		if(!checkedNode[c].nodes){
			var detail=detailNode(tree,checkedNode[c]);
			//console.log(detail);
			leaves=leaves.concat(detail);
		}
	}
	showHospitals(leaves);
	return leaves;
}

//更新被勾选的所有公交站叶节点，并显示在地图上
var updateShowStations=function(tree){
	checkedNode=tree.treeview('getChecked',0);
	var leaves=[];
	for(var c in checkedNode){
		if(!checkedNode[c].nodes){
			var detail=detailNode(tree,checkedNode[c]);
			//console.log(detail);
			leaves=leaves.concat(detail);
		}
	}
	showStations(leaves);
	showHospitaltoStations(leaves);
	return leaves;
}
//显示散点图
var showScatters=function(tree){
	checkedNode=tree.treeview('getChecked',0);
	var leaves=[];
	for(var c in checkedNode){
		if(!checkedNode[c].nodes){
			var detail=detailNode(tree,checkedNode[c]);
			//console.log(detail);
			leaves=leaves.concat(detail);
		}
	}
	hospitalAnalyze(leaves);
	return leaves
}

//建立医院目录树
var hospitalTree=function(){
	var hostree=$('#treeview-hospital');
	hostree.treeview({
        data: hospitalData,
        showIcon: true,
        showTags:true,
        showCheckbox: true,
        onNodeChecked: function(event, node) {
				recurseNode(hostree,node,'expandNode');
 				recurseNode(hostree,node,'checkNode');
        	if(['行政区域','分析操作','周边公交','GPS数据下载','百度坐标转GPS','便利分析'].toString().indexOf(node.text)<0){
 				updateShowHospitals(hostree);
        	}
        },
        onNodeUnchecked: function (event, node) {
    	  	  recurseNode(hostree,node,'collapseNode');
			  recurseNode(hostree,node,'uncheckNode'); 
        	if(['行政区域','分析操作','周边公交','GPS数据下载','百度坐标转GPS','便利分析'].toString().indexOf(node.text)<0){

			  updateShowHospitals(hostree);
        	}
        	
      	  
        },
        onNodeSelected: function(event, node) {
        	//console.log(node);
            // 事件代码...
        	if(node.text=='行政区域'){
        		batchHospitals(node);
        	}
        	if(['行政区域','分析操作','周边公交','GPS数据下载','百度坐标转GPS','便利分析'].toString().indexOf(node.text)<0){
   
        		var hls=detailNode(hostree,node);
        		hostree.treeview('getNode',node.nodeId).tags=[hls.length];
        	}
        	if(node.text=='周边公交'){
        		if(isEmptyObject(stations)){
        		batchStations(hostree,node);
        		}else{
        			 //计算stations的数量
	                var cnt=0;
	                for(var e in stations){
	                	cnt++
	                }
	                hostree.treeview('getNode',node.nodeId).tags=[cnt];
        			updateShowStations(hostree);
        			
        		}
        	}
        	if(node.text=='百度坐标转GPS'){
        		if(!isEmptyObject(stations)){
        			changeGps(hostree,node);      				
        			//console.log(alink.attr('href'));
        		}
        	}
        	if(node.text=='GPS数据下载'){
        		if(!isEmptyObject(stations)){
        			downLoadHospitals();      				
        			//console.log(alink.attr('href'));
        		}
        	}
        	if(node.text=='便利分析'){
        		if(!isEmptyObject(stations)){
        			showScatters(hostree);      				
        			//console.log(alink.attr('href'));
        		}
        	}
        		
        }
        
      });
}


var parkTree=function(){
	var parktree=$('#treeview-park');
	parktree.treeview({
        data: parkData,
        showIcon: false,
        showCheckbox: true,
        onNodeChecked: function(event, node) {	
 				recurseNode(parktree,node,'expandNode');
 				recurseNode(parktree,node,'checkNode');       	  
        },
        onNodeUnchecked: function (event, node) {
      	  recurseNode(parktree,node,'collapseNode');
			  recurseNode(parktree,node,'uncheckNode');  
      	  
        }
      });
}