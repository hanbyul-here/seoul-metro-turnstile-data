'use strict';
var fs = require('fs');
var jsonfile = require('jsonfile');

var contour;
var isochroneData;

// Isochrone sends 60mins, 45mins, 30mins, 15mins data in that order
// If you want to tweak the travle time, change travelTime (60 / 45 / 30 / 15)
var travelTime = '30';
var contourIndex = require('./params').contour[travelTime];

var lines = require('./params').lines;
var lineCount = lines.length-1;

var requestFrequency = require('./params').requestFrequency;

function readJson () {
  // I downloaded the isochrone data from Mapzen Mobility Explorer
  // https://mapzen.com/mobility/explorer/#/isochrones?bbox=126.92856%2C37.55315%2C127.027444%2C37.596755&isochrone_mode=pedestrian&pin=37.57497%2C126.977978
  fs.readFile(__dirname + '/isochrone.json', function(err, data1) {
    isochroneData = JSON.parse(data1);
    readStationData();
  });
}

function readStationData() {
  if (lineCount > -1) {
    var nearStationsObj = {};
    fs.readFile(__dirname + '/station-data-with-location/line'+lines[lineCount]+'.json', function(err, data2) {
      var subwayData = JSON.parse(data2);
      nearStationsObj.line = subwayData.line;
      var nearStationList = [];
      for (const station of subwayData.stations) {
        var isThisStationNear = isMarkerInsidePolygon({lat: station.lat, lon: station.lon}, isochroneData);
        if(isThisStationNear) nearStationList.push(station);
      }
      nearStationsObj.stations = nearStationList;
      writeFile(nearStationsObj);
      lineCount--;
      setTimeout(readStationData, requestFrequency);
    });
  } else {
    console.log('done!');
  }

}


// I took this code from gusper's answer on this page
// http://stackoverflow.com/questions/31790344/determine-if-a-point-reside-inside-a-leaflet-polygon

function isMarkerInsidePolygon(marker, poly) {
    var polyPoints = poly.features[contourIndex].geometry.coordinates[0];
    contour = poly.features[contourIndex].properties.contour;
    var x = marker.lat;
    var y = marker.lon;

    var inside = false;

    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i][1];
        var yi = polyPoints[i][0];
        var xj = polyPoints[j][1];
        var yj = polyPoints[j][0];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
};



function writeFile(obj) {
  console.log('write'+ '/stations-inside-'+contour+'min/line'+obj.line+'.json file');
  jsonfile.writeFileSync(__dirname + '/stations-inside-'+contour+'min/line'+obj.line+'.json', obj);
}

readJson();