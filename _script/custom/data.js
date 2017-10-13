var Data = function(){

    // preload and transform datasets
    var me = {};

    var visits;

    var mines;          var minesLookup = {};  var minesProperties = {}
    var minerals = [];  var mineralLookup = {};
    var years = [];     var yearsLookup = {};
    var armies = [];    var armiesLookup = {};
    var services = [];    var servicesLookup = {};

    var filteredMineIds = [];
    var filteredMines = [];
    var filterFunctionsLookup = {};

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

    var qualifications = {
        "not class" : 0,
        "vert": 1,
        "jaune": 2,
        "rouge" : 3
    };

    me.init = function(next){

        var checkpoint = new Date().getTime();
        var now;

        var url = "http://ipis.annexmap.net/api/data/cod/all?key=ipis";
        FetchService.json(url,function(data){

            console.log(data);
            now = new Date().getTime();
            console.log("data preloaded in " +  (now-checkpoint) + "ms");
            checkpoint = now;

            //build mines
            var counter = 0;
            mines = featureCollection();
			data.result.forEach(function(d){

			    var mine = minesLookup[d.i];
			    if (mine){

                }else{
					mine = featurePoint(d.lt,d.ln);
                    counter ++;
                    mine.properties.id = counter;
                    filteredMineIds.push(counter);

                    mine.properties.pcode = d.i;
                    mine.properties.name = d.n;
                    mine.properties.village = d.v;
                    mine.properties.province = d.pv;
                    mine.properties.territoire = d.te;
                    mine.properties.collectivite = d.co;
                    mine.properties.groupement = d.gr;
                    mine.properties.source = d.s;
                    mine.properties.qualification = 0;

                    mine.properties.visits=[];

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
                        qualification: d.q
                    };
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
                            var armygroup = getArmyGroupFromArmy(army);
                            if (armygroup){
                                mine.properties.armies.push(army);
                                mine.properties.armygroups.push(armygroup);
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

			//console.log(mines);
			//console.log(armies);
			//console.log(years);
			//console.log(minerals);

			now = new Date().getTime();
			console.log("datasets generated in " +  (now-checkpoint) + "ms");

			EventBus.trigger(EVENT.preloadDone);
            EventBus.trigger(EVENT.filterChanged);

        });
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

    function getArmyGroupFromArmy(army){
        var result = 0;
        if (army){
            army = army.toLowerCase();
            result = 1;
            if (army.indexOf("fdlr")>=0)  result = 2;
            if (army.indexOf("fardc")>=0)  result = 3;
        }
        return result;
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
        map.setFilter("mines", ['in', 'id'].concat(filteredMineIds));

        EventBus.trigger(EVENT.filterChanged);
    };

    me.getMines = function(){
        return mines;
    };

    me.getFilteredMines = function(){
        return filteredMines;
    };

    me.getMineDetail = function(mine){
        console.error(mine);
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
            p.visits.forEach(function(visit){
                var parts = visit.date.split("-");
                var year = parts[0] + ": ";
                if (p.visits.length<2) year = "";
                dates.push(parts[2] + "/" + parts[1] + "/" + parts[0]);
                if (visit.workers) workers.push(year  + visit.workers);
                if (visit.pits) pits.push(year  + visit.pits);
                if (visit.depth) depth.push(year  + visit.depth);
                if (visit.soil) soil.push(year + visit.soil);
                if (visit.qualification) qualification.push(year + visit.qualification);
            });

            p.datesString = dates.join("<br>");
            p.workersString = workers.join("<br>");
            p.pitsString = pits.join("<br>");
            p.depthString = depth.join("<br>");
            p.soilString = soil.join("<br>");
            p.qualificationString = qualification.join("<br>") || "Aucune";


            p.hasDetail = true;
        }

        return p;
    };

    me.getYears = function(){
        return years;
    };
    me.getMinerals = function(){
        var result = [];

        minerals.forEach(function(mineral){
            result.push({label: mineral, value: mineral, color: mineralColors[mineral] || "grey"})
        });

        return result;


    };

    me.getServices = function(){
        var result = [];

        services.forEach(function(item){
            result.push({label: item, value:servicesLookup[item]})
        });

        return result;


    };

    me.getColorForMineral = function(mineral){
        return mineralColors[mineral] || "grey";
    };


    return me;



}();