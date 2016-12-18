'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;
var jsonfile = require('jsonfile');
var newJsonWithUsageData = {};

var dates = ['20161015', '20161022', '20161029', '20161105', '20161112', '20161119', '20161126', '20161126', '20161203'];
var date = dates[8];

// This is going to check all the bus stops in the system
// and find the matching one. Seoul Data portal only allows
// 1000 stops per a call, so we are going to fetch 1000 by 1000
var busStopTotal = 37249;
var limit = 1000;
var startNum = 1;
var endNum = 1000;

var requestFrequency = 200; // time gap between requests to openAPI.seoul.go.kr:8080

var stationData;

function readJson () {
  fs.readFile(__dirname + '/bus-stops/total-stops-near.json', function(err, data) {
    stationData = JSON.parse(data);
    makeCall();
  });
}

var totalEntries = 0;
var totalExits = 0;
var stationListWithUsage = [];

function makeCall() {
  if(startNum < busStopTotal) {
    var request = new XMLHttpRequest();

    var url ='http://openapi.seoul.go.kr:8088/'+key+'/json/CardBusStatisticsServiceNew/'+startNum+'/'+endNum+'/'+date;

    console.log(url);
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
      // Success!

        var data = request.responseText;
          var result = JSON.parse(data);
          for(const stop of result.CardBusStatisticsServiceNew.row) {
            for(const station of stationData) {
              if (station.STATIONID === stop.BSST_ARS_NO) {
                const already = stationListWithUsage.findIndex(item => item.bus_station_id == station.STATIONID);
                if(already < 0) {
                  var newStopData = {
                    bus_station_name: stop.BUS_STA_NM,
                    bus_station_id: stop.BSST_ARS_NO,
                    near_subway_station: station.station_NM,
                    tm_x: station.TMX,
                    tm_y: station.TMY,
                    route_id: stop.BUS_ROUTE_ID,
                    route_name: stop.BUS_ROUTE_NAME,
                    entires: stop.RIDE_PASGR_NUM,
                    exits: stop.ALIGHT_PASGR_NUM
                  };
                  totalExits+=stop.ALIGHT_PASGR_NUM;
                  totalEntries+=stop.RIDE_PASGR_NUM;
                  stationListWithUsage.push(newStopData);
                }
              }
            }
          }

        } else {
        console.log('reached server, but it returned error');
      }
      startNum+=limit;
      endNum+=limit;
      setTimeout(makeCall, requestFrequency);
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();

  } else {
    newJsonWithUsageData.stops = stationListWithUsage;
    newJsonWithUsageData.date = date;
    newJsonWithUsageData.totalEntries = totalEntries
    newJsonWithUsageData.totalExits = totalExits;
    writeFile(newJsonWithUsageData);
  }
}

function writeFile(obj) {
  console.log("write file")
  jsonfile.writeFileSync(__dirname + '/bus-stops/'+date+'.json', obj);
}


readJson();