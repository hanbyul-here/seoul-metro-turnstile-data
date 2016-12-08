'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;
var jsonfile = require('jsonfile');

var subwayLineObj = {};

var lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'G', 'K', 'S', 'SU'];
var lineCount = lines.length - 1;

var subwayStationList = [];
var stationCount;
var lineNum;

var requestFrequency = 200; // time gap between requests to openAPI.seoul.go.kr:8080

function readFile() {
  fs.readFile(__dirname + '/raw-station-data/line'+lines[lineCount]+'.json', function(err, data) {
    const result = JSON.parse(data);
    subwayStationList = [];
      for (const station of result.SearchSTNBySubwayLineService.row) {
        lineNum = station.LINE_NUM;
        const obj = {
          station_cd: station.STATION_CD,
          station_name: station.STATION_NM,
          station_fr_code: station.FR_CODE
        }
        subwayStationList.push(obj);
      }
      stationCount = subwayStationList.length-1;
      makeCall();
  });
}

function makeCall() {
  if (stationCount > -1) {
    console.log(stationCount);
    console.log(lineCount);
    const request = new XMLHttpRequest();

    var url = 'http://openAPI.seoul.go.kr:8088/'+key+'/json/SearchLocationOfSTNByIDService/1/5/'+subwayStationList[stationCount].station_cd+'/';
    console.log(url);

    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        const data = JSON.parse(request.responseText);

        const lat = data.SearchLocationOfSTNByIDService.row[0].XPOINT_WGS;
        const lon = data.SearchLocationOfSTNByIDService.row[0].YPOINT_WGS;

        if (lat && lon) {
          subwayStationList[stationCount].lat = lat;
          subwayStationList[stationCount].lon = lon;
        } else {
          // If station misses coordination info (which mostly means it is not open yet)
          // Take that out from the data.
          subwayStationList.splice(stationCount, 1);
        }
        stationCount--;
        setTimeout(makeCall, requestFrequency);
      } else {
        console.log('We reached our target server, but it returned an error')
      }
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();
  } else {
    lineCount--;
    if (lineCount > -1){
      subwayLineObj.line = lineNum;
      subwayLineObj.stations = subwayStationList;
      writeFile(subwayLineObj);
      readFile();
    } else {
      console.log('done');
    }
  }
}

function writeFile(obj) {
  console.log('write ' + '/station-data-with-location/line'+obj.line +'.json file');
  jsonfile.writeFileSync(__dirname + '/station-data-with-location/line'+obj.line +'.json', obj);
}

readFile();
