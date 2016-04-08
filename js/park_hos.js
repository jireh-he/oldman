/**
 * 
 */

d3.json("js/park_hospital.json",function(error,data){
	if (error) return console.warn(error);
	console.log(data);
	rankList(data);
});

var rankList=function(data){
	d3.select("#paihang svg").remove();
	var svg=d3.select("#paihang")
	.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
	var maxcnt=d3.max(d3.map(data,function(d){return d.count}));
	var xRangeWidth=width-margin.left-margin.right;
	var yRangeHeight=height-margin.top-margin.bottom;
	var xScale=d3.scale.linear().domain([0,maxcnt]).range([xRangeWidth,0]);
	var yScale=d3.scale.ordinal().domain(d3.map(data,function(d) {
		return d.zdm;		
	})).rangeRoundBands([0,yRangeHeight],0.1);
	var rect=svg.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("width",function(d){return xScale(d.count)-xScale(0)})
				.attr("height",yScale.rangeBand())
				.attr("x",function(d){return xScale(d.count)})
				.attr("y",function(d){return yScale(d.zdm)})
				.style("fill","steelblue")
				.attr("transform","translate(" + margin.left + "," + margin.top +  ")");
	   //添加坐标轴
    var xAxis=d3.svg.axis()
        .scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left");

    svg.append("g")
			.attr("class","x axis")
			.attr("transform","translate(" + margin.left + "," + (height-margin.bottom) +  ")")
			.call(xAxis)
			.append("text")
            .style("text-anchor", "end")
            .text("人次或人数");

	svg.append("g")
			.attr("class","y axis")
			.attr("transform","translate(" + margin.left + "," + (height - margin.bottom - yRangeHeight) +  ")")
			.call(yAxis);
	
}