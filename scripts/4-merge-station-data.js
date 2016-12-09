'use strict';
var fs = require('fs');
var jsonfile = require('jsonfile');

var lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'G', 'K', 'S', 'SU'];

var lineCount = lines.length-1;
var nearStationList = [];
var contour = 15;
var subwayData = {};

var fileReadFrequency = 200; // time ga between reading station info json files

function readJson () {
  if (lineCount > -1) {
    fs.readFile(__dirname + '/stations-inside-'+contour+'min/line'+lines[lineCount]+'.json', function(err, data) {
      console.log('reading file '+'/stations-inside-'+contour+'min/line'+lines[lineCount]+'.json');
      var subwayData = JSON.parse(data);

        for (const station of subwayData.stations) {
          const stationNM = station.station_name;
          station.line_num = lines[lineCount];
          nearStationList.push(station);
        }

      lineCount--;
      setTimeout(readJson, fileReadFrequency);

    });
  } else {
    subwayData.time_range = contour;
    subwayData.stations = nearStationList;
    writeFile(subwayData);
  }
}



function writeFile(obj) {
  console.log('write file'+'/stations-inside-'+contour+'min/total.json');
  jsonfile.writeFileSync(__dirname + '/stations-inside-'+contour+'min/total.json', obj);
}

readJson();