var version = "0.0.1";

var Config = {
    templateURL: "main.html",
    // starting point for map
    mapCoordinates: {
        x: -4,
        y: 25,
        zoom: 6,
        bounds: [[13.42,-14.66],[45.59,6.67]]
    },
    // if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
    preLoad : function(){Data.init();},
    // layer info
    layers:{
        visits: {
            id: "mines",
            label: "Sites miniers",
            source: function(){return Data.getMines()},
            sourceId: "mines",
            onClick: function(item){
                UI.popup(item.properties,"minePopup",item.geometry.coordinates);
            },
            onFilter: function(){
                //Chart.update();
            },
			onLoaded: function(){
				//Chart.update();
			},
            filters:[
                {id: "years", label: "Année de dernière visite",items: Data.getYears,onFilter: Data.updateFilter,filterProperty:"year"},
                {id: "minerals", label: "Substances minérales",items: Data.getMinerals,onFilter: Data.updateFilter,filterProperty: "mineral"},
                {id: "mercury", label: "Traitement de l’or observé<br><small>(sites visités à partir de 2015)</small>",
                    items: [
                        {label: "Traitement au mercure", value:2},
                        {label: "Pas de traitement au mercure", value:1},
                        {label: "Pas de données", value:0}
                    ],onFilter: Data.updateFilter,filterProperty: "mercury"},
                {id: "armedpresence", label: "Présence armée<br><small>lors de la dernière visite<small>",
                    items:[
                        {label: "Pas de présence armée constatée", value:0},
                        {label: "Groupe armé local", value:1},
                        {label: "Groupe armé étranger", value:2},
                        {label: "FARDC", value:3}
                    ],onFilter: Data.updateFilter,filterProperty: "armygroup"},
                {id: "services", label: "Présence services<br><small>(sites visités à partir de 2015)</small>",
                        items:Data.getServices,onFilter: Data.updateFilter,filterProperty: "services",array:true},
                {id: "qualification", label: "Qualification ministérielle<br><small>jusqu'à avril 2017</small>",items:[
                    {label: "Vert", value:1 , color: "#29b012"},
                    {label: "Jaune", value:2 , color : "#e0a500"},
                    {label: "Rouge", value:3, color: "#b00012"},
                    {label: "Aucune", value:0, color: "grey"}
                ],onFilter: Data.updateFilter,filterProperty: "qualification"},
                {id: "workers", label: "Nombre de creuseurs",items:[
                    {label: "Aucune", value:0},
                    {label: "<50", value:1},
                    {label: ">50", value:2},
                    {label: ">500", value:3}
                ],onFilter: Data.updateFilter,filterProperty: "workergroup"}
            ],
            display:{
                type: 'circle',
                visible: true,
                canToggle: true,
                size:{
                    property: 'workergroup',
                    interval: [[0, 3], [1, 5], [2, 8], [3, 10]]
                },
                color: {
                    property: "mineral",
                    data: function(){return Data.getMinerals();}
                }
            }
        },
        concessions:{
            id: "concessions",
            label: "Titres miniers (source CAMI)",
            source: "http://ipis.annexmap.net/api/geojson/cod_titres.php",
            sourceId: "concessions",
            display:{
                type: 'fill',
                fillColor: "lightblue",
                visible: false,
                canToggle: true
            }
        },
        protectedAreas:{
            id: "protectedAreas",
            label: "Aires protégées (source : WRI, 2017)",
            source: "http://ipis.annexmap.net/api/geojson/cod_protectedArea.php",
            sourceId: "protectedAreas",
            display:{
                type: 'fill',
                fillColor: "#909E00",
                fillOpacity: 0.4,
                visible: false,
                canToggle: true
            }
        }
    }
};




