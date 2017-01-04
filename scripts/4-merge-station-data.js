'use strict';
var fs = require('fs');
var jsonfile = require('jsonfile');

var lines = require('./params').lines;

var lineCount = lines.length-1;
var nearStationList = [];
var subwayData = {};

// Isochrone sends 60mins, 45mins, 30mins, 15mins data in that order
// If you want to tweak the travle time, change travelTime (60 / 45 / 30 / 15)
var travelTime = '30';
var contour = travelTime;

var fileReadFrequency = require('./params').requestFrequency;

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