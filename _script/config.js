var version = "0.0.1";

// cod_dev

var Config = {
    mapId: "CODV5",
    apiScope: "cod",
    apiScopeDev: "cod_dev",
    templateURL: "_templates/main.html",
    showDisclaimerOnFirstUse: true,
    disclaimerUrl: "_templates/disclaimer.html",
    infoUrl: "_templates/info.html",
    usePass: false,
    // starting point for map
    mapCoordinates: {
        x: 28.00,
        y: -3,
        zoom: 5,
        bounds: [[13.42,-14.66],[45.59,6.67]]
    },
    defaultBaseLayerIndex : 4,
    // if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
    preLoad : function(){Data.init();},
    // baselayer info
    baselayers:[
        {index: 4, id: "streetsdrc", label: "Rues <font color='grey'>(IPIS)</font>", url: "mapbox://styles/ipisresearch/cjng25pan1ven2sntyfb60gtq"}, // this is streets DRC
        {index: 2, id: "streets", label: "Rues <font color='grey'>(Mapbox)</font>", url:"mapbox://styles/ipisresearch/ciw6jpn5s002r2jtb615o6shz"},
        {index: 5, id: "satellite_bing", label: "Satellite <font color='grey'>(Bing)</font>", url:"http://ecn.t0.tiles.virtualearth.net/tiles/h{quadkey}.jpeg?g=6412", attribution: "© 2018 Microsoft Corporation © 2018 Digital Globe © CNES (2018) Distribution Airbus DS © 2018 HERE"},
        {index: 1, id: "satellite", label: "Satellite <font color='grey'>(Mapbox)</font>", url:"mapbox://styles/ipisresearch/ciw6jsekm003a2jql0w0a7qca"},
        {index: 3, id: "empty", label: "Aucune", url:"mapbox://styles/ipisresearch/cjav3e31blm5w2smunhb32kzm"}
    ],
    // layer info
    layers:{
        visits: {
            id: "mines",
            label: "Sites miniers artisanaux",
            source: function(){return Data.getMines()},
            sourceId: "mines",
            popupOnhover: "name",
            onClick: function(item){
                UI.popup(Data.getMineDetail(item),"minePopup",item.geometry.coordinates,true);
                UI.showDashboard(Data.getMineDetail(item),"mineDashBoard");
            },
            onFilter: function(){
                //Chart.update();
            },
            onLoaded: function(){
                //Chart.update();
            },
            onToggle: function(visible){
                var legend =  document.getElementById("legend");
                visible ? legend.classList.remove("hidden") : legend.classList.add("hidden");
            },
            filterId: 1,
            filters:[
                //{id: "years", index: 1, label: "Année de dernière visite",items: Data.getYears,onFilter: Data.updateFilter,filterProperty:"year",maxVisibleItems:5},
                {id: "minerals", index: 2, label: "Substances minérales",items: Data.getMinerals,onFilter: Data.updateFilter,filterProperty: "minerals",array:true,maxVisibleItems: 5},
                {id: "armedpresence", index: 4,label: "Présence armée",
                    items: Data.getArmyGroups,onFilter: Data.updateFilter,filterProperty: "armygroups",array:true},
                {id: "services", index: 5, label: "Présence services<br>&ensp;<small>(enregistrée à partir de 2015)</small>",
                    items:Data.getServices,onFilter: Data.updateFilter,filterProperty: "services",array:true,maxVisibleItems:6},
                {id: "qualification", index: 6, label: "Qualification ministérielle<br>&ensp;<small>(source: BGR, décembre 2017)</small>",items:[
                        {label: "Vert", value:1 , color: "#29b012"},
                        {label: "Jaune", value:2 , color : "#e0a500"},
                        {label: "Rouge", value:3, color: "#b00012"},
                        {label: "Aucune", value:0, color: "grey"}
                    ],onFilter: Data.updateFilter,filterProperty: "qualification"},
                {id: "workers", index: 7, label: "Nombre de creuseurs",items:[
                        {label: "Aucun / pas de données", value:0},
                        {label: "1 à 50", value:1},
                        {label: "50 à 500", value:2},
                        {label: "Plus que 500", value:3}
                    ],onFilter: Data.updateFilter,filterProperty: "workergroup"},
                {id: "mercury", index: 3, label: "Traitement de l’or au mercure<br>&ensp;<small>(enregistré à partir de 2015)</small>",
                    items: [
                        {label: "Traitement au mercure", value:2},
                        {label: "Pas de traitement au mercure", value:1},
                        {label: "Pas de données", value:0}
                    ],onFilter: Data.updateFilter,filterProperty: "mercury"}//,
                //{id: "projects", index: 8, label: "Projets",items: Data.getProjects,onFilter: Data.updateFilter,filterProperty:"project",maxVisibleItems:5}
            ],
            display:{
                type: 'circle',
                visible: true,
                canToggle: true,
                size:{
                    property: 'workers',
                    interval: [[1, 3.5], [50, 4.5], [500, 6.5], [5000, 8.5]],
                    default: 3
                },
                color: {
                    property: "mineral",
                    data: function(){return Data.getMinerals();}
                },
                belowLayer: 'ref_layer_mines'
            }
        },
        armedgroupareas: {
            id: "armedgroupareas",
            filterId: 8,
            label: "Zones d'ingérence",
            source: function(layer,show){return Data.getArmedGroupAreas(layer,show)},
            sourceId: "armedgroupareas",
            filters:[
                {id: "armedgroups", index: 71, label: "Acteurs armées", items: Data.getArmedGroups, onFilter: Data.updateArmedGroupAreasFilter, filterProperty: "armedgroup_"}
            ],
            display:{
                visible: false,
                canToggle: true,
                type: 'circle',
                circleRadius: {
                    stops: [[1, 2], [5, 15], [8, 30], [10, 50], [15, 100], [20, 300]]
                },
                circleBlur: 0.9,
                color: {
                    property: "armedgroup_",
                    data: function(){return Data.getArmedGroups();},
                    defaultColor: 'transparent'
                },
                circleStrokeColor: 'transparent',
                circleOpacity: 0.3,
                belowLayer: 'ref_layer_armedgroupareas'
            },
            onLoaded: function(){
                Data.updateArmedGroupAreasFilter(Config.layers.armedgroupareas.filters[0]);
            }
        },
        tradelines:{
            id: "tradelines",
            label: "Destination des minerais",
            source: function(layer,show){return Data.getTradelines(layer,show)},
            sourceId: "tradelines",
            display:{ // todo
                type: 'line',
                lineColor: {
                    property: "interference",
                    data: [
                        {label: "Pas d'ingérence armée", value: "0", color : "#012f66"},
                        {label: "Ingérence armée", value: "1", color: "#660401"}
                    ]
                },
                lineOpacity: 0.1,
                lineWidth: {
                    stops: [[1, 1], [6, 1], [12, 6]]
                },
                visible: false,
                canToggle: true,
                belowLayer: 'ref_layer_tradelines'
            },
            filterId: 6,
            filters:[
                {id: "interference", index: 61, label: "Ingérence au site minier", items: [
                        {label: "Pas d'ingérence", value: "0", color : "#00499f"},
                        {label: "Ingérence", value: "1", color: "#960400"}
                    ],onFilter: Data.updateTradelinesFilter,filterProperty:"interference"}
            ],
            onLoaded: function(){
                Data.updateTradelinesFilter(Config.layers.tradelines.filters[0]);
            }
        },
        sellingpoints: {
            id: "pdv",
            filterId: 2,
            label: "Points de vente des minerais",
            source: function(layer,show){return Data.getPdvs(layer,show)},
            sourceId: "pdv",
            popupOnhover: "name",
            onClick: function(item){
                UI.hideDashboard();
                UI.popup(Data.getPdvDetail(item),"pdvPopup",item.geometry.coordinates,true);
            },
            display:{
                visible: false,
                canToggle: true,
                type: 'symbol',
                iconImage: "home-11",
                iconSize: {
                    stops: [[1, 0.5], [7, 0.7], [9, 1]]
                },
                belowLayer: 'ref_layer_pdv'
            }
        },
        roadblocks: {
            id: "roadblocks",
            label: "Barrières routières",
            source: function(layer,show){return Data.getRoadBlocks(layer,show)},
            sourceId: "roadblocks",
            popupOnhover: "name",
            onClick: function(item){
                UI.hideDashboard();
                UI.popup(Data.getRoadBlockDetail(item),"roadblockPopup",item.geometry.coordinates,true);
            },
            display:{
                visible: false,
                canToggle: true,
                type: 'symbol',
                iconImage: {
                    property: "typeFirst",
                    data: [
                        {label: "Acteurs civils", value: "Acteurs civils" , iconImage: "roadblock-7-acteurs_civils"},
                        {label: "Acteurs étatiques", value: "Acteurs étatiques" , iconImage : "roadblock-7-acteurs_etatiques"},
                        {label: "Eléments indépendants", value: "Eléments indépendants", iconImage: "roadblock-7-elements_independants"},
                        {label: "Forces de sécurité", value: "Forces de sécurité", iconImage: "roadblock-7-forces_de_securite"},
                        {label: "Groupes armés", value: "Groupes armés", iconImage: "roadblock-7-groupes_armes"}
                    ]
                },
                iconSize: {
                    stops: [[1, 0.5], [7, 0.7], [9, 1]]
                },
                iconOpacity: {
                    stops: [[1, 0.5], [5, 0.5], [7, 1]]
                },
                belowLayer: 'ref_layer_roadblocks'
            },
            filterId: 3,
            filters:[
                {id: "op", index: 31, label: "Type d'operateurs",items: Data.getOperateurs,onFilter: Data.updateRoadblockFilter,filterProperty:"operateurs",array:true},
                {id: "bar", index: 32, label: "Type de barrière",items: Data.getRoadblockTypes,onFilter: Data.updateRoadblockFilter,filterProperty: "types",array:true}
            ]
        },
        studyzones:{
            id: "studyzones",
            filterId: 7,
            label: "Zones d'études specifiques",
            source: "http://ipis.annexmap.net/api/data/%apiScope%/studyzones",
            sourceId: "studyzones",
            display:{
                type: 'fill',
                fillColor: {
                    property: "project",
                    data: [
                        {label: "South Kivu, 2018: Assessing the impact of Due Diligence programmes", value: "IPIS - Ulula 2018", color: "#c673c9"},
                        {label: "South Kivu, 2018: Evaluation of potential responsible artisanal mine site hubs", value: "IPIS - CBRMT 2018", color: "#D66F3F"},
                        {label: "Mambasa, Ituri, 2017: Artisanal Gold Monitoring Pilot", value: "IPIS - PPA Mambasa 2017", color: "#D53A49"}
                    ]
                },
                fillOpacity: 0.4,
                visible: false,
                canToggle: true,
                belowLayer: 'ref_layer_concessions'
            },
            popupOnhover: "zone",
            onClick: function(item,lngLat){
                UI.hideDashboard();
                UI.popup(item.properties,"studyzonePopup",lngLat,true);
            },
            filters:[
                {id: "project", index: 71, label: "Project",items:[
                        {label: "South Kivu, 2018: Assessing the impact of Due Diligence programmes", value: "IPIS - Ulula 2018", color: "#c673c9"},
                        {label: "South Kivu, 2018: Evaluation of potential responsible artisanal mine site hubs", color: "#D66F3F"},
                        {label: "Mambasa, Ituri, 2017: Artisanal Gold Monitoring Pilot", value: "IPIS - PPA Mambasa 2017", color: "#D53A49"}
                    ],filterProperty: "project",onFilter: MapService.genericFilter}
            ]
            // You can get the project values by MapService.distinct("studyzones","project")
        },
        concessions:{
            id: "concessions",
            filterId: 4,
            filters: [
                {id: "group", index: 41, label: "License", items:[
                        {label: "PR", value: "PR" , color: "#43b7ff"},
                        {label: "PE", value: "PE", color : "#36ae71"},
                        {label: "ZEA", value: "ZEA", color: "#9f2bae"},
                        {label: "ZIN", value: "ZIN", color: "#ae000e"}
                    ], onFilter: Data.updateConcessionFilter,filterProperty: "group"}
            ],
            label: "Titres miniers<br>&ensp;<small>(source: CAMI, 2019)</small>",
            source: function(layer,show){return Data.getConcessions(layer,show)},
            sourceId: "concessions",
            popupOnhover: "name",
            onClick: function(item,lngLat){
                UI.hideDashboard();
                UI.popup(Data.getConcessionsDetail(item),"concessionPopup",lngLat,true);
            },
            display:{
                type: 'fill',
                fillColor: {
                    property: "group",
                    data: [
                        {label: "Permit de Recherche", value: "PR" , color: "#43b7ff"},
                        {label: "Permit d'Exploitation", value: "PE" , color : "#36ae71"},
                        {label: "Zone d'Exploitation Artisanale", value: "ZEA", color: "#9f2bae"},
                        {label: "Zone Interdite", value: "ZIN", color: "#ae000e"}
                    ]
                },
                fillOpacity: 0.3,
                visible: false,
                canToggle: true,
                belowLayer: 'ref_layer_concessions'
            }
        },
        protectedAreas:{
            id: "protectedAreas",
            filterId: 5,
            label: "Aires protégées<br>&ensp;<small>(source: WRI, 2017)</small>",
            source: "http://ipis.annexmap.net/api/data/%apiScope%/protectedareas",
            source2: "http://ipis.annexmap.net/api/geojson/cod_protectedArea.php",
            sourceId: "protectedAreas",
            display:{
                type: 'fill',
                fillColor: "#7d9a5c",
                fillOpacity: 0.4,
                visible: false,
                canToggle: true,
                belowLayer: 'ref_layer_protectedAreas'
            },
            popupOnhover: "name",
            onClick: function(item,lngLat){
                UI.hideDashboard();
                UI.popup(item.properties,"protectedAreaPopup",lngLat,true);
            }
        }
    }
};
