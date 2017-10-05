var version = "0.0.1";

var Config = {
    templateURL: "main.html",
    // starting point for map
    mapCoordinates: {
        x: -3,
        y: 28,
        zoom: 6,
        bounds: [[ 13.950428635463965,-1.4617249780204418],[ 27.978798916874638,10.523013537201109]]
    },
    // layer info
    layers:{
        incidents: {
            id: "incidents1",
            label: "Incidents",
            source: "data/incidents.geojson", // future optimisation: change types to integers instead of full text
            onClick: function(item){
				item.properties.hasFatalities = item.properties.fatalities>0;
				if (item.properties.actors) item.properties.actors = item.properties.actors.split("<br>").join(", ");
                UI.popup(item.properties,"incidentPopup",item.geometry.coordinates);
            },
            onFilter: function(){
                Chart.update();
            },
			onLoaded: function(){
				Chart.update();
			},
            filterOn: "type",
            filterItems:[
                {id: 1, label: "Riots\/Protests", value: "Riots\/Protests", color: 'blue'},
                {id: 2, label: "Violence against civilians", value: "Violence against civilians", color: 'yellow'},
                {id: 3, label: "Violence among civilians", value: "Violence among civilians", color: 'green'},
                {id: 4, label: "Battle: Non-state actor overtakes territory", value: "Battle-Non-state actor overtakes territory", color: 'orange'},
                {id: 5, label: "Battle: No change of territory", value: "Battle-No change of territory", color: 'red'},
                {id: 6, label: "Headquarters or base established", value: "Headquarters or base established", color: 'purple'}
            ],
            display:{
                property: 'fatalities',
                interval: [[0, 5], [1, 8], [10, 10], [30, 15], [60, 20], [100, 30],[200, 40]]
            }
        }
    }
};




