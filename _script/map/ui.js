var UI = function(){
    var me = {};

    var menuContainer;

    me.init = function(){
		menuContainer = menuContainer || document.getElementById("menu");
		menuContainer.innerHTML = Template.get("menu");
        menuContainer.className = "active";

        me.buildMenu();
        //Chart.init();
    };

    me.showLoader = function(){
		menuContainer = menuContainer || document.getElementById("menu");
		menuContainer.className = "preloader";
		menuContainer.innerHTML = Template.get("loading");
    };

    me.buildMap = function(){

    };

    me.buildLayer = function(properties){

    };

    me.updateFilter = function(filter,item){
        // filter specs
        // see https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter

        item.checked = !item.checked;
        if (item.checked){item.elm.classList.remove("inactive")}else{item.elm.classList.add("inactive")}

        if (filter.onFilter){
            filter.onFilter(filter,item);
        }

    };

    me.buildMenu = function(){
        var container = document.getElementById("layers");

        for (var key in Config.layers){
            if (Config.layers.hasOwnProperty(key)){
                var layer = Config.layers[key];
                var layerContainer = div("filter");
                var label  = div("label",layer.label);
                layerContainer.appendChild(label);


                layer.filters.forEach(function(filter){
                    var filterContainer = div("filter");
                    var filterLabel  = div("filterlabel",filter.label);

                    filterContainer.appendChild(filterLabel);
                    var itemContainer = div("items");

                    var items = filter.items;
                    if (typeof items === "function") items = filter.items();
                    filter.layer = layer;

                    var filterItems = [];
                    items.forEach(function(item){

                        var filterItem = item;
                        if (typeof item === "string" || typeof item === "number"){
                            filterItem = {label: item}
                        }
                        filterItem.color = filterItem.color || "silver";
                        if (typeof filterItem.value === "undefined") filterItem.value = filterItem.label;

                        var icon = '<i style="background-color: '+filterItem.color+'"></i>';
                        var elm = div("filteritem",icon +  filterItem.label );

                        elm.onclick = function(){me.updateFilter(filter,filterItem)};
                        itemContainer.appendChild(elm);
                        filterItem.elm = elm;
                        filterItem.checked = true;
                        filterItems.push(filterItem);
                    });
                    filter.filterItems = filterItems;

                    filterContainer.appendChild(itemContainer);
                    layerContainer.appendChild(filterContainer);
                });





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