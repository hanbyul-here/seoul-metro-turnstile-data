

    var drawSubGraph = function(properties) {
      properties.dates.shift();
      properties.dates.shift();
      var station_name = properties.station_name;
      var station_line = properties.line_num;
      var transfer_line = properties.transfer_line;
      transfer_line.unshift(station_line)

      var data = properties.dates;
      var dataToCompare = properties.previous_data;

      var margin = {top: 10, right: 20, bottom: 10, left: 55};
      // if (!document.querySelector('#line'+station_line)) {
      //   // Add a row for the line if there is not yet.

      // }
      var parseTime = d3.timeParse('%Y%m%d');
      var getDateString = function(ds) {
        var date = parseTime(ds);
        return date;
      }

      // var aveExit = 0;
      // var aveEntry = 0;
      // dataToCompare.forEach(function(d) {
      //   aveExit += d.turnstile_data[0].exits;
      //   aveEntry += d.turnstile_data[0].entries;
      // })
      // aveExit /= dataToCompare.length;
      // aveEntry /= dataToCompare.length;

      var reformedDataToCompare = [];

      var dates = [];
      data.reverse();
      data.forEach(function(d) {
        d.date = getDateString(d.date);
        dates.push(getDateString(d.date));
        reformedDataToCompare.push({
          date: d.date,
          turnstile_data: []
        })
      });
      console.log(dataToCompare)
      for (var i = 0; i < reformedDataToCompare.length; i++) {
        if ( i < dataToCompare.length) {
          reformedDataToCompare[i].turnstile_data.push({
            exits: dataToCompare[i].turnstile_data[0].exits,
            entries: dataToCompare[i].turnstile_data[0].entries
          })
        } else {
          reformedDataToCompare[i].turnstile_data.push({
            exits: 5000,
            entries: 5000
          })
        }
      }
      var formatTime = d3.timeFormat('%m월%d일');

      var subDiv = d3.select('#graph-box');

      var subDivWidth = document.getElementById('graph-box').clientWidth - 30;
      var subHeight = document.getElementById('graph-box').clientHeight - 80;


      var infoBox = subDiv.append('div')
            .attr('id','info-box');

      infoBox.append('h4')
            .text(station_name);


      var lineData = infoBox
            .selectAll('div')
            .data(transfer_line);

      //lineData.attr('class','line_num');

      lineData.enter().append('h6')
              .attr('class','line_num')
            .attr('id',function(d) {return 'line_'+d;})
            .text(function(d) {
              return d;
            })

      var subSvg = subDiv
                    .append('svg')
                    .attr('width', subDivWidth + margin.left +margin.right)
                    .attr('height', subHeight + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform',
                          'translate(' + margin.left + ',0)');

      var subX = d3.scaleTime().range([0, subDivWidth - margin.right - margin.left]);
      var subY = d3.scaleLinear().range([subHeight, 0]);


      // define the line
      var subValueline = d3.line()
          .x(function(d) { return subX(d.date); })
          .y(function(d) { return subY(d.turnstile_data[0].exits); });
      //

      var lineToCompare = d3.line()
          .x(function(d) { return subX(d.date);})
          .y(function(d) { return subY(d.aveValue);})
      // var subEntryValueline = d3.line()
      //     .x(function(d) { return subX(d.date); })
      //     .y(function(d) { return subY(d.turnstile_data[0].entries); });


      var subMin = Math.min(d3.min(data, function(d) { return d.turnstile_data[0].exits; }), d3.min(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits }));
      var subMax = Math.max(d3.max(data, function(d) { return d.turnstile_data[0].exits; }), d3.max(reformedDataToCompare, function(d) { return d.turnstile_data[0].exits}));

      var middle = (subMin + subMax)/2;

      subX.domain(d3.extent(data, function(d) { return d.date; }));
      subY.domain([7000, 230000]);




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
          .call(d3.axisBottom(subX).ticks(dates.length).tickFormat(function(d, i) {
            if ( i%2 ==0) {
              return formatTime(d);
            }
            else return '';}))

      subSvg.append('g')
          .call(d3.axisLeft(subY)
                  .tickSize(-subDivWidth + margin.right + margin.left)
                  .ticks(5));

      // Add Scatter plot points and tooltip
      subSvg.selectAll('dot')
          .data(data)
          .enter().append('svg:image')
          .attr('width', 6)
          .attr('height', 6)
          .attr('xlink:href','./assets/dot.png')
          .attr('x', function(d, i) {
            return subX(d.date)-3})
          .attr('y', function(d, i) {
            return subY(d.turnstile_data[0].exits)-3})
        // .on('click',function(d) {
        //   div.transition()
        //       .duration(200)
        //       .style('opacity', .9);
        //   div .html(formatTime(d.date) + '<br/>'  + d3.format(',')(d.turnstile[0].exits))
        //       .style('left', (d3.event.pageX - 40) + 'px')
        //       .style('top', (d3.event.pageY - 35) + 'px');
        // })
        // .on('mouseover', function(d) {
        //   div.transition()
        //       .duration(200)
        //       .style('opacity', .9);
        //   div .html(formatTime(d.date) + '<br/>'  + d3.format(',')(d.turnstile[0].exits))
        //       .style('left', (d3.event.pageX) + 'px')
        //       .style('top', (d3.event.pageY - 28) + 'px');
        // })
        // .on('mouseout', function(d) {
        //     div.transition()
        //         .duration(500)
        //         .style('opacity', 0);
        // });

    }
