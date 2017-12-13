var map;
var MapService = (function() {

  var me = {};

  var mapSources = {};
  var mapLoaded;
  var initStyleLoaded;
  var updateHashTimeout;
  var popupHover;

  me.init = function(){
    mapboxgl.accessToken = 'pk.eyJ1IjoiaXBpc3Jlc2VhcmNoIiwiYSI6IklBazVQTWcifQ.K13FKWN_xlKPJFj9XjkmbQ';

    var hash = document.location.hash.substr(1);
    decodeHash(hash);

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/' + Config.initStyle || 'ipisresearch/ciw6jpn5s002r2jtb615o6shz',
      center: [Config.mapCoordinates.x,Config.mapCoordinates.y],
      zoom: Config.mapCoordinates.zoom
    });

    map.on("zoomend",function(){
      updateHash("zoom ended");
    });

    map.on("moveend",function(){
      updateHash("move ended");
    });

    // Create a hover popup, but don't add it to the map yet.
    popupHover = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on('style.load', function(e) {
      for (var key in Config.layers){
        if (Config.layers.hasOwnProperty(key)){
          var layer = Config.layers[key];
          layer.display = layer.display || {visible: true};
          if (typeof layer.display.visible === "undefined") layer.display.visible = true;

          if (layer.filterId && Config.initLayerIds.length){
            layer.display.visible = Config.initLayerIds.indexOf("" + layer.filterId)>=0;
          }

          if (layer.display.visible){
            me.addLayer(Config.layers[key]);
            if (layer.containerElm) layer.containerElm.classList.remove("inactive");
            if (layer.labelElm) layer.labelElm.classList.remove("inactive");

            // check initial filter
            if (Config.initfilterIds.length && layer.filters){
              layer.filters.forEach(function(filter){
                var state = getFilterState(filter.index);
                if (state && filter.filterItems &&  filter.filterItems.length){
                  for (var i = 0, max = filter.filterItems.length; i<max; i++){
                    // note: filter state contains a leading "1" to handle leading zeros
                    var item = filter.filterItems[i];
                    item.checked = state[i+1]=="1";
                    if (item.elm) item.elm.classList.toggle("inactive",!item.checked);
                  }
                  if (filter.onFilter) filter.onFilter(filter);
                }
              });

            }

          }else{
            if (layer.containerElm) layer.containerElm.classList.add("inactive");
            if (layer.labelElm) layer.labelElm.classList.add("inactive");
            layer.added = false;
          }
        }
      }

      if (!initStyleLoaded){
        map.addControl(new mapboxgl.NavigationControl(),'top-left');
        initStyleLoaded = true;
      }else{
        updateHash("style loaded");
      }

    });

  };

  me.addLayer = function(layer){
    var sourceOrigin = layer.source;

    if (typeof sourceOrigin === "function") {
      sourceOrigin = layer.source();
    }
    var sourceId = layer.sourceId || sourceOrigin.replace(/\W/g, '');

    var source = mapSources[sourceId];
    if (!source){
      map.addSource(sourceId, {
        type: 'geojson',
        data: sourceOrigin,
        buffer: 0,
        maxzoom: 12
      });
    }

    var circleColor = "blue";
    var fillColor;

    var colorStops = [];
    var iconImageStops = [];

    var paint = {};
    var layout = {
      'visibility': 'visible'
    };

    var displayType = "circle";
    if (layer.display.type) displayType = layer.display.type;

    if(layer.display.type === "circle"){

      if (layer.display.color){
        var items =  layer.display.color.data;
        if (typeof layer.display.color.data === "function") items = layer.display.color.data();
        items.forEach(function(item){
          colorStops.push([item.value,item.color]);
        });

        circleColor = {
          property: layer.display.color.property,
          type: 'categorical',
          stops: colorStops
        }
      }

      var circleRadius = 3;
      if (layer.display.size){
        circleRadius = {
          'default': 3,
          'property': layer.display.size.property,
          'type': 'interval',
          'stops': layer.display.size.interval
        }
      }

      paint = {
        'circle-color': circleColor,
        'circle-radius': circleRadius,
        'circle-opacity': 0.5,
        'circle-blur': 0,
        'circle-stroke-width': 0.5,
        'circle-stroke-color': 'white'
      };
    }

    if (displayType === "fill"){
      if (layer.display.fillColor.data){
        var items =  layer.display.fillColor.data;
        if (typeof layer.display.fillColor.data === "function") items = layer.display.fillColor.data();
        items.forEach(function(item){
          colorStops.push([item.value,item.color]);
        });

        fillColor = {
          property: layer.display.fillColor.property,
          type: 'categorical',
          stops: colorStops
        }
      } else {
        if (layer.display.fillColor){
          fillColor = layer.display.fillColor
        }
      }

      paint = {
        'fill-color': fillColor || '#088',
        'fill-opacity': layer.display.fillOpacity || 0.7
      }
    }

    if (displayType === "symbol"){
      // list of standard icons: https://github.com/mapbox/mapbox-gl-styles/tree/master/sprites/basic-v9/_svg
      if (layer.display.iconImage.data){
        var items =  layer.display.iconImage.data;
        if (typeof layer.display.iconImage.data === "function") items = layer.display.iconImage.data();
        items.forEach(function(item){
          iconImageStops.push([item.value,item.iconImage]);
        });

        iconImage = {
          property: layer.display.iconImage.property,
          type: 'categorical',
          stops: iconImageStops
        }
      } else {
        if (layer.display.iconImage){
          iconImage = layer.display.iconImage
        }
      }

      layout = {
        'icon-image': iconImage || "marker-11",
        'icon-allow-overlap' : true,
        'icon-size': layer.display.iconSize || 1
      };

      paint = {
        'icon-opacity': layer.display.iconOpacity || 1
      };
    }

    map.addLayer({
      'id': layer.id,
      'type': displayType,
      'source': sourceId,
      'paint': paint,
      'layout': layout
    },layer.display.belowLayer);

    layer.added = true;

    if (layer.onClick){
        map.on('mouseenter', layer.id, function (e) {
            map.getCanvas().style.cursor = 'pointer';
            // e.features[0].geometry.coordinates
            var co = e.features[0] && e.features[0].geometry && e.features[0].geometry.coordinates ? e.features[0].geometry.coordinates : e.lngLat;
            popupHover.setLngLat(co)
            .setHTML(e.features[0].properties.name)
            .addTo(map);
        });
        map.on('mouseleave', layer.id, function (e) {
            map.getCanvas().style.cursor = '';
            popupHover.remove();
        });
        map.on('click', layer.id, function (e) {
            if (e.features.length>1) {
              // TODO: Spiderify ?
            }
            popupHover.remove();
            layer.onClick(e.features[0],e.lngLat);
        });
    }

    map.on("render", function() {
      if(map.loaded()) {
        if (!mapLoaded){
          mapLoaded = true;
          if (layer.onLoaded) layer.onLoaded();
          updateHash("render");
        }

        if (UI.onRender) UI.onRender();
      }
    });


  };


  me.setStyle = function(styleId){
	  map.setStyle('mapbox://styles/' + styleId);
  };


  // updates the url Hash so links can reproduce the current map state
  function updateHash(reason){
    console.log("update hash " + reason);
    clearTimeout(updateHashTimeout);

    updateHashTimeout = setTimeout(function(){
      var zoom = map.getZoom();
      var center = map.getCenter();
      var bounds = map.getBounds();

      var latitude = center.lat;
      var longitude = center.lng;

      var baseLayer = 0;

      var layerIds = [];
      var filterIds = [];

      Config.baselayers.forEach(function(layer){
        if (layer.active) baseLayer = layer.index;
      });

      for (var key in Config.layers){
        if (Config.layers.hasOwnProperty(key)){
          var layer = Config.layers[key];
          if (layer.id && layer.filterId){
            if (map.getLayer(layer.id)){
              if (map.getLayoutProperty(layer.id, 'visibility') !== "none"){
                layerIds.push(layer.filterId);

                if (layer.filters && layer.filters.length){
                  layer.filters.forEach(function(filter){
                    if (filter.index){
                      var index = filter.index;
                      if (filter.filterItems && filter.filterItems.length){
                          var max = filter.filterItems.length;
                          var count = 0;
                          var a = [1];
                          filter.filterItems.forEach(function(e){
                            if (e.checked){
                              a.push(1);
                              count++;
                            }else{
                              a.push(0);
                            }
                          });
                          if (count<max){
                            // this filter has a state - decode binary state as base36
                            index += "." + parseInt(a.join(""),2).toString(36);
                            filterIds.push(index);
                          }
                      }
                    }
                  });
                }
              }
            }
          }
        }
      }

      var hash = latitude + "/" + longitude + "/" + zoom + "/" + baseLayer + "/" + layerIds.join(",") + "/" + filterIds.join(",");
      decodeHash(hash);
      window.location.hash = hash;
    },50);

  }

  function decodeHash(hash){

    Config.initLayerIds = ["1"];
    Config.initfilterIds = [];
    Config.initBaselayer = Config.defaultBaseLayerIndex;

    if (hash.indexOf("/")>0){
      var urlparams = hash.split("/");
      if (urlparams.length>2){
        Config.mapCoordinates.y = urlparams[0];
        Config.mapCoordinates.x = urlparams[1];
        Config.mapCoordinates.zoom = urlparams[2];
        Config.initBaselayer = urlparams[3] || 2;
        if (urlparams[4]) Config.initLayerIds =  (urlparams[4]).split(",");
        if (urlparams[5]) Config.initfilterIds =  (urlparams[5]).split(",");
      }
    }

    Config.baselayers.forEach(function(baseLayer){
      if (Config.initBaselayer == baseLayer.index){
        Config.initStyle = baseLayer.url;
        baseLayer.active = true;
      }
    });

  }

  function getFilterState(index){
    var sIndex = index + ".";
    var sLen = sIndex.length;
    for (var i = 0, max = Config.initfilterIds.length; i<max;i++){
      if (Config.initfilterIds[i].substr(0,sLen) == sIndex) {
        var stateString = Config.initfilterIds[i].substr(sLen);
        if (stateString){
          return parseInt(stateString,36).toString(2).split("");
        }
      }
    }
  }

  EventBus.on(EVENT.filterChanged,function(){
    updateHash("filter Changed");
  });

  EventBus.on(EVENT.layerChanged,function(){
    updateHash("layer Changed");
  });


  return me;

}());
