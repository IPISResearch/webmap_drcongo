var version = "0.0.1";

var Config = {
    mapId: "CODV5",
    templateURL: "_templates/main.html",
    showDisclaimerOnFirstUse: true,
    disclaimerUrl: "_templates/disclaimer.html",
    infoUrl: "_templates/info.html",
    // starting point for map
    mapCoordinates: {
      x: 28.00,
      y: -3,
      zoom: 5,
      bounds: [[13.42,-14.66],[45.59,6.67]]
    },
    defaultBaseLayerIndex : 2,
    // if preLoad is defined, this occurs before the map is shown - used to pre-generate datasets etc.
    preLoad : function(){Data.init();},
    // baselayer info
    baselayers:[
        {index: 1, id: "satellite", label: "Satellite", url:"ipisresearch/ciw6jsekm003a2jql0w0a7qca"},
        {index: 2, id: "streets", label: "Rues", url:"ipisresearch/ciw6jpn5s002r2jtb615o6shz"},
        {index: 3, id: "empty", label: "Aucune", url:"ipisresearch/cjav3e31blm5w2smunhb32kzm"}
    ],
    // layer info
    layers:{
        visits: {
            id: "mines",
            label: "Sites miniers artisanales",
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
                {id: "years", index: 1, label: "Année de dernière visite",items: Data.getYears,onFilter: Data.updateFilter,filterProperty:"year",maxVisibleItems:5},
                {id: "minerals", index: 2, label: "Substances minérales",items: Data.getMinerals,onFilter: Data.updateFilter,filterProperty: "minerals",array:true,maxVisibleItems: 5},
                {id: "armedpresence", index: 4,label: "Présence armée",
                items: Data.getArmyGroups,onFilter: Data.updateFilter,filterProperty: "armygroups",array:true},
                {id: "services", index: 5, label: "Présence services<br>&ensp;<small>(enrégistré à partir de 2015)</small>",
                items:Data.getServices,onFilter: Data.updateFilter,filterProperty: "services",array:true,maxVisibleItems:4},
                {id: "qualification", index: 6, label: "Qualification ministérielle<br>&ensp;<small>(source: BGR, avril 2017)</small>",items:[
                  {label: "Vert", value:1 , color: "#29b012"},
                  {label: "Jaune", value:2 , color : "#e0a500"},
                  {label: "Rouge", value:3, color: "#b00012"},
                  {label: "Aucune", value:0, color: "grey"}
                ],onFilter: Data.updateFilter,filterProperty: "qualification"},
                {id: "workers", index: 7, label: "Nombre de creuseurs",items:[
                  {label: "Aucun", value:0},
                  {label: "1 à 50", value:1},
                  {label: "50 à 500", value:2},
                  {label: "Plus que 500", value:3}
                ],onFilter: Data.updateFilter,filterProperty: "workergroup"},
                {id: "mercury", index: 3, label: "Traitement de l’or au mercure<br>&ensp;<small>(enrégistré à partir de 2015)</small>",
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
                  property: 'workergroup',
                  interval: [[0, 2.5], [1, 3], [2, 4], [3, 6]]
                },
                color: {
                  property: "mineral",
                  data: function(){return Data.getMinerals();}
                },
                belowLayer: 'ref_layer_mines'
            }
        },
        tradelines:{
          id: "tradelines",
          label: "Destination de minerais",
          source: function(){return Data.getTradelines()},
          sourceId: "tradelines",
          display:{ // todo
            type: 'line',
            lineColor: {
              property: "interference",
              data: [
                {label: "Pas d'ingérence", value: "0", color : "#012f66"},
                {label: "Ingérence", value: "1", color: "#660401"}
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
          ]
        },
        sellingpoints: {
            id: "pdv",
            filterId: 2,
            label: "Points de vente de minerais",
            source: function(){return Data.getPdvs()},
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
            label: "Barrage routier",
            source: function(){return Data.getRoadBlocks()},
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
              {id: "op", index: 31, label: "Operateurs",items: Data.getOperateurs,onFilter: Data.updateRoadblockFilter,filterProperty:"operateurs",array:true},
              {id: "bar", index: 32, label: "Barriere",items: Data.getRoadblockTypes,onFilter: Data.updateRoadblockFilter,filterProperty: "types",array:true}
          ]
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
            label: "Titres miniers<br>&ensp;<small>(source: CAMI, 2017)</small>",
            source: function(){return Data.getConcessions()},
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
            source: "http://ipis.annexmap.net/api/geojson/cod_protectedArea.php",
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
