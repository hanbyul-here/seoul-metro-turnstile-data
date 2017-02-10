var Graph = (function() {

  var station_name;
  var transfer_line;
  var data;
  var dataToCompare;
  var reformedDataToCompare;
  var ave;
  var datesForX = [];
  var previousAve;


  var formatTime = function(time) {
    var dayTime = d3.timeFormat('%m %d')(time);
    var month = dayTime.split(' ')[0];
    var day = dayTime.split(' ')[1];
    var week = Math.ceil(day /7);

    if (globalLng == 'en') return words['week'][globalLng] + week + ' of ' +  month + words['month'][globalLng];
    else return month + words['month'][globalLng] + ' ' + week + words['week'][globalLng] ;
  };
  var formatNumber = d3.format(",");
  var minMaxFormat = d3.format(".3r");
  var subDiv;
  var subDivWidth;
  var subHeight;
  var svgBox;
  var subSvg;
  var subX, subY;
  var subValueline

  var tooltipDiv = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);


  var parseTime = d3.timeParse('%Y%m%d');

  var getDateString = function(ds) {
    var date = parseTime(ds);
    return date;
  }

  function prepareData(properties) {
    subDiv = d3.select('#graph-box');

    ave = 0;
    previousAve = 0;

    reformedDataToCompare = [];

    station_name = properties.station_name || words['totalTitle'][globalLng];
    transfer_line = properties.transfer_line;
    if (transfer_line) transfer_line.unshift(properties.line_num)

    data = properties.dates;
    dataToCompare = properties.previous_data;
    data.reverse();
    data.forEach(function(d) {
      datesForX.push(getDateString(d.date));
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
  }

  var margin = { top: 10, right: 20, bottom: 10, left: 47};
  var barSvg;
  var barWidth;
  var barHeight;

  function drawBarSVG() {
    barWidth = 100;
    barHeight =  subHeight;

    barSvg = svgBox
              .append('svg')
              .attr('width', barWidth)
              .attr('height', barHeight)

    var barG = barSvg.append('g')
          .attr('class', 'bar-graph');

    barG.append('rect')
          .attr('fill', 'rgba(255, 204, 0, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(previousAve))
          .attr('transform', 'translate(10,'+ subY(previousAve)+')');

    barG.append('text')
          .attr('x', 25 - getBarGraphLabelXPos(previousAve))
          .attr('y', subY(previousAve))
          .text(formatNumber(previousAve))


    barG.append('rect')
          .attr('fill', getMainColor())
          .attr('width', 30)
          .attr('height', barHeight-subY(ave))
          .attr('transform', 'translate(50,'+ subY(ave) +')');

    barG.append('text')
          .attr('x', 65 - getBarGraphLabelXPos(ave))
          .attr('y', subY(ave))
          .text(formatNumber(ave))

  }

  function getBarGraphLabelXPos(number) {
    var digits = (number+'').length;
    if (digits > 6) return 27;
    else if (digits > 5) return 22;
    else return 17;
  }

  function drawLegend() {
    var legendSvg = subDiv.append('svg')
                    .attr('style','position:absolute;right:0;width:'+barWidth);

    legendSvg.append('rect')
          .attr('fill',getMainColor())
          .attr('width', 15)
          .attr('height', 15)


    legendSvg.append('text')
          .attr('x', 21)
          .attr('y', 12)
          .text('2016');


    legendSvg.append('g')
          .append('rect')
          .attr('fill', 'rgb(255, 204, 0')
          .attr('width', 15)
          .attr('height', 15)
          .attr('transform', 'translate(0, 20)');

    legendSvg.append('text')
          .attr('x', 21)
          .attr('y', 32)
          .text('2015');

    legendSvg.append('text')
          .attr('x', barWidth - 80)
          .attr('y', barHeight + 45)
          .text(words['ave'][globalLng]);

  }

  function drawDOM() {
    var infoBox = subDiv.append('div')
          .attr('id','info-box');

    infoBox.append('h4')
          .text(station_name);


    if (transfer_line) {
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
  }

  function drawLineSVG() {

    svgBox = subDiv.append('div')
        .attr('id','svg-box');


    subDivWidth = document.getElementById('graph-box').clientWidth - margin.left - margin.right - 100;
    subHeight = 120 - margin.top - margin.bottom;

    subSvg = svgBox
                  .append('svg')
                  .attr('width', subDivWidth + margin.left +margin.right)
                  .attr('height', subHeight + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform',
                        'translate(' + margin.left + ',0)');

    subX = d3.scaleTime().rangeRound([0, subDivWidth]);
    subY = d3.scaleLinear().rangeRound([subHeight, 0]);

    // mouse interaction

    // define the line
    subValueline = d3.line()
        .x(function(d) { return subX(d.date); })
        .y(function(d) { return subY(d.turnstile_data[0].exits); });

    var subMin = minMaxFormat(Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits })));
    var subMax = minMaxFormat(Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits})));

    subX.domain([data[0].date, data[data.length-1].date]);
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
        .attr('transform', 'translate(0,' + subHeight + ')')
        .attr('class','ticktick')
        .call(
          d3.axisBottom(subX)
          .tickValues(datesForX)
          .tickPadding(5)
          .tickSize(-subHeight)
          .tickFormat(function(d, i) {
            if ( i%2 ==0) {
              return formatTime(d);
            }
            else return '';}))

    subSvg.append('g')
        .attr('class', 'yaxis')
        .call(d3.axisLeft(subY)
                .tickSize(-subDivWidth)
                .tickPadding([0])
                .ticks(5));

    // Add Scatter plot points and tooltip
    subSvg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circledot')
      .attr('r', 7)
      .attr('fill', getMainColor())
      .attr('cx', function(d, i) {
        return subX(d.date)})
      .attr('cy', function(d, i) {
        return subY(d.turnstile_data[0].exits)})
    .on('click',function(d, i) {
      tooltipDiv.transition()
          .duration(200)
          .style('opacity', .9);
      tooltipDiv .html(
            formatTime(d.date) + '<br/>'  +
            d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
            d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits)
            )
          .style('left', (d3.event.pageX) + 10 + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');

    var val = d3.line()
        .x(function(d) { return subX(d.date); })
        .y(function(d) { return subY(d.turnstile_data[0].exits); });

    var zeroVal = d3.line()
        .x(function(d) { return subX(d.date); })
        .y(function(d) { return 0});

      subSvg.append('path')
          .attr('class', 'tooltip-line')
          .attr('d', [val, zeroVal]);

    })
    .on('mouseover', function(d, i) {
      tooltipDiv.transition()
          .duration(200)
          .style('opacity', .9);
      tooltipDiv .html(formatTime(d.date) + '<br/>'  +
            d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
            d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits))
          .style('left', (d3.event.pageX) + 10 +'px')
          .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseout', function(d) {
        tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
    });
  }


  function updateDOM() {
    var infoBox = subDiv.select('#info-box');

    infoBox.select('h4')
        .text(station_name);

    infoBox.selectAll('h6').remove();

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

  function updateYAxis() {
    var subMin = Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits }));
    var subMax = Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits}));
    // var middle = (subMin + subMax)/2;

    subY.domain([subMin, subMax*1.05]);
    subDiv.select('.yaxis')
          .transition().duration(200)
          .call(d3.axisLeft(subY)
                .tickSize(-subDivWidth)
                .ticks(5));
    updateLineGraph();
    updateBarGraph();
    updateTipDots();
    updateDOM();
  }

  function updateTipDots() {
    subSvg.selectAll('circle').remove();

    subSvg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circledot')
      .attr('r', 7)
      .attr('fill', getMainColor())
      .attr('cx', function(d, i) {
        return subX(d.date)})
      .attr('cy', function(d, i) {
        return subY(d.turnstile_data[0].exits)})
    .on('click',function(d, i) {
      tooltipDiv.transition()
          .duration(200)
          .style('opacity', .9);
      tooltipDiv .html(
            formatTime(d.date) + '<br/>'  +
            d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
            d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits)
            )
          .style('left', (d3.event.pageX) + 10 + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseover', function(d, i) {
      tooltipDiv.transition()
          .duration(200)
          .style('opacity', .9);
      tooltipDiv .html(formatTime(d.date) + '<br/>'  +
            d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
            d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits))
          .style('left', (d3.event.pageX) + 10 +'px')
          .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseout', function(d) {
        tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
    });
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
          .attr('x', 25 - getBarGraphLabelXPos(ave))
          .attr('y', subY(previousAve))
          .text(formatNumber(previousAve))


    barG.append('rect')
          .attr('fill', 'rgba(255, 51, 51, 0.7)')
          .attr('width', 30)
          .attr('height', barHeight-subY(ave))
          .attr('transform', 'translate(50,'+ subY(ave) +')');

    barG.append('text')
          .attr('x', 65 - getBarGraphLabelXPos(ave))
          .attr('y', subY(ave))
          .text(formatNumber(ave))
  }

  var createGraph = function () {
    drawDOM();
    drawLineSVG();
    drawBarSVG();
    drawLegend();
  }

  return {
    prepareData: prepareData,
    createGraph: createGraph,
    updateYAxis: updateYAxis
  }
})()
