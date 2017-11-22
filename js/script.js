var svg = d3.select("#main svg");


// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

svg.append("image")
    .attr("xlink:href", "atl.PNG")
    .attr('image-rendering','optimizeQuality')
    .attr("x", 0)
    .attr("y", -20)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr('transform', 'scale('+[1, 1.05]+')');


var geoCell = svg.append('g')
    .attr('transform', 'translate('+[0, 0]+')');

var HIST_CELL_X = svgWidth / 3 * 2;

var TABLE_CELL_X = svgWidth / 3 * 2;
var TABLE_CELL_Y = svgHeight / 2;

var geoWidth = svgWidth /3;
var geoHeight = svgHeight;

var histWidth = svgWidth - HIST_CELL_X;
var histHeight = svgHeight - TABLE_CELL_Y;

var tableWidth = svgWidth - TABLE_CELL_X;
var tableHeight = svgHeight - TABLE_CELL_Y;

var histCell = svg.append('g')
    .attr('transform', 'translate('+[HIST_CELL_X, 0]+')');

var tableCell = svg.append('g')
    .attr('transform', 'translate('+[TABLE_CELL_X, TABLE_CELL_Y]+')');

histCell.selectAll('rect').data(['h'])
    .enter().append('rect')
    .attr('class', 'bg')
    .attr('fill','#ffffff')
    .attr('width', histWidth)
    .attr('height', histHeight);

tableCell.selectAll('rect').data(['h'])
    .enter().append('rect')
    .attr('class', 'bg')
    .attr('fill','#ffffff')
    .attr('width', tableWidth)
    .attr('height', tableHeight);

var padding = {l: 10, r: 10, t: 10, b: 10};

var owner_color_map = {
  0:"#0d2526",
  1:"#370533",
  2:"#176d5d",
  3:"#080540",
};


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

function setApprCells() {
    histCell.selectAll('.dot').remove()
    //etc
    //make buttons for years
}


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

    geoXScale = d3.scaleLinear()
      .domain([-84.415, -84.410])
      .range([185, geoWidth]);

    console.log((d3.extent(data, function(d){return d.y})));
    geoYScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d){return d.y}))
      .range([geoHeight-60, 30]);

    attr = 'appr';
    color_attr = 'owner_code';
    year = 14;
    map = owner_color_map;

    histXScale = d3.scaleLog()
    .domain([1, 409])
    .range([padding.r, histWidth-padding.l]);

    histYScale = d3.scaleLinear()
      .domain([0,25])
      .range([histHeight- padding.b, padding.t]);

    step_size = step_sizes[attr]

    updateHist();
    updateGeo();

});

var step_sizes = {
    'appr' : 5000
    };

var counts = {};
function histBins(appr_value) {
  var x = parseInt(appr_value / step_size) + 1;
  if (x in counts){
      counts[x] += 1;
      return [x, counts[x]];
  } else {
    counts[x] = 0;
    return [x, 0];
  }
}


//keep track of attr, coloring, year, color map
function updateHist() {

    counts = {};

    var dots = histCell.selectAll('.dot')
    .data(data.sort(function(a,b) {return d3.ascending(a[color_attr], b[color_attr])}), function(d) {return d.id});


    var dotsEnter = dots.enter()
    .append('circle')
    .attr('r', 4)
    .attr('class', 'dot')
    .style('stroke', '#ffffff')
    .style('fill', function(d) {return colorScale(d, color_attr, map)})
    .on('mouseover', function(d) {select_points(d);})
    .on('mouseout', function(d) {deselect_points(d);});

    dots.merge(dotsEnter)
    .transition()
    .duration(750)
    .attr('transform', function(d) {
    var t = histBins(d[attr+'_'+year]);
    return 'translate('+[histXScale(t[0]), histYScale(t[1])]+')';
    });
}

function updateGeo() {
  
  var bars = geoCell.selectAll('.bar')
    .data(data, function(d) {
        return {appr : d[attr + '_' + year]};
      });
      
  var barsEnter = bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) {return geoXScale(d.x);})
    .attr('y', function(d) {return geoYScale(d.y);})
    .attr('width', 5)
    .attr('height', 5)
    
    .style('stroke', '#ffffff')
    .on('mouseover', function(d) {select_points(d);})
    .on('mouseout', function(d) {deselect_points(d);});

  bars.merge(barsEnter)
    .transition()
    .duration(750)
    // .style('fill', function(d) {
    //     var bin = histBins(d['appr_'+year])[0];
    //     return d3.hsv(180, 1, bin/20.0);
    //   });
}

function colorScale(d, attr, map) {
  if (d[attr] in map){
    return map[d[attr]];
  }
  
  return "#E0E2E3";

}

function select_points(point) {
  svg.selectAll(".dot")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  svg.selectAll(".bar")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  d3.selectAll(".table").remove();

  var table = tableCell.selectAll('div')
    .data([point])
    .enter().append('g')
    .attr('class', 'table')
    .attr('id', '1')
    .attr('transform', 'translate('+[200,50]+')');
    
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
  svg.selectAll('.hidden').classed('hidden', false);
  d3.selectAll(".table").remove();
}