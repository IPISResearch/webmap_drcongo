var Ruler = function(){
    var me = {};
    var  geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    var  linestring = {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': []
        }
    };
    var distanceContainer;
    var setupDone = false;
    var label;
    var rulerActive = false;



    EventBus.on(EVENT.UIReady,function(){
        me.init();
    });

    EventBus.on(EVENT.baseLayerChanged,function(){
        var ruler = document.getElementById("ruler");
        if (ruler) ruler.classList.remove("active");
        me.hide();
    });

    me.init = function(){
        var rulerButton = document.createElement("div");
        rulerButton.id = "ruler";
        rulerButton.title = "Activer l'outil règle";
        rulerButton.addEventListener("click",function(){
            me.toggle();
        });
        document.body.appendChild(rulerButton);

        distanceContainer = document.createElement('div');
        distanceContainer.classList.add('distance-container');
        distanceContainer.style.display = 'none';
        label = document.createElement('pre');
        distanceContainer.appendChild(label);
        document.body.appendChild(distanceContainer);
    }

    me.toggle = function(){
        var ruler = document.getElementById("ruler");
        ruler.classList.toggle("active");
        if (ruler.classList.contains("active")){
            me.show();
        }else{
            me.hide();
        }
    }

    me.show = function(){
        if (!map.getSource('measure-source')) setupDone = false;
        if (!setupDone) setup();
        label.textContent = 'Cliquez sur la carte pour mesurer la distance';
        distanceContainer.style.display = 'block';
        rulerActive = true;
    }

    me.hide = function(){
        geojson.features = [];
        if (map.getSource('measure-source')) map.getSource('measure-source').setData(geojson);
        distanceContainer.style.display = 'none';
        map.getCanvas().style.cursor = '';
        rulerActive = false;
    }


    function setup(){
        map.addSource('measure-source', {
            'type': 'geojson',
            'data': geojson
        });

        map.addLayer({
            id: 'measure-points',
            type: 'circle',
            source: 'measure-source',
            paint: {
                'circle-radius': 5,
                'circle-color': '#000'
            },
            filter: ['in', '$type', 'Point']
        });
        map.addLayer({
            id: 'measure-lines',
            type: 'line',
            source: 'measure-source',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#000',
                'line-width': 2.5
            },
            filter: ['in', '$type', 'LineString']
        });



        map.on('click', function(e){
            if (!rulerActive) return;
            if (!map.getSource('measure-source')){
                me.hide();
                return;
            }
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
            });

            if (geojson.features.length > 1) geojson.features.pop();

            if (features.length) {
                var id = features[0].properties.id;
                geojson.features = geojson.features.filter(
                    function(point){return point.properties.id !== id}
                );
            } else {
                var point = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [e.lngLat.lng, e.lngLat.lat]
                    },
                    'properties': {
                        'id': String(new Date().getTime())
                    }
                };

                geojson.features.push(point);
            }

            if (geojson.features.length > 1) {
                linestring.geometry.coordinates = geojson.features.map(
                    function(point){return point.geometry.coordinates}
                );

                geojson.features.push(linestring);

                var  distance = turf.length(linestring);
                label.textContent = "Distance totale: " + distance.toLocaleString() + "km";
            }else{
                label.textContent = 'Cliquez sur la carte pour mesurer la distance';
            }

            map.getSource('measure-source').setData(geojson);
        });


        map.on('mousemove', function(e){
            if (!rulerActive) return;
            if (!map.getSource('measure-source')){
                me.hide();
                return;
            }
            var  features = map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
            });
            // Change the cursor to a pointer when hovering over a point on the map.
            // Otherwise cursor is a crosshair.
            map.getCanvas().style.cursor = features.length
                ? 'pointer'
                : 'crosshair';
        });

        setupDone = true;
    }

    return me;
}();