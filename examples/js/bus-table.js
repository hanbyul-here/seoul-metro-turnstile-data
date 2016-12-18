d3.json('./data/bus/total-based-on-station.json', function (err, data) {

  var tData = trimData(data);

  d3.select('#table-2016-30min')
  .selectAll("table")
    .data([tData])
    .enter().append("table")
    .attr('class', 'table table-bordered')
    .call(recurse);

});



function trimData(data) {
  var trimmedData = [];

  for(var i = 0; i < data.length; i++) {
    var datum = data[i];
    var obj = {};
    obj.station_name = data[i].station_name;
    obj.station_cd = data[i].station_cd;
    for(var key in datum) {
      console.log(datum[key])
      if(['station_name', 'tm_x', 'tm_y', 'route_id','station_cd'].indexOf(key) < 0) {
        obj[key[0]+key[1]+key[2]+key[3]+ '년 ' + key[4]+key[5] + '월 '+ key[6]+ key[7] + '일']  = datum[key];
      }
    }
    trimmedData.push(obj);
  }
  return trimmedData;
}



// Took this code from nautat's block : http://bl.ocks.org/nautat/4085017

function recurse(sel) {
  // sel is a d3.selection of one or more empty tables
  sel.each(function(d) {
    // d is an array of objects
    var colnames,
        tds,
        table = d3.select(this);

    // obtain column names by gathering unique key names in all 1st level objects
    // following method emulates a set by using the keys of a d3.map()
    colnames = d                                                          // array of objects
        .reduce(function(p,c) { return p.concat(d3.keys(c)); }, [])       // array with all keynames
        .reduce(function(p,c) { return (p.set(c,0), p); }, d3.map())      // map with unique keynames as keys
        .keys();                                                          // array with unique keynames (arb. order)
        //console.log(colnames);
    // colnames array is in arbitrary order
    // sort colnames here if required

    // create header row using standard 1D data join and enter()
    table.append("thead").append("tr").selectAll("th")
        .data(colnames)
        .enter().append("th")
        .attr('class', function(d) {return d;})
        .text(function(d) {
          switch(d) {
            case 'station_name':
              return '역 이름';
              break;
            case 'entries':
              return '탑승';
              break;
            case 'exits':
              return '하차';
              break;
            case 'station_cd':
              return '정류장 고유번호';
              break;
            case 'total':
              return '총합';
            default:
              return d;
            }
          });

    // create the table cells by using nested 2D data join and enter()
    // see also http://bost.ocks.org/mike/nest/
    tds = table.append("tbody")
      .selectAll("tr")
        .data(d)                            // each row gets one object
      .enter().append("tr").selectAll("td")
        .data(function(d) {                 // each cell gets one value
          return colnames.map(function(k) { // for each colname (i.e. key) find the corresponding value
            return d[k] || "";              // use empty string if key doesn't exist for that object
          });
        })
      .enter().append("td");

    // cell contents depends on the data bound to the cell
    // fill with text if data is not an Array
    tds.filter(function(d) { return !(d instanceof Array); })
        .text(function(d) { return d; });
    // fill with a new table if data is an Array
    tds.filter(function(d) { return (d instanceof Array); })
        .append("table")
        .attr('class', 'table')
        .call(recurse);
  });
}
