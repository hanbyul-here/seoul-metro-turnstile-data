var TangramUtil = function (scene) {

  this.scene = scene;

  this.addData = function (dataLayerName, customData, customStyle) {
    if (!customStyle) customStyle = { 'lines': { 'order': 1000, 'width': '2px', 'color': 'red' } };
    this.scene.config.layers[dataLayerName] = { 'data': { 'source': dataLayerName }, 'draw': customStyle };
    this.scene.setDataSource(dataLayerName, { type: 'GeoJSON', url: customData.url});
  }

  this.removeData = function (dataLayerName) {
    var newDataSources = {};
    for (var sourceName in this.scene.config.sources){
      if (sourceName === dataLayerName) ;
      else {
        newDataSources[sourceName] = this.scene.config.sources[sourceName];
      }
    }
    this.scene.config.sources = newDataSources;
    this.scene.updateConfig();
  }
};
