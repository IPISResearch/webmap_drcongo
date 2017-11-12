var map;
var popup_hover;
var MapService = (function() {

    var me = {};

    var mapSources = {};
    var mapLoaded;

    me.init = function(){
        mapboxgl.accessToken = 'pk.eyJ1IjoiaXBpc3Jlc2VhcmNoIiwiYSI6IklBazVQTWcifQ.K13FKWN_xlKPJFj9XjkmbQ';
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [Config.mapCoordinates.x,Config.mapCoordinates.y],
            zoom: Config.mapCoordinates.zoom
        });

        // Create a hover popup, but don't add it to the map yet.
        popup_hover = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });

        map.once('style.load', function(e) {
            map.addControl(new mapboxgl.NavigationControl(),'top-left');
            // map.fitBounds(Config.mapCoordinates.bounds);

			for (var key in Config.layers){
				if (Config.layers.hasOwnProperty(key)){
					var layer = Config.layers[key];
					layer.display = layer.display || {visible: true};
					if (typeof layer.display.visible === "undefined") layer.display.visible = true;

					if (layer.display.visible) me.addLayer(Config.layers[key]);
				}
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

		var colorStops = [];

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
			paint = {
				'fill-color': layer.display.fillColor || '#088',
				'fill-opacity': layer.display.fillOpacity || 0.7
			}
		}

		if (displayType === "symbol"){
			// list of standard icons: https://github.com/mapbox/mapbox-gl-styles/tree/master/sprites/basic-v9/_svg
			layout = {
				'icon-image': layer.display.symbol || "marker-11",
				'icon-allow-overlap' : true
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
        popup_hover.setLngLat(e.features[0].geometry.coordinates)
        .setHTML(e.features[0].properties.name)
        .addTo(map);
			});
			map.on('mouseleave', layer.id, function (e) {
				map.getCanvas().style.cursor = '';
        popup_hover.remove();
			});
			map.on('click', layer.id, function (e) {
				if (e.features.length>1) {
					// TODO: Spiderify ?
				}
        popup_hover.remove();
        layer.onClick(e.features[0]);
			});
		}

		map.on("render", function() {
			if(map.loaded()) {
				if (!mapLoaded){
					mapLoaded = true;
					if (layer.onLoaded) layer.onLoaded();
                }

                if (UI.onRender) UI.onRender();
			}
		});

    };

    return me;

}());
