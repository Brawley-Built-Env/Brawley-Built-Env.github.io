// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateApprChart(event.value.newValue);
});

$("#yearSlider2").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider2").on('change', function(event){
    // Update the chart on the new value
    updateStatusChart(event.value.newValue);
});

var svg = d3.selectAll('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 40, l: 40};

svg.append("svg:image")
    .attr("xlink:href", "brawley_map.PNG")
    .attr("x", -4)
    .attr("y", 10)
    .attr("width", chartWidth)
    .attr("height", chartHeight);

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-2, 2])
  .html(function(d) {
      return "<h5>"+d.st_number + " " + d.st_name+"</h5><table><thead><tr><td>Appraisal Value</td></thead>"
             + "<tbody><tr><td>"+d.appr_16+"</td></tr></tbody></table>"
  });

svg.call(toolTip);

d3.csv("../data/Brawley-Street-Built-Environment.csv", 
  function(d){
    return {
      st_number: +d["SITUS STREET NUMBER17"],
      st_name: d["SITUS ADDRESS17"],
      appr_16: +d["TOTAL APPRAISED16"],
      x: +d.x,
      y: +d.y,
      fulton_16: +d["FULTON TOTAL DUE16"],
      atl_16: +d["CITY TOTAL DUE16"],
      owner_16: d["CURRENT OWNER NAME16"],
      appr_15: +d["TOTAL APPRAISED15"],
      appr_14: +d["TOTAL APPRAISED14"],
      status_15: d["CODE15"],
      status_17: d["Built Environment CODE17"]
    };
  },

  function(error, dataset) {
    if (error) {console.log(error)};
    data = dataset;

    xScale = d3.scaleLinear()
      .domain([-84.415, -84.410])
      .range([0, chartHeight]);

    yScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d){return d.y}))
      .range([0, chartWidth]);

    console.log(d3.extent(data, function(d){return d.y}));

    apprScale = d3.scaleLog()
      .domain([1, d3.max(data, function(d) {return d.appr_16})])
      .range([0,chartHeight/2.0]);

    chartAppr = d3.select("#appr svg").append('g')
          .attr('transform', 'translate('+[padding.l, padding.t]+')');

    chartStatus = d3.select('#stat svg').append('g')
          .attr('transform', 'translate('+[padding.l, padding.t]+')');

    updateApprChart(2014);
    updateStatusChart(2015);
});


function updateApprChart(year) {
  year -= 2000;
  var circles = chartAppr.selectAll('.bar')
      .data(data, function(d) {
        return {appr : d["appr_" + year]};
      });


  var circlesEnter = circles.enter()
      .append('g')
      .attr('class', 'bar')

  
      // .attr('transform', function(d) {
      //     return 'translate('+[yScale(d.y), xScale(d.x)]+')';
      // });

  circlesEnter.append('rect')
      .attr('x', function(d) {return yScale(d.y);})
      .attr('y', function(d) {return xScale(d.x) - ( isNaN(d['appr_'+year]) ? 1 : apprScale(d['appr_'+year]));})
      .attr('width', 6)
      .attr('height', function(d) {return isNaN(d['appr_'+year]) ? 1 : apprScale(d['appr_'+year]);})
      .style('fill', "#2C514C")
      .style('stroke', '#ffffff');

  circlesEnter
    .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  circles.merge(circlesEnter);

  circles.exit().remove();
}

var color_status_map = {"Abandoned Lot": "#801515",
  "Business - Operational": "#162955",
  "Church": "#FCE433",
  "Fire Damaged Structure": "#B50009",
  "Occupied - Dilapidated": "#85162E",
  "Occupied - Good Condition": "#126E22",
  "Occupied - Needs Improvement": "#64105A",
  "Vacant - Dilapidated": "#682501",
  "Vacant - Good Condition": "#B85500",
  "Vacant - Needs Improvement": "#682C01",
  "Vacant Lot": "#801515"};

function colorScale(d, year) {
  if (d['status_' + year] in color_status_map){
    return color_status_map[d['status_' + year]];
  }
  
  return "#E0E2E3";

}

function updateStatusChart(year) {
  year -= 2000;
  var circles = chartStatus.selectAll('.dot')
      .data(data, function(d) {
        return {appr : d["appr_" + year]};
      });


  var circlesEnter = circles.enter()
      .append('g')
      .attr('class', 'dot')

  circlesEnter.append('circle')
      .attr('cx', function(d) {return yScale(d.y);})
      .attr('cy', function(d) {return xScale(d.x);})
      .attr('r', 6)
      .style('fill', function(d) {return colorScale(d, year);})
      .style('stroke', '#ffffff');

  circlesEnter
    .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  circles.merge(circlesEnter);

  circles.exit().remove();
}