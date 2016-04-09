/**
 * 
 */

d3.json("js/park_hospital.json",function(error,data){
	if (error) return console.warn(error);
	var points=data.points.filter(function(p){
		return (p.zdm.indexOf("公园")>0);
	}).sort(function(a,b){return (b.count-a.count)}).slice(0,9);
	
	margin.left=120;
	rankList(points);
	drawRadio(data);
});
var drawRadio=function(data){
	var radios=d3.select("#paihang").insert("div","svg")
    .attr("class","legend");
	radios.append("label").attr("class","radio-inline").html("<input type='radio' name='park_hosp' id='park_hosp' value='hosp'>医院排行")
    .style("float","right")
    .style("right","100px").on("change",function(){
    	points=data.points.filter(function(p){
    		return (p.zdm.indexOf("医院")>0);
    	}).sort(function(a,b){return (b.count-a.count)}).slice(0,9);
    	
    	rankList(points);
});
radios.append("label").attr("class","radio-inline").html("<input type='radio' name='park_hosp' id='park_hosp' value='park' checked>公园排行")
    .style("float","right")
    .style("right","150px")
    .on("change",function(){
    	points=data.points.filter(function(p){
    		return (p.zdm.indexOf("公园")>0);
    	}).sort(function(a,b){return (b.count-a.count)}).slice(0,9);
    	rankList(points);
    });
}
var rankList=function(data){
	d3.select("#paihang svg").remove();
	var svg=d3.select("#paihang")
	.append("svg")
    .attr("width", width*0.9)
    .attr("height", height);
	
	var maxcnt=d3.max(data,function(d){return d.count});
	
	var xRangeWidth=width*0.9-margin.left-margin.right;
	var yRangeHeight=height-margin.top-margin.bottom;
	var xScale=d3.scale.linear().domain([0,maxcnt]).range([0,xRangeWidth]);
	var yScale=d3.scale.ordinal().domain(d3.map(data,function(d) {
		return d.zdm;		
	}).keys()).rangeRoundBands([0,yRangeHeight],0.1);
		
	var rect=svg.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("width",function(d){return xScale(d.count)-xScale(0)})
				.attr("height",yScale.rangeBand())
				.attr("x",margin.left)
				.attr("y",function(d){return margin.top+yScale(d.zdm);})
				.style("fill","steelblue")
				.on("click",function(d){
					showPano(d);
				});
	//添加文字元素
	var texts = svg.selectAll(".MyText")
	        .data(data)
	        .enter()
	        .append("text")
	        .attr("class","MyText")
	        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
	        .attr("x", function(d){
	            return xScale(10);
	        } )
	        .attr("y",function(d){
	            return yScale(d.zdm);
	        })
	        .attr("dx",function(d){
	        	return xScale(d.count)/2;
	        })
	        .attr("dy",function(d){
	        	return 20;
	        })
	        .text(function(d){
	            return d.count;
	        });
	   //添加坐标轴
    var xAxis=d3.svg.axis()
        .scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left");

    svg.append("g")
			.attr("class","x axis")
			.attr("transform","translate("+margin.left+"," + (height-margin.bottom) +  ")")
			.call(xAxis);

	svg.append("g")
			.attr("class","y axis")
			.attr("transform","translate(" + margin.left + "," + (height - margin.bottom - yRangeHeight) +  ")")
			.call(yAxis);
	
}

