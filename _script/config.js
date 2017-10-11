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
            source: function(){return Data.mines},
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
                {id: "armedpresence", label: "Présence armée <small>lors de la dernière visite<small>",
                    items:[
                        {label: "Pas de présence armée constatée", value:0},
                        {label: "Groupe armé local", value:1},
                        {label: "Groupe armé étranger", value:2},
                        {label: "FARDC", value:3}
                    ],onFilter: Data.updateFilter,filterProperty: "armygroup"},
                {id: "workers", label: "Nombre de creuseurs",items:[
                    {label: "Aucune", value:0},
                    {label: "<50", value:1},
                    {label: ">50", value:2},
                    {label: ">500", value:3}
                ],onFilter: Data.updateFilter,filterProperty: "workergroup"}
            ],
            filterOn: "type",
            filterItems:[
                //{id: 1, label: "Riots\/Protests", value: "Riots\/Protests", color: 'blue'},
                //{id: 2, label: "Violence against civilians", value: "Violence against civilians", color: 'yellow'},
                //{id: 3, label: "Violence among civilians", value: "Violence among civilians", color: 'green'},
                //{id: 4, label: "Battle: Non-state actor overtakes territory", value: "Battle-Non-state actor overtakes territory", color: 'orange'},
                //{id: 5, label: "Battle: No change of territory", value: "Battle-No change of territory", color: 'red'},
                //{id: 6, label: "Headquarters or base established", value: "Headquarters or base established", color: 'purple'}
            ],
            display:{
                size:{
                    property: 'workergroup',
                    interval: [[0, 3], [1, 5], [2, 8], [3, 10]]
                },
                color: {
                    property: "mineral",
                    data: function(){return Data.getMinerals();}
                }
            }
        }
    }
};




