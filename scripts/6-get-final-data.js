'use strict';

var fs = require('fs');
var jsonfile = require('jsonfile');

var dates = require('./params').dates;
var travelTime = require('./params').travelTime;
var dateCount = dates.length-1;


var total = [];

function readJson () {
  if (dateCount > -1) {
    fs.readFile(__dirname + '/turnstile-data/'+travelTime+'min/'+dates[dateCount]+'.json', function(err, data) {

      var subwayData = JSON.parse(data);
      var newObj = {};
      var intEntry = 0;
      var intExit = 0;
      var totalEntries = 0;
      var totalExits = 0;
    // var nearStationList = [];
      for (const station of subwayData.stations) {
        totalEntries += parseInt(station.entries);
        totalExits += parseInt(station.exits);
      }

      newObj.date = subwayData.date;
      newObj.stations = subwayData.stations;
      newObj.totalEntries = totalEntries;
      newObj.totalExits = totalExits;
      total.push(newObj);

      dateCount--;

      setTimeout(readJson, 1000);
    });

  } else {
    writeFile(total, 'date-based');
    var newtotal = makeStationBasedData(total);
    writeFile(newtotal, 'station-based');
  }

}



function makeStationBasedData(data) {
  var newData = [];
  var totalData = {
    station_name: 'total',
    line_num: '',
    lat: '',
    lon: ''
  };

  for (var st of data[0].stations) {
    const obj = {
        station_name: st.station_name,
        line_num: st.line_num,
        lat: st.lat,
        lon: st.lon,
        station_cd: st.station_cd
    };

      for (var datum of data) {
        for (var station of datum.stations) {
          if(station.station_name === obj.station_name && station.line_num === obj.line_num) {
            obj[datum.date] = [];
            obj[datum.date].push({
              entries: station.entries,
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

  newData.push(totalData)
  return newData;
}


function writeFile(obj, fileName) {
  console.log('write ' + fileName +' file');
  jsonfile.writeFileSync(__dirname + '/turnstile-data/'+travelTime+'min/'+ fileName + '.json', obj);
}

readJson();