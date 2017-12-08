d3.selectAll('.btn-group > .btn.btn-dark')
  .on('click', function() {
      var attr = d3.select(this).attr('data-type');
      if (attr == "status_code") {
        setOccupancyCells();
      } else if (attr == "tax") {
        setTaxCells();
      } else {
        setApprCells();
      }
      d3.selectAll('.btn.btn-dark.active').classed('active', false);
  });

var svg = d3.select("#main svg");
var pie_svg = d3.select("#pie svg");


// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');


//map in background
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

//put transparent background for histogram and table cells
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

//neighborhood labels
svg.selectAll('.neighborhoodLabel')
  .data(['English Ave', 'Vine City']).enter()
  .append('text')
  .attr('class', 'neighborhoodLabel')
  .text(function(d) {return d})
  .attr('transform', function(d,i) {return 'translate('+[140, 50+i*300]+')';})

//Set up timeline
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
    .attr('fill','#000000')
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
  0:"#BC96E6",
  1:"#136F63",
  2:"#DB5375",
  3:"#FFC145",
};

timelineScale = d3.scaleLinear()
    .domain([0, years.length-1])
    .range([0, svgHeight/6])


histCell.append('text')
.text('Number')
.attr('transform', 'translate(165, 35)')
.attr('text-anchor', 'end');

histCell.append('text')
.text('of Parcels')
.attr('transform', 'translate(165, 50)')
.attr('text-anchor', 'end');
//Set up histogram legend
var legendNodes = histCell.selectAll('g legend')
  .data(['Owner-Occupant/Rental', 'Investor', 'Church', 'Non-Profit/State Owned'])

var lNodesEnter = legendNodes.enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {return 'translate('+[15, padding.t + 90 + timelineScale(i)]+')'});

lNodesEnter.append('circle')
    .attr('fill', function(d,i) {return owner_color_map[i];})
    .attr('stroke', '#000000')
    .attr('r', 6);

lNodesEnter.append('text')
    .text(function(d){return d})
    .attr('transform', 'translate(12, 5)');

lNodesEnter
  .on('mouseover', function(d,i) {select_legend(i);})
  .on('mouseout', function(d) {deselect_points(d);});

function select_legend(legend_val) {
  svg.selectAll(".bar")
    .classed("hidden", function(d){
        return d.owner_code != legend_val;
    });

  svg.selectAll(".dot")
    .classed("hidden", function(d){
        return d.owner_code != legend_val;
    });

  svg.selectAll('.legend')
    .classed("hidden", function(d,i){
        return i != legend_val;
    });
}


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
    histCell.selectAll('.y-axis').remove();
    histCell.selectAll('.title').remove();
    pie_svg.selectAll('.title').remove();

    validYears = ['2014','2015','2016'];

    attr = 'appr';
    color_attr = 'owner_code';
    
    map = owner_color_map;

    histXScale = d3.scaleLog()
    .domain([1, 409])
    .range([padding.r, histWidth-padding.l]);

    histYScale = d3.scaleLinear()
      .domain([0,26])
      .range([histHeight- padding.b, padding.t]);

    gradientScale = d3.scaleLog()
      .domain([1, 409])
      .range(["#AA2258", "#23DD99"])
      .interpolate(d3.interpolateHcl);


    step_size = step_sizes[attr]

    //TODO make a better fix -> check what attr is active
    updatePie();
    
    year = null;
    setYear('2014');

    //make axis
    var histYAxis = histCell.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate('+[padding.r-5,0]+')')
      .call(d3.axisLeft(histYScale));

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
      .attr('transform', 'translate('+[300, 20]+')');

    pie_svg.append('text')
      .text('Home Appraisal Values')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate('+[+pie_svg.attr('width')/2, 40]+')');
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
    histCell.selectAll('.y-axis').remove();

    histCell.selectAll('.title').remove();
    pie_svg.selectAll('.title').remove();

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
      .domain([153,1])
      .range(["#AA2258", "#23DD99"])
      .interpolate(d3.interpolateHcl);

    updatePie();
    year = null;

    setYear('2014');

    var histYAxis = histCell.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate('+[padding.r-5,0]+')')
      .call(d3.axisLeft(histYScale));

    var histXAxis = histCell.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, histHeight-55]+')')
    .call(d3.axisBottom(histXScale)
      //TODO make scales for every year
      .tickValues([1,2,3,4,5,8,10,14,16, 19, 24, 29, 95,127,152])
      .tickFormat(function(d) {return '< $'+d3.format(".2s")(d*20)}))
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
      .text('Back Taxes Owed')
      .attr('class', 'title')
      .attr('transform', 'translate('+[350, 20]+')');

      pie_svg.append('text')
        .text('Back Taxes Owed')
        .attr('class', 'title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+[+pie_svg.attr('width')/2, 40]+')');

}

function setOccupancyCells() {
    histCell.selectAll('.title').remove();
    histCell.selectAll('.y-axis').remove();
    histCell.selectAll('.x-axis').remove();
    pie_svg.selectAll('.title').remove();
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

    updatePie();

    year = null;
    setYear('2015');

    //make axis
    var histYAxis = histCell.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate('+[padding.r-5,0]+')')
      .call(d3.axisLeft(histYScale));

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
    pie_svg.append('text')
        .text('Occupancy Status')
        .attr('class', 'title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+[+pie_svg.attr('width')/2, 40]+')');
}


function updatePie() {
  pie_svg.selectAll('.arc').remove();
  pie_svg.selectAll('.yearLabel').remove();

  pieCenterScale = d3.scaleLinear()
      .domain([0,validYears.length])
      .range([0, +pie_svg.attr('width')])

  pie_svg.selectAll('.yearLabel')
    .data(validYears)
    .enter()
    .append('text')
    .text(function(d) {return d;})
    .attr('class', 'yearLabel title')
    .attr('text-anchor', 'middle')
    .attr('transform', function(d,i) {return 'translate('+[pieCenterScale(i+0.5), 70]+')';});

  var stored_count_list = [];
  for(var i = 0; i < validYears.length; i++) {
    year = parseInt(validYears[i])-2000;
    counts = {};
    for(var j = 0; j < data.length; j++) {
      histBins(data[j]);
    }

    count_list = []
    var count_keys = Object.keys(counts);
    for(var c = 0; c < count_keys.length; c++) {
      var key = count_keys[c];
      count_list.push(
        { 
          index: key,
          count: counts[key]
        });
    }
    stored_count_list.push(count_list);
    var radius = 100;

    

    var pie_ = d3.pie()
      .value(function(d) {return d.count+1;})
      .sort(null);


    var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius+40);

    var arc = pie_svg.append('g')
    .attr('transform','translate('+[pieCenterScale(i+0.5),+pie_svg.attr('height')/2]+')')
    .selectAll(".arc")
    .data(pie_(count_list))
    .enter().append("g")
      .attr("class", "arc");

    

    arc.append("path")
      .attr("d", path)
      .attr("fill", function(d,i) {return gradientScale(+count_list[i].index)})
      .style("stroke", "#000000")
      .attr("class", "bg")

    arc.append("text")
      .attr("class", "invisible")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return Number(((d.endAngle - d.startAngle)/6.283)*100).toFixed(1) + "%"; })
      .attr("text-anchor", "middle");

    arc.append("text")
      .attr("class", "invisible")
      .attr("transform", function(d) { return "translate(" + [label.centroid(d)[0],label.centroid(d)[1] + 15] + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return formatText(d.data.index * step_size);})
      .attr("text-anchor", "middle");

    arc.on('mouseover', function(d,idx) {
        pie_svg.selectAll('.arc path')
        .classed('hidden', 
          function(b,jdx) {return d.data.index != b.data.index;})
        pie_svg.selectAll('.arc text')
        .classed('invisible', 
          function(b,jdx) {return d.data.index != b.data.index;})
      }).on('mouseout', function() {
        pie_svg.selectAll('.arc path')
        .classed('hidden', false);
        pie_svg.selectAll('.arc text')
        .classed('invisible', true);
      })
  }
}

function formatText(str) {
  if (attr == "appr" || attr == "tax") {
    return "<$" + str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {return status_list[parseInt(str)-1];}
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
      .domain([-84.414, -84.411])
      .range([180, geoWidth-5]);

    geoYScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d){return d.y}))
      .range([geoHeight-55, 25]);

    setApprCells();
});

var step_sizes = {
    'appr' : 5000,
    'tax' : 20
    };

var counts = {};
function histBins(d) {
  var value = d[attr+'_'+year];

  var x = parseInt(value / step_size) + 1;
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
    .append('rect')
    .attr('width', 8)
    .attr('height', 8)
    .attr('x', -4)
    .attr('y', -8)
    .attr('class', 'dot')
    .style('stroke', '#000000')
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
    .style('stroke', '#000000')
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
  svg.selectAll(".dot")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  svg.selectAll(".bar")
    .classed("hidden", function(d){
        return point.st_number != d.st_number || point.st_name != d.st_name;
    });

  d3.selectAll(".table").remove();

  tableCell.append('foreignObject')
  .attr('class', 'table')
  .attr('transform', 'translate('+[-175, 20]+')')
  .html("<table><thead><tr><td colspan='4' align=\"center\">"+point.st_number+" "+point.st_name+"</td></tr></thead>"
       + "<tbody><tr><td align=\"right\"><b>Owner</b></td><td>"+point.owner_16+"</td><td align=\"right\"><b>2015 Occupancy</b></td><td>"+point.status_15+"</td></tr>"
       + "<tr><td align=\"right\"><b>Neighborhood</b></td><td>"+point.neighborhood+"</td><td align=\"right\"><b>2017 Occupancy</b></td><td>"+point.status_17+"</td></tr>"
       + "<tr><td align=\"right\"><b>2014 Appraisal</b></td><td>$"+point.appr_14+"</td><td align=\"right\"><b>2014 Back Taxes</b></td><td>$"+point.tax_14+"</td></tr>"
       + "<tr><td align=\"right\"><b>2015 Appraisal</b></td><td>$"+point.appr_15+"</td><td align=\"right\"><b>2015 Back Taxes</b></td><td>$"+point.tax_15+"</td></tr>"
       + "<tr><td align=\"right\"><b>2016 Appraisal</b></td><td>$"+point.appr_16+"</td><td align=\"right\"><b>2016 Back Taxes</b></td><td>$"+point.tax_16+"</td></tr></tbody></table></div>");

}

//TODO remove param
function deselect_points(d) {
  svg.selectAll('.dot.hidden').classed('hidden', false);
  svg.selectAll('.bar.hidden').classed('hidden', false);
  svg.selectAll('.legend.hidden').classed('hidden', false);

  d3.selectAll(".table").remove();
}