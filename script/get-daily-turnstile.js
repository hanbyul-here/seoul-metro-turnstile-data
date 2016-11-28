'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;
var jsonfile = require('jsonfile');
var newJsonWithUsageData = {};
var missedStation = {};

var dates = ['20161015', '20161022', '20161029', '20161105', '20161112', '20161119'];
var date = dates[0];
var contour = 30;

function readJson () {
  fs.readFile(__dirname + '/stations-inside-'+contour+'min/total.json', function(err, data) {
    var stationData = JSON.parse(data).stations;
    makeCall(stationData);
  });
}


function makeCall(stationData) {
  var request = new XMLHttpRequest();

  var stationListWithUsage = [];
  var url ='http://openapi.seoul.go.kr:8088/'+key+'/json/CardSubwayStatsNew/1/600/'+date;

  console.log(url);
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!

      var data = request.responseText;
        var result = JSON.parse(data);
        for(const stationUse of result.CardSubwayStatsNew.row) {

          var entriesFromCall = stationUse.RIDE_PASGR_NUM;
          var exitsFromCall = stationUse.ALIGHT_PASGR_NUM;

          
          var lineNum = stationUse.LINE_NUM;
          var stationNM = stationUse.SUB_STA_NM;

          if(stationNM.indexOf('(') > -1)  {
            stationNM = stationNM.substring(0, stationNM.indexOf('('));
          }

          if(stationUse.SUB_STA_NM === '서울역') stationNM = '서울';


          if (entriesFromCall && exitsFromCall) {
            for(const station of stationData) {
              if (station.station_name === stationNM && station.line_num == lineNum[0]) {
                var newStationData = station;
                newStationData.entries = entriesFromCall;
                newStationData.exits = exitsFromCall;
                stationListWithUsage.push(newStationData);
              }
            }
          }
        }

      newJsonWithUsageData.stations = stationListWithUsage;
      newJsonWithUsageData.date = date;
      writeFile(newJsonWithUsageData);
    }
  }
  
  request.onerror = function() {
    console.log('There was a connection error of some sort');
  };
  
  request.send();
}

function writeFile(obj) {
  console.log("write file")
  jsonfile.writeFileSync(__dirname + '/turnstile-data/'+contour+'min/'+date+'.json', obj);
}


readJson();