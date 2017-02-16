var Graph = (function() {
  var formatTime = function(time) {
    if (GlobalAsset.lang == 'en') {
      var dayTime = d3.timeFormat('%b %d')(time);
      var month = dayTime.split(' ')[0];
      var day = dayTime.split(' ')[1];
      var week = Math.ceil(day /7);
      var suffix = 'th';
      if (week == 1) suffix = 'st';
      else if (week == 2) suffix = 'nd';
      else if (week == 3) suffix = 'rd';
      return  week + suffix + ' ' + GlobalAsset.words['saturday'][GlobalAsset.lang] + ' of ' +  month + GlobalAsset.words['month'][GlobalAsset.lang];
    } else {
      var dayTime = d3.timeFormat('%m %d')(time);
      var month = dayTime.split(' ')[0];
      var day = dayTime.split(' ')[1];
      var suffix = '번째'
      var week = Math.ceil(day /7);
      return  month + GlobalAsset.words['month'][GlobalAsset.lang] + ' '+week + suffix + ' ' + GlobalAsset.words['saturday'][GlobalAsset.lang];
    }
  };
  var formatNumber = d3.format(",");
  var minMaxFormat = d3.format(".3r");

  var mainDiv;
  var mainDivWidth;
  var mainDivHeight;
  var margin = { top: 10, right: 20, bottom: 10, left: 47};

  var svgBox;
  var subX, subY;

  var tooltipDiv = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('height', 0);


  var parseTime = d3.timeParse('%Y%m%d');

  var getDateString = function(ds) {
    var date = parseTime(ds);
    return date;
  }

  // Data to display
  var data;
  var stationName, transferLine;
  var reformedDataToCompare;
  var ave, previousAve;
  var datesForX = [];

  function setData(properties) {
    mainDiv = d3.select('#graph-box');

    ave = 0;
    previousAve = 0;

    reformedDataToCompare = [];

    if (GlobalAsset.lang =='en') stationName = properties.station_name_en || GlobalAsset.words['totalTitle'][GlobalAsset.lang];
    else stationName = properties.station_name || GlobalAsset.words['totalTitle'][GlobalAsset.lang];

    transferLine = properties.transfer_line;
    if (transferLine) transferLine.unshift(properties.line_num)

    data = properties.dates;
    var dataToCompare = properties.previous_data;
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

  function prepareMaterials() {

    mainDivWidth = document.getElementById('graph-box').clientWidth - margin.left - margin.right - 100;
    mainDivHeight = 120 - margin.top - margin.bottom;


    //var subMin = minMaxFormat(Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits })));
    var max = minMaxFormat(Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits})));
    subX = d3.scaleTime().rangeRound([0, mainDivWidth]);
    subY = d3.scaleLinear().rangeRound([mainDivHeight, 0]);

    subX.domain([data[0].date, data[data.length-1].date]);
    subY.domain([0, max*1.05]);

  }

  var animationTime = 200;
  var rect2015, rect2016, text2015, text2016;
  var barSvgWidth;

  function drawBarGraph() {
    barSvgWidth = 100;

    var barSvg = svgBox
              .append('svg')
              .attr('width', barSvgWidth)
              .attr('height', mainDivHeight)

    var barG = barSvg.append('g')
          .attr('class', 'bar-graph');

    rect2015 = barG.append('rect')
          .attr('fill', 'rgba(255, 204, 0, 0.7)')
          .attr('width', 30)
          .attr('height', mainDivHeight-subY(previousAve))
          .attr('transform', 'translate(10,'+ subY(previousAve)+')');

    text2015 = barG.append('text')
          .attr('x', 25 - getBarGraphLabelXPos(previousAve))
          .attr('y', subY(previousAve) - 1)
          .text(formatNumber(previousAve))


    rect2016 = barG.append('rect')
          .attr('fill', GlobalAsset.subMainColor)
          .attr('width', 30)
          .attr('height', mainDivHeight-subY(ave))
          .attr('transform', 'translate(50,'+ subY(ave) +')');

    text2016 = barG.append('text')
          .attr('x', 65 - getBarGraphLabelXPos(ave))
          .attr('y', subY(ave) - 1)
          .text(formatNumber(ave))

  }

  function updateBarGraph() {

    rect2015.attr('height', mainDivHeight-subY(previousAve))
            .attr('transform', 'translate(10,'+ subY(previousAve)+')');

    text2015.attr('x', 25 - getBarGraphLabelXPos(ave))
          .attr('y', subY(previousAve) - 1)
          .text(formatNumber(previousAve))


    rect2016.attr('height', mainDivHeight-subY(ave))
            .attr('transform', 'translate(50,'+ subY(ave) +')');

    text2016.attr('x', 65 - getBarGraphLabelXPos(ave))
          .attr('y', subY(ave) - 1)
          .text(formatNumber(ave))
  }


  function getBarGraphLabelXPos(number) {
    var digits = (number+'').length;
    if (digits > 6) return 27;
    else if (digits > 5) return 22;
    else return 17;
  }

  function drawLegend() {
    var barSvgWidth = 100;
    var legendSvg = mainDiv.append('svg')
                    .attr('style','position:absolute;right:0;width:'+barSvgWidth+'px');

    legendSvg.append('rect')
          .attr('fill', GlobalAsset.subMainColor)
          .attr('width', 15)
          .attr('height', 15)
          .attr('transform', 'translate(10, 0)');


    legendSvg.append('text')
          .attr('x', 31)
          .attr('y', 12)
          .text('2016');


    legendSvg.append('g')
          .append('rect')
          .attr('fill', "rgb(255, 204, 0)")
          .attr('width', 15)
          .attr('height', 15)
          .attr('transform', 'translate(10, 20)');

    legendSvg.append('text')
          .attr('x', 31)
          .attr('y', 32)
          .text('2015');

    legendSvg.append('text')
          .attr('x', barSvgWidth - 80)
          .attr('y', mainDivHeight + 45)
          .text(GlobalAsset.words['ave'][GlobalAsset.lang]);

  }




  function drawDOM() {
    infoBox = mainDiv.append('div')
          .attr('id','info-box');

    infoBox.append('h4')
          .text(stationName);


    if (transferLine) {
      var lineData = infoBox
            .selectAll('div')
            .data(transferLine);


      lineData.enter().append('h6')
              .attr('class','line_num')
            .attr('id',function(d) {return 'line_'+d;})
            .text(function(d) {
              return d;
            })
    }
  }


  function updateDOM() {
    var infoBox = mainDiv.select('#info-box');

    infoBox.select('h4')
        .text(stationName);

    infoBox.selectAll('h6').remove();

    var lineData = infoBox
          .selectAll('div')
          .data(transferLine);


    lineData.enter().append('h6')
          .attr('class','line_num')
          .attr('id',function(d) {return 'line_'+d;})
          .text(function(d) {
            return d;
          })
  }

  var subValueline;
  var lineGraphSvg;

  function drawLineGraph() {

    svgBox = mainDiv.append('div')
        .attr('id','svg-box');

    lineGraphSvg = svgBox
              .append('svg')
              .attr('width', mainDivWidth + margin.left +margin.right)
              .attr('height', mainDivHeight + margin.top + margin.bottom + xAxisBound.height)
              .append('g')
              .attr('transform',
                    'translate(' + margin.left + ',0)');

    // mouse interaction

    // define the line
    subValueline = d3.line()
        .x(function(d) { return subX(d.date); })
        .y(function(d) { return subY(d.turnstile_data[0].exits); });

      // Add the valueline path
    lineGraphSvg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', subValueline);


    lineGraphSvg.append('path')
        .data([reformedDataToCompare])
        .attr('class', 'lineToCompare')
        .attr('d', subValueline);

  }

  var xAxisBound = {height: 20, width: 25};

  function drawAxis () {

    var wrap = d3.textwrap().bounds(xAxisBound);

    lineGraphSvg.append('g')
        .attr('class','ticktick')
        .attr('transform', 'translate(0,' + mainDivHeight + ')')
        .call(
          d3.axisBottom(subX)
          .tickValues(datesForX)
          .tickPadding(5)
          .tickSize(-mainDivHeight)
          .tickFormat(function(d, i) {
            if ( i%2 ==0) {
              return formatTime(d);
            }
            else return '';})
          )
        .selectAll('text')
        .call(wrap);

    lineGraphSvg.append('g')
        .attr('class', 'yaxis')
        .call(d3.axisLeft(subY)
                .tickSize(-mainDivWidth)
                .tickPadding([0])
                .ticks(5));
  }


  function updateLineGraph() {
    d3.select('.line').remove();
    d3.select('.lineToCompare').remove();

    lineGraphSvg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', subValueline);

    lineGraphSvg.append('path')
        .data([reformedDataToCompare])
        .attr('class', 'lineToCompare')
        .attr('d', subValueline);
  }


  var clickBehaviour = function (d, i) {
    tooltipDiv
        .style('opacity', .9)
        .style('height', 'auto')
        .style('left', (d3.event.pageX) + 15 + 'px')
        .style('top', (d3.event.pageY - 28) + 'px')
        .html(getTooltipHTML(d, i));
  }

  var mouseOverBehaviour = function (d, i) {
    clickBehaviour(d, i)
  }

  var mouseOutBehaviour = function () {
    tooltipDiv.html('')
        .style('height', 0)
        .style('opacity', 0);
  }

  function getTooltipHTML(d, i) {
    return '<h6>' +formatTime(d.date) + '</h6>'  +
            '2016 : ' + d3.format(',')(d.turnstile_data[0].exits) + '<br/>'  +
            '2015 : ' + d3.format(',')(reformedDataToCompare[i].turnstile_data[0].exits) + '<br/>'  +
            GlobalAsset.words.gap[GlobalAsset.lang] +' : ' + d3.format(',')(d.turnstile_data[0].exits- reformedDataToCompare[i].turnstile_data[0].exits);
  }

  function drawTooltip() {
    // Add Scatter plot points and tooltip
    lineGraphSvg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circledot')
      .attr('r', 6)
      .attr('fill', GlobalAsset.subMainColor)
      .attr('cx', function(d, i) {
        return subX(d.date)})
      .attr('cy', function(d, i) {
        return subY(d.turnstile_data[0].exits)})
    .on('click',function(d, i) {
      clickBehaviour(d, i);

    })
    .on('mouseover', function(d, i) {
        mouseOverBehaviour(d, i);
    })
    .on('mouseout', mouseOutBehaviour);
  }


  function updateTooltip() {
    lineGraphSvg.selectAll('circle').remove();
    lineGraphSvg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circledot')
      .attr('r', 6)
      .attr('fill', GlobalAsset.subMainColor)
      .attr('cx', function(d, i) {
        return subX(d.date)})
      .attr('cy', function(d, i) {
        return subY(d.turnstile_data[0].exits)})
    .on('click',function(d, i) {
      clickBehaviour(d, i);

    })
    .on('mouseover', function(d, i) {
        mouseOverBehaviour(d, i);
    })
    .on('mouseout', mouseOutBehaviour);
  }


  function updateYAxis(max) {
    // YAxis updates only one time
    subY.domain([0, max*1.05]);
    mainDiv.select('.yaxis')
          .transition().duration(200)
          .call(d3.axisLeft(subY)
                .tickSize(-mainDivWidth)
                .ticks(5));
  }


  function createGraph () {
    drawDOM();
    drawLineGraph();
    drawAxis();
    drawTooltip();
    drawBarGraph();
    drawLegend();
  }

  function updateGraph () {
    updateDOM();
    updateLineGraph();
    updateTooltip();
    updateBarGraph();
  }

  function destroy () {
    d3.select('.line').remove();
    d3.select('.lineToCompare').remove();
    barSvg.select('.bar-graph').remove();
  }

  return {
    setData: setData,
    prepareMaterials: prepareMaterials,
    createGraph: createGraph,
    updateGraph: updateGraph,
    updateYAxis: updateYAxis,
    destroy: destroy
  }
})()
