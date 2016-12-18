'use strict';

var fs = require('fs');
var jsonfile = require('jsonfile');

var dates = ['20161015', '20161022', '20161029', '20161105', '20161112', '20161119', '20161126', '20161126', '20161203'];
var dateCount = dates.length-1;


var total = [];

function readJson () {
  if (dateCount > -1) {
    fs.readFile(__dirname + '/bus-stops/'+dates[dateCount]+'.json', function(err, data) {

      var subwayData = JSON.parse(data);
      var newObj = {};
      var intEntry = 0;
      var intExit = 0;
      var totalEntries = 0;
      var totalExits = 0;
    // var nearStationList = [];
      for (const station of subwayData.stops) {
        totalEntries += parseInt(station.entires);
        totalExits += parseInt(station.exits);
      }

      newObj.date = subwayData.date;
      newObj.stations = subwayData.stops;
      newObj.totalEntries = totalEntries;
      newObj.totalExits = totalExits;
      total.push(newObj);

      dateCount--;

      setTimeout(readJson, 1000);
    });

  } else {
    writeFile(total, 'date-based');
    var newtotal = makeStationBasedOne(total);
    writeFile(newtotal, 'station-based');
  }

}



function makeStationBasedOne(data) {
  var newData = [];
  var totalData = {
    station_name: 'total'
  };

  for (var st of data[0].stations) {
    const obj = {
        station_name: st.bus_station_name,
        route_id: st.route_id,
        tm_x: st.tm_x,
        tm_y: st.tm_y,
        station_cd: st.bus_station_id
    };

      for (var datum of data) {
        for (var station of datum.stations) {
          if(station.bus_station_name === obj.station_name && station.bus_station_id === obj.station_cd) {
            obj[datum.date] = [];
            obj[datum.date].push({
              entries: station.entires,
              exits: station.exits
            })
          }
        }
        totalData[datum.date] = [];
        totalData[datum.date].push({
          entries: datum.totalEntries,
          exits: datum.totalExits
        });
      }

      newData.push(obj);

  }
  // push total just for easy table
  newData.push(totalData)
  return newData;
}


function writeFile(obj, fileName) {
  console.log('write ' + fileName +' file');
  jsonfile.writeFileSync(__dirname + '/bus-stops/'+ fileName +'-'+dates[0]+'-'+dates[dates.length-1]+'.json', obj);
}

readJson();