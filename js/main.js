// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateApprChart(event.value.newValue);
    updateApprHist(event.value.newValue);
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

var svg = d3.select("#appr svg");

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 40, l: 40};

var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-2, 2])
  .html(function(d) {
      return "<h5>"+d.st_number + " " + d.st_name+"</h5><table><thead><tr><td>Appraisal Value</td></thead>"
             + "<tbody><tr><td>"+d.appr_16+"</td></tr></tbody></table>"
  });

//can possibly move into csv read method
svg.append("svg:image")
    .attr("xlink:href", "brawley_map.PNG")
    .attr("x", -4)
    .attr("y", 10)
    .attr("width", chartWidth)
    .attr("height", chartHeight);


var svg = d3.select("#stat svg");

svg.append("svg:image")
    .attr("xlink:href", "brawley_map.PNG")
    .attr("x", -4)
    .attr("y", 10)
    .attr("width", chartWidth)
    .attr("height", chartHeight);

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

svg = d3.selectAll("svg");

d3.csv("./Brawley-Street-Built-Environment.csv", 
  function(d,i){
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
      status_17: d["Built Environment CODE17"],
      tax_14: +d["TOTAL TAX DUE 2015"],
      tax_15: +d["TOTAL TAX DUE 2016"],
      tax_16: +d["total tax due 2017"],
      owner_code: +d["owner_code"],
      id: d['OBJECTID1'],
      index: i
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

    apprScale = d3.scaleLog()
      .domain([1, d3.max(data, function(d) {return d.appr_16})])
      .range([0,chartHeight/2.0]);

    

    chartAppr = d3.select("#appr svg").append('g')
          .attr('transform', 'translate('+[padding.l, padding.t]+')');

    chartStatus = d3.select('#stat svg').append('g')
          .attr('transform', 'translate('+[padding.l, padding.t]+')');


    //APPRAISAL HISTOGRAM THINGS
    var svg = d3.select("#appr-hist svg");

    chartApprHist = svg.append('g')
          .attr('transform', 'translate('+[padding.l, padding.t]+')');

    // Get layout parameters
    var svgHistHeight = +svg.attr('height');
    var histHeight = svgHistHeight - padding.t - padding.b;

    histXScale = d3.scaleLog()
    .domain([1, 409])
    .range([0, chartWidth]);

    var histXAxis = chartApprHist.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, histHeight]+')')
    .call(d3.axisBottom(histXScale)
      .tickValues([1,2,3,4,5,7,10, 15,21,25, 39, 53, 150, 400])
      .tickFormat(function(d) {return '<'+d3.format(".2s")(d*5000)}));

    histYScale = d3.scaleLinear()
      .domain([0,25])
      .range([histHeight, 0]);

    //set up bins for histogram
    // bins = histXScale.ticks(300);
    // console.log(bins);

    
    updateApprHist(2014);
    updateApprChart(2014);
    updateStatusChart(2015);
});

var owner_color_map = {
  0:"#54e565",
  1:"#e57a54",
  2:"#4286f4",
  3:"#f4ee41",
};


var counts = {};
function histBins(appr_value) {
  var x = parseInt(appr_value / 5000) + 1;
  if (x in counts){
      counts[x] += 1;
      return [x, counts[x]];
  } else {
    counts[x] = 0;
    return [x, 0];
  }
}

function updateApprHist(year) {
  year -= 2000;

  counts = {};

  var dots = chartApprHist.selectAll('.dot')
    .data(data.sort(function(a,b) {return d3.ascending(a.owner_code, b.owner_code)}), function(d) {return d.id});


  var dotsEnter = dots.enter()
    .append('circle')
    .attr('r', 5)
    .attr('class', 'dot')
    //.attr('id', function(d){return 'a'+d.id})
    .attr('r', 5)
    .style('fill', function(d) {return colorScale(d, 'owner_code', owner_color_map)})
    .on('mouseover', function(d) {select_points(d);})
    .on('mouseout', function(d) {deselect_points(d);});
  
  dots.merge(dotsEnter)
    .transition()
    .duration(750)
    .attr('transform', function(d) {
      var t = histBins(d['appr_'+year]);
      return 'translate('+[histXScale(t[0]), histYScale(t[1])]+')';
    });
  }
  //circles.exit().remove();


    // circles = chartAppr.selectAll('.bar')
    //   .data(data, function(d) {
    //     return {appr : d["appr_" + year]};
    //   });


    // for (var i = 0; i < bins.length; i++) {
    //   var count = 0;
    //   var dotsi = chartAppr.selectAll('.bar' + i)
    //     .data(bins[i]);
        
    //   var dotsEnter = dotsi.enter()
    //     .append('rect')
    //     .attr('class', 'bar')
    //     .attr('x', function(d) {return yScale(d.y);})
    //     .attr('y', function(d) {return xScale(d.x)-5;})
    //     .attr('width', 8)
    //     .attr('height', 8)
    //     .style('fill', d3.rgb(i*10 + 100, 70, 70 + i*10))
    //     .style('stroke', '#ffffff')
    //     .on('mouseover', function(d) {select_points(d);})
    //     .on('mouseout', function(d) {deselect_points(d);});

    //   circles.merge(dotsEnter);
    // }

    // circles.exit().remove();
  



function updateApprChart(year) {
  year -= 2000;
  
  }

  

  // circlesEnter.append('rect')
  //     .attr('x', function(d) {return yScale(d.y);})
  //     .attr('y', function(d) {return xScale(d.x) - ( isNaN(d['appr_'+year]) ? 1 : apprScale(d['appr_'+year]));})
  //     .attr('width', 6)
  //     .attr('height', function(d) {return isNaN(d['appr_'+year]) ? 1 : apprScale(d['appr_'+year]);})
  //     .style('fill', "#2C514C")
  //     .style('stroke', '#ffffff');

  // circlesEnter
  //   .on('mouseover', function(d) {select_points(d);})
  //   .on('mouseout', function(d) {deselect_points(d);});

  // circles.merge(circlesEnter)

  //circles.exit().remove();


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

function colorScale(d, attr, map) {
  if (d[attr] in map){
    return map[d[attr]];
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
      .style('fill', function(d) {return colorScale(d, 'status_'+year, color_status_map);})
      .style('stroke', '#ffffff');

  circlesEnter
    .on('mouseover', function(d) {select_points(d);})
    .on('mouseout', function(d) {deselect_points(d);});

  circles.merge(circlesEnter)

  circles.exit().remove();
}

function select_points(point) {
  d3.selectAll("svg").selectAll(".dot")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  d3.selectAll("svg").selectAll(".bar")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  d3.selectAll(".table").remove();

  var table = d3.select("#appr-hist svg").selectAll('div')
    .data([point])
    .enter().append('g')
    .attr('class', 'table')
    .attr('id', '1')
    .attr('transform', 'translate('+[700,50]+')');
    
  table.append('text')
    .text(point.st_number + ' ' + point.st_name);
    

  table.append('text')
    .text('2014 Appraisal | $' + point.appr_14)
    .attr('transform', 'translate('+[0,15]+')');

  table.append('text')
    .text('2015 Appraisal | $' + point.appr_15)
    .attr('transform', 'translate('+[0,30]+')');

  table.append('text')
    .text('2016 Appraisal | $' + point.appr_16)
    .attr('transform', 'translate('+[0,45]+')');

  //table.merge(tableEnter);
    
}

function deselect_points(d) {
  d3.selectAll("svg").selectAll('.hidden').classed('hidden', false);
  d3.selectAll(".table").remove();
}