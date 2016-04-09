/**
 * 
 */
var tdata;
d3.json("js/park_hospital.json",function(error,data){
	if (error) return console.warn(error);
	tdata=data.points;
	points=data.points.filter(function(p){
		return (p.zdm.indexOf("医院")>0);
	}).sort(function(a,b){return (b.count-a.count)}).slice(0,9);
	margin.left=120;
	rankList(points);
});

var rankList=function(data){
	d3.select("#paihang svg").remove();
	var svg=d3.select("#paihang")
	.append("svg")
    .attr("width", width)
    .attr("height", height);
	var maxcnt=d3.max(d3.map(data,function(d){return d.count}).keys());
	var xRangeWidth=width*0.9-margin.left-margin.right;
	var yRangeHeight=height-margin.top-margin.bottom;
	var xScale=d3.scale.linear().domain([0,maxcnt]).range([0,xRangeWidth]);
	
	var yScale=d3.scale.ordinal().domain(d3.map(data,function(d) {
		return d.zdm;		
	}).keys()).rangeRoundBands([0,yRangeHeight],0.1);

	var rectheight=parseInt(yRangeHeight/data.length);
	var rect=svg.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("width",function(d){return xScale(d.count)-xScale(0)})
				.attr("height",yScale.rangeBand())
				.attr("x",margin.left)
				.attr("y",function(d){return margin.top+yScale(d.zdm);})
				.style("fill","steelblue")
				.text(function(d) {
					return "刷卡人次:"+d.count
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