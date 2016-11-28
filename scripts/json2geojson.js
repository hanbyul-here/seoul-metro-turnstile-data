var GeoJSON = require('geojson');
var fs = require('fs');
var jsonfile = require('jsonfile');

var lineNum;

fs.readFile(__dirname + '/station-data-with-location/lineSU.json', function(err, data) {
  lineNum = JSON.parse(data).line;
  var stationData = JSON.parse(data).stations;

  var lineGeoJson = GeoJSON.parse(stationData, {Point: ['lat', 'lon']});
  writeStationFile(lineGeoJson);
});


function writeStationFile(obj) {
  obj.line = lineNum;
  console.log("writing geojson")
  jsonfile.writeFileSync(__dirname + '/station-data-with-location/line'+lineNum+'.geojson', obj);
}
