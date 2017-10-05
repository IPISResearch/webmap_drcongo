var UI = function(){
    var me = {};

    me.init = function(){
		var container = document.getElementById("menu");
		container.innerHTML = Template.get("menu");
        me.buildMenu();
        Chart.init();
    };

    me.buildLayer = function(properties){

    };

    me.updateFilter = function(layer,item){
        // filter specs
        // see https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter

        item.checked = !item.checked;
        if (item.checked){item.elm.classList.remove("inactive")}else{item.elm.classList.add("inactive")}

        var filter = [];
        layer.filterItems.forEach(function(item){
           if (item.checked) filter.push(item.value);
        });


       // map.setFilter('incidents1', ['==', 'type',item.dataset.value]);
        map.setFilter(layer.id, ['in', 'type'].concat(filter));
        me.onRender = function(){
			me.onRender = false;
			if (layer.onFilter) layer.onFilter();
        };



        // map.queryRenderedFeatures({ layers: ['incidents1'] });
    };

    me.buildMenu = function(){
        var container = document.getElementById("layers");

        for (var key in Config.layers){
            if (Config.layers.hasOwnProperty(key)){
                var layer = Config.layers[key];
                var layerContainer = div("filter");
                var label  = div("label",layer.label);
                var items = div("items");

                layer.filterItems.forEach(function(item){
                    var icon = '<i style="background-color: '+item.color+'"></i>';
                    var elm = div("filteritem",icon + item.label);
                    elm.onclick = function(){me.updateFilter(layer,item)};
                    items.appendChild(elm);
                    item.elm = elm;
                    item.checked = true;
                });

                layerContainer.appendChild(label);
                layerContainer.appendChild(items);
                container.appendChild(layerContainer);
            }
        }
    };

    me.popup = function(data,template,point){

        var html = data;
        if (template) html = Template.render(template,data);

		new mapboxgl.Popup()
			.setLngLat(point)
			.setHTML(html)
			.addTo(map);
    };

    function div(className,innerHTML){
        var d = document.createElement("div");
        if (className) d.className = className;
        if (innerHTML) d.innerHTML = innerHTML;
        return d;
    }

    return me;

}();