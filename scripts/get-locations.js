'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;
var jsonfile = require('jsonfile');

var subwayLineObj = {};

var subwayStationList = [];
var stationCount;// = 2;
var lineNum;

fs.readFile(__dirname + '/raw-station-data/lineSU.json', function(err, data) {
  const result = JSON.parse(data);
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


function makeCall() {
  if (stationCount > -1) {
    console.log(stationCount);
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
          console.log(subwayStationList[stationCount].station_name);
          console.log(data.SearchLocationOfSTNByIDService.row[0].STATION_NM);
          subwayStationList[stationCount].lat = lat;
          subwayStationList[stationCount].lon = lon;
        } else {
          // If station misses coordination info (which mostly means it is not open yet)
          // Take that out from the data.
          subwayStationList.splice(stationCount, 1);
        }
        stationCount--;
        setTimeout(makeCall, 1000);
      } else {
        console.log('We reached our target server, but it returned an error')
      }
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();
  } else {
    subwayLineObj.line = lineNum;
    subwayLineObj.stations = subwayStationList;
    writeFile(subwayLineObj);
  }
}

function writeFile(obj) {
  console.log('write ' + '/station-data-with-location/line'+obj.line +'.json file');
  jsonfile.writeFileSync(__dirname + '/station-data-with-location/line'+obj.line +'.json', obj);
}

