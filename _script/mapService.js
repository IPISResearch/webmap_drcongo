var map;
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


        map.once('style.load', function(e) {
            map.addControl(new mapboxgl.NavigationControl(),'top-left');
            map.fitBounds(Config.mapCoordinates.bounds);

			for (var key in Config.layers){
				if (Config.layers.hasOwnProperty(key)){
					me.addLayer(Config.layers[key]);
				}
			}
        });


    };

    me.addLayer = function(layer){
        var sourceId = layer.source.replace(/\W/g, '');
        var source = mapSources[sourceId];
        if (!source){
			map.addSource(sourceId, {
				type: 'geojson',
				data: layer.source,
				buffer: 0,
				maxzoom: 12
			});
        }

        var colorStops = [];
        layer.filterItems.forEach(function(item){
			colorStops.push([item.value,item.color]);
        });

		map.addLayer({
			'id': layer.id,
			'type': 'circle',
			'source': sourceId,
			'paint': {
				'circle-color': {
					property: layer.filterOn,
					type: 'categorical',
					stops: colorStops
				},
				'circle-radius': {
					'default': 5,
					'property': layer.display.property,
					'type': 'interval',
					'stops': layer.display.interval
				},
				'circle-opacity': 0.6,
				'circle-blur': 0.5
			}
		});

		map.on('mouseenter', layer.id, function () {
			map.getCanvas().style.cursor = 'pointer';
		});
		map.on('mouseleave', layer.id, function () {
			map.getCanvas().style.cursor = '';
		});


		map.on('click', layer.id, function (e) {
			map.flyTo({center: e.features[0].geometry.coordinates});

			if (e.features.length>1) {
			    // TODO: Spiderify ?
            }

            if (layer.onClick) layer.onClick(e.features[0]);

		});

		map.on("filter",function(){
			console.error("filter");
		});

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