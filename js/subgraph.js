var drawSubGraph = (function() {

  var station_name;
  var transfer_line;
  var data;
  var dataToCompare;
  var reformedDataToCompare;
  var ave;
  var previousAve;


  var formatTime = d3.timeFormat('%m월 %d일');
  var formatNumber = d3.format(",");
  var minMaxFormat = d3.format(".3r");
  var subDiv;
  var subDivWidth;
  var svgBox;
  var subSvg;
  var subY;
  var subValueline


  var parseTime = d3.timeParse('%Y%m%d');

  var getDateString = function(ds) {
    var date = parseTime(ds);
    return date;
  }

  function prepareData(properties) {

    ave = 0;
    previousAve = 0;

    reformedDataToCompare = [];

    station_name = properties.station_name;
    transfer_line = properties.transfer_line;
    transfer_line.unshift(properties.line_num)

    data = properties.dates;
    dataToCompare = properties.previous_data;
    data.reverse();
    data.forEach(function(d) {
      d.date = getDateString(d.date);
      ave += d.turnstile_data[0].exits;
      reformedDataToCompare.push({
        date: d.date,
        turnstile_data: []
      })
    });

    ave /= data.length;
    ave = Math.floor(ave);

    for (var i = 0; i < reformedDataToCompare.length; i++) {
      previousAve += dataToCompare[i].turnstile_data[0].exits;
      reformedDataToCompare[i].turnstile_data.push({
        exits: dataToCompare[i].turnstile_data[0].exits,
        entries: dataToCompare[i].turnstile_data[0].entries
      })
    }
    previousAve /= reformedDataToCompare.length;
    previousAve = Math.floor(previousAve);

    prepareDOM();
  }

  var prepareDOM = function () {
    subDiv = d3.select('#graph-box');
  }


  var margin = { top: 10, right: 20, bottom: 10, left: 40};
  var barSvg;
  var barWidth;
  var barHeight;

  function drawBarSVG() {
    barWidth = 100;
    barHeight =  120 -margin.top - margin.bottom;

    barSvg = svgBox
              .append('svg')
              .attr('width', barWidth)
              .attr('height', barHeight);

    var barG = barSvg.append('g')
          .attr('class', 'bar-graph');

    barG.append('rect')
          .attr('fill', 'rgba(255, 204, 0, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(previousAve))
          .attr('transform', 'translate(10,'+ subY(previousAve)+')');

    barG.append('text')
          .attr('x', 10)
          .attr('y', subY(previousAve))
          .text(formatNumber(previousAve))


    barG.append('rect')
          .attr('fill', 'rgba(255, 51, 51, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(ave))
          .attr('transform', 'translate(50,'+ subY(ave) +')');

    barG.append('text')
          .attr('x', 40)
          .attr('y', subY(ave))
          .text(formatNumber(ave))

  }

  function drawLineSVG() {

    svgBox = subDiv.append('div')
        .attr('id','svg-box');


    subDivWidth = document.getElementById('graph-box').clientWidth - margin.left - margin.right - 100;
    var subHeight = 120 - margin.top - margin.bottom;

    subSvg = svgBox
                  .append('svg')
                  .attr('width', subDivWidth + margin.left +margin.right)
                  .attr('height', subHeight + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform',
                        'translate(' + margin.left + ',0)');

    var subX = d3.scaleTime().range([0, subDivWidth]);
    subY = d3.scaleLinear().range([subHeight, 0]);


    // define the line
    subValueline = d3.line()
        .x(function(d) { return subX(d.date); })
        .y(function(d) { return subY(d.turnstile_data[0].exits); });

    var subMin = minMaxFormat(Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits })));
    var subMax = minMaxFormat(Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits})));
    console.log(subMin);

    subX.domain(d3.extent(data, function(d) { return d.date; }));
    subY.domain([subMin, subMax*1.05]);

      // Add the valueline path.
    subSvg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', subValueline);


    subSvg.append('path')
        .data([reformedDataToCompare])
        .attr('class', 'lineToCompare')
        .attr('d', subValueline);

    subSvg.append('g')
        .attr('transform', 'translate(0,' + (subHeight) + ')')
        .attr('class','ticktick')
        .call(d3.axisBottom(subX).ticks(data.length).tickFormat(function(d, i) {
          if ( i%2 ==0) {
            return formatTime(d);
          }
          else return '';}))

    subSvg.append('g')
        .attr('class', 'yaxis')
        .call(d3.axisLeft(subY)
                .tickSize(-subDivWidth)
                .ticks(5));

      var div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Add Scatter plot points and tooltip
    // subSvg.selectAll('dot')
    //   .data(data)
    //   .enter().append('svg:image')
    //   .attr('width', 10)
    //   .attr('height', 10)
    //   .attr('xlink:href','./assets/dot.png')
    //   .attr('x', function(d, i) {
    //     return subX(d.date)-5})
    //   .attr('y', function(d, i) {
    //     return subY(d.turnstile_data[0].exits)-5})
    // .on('click',function(d, i) {
    //   div.transition()
    //       .duration(200)
    //       .style('opacity', .9);
    //   div .html(
    //         formatTime(d.date) + '<br/>'  +
    //         d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
    //         d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits)
    //         )
    //       .style('left', (d3.event.pageX - 40) + 'px')
    //       .style('top', (d3.event.pageY - 35) + 'px');
    // })
    // .on('mouseover', function(d, i) {
    //   div.transition()
    //       .duration(200)
    //       .style('opacity', .9);
    //   div .html(formatTime(d.date) + '<br/>'  +
    //         d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
    //         d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits))
    //       .style('left', (d3.event.pageX) + 'px')
    //       .style('top', (d3.event.pageY - 28) + 'px');
    // })
    // .on('mouseout', function(d) {
    //     div.transition()
    //         .duration(500)
    //         .style('opacity', 0);
    // });
  }


  function updateYAxis() {
    var subMin = Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits }));
    var subMax = Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits}));
    var middle = (subMin + subMax)/2;

    subY.domain([subMin, subMax*1.05]);
    subDiv.select('.yaxis')
          .transition().duration(200)
          .call(d3.axisLeft(subY)
                .tickSize(-subDivWidth)
                .ticks(5));
    updateLineGraph();
    updateBarGraph();
  }

  function updateLineGraph() {
    d3.select('.line').remove();
    d3.select('.lineToCompare').remove();

    subSvg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', subValueline);

    subSvg.append('path')
        .data([reformedDataToCompare])
        .attr('class', 'lineToCompare')
        .attr('d', subValueline);
  }

  function updateBarGraph() {
    barSvg.select('.bar-graph').remove();

    var barG = barSvg.append('g')
          .attr('class', 'bar-graph')

    barG.append('rect')
          .attr('fill', 'rgba(255, 204, 0, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(previousAve))
          .attr('transform', 'translate(10,'+ subY(previousAve)+')');

    barG.append('text')
          .attr('x', 10)
          .attr('y', subY(previousAve))
          .text(formatNumber(previousAve))


    barG.append('rect')
          .attr('fill', 'rgba(255, 51, 51, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(ave))
          .attr('transform', 'translate(50,'+ subY(ave) +')');

    barG.append('text')
          .attr('x', 40)
          .attr('y', subY(ave))
          .text(formatNumber(ave))
  }


  function drawDOM() {

    var infoBox = subDiv.append('div')
          .attr('id','info-box');

    infoBox.append('h4')
          .text(station_name);


    var lineData = infoBox
          .selectAll('div')
          .data(transfer_line);


    lineData.enter().append('h6')
            .attr('class','line_num')
          .attr('id',function(d) {return 'line_'+d;})
          .text(function(d) {
            return d;
          })

  }
  var createGraph = function () {
    drawDOM();
    drawLineSVG();
    drawBarSVG();
  }

  return {
    prepareData: prepareData,
    createGraph: createGraph,
    updateYAxis: updateYAxis
  }
})()
