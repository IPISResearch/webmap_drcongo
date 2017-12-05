var Data = function(){

  // preload and transform datasets
  var me = {};

  var visits;

  var mines;          var minesLookup = {};       var minesProperties = {};
  var pdvs;           var pdvsLookup = {};        var pdvsProperties = {};
  var roadblocks;    var roadblocksLookup = {};  var roadblocksProperties = {};
  var concessions;  var concessionsLookup = {};  var concessionsProperties = {};
  var minerals = [];  var mineralLookup = {};
  var years = [];     var yearsLookup = {};
  var armyGroups = [];    var armyGroupLookup = {};
  var services = [];  var servicesLookup = {};
  var operateurs = [];  var operateursLookup = {};
  var roadblockTypes = [];  var roadblockTypesLookup = {};
  var groups = [];  var groupsLookup = {};

  var filteredMineIds = [];
  var filteredMines = [];
  var filterFunctionsLookup = {};
  var roadBlockFilterFunctionsLookup = {};
  var concessionFilterFunctionsLookup = {};

  var mineralColors = {
    "Or" : "#DAA520",
    "Cassitérite" : "#FFA07A",
    "Coltan" : "#1E90FF",
    "Wolframite" : "#8b5928",
    "Cuivre" : "#C87533",
    "Diamant" : "#FFDEAD",
    "Monazite" : "#9cc6de",
    "Tourmaline" : "#006600",
    "Améthyste" : "#9966CB"
  };

  var operateurColors = {
    "Acteurs civils": "#eb4b8b",
    "Acteurs étatiques": "#cc490c",
    "Eléments indépendants": "#a87e7f",
    "Forces de sécurité": "#520c07",
    "Groupes armés": "#e80c0f"
  };

  var qualifications = {
    "not class" : 0,
    "vert": 1,
    "jaune": 2,
    "rouge" : 3
  };

  me.init = function(){

    var minesLoaded, pdvLoaded, roadblocksLoaded,concessionsLoaded;

    var checkpoint = new Date().getTime();
    var now;

    var dataDone = function(){
      if (minesLoaded && pdvLoaded && roadblocksLoaded && concessionsLoaded){
        now = new Date().getTime();
        console.log("datasets generated in " +  (now-checkpoint) + "ms");

        EventBus.trigger(EVENT.preloadDone);
        EventBus.trigger(EVENT.filterChanged);

      }
    };

    var buildProperties = function(item,data){
      item.properties.pcode = data.i;
      item.properties.name = data.n;
      item.properties.village = data.v;
      item.properties.province = data.pv;
      item.properties.territoire = data.te;
      item.properties.collectivite = data.co;
      item.properties.groupement = data.gr;
      item.properties.source = data.s;
      item.properties.qualification = 0;

      item.properties.visits=[];
    };

    function loadMines(){
      var url = "http://ipis.annexmap.net/api/data/cod/all?key=ipis";
      FetchService.json(url,function(data){

        console.log(data);
        now = new Date().getTime();
        console.log("minedata loaded in " +  (now-checkpoint) + "ms");
        checkpoint = now;

        //build mines
        var counter = 0;
        mines = featureCollection();

		armyGroups.push({
            label: "Pas de présence armée constatée",
            value: 0
        });

        data.result.forEach(function(d){

          var mine = minesLookup[d.i];
          if (mine){

          }else{
            mine = featurePoint(d.lt,d.ln);
            counter ++;
            mine.properties.id = counter;
            filteredMineIds.push(counter);
            buildProperties(mine,d);

            mines.features.push(mine);
            minesLookup[d.i] = mine;
            minesProperties[counter] = mine.properties;
          }

          // minerals
          mine.properties.mineral = d.m1;
          if (mine.properties.mineral && !mineralLookup[mine.properties.mineral]){
            minerals.push(mine.properties.mineral);
            mineralLookup[mine.properties.mineral] = true;
          }


          // years, visits and properties latest visit
          var date = d.d;
          if (date){

            var workers = parseInt(d.w) || 0;
            if (isNaN(workers)){
              console.error("Workers NAN: " + d.w);
              workers = 0;
            }

            var visit = {
              date: date,
              workers: workers,
              pits: d.p,
              depth: d.dp,
              soil: d.sl,
              qualification: d.q,
              armies: [],
              services : [],
              tel : []
            };

			for (var i = 1; i<3; i++){
                var army = d["a" + i];
                if (army){
					visit.armies.push({
                        name: army,
                        frequency:  d["a" + i + "f"],
                        taxation:  d["a" + i + "t"],
                        buying:  d["a" + i + "b"],
                        digging:  d["a" + i + "d"],
                        forcedLabour:  d["a" + i + "l"],
                        pillaging:  d["a" + i + "p"]
                    });
                }
			}

            mine.properties.visits.push(visit);

            var year = parseInt(date.split("-")[0]);
            if (!mine.properties.year || year>mine.properties.year){
              mine.properties.year = year;

              if (!yearsLookup[year]){
                years.push(year);
                yearsLookup[year] = true;
              }

              mine.properties.minerals = [];
              if (d.m1) mine.properties.minerals.push(d.m1);
              if (d.m2) mine.properties.minerals.push(d.m2);

              // armed presence
              mine.properties.armygroups = [];
              mine.properties.armies = [];
              for (i = 1; i<3; i++){
                var army = d["a" + i];

                var armyType = d["a" + i + "y"];
                if (armyType === "0") armyType = 0;
                var armygroupId = 0;
                if (armyType){
                  var armyGroup = armyGroupLookup[armyType];
                  if (!armyGroup){
					  armyGroup = {
					      label: armyType,
                          value: armyGroups.length + 1
                      };
                      armyGroups.push(armyGroup);
					  armyGroupLookup[armyType] = armyGroup;
                  }
                  armygroupId = armyGroup.value;
				}

                if (armygroupId){
                  mine.properties.armies.push(army);
                  mine.properties.armygroups.push(armygroupId);
                  if (i===1) mine.properties.army = army;
                }
              }
              // also filter on "no army presence"
              if (mine.properties.armygroups.length === 0) mine.properties.armygroups.push(0);

              // workers
              mine.properties.workers = workers;
              var workergroup = 0;
              if (workers>0) workergroup=1;
              if (workers>=50) workergroup=2;
              if (workers>=500) workergroup=3;
              mine.properties.workergroup =  workergroup;

              // services
              mine.properties.services = []; // do we only include services from the last visit?
              for (i = 1; i<5; i++){
                var service = d["s" + i];
                if (service){
                  if (!servicesLookup[service]){
                    services.push(service);
                    servicesLookup[service] = services.length;
                  }
                  var serviceId = servicesLookup[service];
                  mine.properties.services.push(serviceId);
                }
              }

              // mercury
              mine.properties.mercury = 0;
              if (d.m == 0) mine.properties.mercury = 1;
              if (d.m == 1) mine.properties.mercury = 2;
            }
          }

          if (d.q){
            var q = qualifications[d.q.toLowerCase()];
            if (q) {
              mine.properties.qualification = q;
            }else{
              console.error("Unknown Qualification: " + d.q);
            }
          }

        });

        filteredMines = mines.features;
        armyGroups.sort(function(a,b) {return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);});
        minesLoaded = true;
        dataDone();

      });
    }

    function loadPdv(){
      var url = "http://ipis.annexmap.net/api/data/cod/pdvall?key=ipis";
      FetchService.json(url,function(data){

        console.log(data);
        now = new Date().getTime();
        console.log("pdv data loaded in " +  (now-checkpoint) + "ms");

        //build pdv
        var counter = 0;
        pdvs = featureCollection();
        data.result.forEach(function(d){

          var pdv = pdvsLookup[d.i];
          if (pdv){

          }else{
            pdv = featurePoint(d.lt,d.ln);
            counter ++;
            pdv.properties.id = counter;
            buildProperties(pdv,d);

            pdvs.features.push(pdv);
            pdvsLookup[d.i] = pdv;
            pdvsProperties[counter] = pdv.properties;
          }

          pdv.properties.mineral = d.m1;

        });

        pdvLoaded = true;
        dataDone();

      });
    }

    function loadRoadBlocks(){
      var url = "http://ipis.annexmap.net/api/data/cod/roadblocksall?key=ipis";
      FetchService.json(url,function(data){

        console.log(data);
        now = new Date().getTime();
        console.log("roadblock data loaded in " +  (now-checkpoint) + "ms");

        //build roadBlocks
        var counter = 0;
        roadblocks = featureCollection();
        data.result.forEach(function(d){

          var roadblock = featurePoint(d.lt,d.ln);
          var type = d.t;
          var barriere = d.b;

          counter ++;
          roadblock.properties.id = counter;
          roadblock.properties.name = d.n;
          roadblock.properties.operateur = d.o;
          roadblock.properties.type = type;
          roadblock.properties.typeFirst = type ? type.split(",")[0].trim() : null;
          roadblock.properties.taxCible = d.tc;
          roadblock.properties.taxMontant = d.tm;
          roadblock.properties.barriere = d.b;
          roadblock.properties.resourcesNaturelles = d.r;

          roadblocks.features.push(roadblock);
          roadblocksLookup[counter] = roadblock;
          roadblocksProperties[counter] = roadblock.properties;

          roadblock.properties.operateurs = [];
          roadblock.properties.types = [];


          if (type){
            var list = type.split(",");
            list.forEach(function(s){
              s = s.trim();
              if (!operateursLookup[s]){
                operateurs.push(s);
                operateursLookup[s] = operateurs.length;
              }
              roadblock.properties.operateurs.push(operateursLookup[s]);
            });

          }

          var hasResourcesNaturelles = false;
          if (barriere){
            list = barriere.split(",");
            list.forEach(function(s){
              s = s.trim();
              if (!roadblockTypesLookup[s]){
                roadblockTypes.push(s);
                roadblockTypesLookup[s] = roadblockTypes.length;
              }
              roadblock.properties.types.push(roadblockTypesLookup[s]);
              if (s.indexOf("naturelles")>0) hasResourcesNaturelles = true;
            });

          }
          if (!hasResourcesNaturelles) roadblock.properties.resourcesNaturelles="";

        });

        operateurs.sort();
        roadblockTypes.sort();

        roadblocksLoaded = true;
        dataDone();

      });
    }

    function loadConcessions(){
      var url = "http://ipis.annexmap.net/api/geojson/cod_titres.php";
      FetchService.json(url,function(data){

        console.log(data);
        now = new Date().getTime();
        console.log("concession data loaded in " +  (now-checkpoint) + "ms");

        //build concessions
        var counter = 0;
        concessions = featureCollection();
        data.features.forEach(function(d){

          var concession = featureMultiPolygon(d.geometry.coordinates);
          var group = d.properties.group;

          counter ++;
          concession.properties.id = counter;
          concession.properties.group = d.properties.group;

          concessions.features.push(concession);
          concessionsLookup[counter] = concession;
          concessionsProperties[counter] = concession.properties;

          concession.properties.groups = [];


          if (group){
            if (!groupsLookup[group]){
              groups.push(group);
              groupsLookup[group] = groups.length;
            }
            concession.properties.groups.push(groupsLookup[group]);

          }

        });

        concessionsLoaded = true;
        dataDone();

      });
    }

    loadMines();
    loadPdv();
    loadRoadBlocks();
    loadConcessions();

  };


  function featureCollection(){
    return {
      "type": "FeatureCollection",
      "features": []
    }
  }

  function featurePoint(lat,lon){
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [lon, lat]
      }
    }
  }

  function featureMultiPolygon(coords){
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": coords
      }
    }
  }


  me.updateFilter = function(filter,item){
    //console.log(filter);
    //console.log(item);

    var values = [];
    filter.filterItems.forEach(function(item){
      if (item.checked) values.push(item.value);
    });

    if (values.length ===  filter.filterItems.length){
      // all items checked - ignore filter
      filterFunctionsLookup[filter.id] = undefined;
    }else{
      if (filter.array){
        filterFunctionsLookup[filter.id] = function(item){
          var value = item.properties[filter.filterProperty];
          if (value && value.length){
            return value.some(function (v){return values.includes(v);});
          }
          return false;
        };
      }else{
        filterFunctionsLookup[filter.id] = function(item){
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }

    me.filterMines();
  };

  me.filterMines = function(){
    filteredMineIds = [];
    filteredMines = [];
    var filterFunctions = [];

    for (var key in  filterFunctionsLookup){
      if (filterFunctionsLookup.hasOwnProperty(key) && filterFunctionsLookup[key]){
        filterFunctions.push(filterFunctionsLookup[key]);
      }
    }

    mines.features.forEach(function(mine){
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount<filterMax){
        passed =  filterFunctions[filterCount](mine);
        filterCount++;
      }
      if (passed) {
        filteredMines.push(mine);
        filteredMineIds.push(mine.properties.id);
      }
    });

    // filter specs
    // see https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter
    // performance tests indicate that the fastest way to combine multiple filters is to
    // generate an array with all the matching id's and have only 1 filter of type "id in array"
    map.setFilter("mines", ['in', 'id'].concat(filteredMineIds));

    EventBus.trigger(EVENT.filterChanged);
  };

  me.getPdvs = function(){
    return pdvs;
  };

  me.getMines = function(){
    return mines;
  };

  me.getFilteredMines = function(){
    return filteredMines;
  };

  me.getMineDetail = function(mine){
    // hmmm... don't use mine directly: apparently mapbox stores the features as shallow copies.

    var p  = minesProperties[mine.properties.id];

    if(!p.hasDetail){
      p.mineralString = p.minerals.join(", ");

      if (p.mercury === 1) p.mercuryString = "Non traité";
      if (p.mercury === 2) p.mercuryString = "Mercure";

      p.fLongitude = decimalToDegrees(mine.geometry.coordinates[0],"lon");
      p.fLatitude = decimalToDegrees(mine.geometry.coordinates[1],"lat");

      var dates = [];
      var workers = [];
      var soil = [];
      var pits = [];
      var depth = [];
      var qualification = [];
      var arrete = [];
      var armyYears = [];
      var armyData = {};

      p.visits.forEach(function(visit){
        var parts = visit.date.split("-");
        var year = parts[0];
        var yearString = year + ": ";
        if (p.visits.length<2) yearString = "";
        dates.push(parts[2] + "/" + parts[1] + "/" + parts[0]);
        if (visit.workers) workers.push(yearString  + visit.workers);
        if (visit.pits) pits.push(yearString  + visit.pits);
        if (visit.depth) depth.push(yearString  + visit.depth);
        if (visit.soil) soil.push(yearString + visit.soil);
        if (visit.qualification) qualification.push(yearString + visit.qualification);
        if (visit.armies){
            var hasArmy = false;
            var armyDetails = [];
			visit.armies.forEach(function(army){
              if (army.name){
                  hasArmy = true;
				  armyDetails.push(Template.render("armydetail",army));
              }
			});
			if (hasArmy) {
			    armyYears.push(year);
				armyData[year] = Template.get("armydetailheader") + armyDetails.join("");
			}
        }
      });

      p.datesString = dates.join("<br>");
      p.workersString = workers.join("<br>");
      p.pitsString = pits.join("<br>");
      p.depthString = depth.join("<br>");
      p.soilString = soil.join("<br>");
      p.qualificationString = qualification.join("<br>") || "Aucune";

      p.armyTab = "";
      if (armyYears.length){
		  p.armyYears = [];
		  armyYears.forEach(function(armyYear){
			  p.armyYears.push({
                  year: armyYear,
                  data: armyData[armyYear]
              })
		  });

		  p.armyTab = Template.render("yeartabs",p.armyYears)
      }else{
		  p.armyTab = "Pas de données";
      }

      p.serviceTab = "Pas de données";
      p.childrenTab = "Pas de données";
      p.phoneTab = "Pas de données";

      console.error(p);

      p.hasDetail = true;
    }

    return p;
  };

  me.getYears = function(){
    return years.reverse();
  };
  me.getMinerals = function(){
    var result = [];

    minerals.forEach(function(mineral){
      result.push({label: mineral, value: mineral, color: mineralColors[mineral] || "grey"})
    });

    return result;

  };

  me.getArmyGroups = function(){
    return armyGroups;
  };

  me.getServices = function(){
    var result = [];

    services.forEach(function(item){
      result.push({label: item, value:servicesLookup[item]})
    });

    return result;
  };

  // ---- roadblocks ----

  me.getRoadBlocks = function(){
    return roadblocks;
  };

  me.getRoadBlockDetail = function(roadBlock){
    var p  = roadblocksProperties[roadBlock.properties.id];
    return p;
  };

  me.getOperateurs = function(){
    var result = [];

    operateurs.forEach(function(item){
      result.push({label: item, value:operateursLookup[item], color: operateurColors[item]})
    });

    return result;
  };

  me.getRoadblockTypes = function(){
    var result = [];

    roadblockTypes.forEach(function(item){
      result.push({label: item, value:roadblockTypesLookup[item]})
    });

    return result;
  };

  me.updateRoadblockFilter = function(filter,item){
    var values = [];
    filter.filterItems.forEach(function(item){
      if (item.checked) values.push(item.value);
    });

    if (values.length ===  filter.filterItems.length){
      // all items checked - ignore filter
      roadBlockFilterFunctionsLookup[filter.id] = undefined;
    }else{
      if (filter.array){
        roadBlockFilterFunctionsLookup[filter.id] = function(item){
          var value = item.properties[filter.filterProperty];
          if (value && value.length){
            return value.some(function (v){return values.includes(v);});
          }
          return false;
        };
      }else{
        roadBlockFilterFunctionsLookup[filter.id] = function(item){
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }


    me.filterRoadBlocks();
  };

  me.filterRoadBlocks = function(){
    var filteredIds = [];
    var filtered = [];
    var filterFunctions = [];

    for (var key in  roadBlockFilterFunctionsLookup){
      if (roadBlockFilterFunctionsLookup.hasOwnProperty(key) && roadBlockFilterFunctionsLookup[key]){
        filterFunctions.push(roadBlockFilterFunctionsLookup[key]);
      }
    }

    roadblocks.features.forEach(function(roadblock){
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount<filterMax){
        passed =  filterFunctions[filterCount](roadblock);
        filterCount++;
      }
      if (passed) {
        filtered.push(roadblock);
        filteredIds.push(roadblock.properties.id);
      }
    });

    console.error(filteredIds);

    map.setFilter("roadblocks", ['in', 'id'].concat(filteredIds));

    EventBus.trigger(EVENT.filterChanged);
  };


  // ---- end roadblocks ----

  me.getConcessions = function(){
    return concessions;
  };

  me.updateConcessionFilter = function(filter,item){

    var values = [];
    filter.filterItems.forEach(function(item){
      if (item.checked) values.push(item.value);
    });

    if (values.length ===  filter.filterItems.length){
      // all items checked - ignore filter
      concessionFilterFunctionsLookup[filter.id] = undefined;
    }else{
      if (filter.array){
        concessionFilterFunctionsLookup[filter.id] = function(item){
          var value = item.properties[filter.filterProperty];
          if (value && value.length){
            return value.some(function (v){return values.includes(v);});
          }
          return false;
        };
      }else{
        concessionFilterFunctionsLookup[filter.id] = function(item){
          return values.includes(item.properties[filter.filterProperty]);
        };
      }
    }

    me.filterConcessions();
  };

  me.filterConcessions = function(){
    var filteredIds = [];
    var filtered = [];
    var filterFunctions = [];

    for (var key in  concessionFilterFunctionsLookup){
      if (concessionFilterFunctionsLookup.hasOwnProperty(key) && concessionFilterFunctionsLookup[key]){
        filterFunctions.push(concessionFilterFunctionsLookup[key]);
      }
    }

    concessions.features.forEach(function(concession){
      var passed = true;
      var filterCount = 0;
      var filterMax = filterFunctions.length;
      while (passed && filterCount<filterMax){
        passed =  filterFunctions[filterCount](concession);
        filterCount++;
      }
      if (passed) {
        filtered.push(concession);
        filteredIds.push(concession.properties.id);
      }
    });

    console.error(filteredIds);

    map.setFilter("concessions", ['in', 'id'].concat(filteredIds));

    EventBus.trigger(EVENT.filterChanged);
  };


  // ---- end concessions ----


  me.getColorForMineral = function(mineral){
    return mineralColors[mineral] || "grey";
  };


  return me;



}();
