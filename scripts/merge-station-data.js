'use strict';
var fs = require('fs');
var jsonfile = require('jsonfile');

var lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'G', 'K', 'S', 'SU'];

var lineCount = lines.length-1;
var nearStationList = [];
var contour = 30;
var subwayData = {};

function readJson () {
  if (lineCount > -1) {
    fs.readFile(__dirname + '/stations-inside-'+contour+'min/line'+lines[lineCount]+'.json', function(err, data) {
      var subwayData = JSON.parse(data);

        for (const station of subwayData.stations) {
          const stationNM = station.station_name;
          station.line_num = lines[lineCount];
          nearStationList.push(station);
        }

      lineCount--;
      setTimeout(readJson, 1000);

    });
  } else {
    subwayData.time_range = contour;
    subwayData.stations = nearStationList;
    writeFile(subwayData);
  }
}





function writeFile(obj) {
  console.log("write file")
  jsonfile.writeFileSync(__dirname + '/stations-inside-'+contour+'min/total.json', obj);
}

readJson();