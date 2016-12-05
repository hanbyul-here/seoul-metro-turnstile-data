// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = document.getElementById('graph-30min').clientWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse('%Y%m%d');

var formatTime = d3.timeFormat('%m월%d일');

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// set the ranges


// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.totalExits); });

var entryValueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.totalEntries); });

// div for tooltip
var div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select('#graph-30min').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')');

var getDateString = function(ds) {
  var date = parseTime(ds);
  return date;
}

var dates = [];

// Get the data
d3.json('./data/30min-from-center/total-based-on-date.json', function(error, data) {
  if (error) throw error;
  // format the data
  data.reverse();
  dates = [];
  var subData = [];
  var firstTurn = true;


  data.forEach(function(d) {
    d.date = getDateString(d.date);
    dates.push(d.date);

    for (var i = 0; i < d.stations.length; i++) {
      var station = d.stations[i];
      if (firstTurn) {
        var flatObj = {
          station_name: station.station_name,
          line_num: station.line_num,
          turnstile:[]
        }
        flatObj.turnstile.push({
          date: d.date,
          entries: station.entries,
          exits: station.exits
        })
        subData.push(flatObj);
      } else {
        for(var j = 0; j < subData.length; j++) {
          if(subData[j].station_name === station.station_name && subData[j].line_num == station.line_num) {
            subData[j].turnstile.push({
              date: d.date,
              entries: station.entries,
              exits: station.exits
            })
            break;
          }
        }
      }
    }
    firstTurn = false;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([d3.min(data, function(d) { return d.totalExits; })*0.95, d3.max(data, function(d) { return d.totalExits; })*1.02]);

  // Add the valueline path.
  svg.append('path')
      .data([data])
      .attr('class', 'line entry')
      .attr('d', entryValueline);


  svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', valueline);



  // Add the scatterplot
  // Change image depending on the date
  svg.selectAll('dot')
      .data(data)
      .enter().append('svg:image')
      .attr('width', function(d, i) {
        return (i < 2)? 10:20})
      .attr('height', function(d, i) {
        return (i < 2)? 10:20})
      .attr('xlink:href', function(d, i) {
        return (i < 2)? './assets/dot.png':'./assets/candle.png'})
      .attr('x', function(d, i) {
        return (i < 2)? x(d.date)-5:x(d.date)-10})
      .attr('y', function(d,i) {
        return (i < 2)? y(d.totalExits)-5:y(d.totalExits)-15})

  // Add text to plot point

  svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(function(d) {
        return d3.format(',')(d.totalExits);
      })
      .attr('font-size', '12px')
      .attr('x', function(d, i){
        console.log()
        if (x(d.date) - 30 < 0) return x(d.date) + 5;
        else if(x(d.date) +30 > width) return x(d.date) -25;
        else return x(d.date) - 15;
      })
      .attr('y', function(d){
        return y(d.totalExits) + 15;
      })

  // Add the X Axis
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickValues(dates).tickFormat(function(d, i) { if ( i%2 ==0) return formatTime(d); else return '';}))
      .attr('font-size','12px');

  // Add the Y Axis
  svg.append('g')
      .call(d3.axisLeft(y).tickArguments([5]))
      .attr('font-size','12px');

  // Add legend

  d3.select('#graph-30min')
    .append('div')
    .attr('class', 'legend')
    .html('<i style=background:#868e96>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i> 하차 <br>'+
            '<i style=background:#dee2e6>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i> 승차')

  // Draw sub graphs
  subData.forEach(function(d) {
    drawSubGraph(d.station_name, d.line_num, d.turnstile);
  });

});


var drawSubGraph = function(station_name, station_line, data) {

  if (!document.querySelector('#line'+station_line)) {
    // Add a row for the line if there is not yet.
    d3.select('#sub-graphs')
                .append('div')
                .attr('class', 'row')
                .attr('id', 'line'+station_line)
                .append('div')
                .attr('class','col-md-12')
                .append('h2')
                .html(station_line+'호선')
  }

  var subDiv = d3.select('#line'+station_line)
                  .append('div')
              .attr('class', 'sub-graph col-md-6 col-xs-12');

  var subDivWidth = document.querySelector('.sub-graph').clientWidth*0.9;
  var subHeight = 100;


  subDiv.append('h4')
        .text(station_name);

  var subSvg = subDiv
                .append('svg')
                .attr('width', subDivWidth + margin.left +margin.right)
                .attr('height', subHeight + margin.top + margin.bottom)
                .append('g')
                .attr('transform',
                      'translate(' + margin.left + ',' + margin.top + ')');

  var subX = d3.scaleTime().range([0, subDivWidth- margin.left]);
  var subY = d3.scaleLinear().range([subHeight, 0]);


  // define the line
  var subValueline = d3.line()
      .x(function(d) { return subX(d.date); })
      .y(function(d) { return subY(d.exits); });

  var subEntryValueline = d3.line()
      .x(function(d) { return subX(d.date); })
      .y(function(d) { return subY(d.entries); });


  var subMin = Math.min(d3.min(data, function(d) { return d.exits; }), d3.min(data, function(d) { return d.entries; }));
  var subMax = Math.max(d3.max(data, function(d) { return d.exits; }), d3.max(data, function(d) { return d.entries; }));

  var middle = (subMin + subMax)/2;

  subX.domain(d3.extent(data, function(d) { return d.date; }));
  subY.domain([subMin*0.95, subMax]);


  // Add the entry valueline path.
  subSvg.append('path')
      .data([data])
      .attr('class', 'line'+station_line+ ' entry')
      .attr('d', subEntryValueline);


  // Add the valueline path.
  subSvg.append('path')
      .data([data])
      .attr('class', 'line'+station_line)
      .attr('d', subValueline);


  subSvg.append('g')
      .attr('transform', 'translate(0,' + subHeight + ')')
      .call(d3.axisBottom(subX).tickValues(dates).tickFormat(function(d, i) { if ( i%2 ==0) return formatTime(d); else return '';}))

  subSvg.append('g')
      .call(d3.axisLeft(subY).tickValues([subMin, middle, subMax]));

  // Add Scatter plot points and tooltip
  subSvg.selectAll('dot')
      .data(data)
      .enter().append('svg:image')
      .attr('width', function(d, i) {
        return (i < 2)? 6:16})
      .attr('height', function(d, i) {
        return (i < 2)? 6:16})
      .attr('xlink:href', function(d, i) {
        return (i < 2)? './assets/dot.png':'./assets/candle.png'})
      .attr('x', function(d, i) {
        return (i < 2)? subX(d.date)-3:subX(d.date)-8})
      .attr('y', function(d,i) {
        return (i < 2)? subY(d.exits)-3:subY(d.exits)-12})
    .on('click',function(d) {
      div.transition()
          .duration(200)
          .style('opacity', .9);
      div .html(formatTime(d.date) + '<br/>'  + d3.format(',')(d.exits))
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseover', function(d) {
      div.transition()
          .duration(200)
          .style('opacity', .9);
      div .html(formatTime(d.date) + '<br/>'  + d3.format(',')(d.exits))
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseout', function(d) {
        div.transition()
            .duration(500)
            .style('opacity', 0);
    });

}