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

var HIST_CELL_X = (svgWidth / 2.5);
var HIST_CELL_Y = svgHeight / 3;

var TABLE_CELL_X = (svgWidth / 2.5);
var TABLE_CELL_Y = 0;

var geoWidth = svgWidth /3;
var geoHeight = svgHeight;

var histWidth = svgWidth - HIST_CELL_X;
var histHeight = svgHeight - HIST_CELL_Y;

var tableWidth = svgWidth - TABLE_CELL_X;
var tableHeight = svgHeight - histHeight;



var tableCell = svg.append('g')
    .attr('transform', 'translate('+[TABLE_CELL_X, TABLE_CELL_Y]+')');

var histCell = svg.append('g')
    .attr('transform', 'translate('+[HIST_CELL_X, HIST_CELL_Y]+')');

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

var tlPadding = 50;

years = ['2014', '2015', '2016', '2017']
timelineScale = d3.scaleLinear()
    .domain([0, years.length-1])
    .range([0, svgHeight/2])

var timeLine = svg.append('g')
    .attr('transform', 'translate('+[tlPadding, tlPadding]+')');

timeLine.selectAll('rect').data(['h'])
    .enter().append('rect')
    .attr('x', -5)
    .attr('class', 'hidden')
    .attr('fill','#ffffff')
    .attr('width', 10)
    .attr('height', svgHeight/2);

var yearNodes = timeLine.selectAll("g node")
    .data(years);

var nodesEnter = yearNodes.enter()
    .append('g')
    .attr('id', function(d){return 'node'+d})
    .attr('class', 'time-node')
    .attr('transform', function(d, i) {return 'translate('+[0, timelineScale(i)]+')'})
    .on('click', function(d){setYear(d);});

nodesEnter.append('circle')
    .attr('fill', '#ffffff')
    .attr('stroke', '#555')
    .attr('r', 20);

nodesEnter.append('text')
    .text(function(d){return d})
    .attr('transform', 'translate(-14, 5)');

var padding = {l: 20, r: 200, t: 30, b: 180};

var year;
var validYears;

var owner_color_map = {
  0:"#176D5D",
  1:"#32021F",
  2:"#DB5375",
  3:"#564D65",
};

timelineScale = d3.scaleLinear()
    .domain([0, years.length-1])
    .range([0, svgHeight/6])

var legendNodes = histCell.selectAll('g legend')
  .data(['Person Owned', 'Investor Owned', 'Church Owned', 'Non-profit/Gov\'t Owned'])

var lNodesEnter = legendNodes.enter()
  .append('g')
  .attr('transform', function(d, i) {return 'translate('+[30, padding.t + 70 + timelineScale(i)]+')'});

lNodesEnter.append('circle')
    .attr('fill', function(d,i) {return owner_color_map[i];})
    .attr('stroke', '#ffffff')
    .attr('r', 6);

lNodesEnter.append('text')
    .text(function(d){return d})
    .attr('transform', 'translate(12, 5)');




var color_status_map = {"Abandoned Lot": "#801515",
  "Vacant Lot": "#801515",
  "Fire Damaged Structure": "#B50009",
  "Vacant - Dilapidated": "#682501",
  "Vacant - Needs Improvement": "#682C01",
  "Vacant - Good Condition": "#B85500",
  "Occupied - Dilapidated": "#85162E",
  "Occupied - Needs Improvement": "#64105A",
  "Occupied - Good Condition": "#126E22",
  "Business - Operational": "#162955",
  "Church": "#FCE433",
  "NULL": "#E0E2E3"};

var status_list = Object.keys(color_status_map);

function setApprCells() {
    histCell.selectAll('.x-axis').remove();
    histCell.selectAll('.title').remove();

    validYears = ['2014','2015','2016'];

    attr = 'appr';
    color_attr = 'owner_code';
    
    map = owner_color_map;

    histXScale = d3.scaleLog()
    .domain([1, 409])
    .range([padding.r, histWidth-padding.l]);

    histYScale = d3.scaleLinear()
      .domain([0,25])
      .range([histHeight- padding.b, padding.t]);

    gradientScale = d3.scaleLog()
      .domain([1, 409])
      .range(["#AA2258", "#23DD99"])
      .interpolate(d3.interpolateHcl);


    step_size = step_sizes[attr]

    //TODO make a better fix -> check what attr is active
    
    year = null;
    setYear('2014');

    //make axis
    var histXAxis = histCell.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, histHeight-padding.b]+')')
    .call(d3.axisBottom(histXScale)
      .tickValues([1,2,3,4,5,7,10, 15,21,25, 39, 53, 151, 410])
      .tickFormat(function(d) {return '< $'+d3.format(".2s")(d*5000)}))
    .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")
      .on('mouseover', function(d) {
        d3.select(this)
          .style('fill', gradientScale(d))
          .style('stroke', '#000000');
        set_fill(d);
      })
      .on('mouseout', function(d) {
        d3.select(this).style('fill', '#000000')
          .style('stroke', 'none');
        deselect_points(d);
      });

     histCell.append('text')
      .text('Home Appraisal Values')
      .attr('class', 'title')
      .attr('transform', 'translate('+[350, 20]+')');
}

function set_fill(point) {
  svg.selectAll(".bar")
    .classed("hidden", function(d){
        return parseInt(d[attr+'_'+year]/step_size) + 1 != point;
    });

  svg.selectAll(".dot")
    .classed("hidden", function(d){
        return parseInt(d[attr+'_'+year]/step_size) + 1 != point;
    });
}

function setTaxCells() {
    validYears = ['2014','2015','2016'];
    histCell.selectAll('.x-axis').remove();
    histCell.selectAll('.title').remove();

    attr = 'tax';
    color_attr = 'owner_code';
    step_size = step_sizes[attr];

    map = owner_color_map;

    histXScale = d3.scaleLog()
    .domain([1,153])
    .range([padding.r, histWidth-padding.l]);

    //TODO remove placeholder
    histYScale = d3.scaleLinear()
      .domain([0,100])
      .range([histHeight- 55, padding.t]);

    gradientScale = d3.scaleLog()
      .domain([1,153])
      .range(["#AA2258", "#23DD99"])
      .interpolate(d3.interpolateHcl);
    year = null;

    setYear('2014');

    var histXAxis = histCell.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, histHeight-55]+')')
    .call(d3.axisBottom(histXScale)
      //TODO make scales for every year
      .tickValues([1,2,3,4,5,8,9, 10,14,16, 19, 24, 29, 95,127,152])
      .tickFormat(function(d) {return '< $'+d3.format(".2s")(d*200)}))
    .selectAll("text")  
     .style("text-anchor", "end")
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", "rotate(-65)")
     .on('mouseover', function(d) {
        d3.select(this)
          .style('fill', gradientScale(d))
          .style('stroke', '#000000');
        set_fill(d);
      })
      .on('mouseout', function(d) {
        d3.select(this).style('fill', '#000000')
          .style('stroke', 'none');
        deselect_points(d);
      });

     histCell.append('text')
      .text('Property Taxes')
      .attr('class', 'title')
      .attr('transform', 'translate('+[350, 20]+')');

}

function setOccupancyCells() {
    histCell.selectAll('.title').remove();
    histCell.selectAll('.x-axis').remove();
    validYears = ['2015', '2017'];

    attr = 'status_code';
    color_attr = 'owner_code';
    
    map = owner_color_map;

    histXScale = d3.scaleLinear()
        .domain([1, status_list.length])
        .range([padding.r, histWidth-padding.l]);

    histYScale = d3.scaleLinear()
      .domain([0,28])
      .range([histHeight-padding.b, padding.t]);

    gradientScale = d3.scaleLog()
      .domain([1, status_list.length])
      .range(["#AA2258", "#23DD99"])
      .interpolate(d3.interpolateHcl);

    step_size = 1;

    year = null;
    setYear('2015');

    //make axis
    var histXAxis = histCell.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, histHeight-padding.b]+')')
    .call(d3.axisBottom(histXScale)
      .tickFormat(function(d) {return status_list[d-1]}))
    .selectAll("text")  
     .style("text-anchor", "end")
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", "rotate(-65)")
     .on('mouseover', function(d) {
        d3.select(this)
          .style('fill', gradientScale(d))
          .style('stroke', '#000000');
        set_fill(d);
      })
      .on('mouseout', function(d) {
        d3.select(this).style('fill', '#000000')
          .style('stroke', 'none');
        deselect_points(d);
      });

    histCell.append('text')
      .text('Occupancy Status')
      .attr('class', 'title')
      .attr('transform', 'translate('+[350, 20]+')');
}



function setYear(yearStr) {
    new_year = parseInt(yearStr) - 2000;
    if ((year == null || year != new_year) && validYears.includes(yearStr)) { //add some other conditionals too
        year = new_year;
        svg.selectAll(".time-node")
            .classed("selected", function(d){
                return d == yearStr;
            });
        svg.selectAll(".time-node")
            .classed("hidden", function(d){
                return !validYears.includes(d);
            });

        updateHist();
        updateGeo();
    }
}


d3.csv("./Brawley-Street-Built-Environment.csv", 
  function(d,i){
    return {
      st_number: +d["SITUS STREET NUMBER17"],
      st_name: d["SITUS ADDRESS17"],
      appr_16: +d["TOTAL APPRAISED16"],
      x: +d.x,
      y: +d.y,
      owner_16: d["CURRENT OWNER NAME16"],
      appr_15: +d["TOTAL APPRAISED15"],
      appr_14: +d["TOTAL APPRAISED14"],
      status_code_15: status_list.indexOf(d["CODE15"]),
      status_code_17: status_list.indexOf(d["Built Environment CODE17"]),
      status_15: d["CODE15"],
      status_17: d["Built Environment CODE17"],
      tax_14: +d["TOTAL TAX DUE 2015"],
      tax_15: +d["TOTAL TAX DUE 2016"],
      tax_16: +d["total tax due 2017"],
      owner_code: +d["owner_code"],
      id: d['OBJECTID1'],
      index: i,
      neighborhood: d['NEIGHBORHOOD']
    };
  },


  function(error, dataset) {
    if (error) {console.log(error)};
    data = dataset;

    geoXScale = d3.scaleLinear()
      .domain([-84.4145, -84.4105])
      .range([185, geoWidth]);

    geoYScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d){return d.y}))
      .range([geoHeight-60, 30]);

    //console.log(validYears);
    setApprCells();
});

var step_sizes = {
    'appr' : 5000,
    'tax' : 20
    };

var counts = {};
function histBins(d) {
  var value = d[attr+'_'+year];
  //console.log(value);

  var x = parseInt(value / step_size) + 1;
  //console.log(x)
  if (value == 'NULL') {
    x = 0;
  }
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
      var t = histBins(d);
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
    .attr('width', 10)
    .attr('height', 5)
    .style('stroke', '#ffffff')
    .on('mouseover', function(d) {select_points(d);})
    .on('mouseout', function(d) {deselect_points(d);});

  bars.merge(barsEnter)
    .style('fill', function(d) {
        var bin = histBins(d)[0];
        return gradientScale(bin);
      });

  bars.exit().remove();
}

function colorScale(d, attr, map) {
  if (d[attr] in map){
    return map[d[attr]];
  }
  
  return "#E0E2E3";

}

function select_points(point) {
  console.log(parseInt(point[attr+'_'+year]/step_size) + 1);

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
    .attr('transform', 'translate('+[tableWidth / 2.1,75]+')');
    
  table.append('text')
    .text(point.st_number + ' ' + point.st_name)
    .attr('transform', 'translate('+[0,-15]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('Owner | ' + point.owner_16)
    .attr('transform', 'translate('+[-150,15]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('Neighborhood | ' + point.neighborhood)
    .attr('transform', 'translate('+[-150,30]+')')
    .style("text-anchor", "middle");
    

  table.append('text')
    .text('2014 Appraisal | $' + point.appr_14)
    .attr('transform', 'translate('+[-150,60]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2015 Appraisal | $' + point.appr_15)
    .attr('transform', 'translate('+[-150,75]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2016 Appraisal | $' + point.appr_16)
    .attr('transform', 'translate('+[-150,90]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2015 Occupancy Status | ' + point.status_15)
    .attr('transform', 'translate('+[150,15]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2017 Occupancy Status | ' + point.status_17)
    .attr('transform', 'translate('+[150,30]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2014 Property Tax | $' + point.tax_14)
    .attr('transform', 'translate('+[150,60]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2015 Property Tax | $' + point.tax_15)
    .attr('transform', 'translate('+[150,75]+')')
    .style("text-anchor", "middle");

  table.append('text')
    .text('2016 Property Tax | $' + point.tax_16)
    .attr('transform', 'translate('+[150,90]+')')
    .style("text-anchor", "middle");

  //table.merge(tableEnter);
    
}

//TODO remove param
function deselect_points(d) {
  svg.selectAll('.dot.hidden').classed('hidden', false);
  svg.selectAll('.bar.hidden').classed('hidden', false);
  d3.selectAll(".table").remove();
}