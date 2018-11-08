var Data = function () {

    // preload and transform datasets
    var me = {};

    var startYear;
    var endYear;
    var timeOutCount = 0;
    var maxTimeOutRetry = 3;

    var mines = {
        collection: {}, // holds the complete list of mines, not filtered
        clamped: {}, // holds the list of mines, filtered on year
        filtered: {list: [], ids: []}, // holds the final filtered of mines, filtered on year and all other filters
        pCodeIds: {} // matches pCodes to ids as the ids need to be te same even when the base filter changes
    };

    var pdvs, pdvLoaded;
    var pdvsLookup = {};
    var pdvsProperties = {};
    var roadblocks, roadblocksLoaded;
    var roadblocksLookup = {};
    var roadblocksProperties = {};
    var concessions, concessionsLoaded;
    var concessionsLookup = {};
    var tradelines, tradelinesLoaded;
    var tradelinesLookup = {};
    var tradelinesProperties = {};
    var minerals = [];
    var mineralLookup = {};
    var years = [];
    var yearsLookup = {};
    var projects = [];
    var projectsLookup = {};
    var armyGroups = [];
    var armyGroupLookup = {};
    var services = [];
    var servicesLookup = {};
    var operateurs = [];
    var operateursLookup = {};
    var roadblockTypes = [];
    var roadblockTypesLookup = {};
    var armedgroupareas, armedgroupareasLoaded;
    var armedgroupareasLookup = {};
    var armedgroupareasProperties = {};
    var armedgroups = [];
    var armedgroupsLookup = {};
    var groups = [];
    var groupsLookup = {};
    var interferences = [];
    var interferencesLookup = {};
    var pCodeCounter =0;

    var filterFunctionsLookup = {};
    var roadBlockFilterFunctionsLookup = {};
    var armedGroupAreasFilterFunctionsLookup = {};
    var concessionFilterFunctionsLookup = {};
    var tradelineFilterFunctionsLookup = {};

    var mineralColors = {
        "Or": "#DAA520",
        "Cassitérite": "#FFA07A",
        "Coltan": "#1E90FF",
        "Wolframite": "#8b5928",
        "Cuivre": "#C87533",
        "Diamant": "#FFDEAD",
        "Monazite": "#9cc6de",
        "Tourmaline": "#006600",
        "Améthyste": "#9966CB",
        "Argent": "#cfcfcf",
        "Bauxite": "#961f21",
        "Digénite": "#4655b6",
        "Arsénopyrite": "#7491a4",
        "Plomp": "#878787",
        "Manganèse": "#d095c9"
    };

    var operateurColors = {
        "Acteurs civils": "#eb4b8b",
        "Acteurs étatiques": "#cc490c",
        "Eléments indépendants": "#a87e7f",
        "Forces de sécurité": "#520c07",
        "Groupes armés": "#e80c0f"
    };

    var armedgroupsColors = {
        "FARDC - Éléments indiciplinés": "#AD5936", // #ac5023
        "Raïa Mutomboki": "#c3a710", // c3a710
        "NDC": "#368E8B",
        "NDC-Rénové": "#2C98AB",
        "FDLR": "#872A5F",
        "FRPI": "#250988",
        "Maï-Maï Simba (Morgan/ex-Morgan)": "#5379AD",
        "Maï-Maï Simba": "#5379AD",
        "Maï-Maï Yakutumba": "#5379AD",
        "Maï-Maï UPCP": "#5379AD",
        "Maï-Maï UPLD": "#5379AD",
        "Maï-Maï (autre)": "#5379AD",
        "Autre": "#636465",
        'Pas de présence armée constatée': "transparent"
    };

    var qualifications = {
        "not class": 0,
        "vert": 1,
        "jaune": 2,
        "rouge": 3
    };

    var buildProperties = function (item, data) {
        item.properties.pcode = data.i;
        item.properties.name = data.n;
        item.properties.village = data.v;
        item.properties.province = data.pv;
        item.properties.territoire = data.te;
        item.properties.collectivite = data.co;
        item.properties.groupement = data.gr;
        item.properties.source = data.s;
        item.properties.location_origin = data.lo;
        item.properties.qualification = 0;
        item.properties.workergroup = 0;
        item.properties.visits = [];
    };


    me.init = function () {

        var checkpoint = new Date().getTime();
        var now;

        var dataDone = function () {
            if (mines.loaded && roadblocksLoaded && armedgroupareasLoaded) {
                now = new Date().getTime();
                console.log("datasets generated in " + (now - checkpoint) + "ms");

                EventBus.trigger(EVENT.preloadDone);
                //EventBus.trigger(EVENT.filterChanged);
                CodChart.render();
            }
        };

        function loadMines() {
            var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/all?key=ipis";

            FetchService.json(url, function (data,xhr) {

                if (!data){
                    console.error("Failed loading mines");
                    if (xhr.hasTimeOut){
                        timeOutCount++;
                        if (timeOutCount<maxTimeOutRetry){
                            UI.showLoaderTimeOut();
                            loadMines();
                        }else{
                            UI.showLoaderError();
                        }
                    }else{
                        UI.showLoaderError();
                    }
                }else{
                    now = new Date().getTime();
                    console.log("minedata loaded in " + (now - checkpoint) + "ms");
                    checkpoint = now;

                    armyGroups = [];
                    armyGroups.push({
                        label: "Pas de présence armée constatée",
                        value: 0
                    });

                    mines.baseData = data.result;
                    buildMineData(mines.collection);
                    buildMineData(mines.clamped);

                    mines.filtered.list = mines.collection.list.features;
                    mines.total=mines.collection.list.features.length;
                    armyGroups.sort(function (a, b) {
                        return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);
                    });
                    mines.loaded = true;
                    dataDone();
                }
            });
        }


        loadMines();
        //loadPdv();
        loadArmedGroupAreas();
        loadRoadBlocks(dataDone);
        //loadTradelines();

    };

    function buildMineData(target) {

        target.list = featureCollection();
        target.lookup = {};
        target.properties = {};

        mines.baseData.forEach(function (d) {

            var passed = true;
            var date = d.d;
            if (date) {

                var year = parseInt(date.split("-")[0]);
                if (startYear && year<startYear) passed = false;
                if (endYear && year>endYear) passed = false;

                if (passed) {
                    var mine = target.lookup[d.i];
                    if (!mine) {

                        var mineId = mines.pCodeIds[d.i];
                        if (!mineId){
                            pCodeCounter++;
                            mines.pCodeIds[d.i] = pCodeCounter;
                            mineId = pCodeCounter;
                        }
                        mine = featurePoint(d.lt, d.ln);
                        mine.properties.id = mineId;
                        mines.filtered.ids.push(mineId);
                        buildProperties(mine, d);

                        target.list.features.push(mine);
                        target.lookup[d.i] = mine;
                        target.properties[mineId] = mine.properties;
                    }

                    mine.properties.mineral = d.m1;
                    mine.properties.picture = d.pi;


                    var workers = isNaN(parseInt(d.w)) ? -1 : parseInt(d.w);
                    if (isNaN(workers)) {
                        console.error("Workers NAN: " + d.w);
                        workers = -1;
                    }

                    var visit = {
                        date: date,
                        visit_onsite: d.vo,
                        visit_onsite_novisit: d.vo == "0" ? 1 : null,
                        visit_onsite_novisitreason: d.vonvr,
                        workers: workers,
                        hasWorkers: workers >= 0,
                        pits: d.p,
                        pitsType: d.pt,
                        depth: d.dp,
                        // soil: d.sl,
                        qualification: d.q,
                        source: d.s,
                        project: d.pj,
                        location_origin: d.lo,
                        minerals: [],
                        mineralRoutes: [],
                        armies: [],
                        services: [],
                        womanchildren: {},
                        mercury: d.m == 0 ? 1 : d.m == 1 ? 2 : 0,
                        armyPresence: d.ap
                    };

                    for (var i = 1; i < 4; i++) {
                        var mineral = d["m" + i];
                        if (mineral) {
                            visit.minerals.push(mineral);

                            if (!mineralLookup[mineral]) {
                                minerals.push(mineral);
                                mineralLookup[mineral] = true;
                            }
                            visit.mineralRoutes.push({
                                mineral: mineral,
                                color: mineralColors[mineral],
                                sellingPoint: d["m" + i + "sp"],
                                finalDestination: d["m" + i + "fd"]
                            });
                        }
                    }

                    for (i = 1; i < 3; i++) {
                        var army = d["a" + i];
                        if (army) {
                            visit.armies.push({
                                name: army,
                                frequency: d["a" + i + "f"],
                                taxation: d["a" + i + "t"] == 1 ? "oui" : "---",
                                taxationCommerce: d["a" + i + "c"] == 1 ? "oui" : "---",
                                taxationEntrence: d["a" + i + "e"] == 1 ? "oui" : "---",
                                buying: d["a" + i + "b"] == 1 ? "oui" : "---",
                                digging: d["a" + i + "d"] == 1 ? "oui" : "---",
                                forcedLabour: d["a" + i + "l"] == 1 ? "oui" : "---",
                                monopoly: d["a" + i + "m"] == 1 ? "oui" : "---",
                                pillaging: d["a" + i + "p"] == 1 ? "oui" : "---"
                            });
                        }

                        //if (d["a" + i + "c"] == 1) console.error(mine.properties.name);
                        //if (d["m" + i + "fd"]) console.error(mine.properties.name);
                    }

                    // services
                    for (i = 1; i<5; i++){
                      if (d["s" + i])visit.services.push(d["s" + i]);
                    }
                    var phone = d.ph;
                    if (phone){
                      phone = "<b>Couverture téléphonique</b>: " + phone;
                      if (d.pc) phone += " (<small>" + d.pc + "</small>)";
                      visit.services.push(phone);
                    }
                    if (d.it) visit.services.push("<b>iTSCi</b>: " + d.it);

                    // women and children
                    visit.womanchildren = {
                        women: d.wo == 1 ? "oui" : "---",
                        womennight: d.wn == 1 ? "oui" : "---",
                        womensani: d.ws == 1 ? "oui" : "---",
                        womenpregnant: d.wp == 1 ? "oui" : "---",
                        womenwork: d.ww,
                        child15: d.cu == 1 ? "oui" : "---",
                        child15work: d.cw,
                        child1518: d.pu == 1 ? "oui" : "---",
                        child1518work: d.pw
                    };

                    mine.properties.visits.push(visit);


                    if (d.q && visit.project.toLowerCase().indexOf("qualification") >= 0) {
                        mine.properties.qualificationString = d.q;
                        var q = qualifications[d.q.toLowerCase()];
                        if (q >= 0) {
                            mine.properties.qualification = q;
                        } else {
                            console.error("Unknown Qualification: " + d.q);
                        }
                    }

                    // years, visits and properties latest visit
                    if (!mine.lastVisit || date > mine.lastVisit) {
                        mine.properties.year = year;
                        mine.lastVisit = date;

                        if (!yearsLookup[year]) {
                            years.push(year);
                            yearsLookup[year] = true;
                        }

                        mine.properties.minerals = visit.minerals;

                        // armed presence
                        mine.properties.armygroups = [];
                        mine.properties.armies = [];
                        for (i = 1; i < 3; i++) {
                            var army = d["a" + i];

                            var armyType = d["a" + i + "y"];
                            if (armyType === "0") armyType = 0;
                            var armygroupId = 0;
                            if (armyType) {
                                var armyGroup = armyGroupLookup[armyType];
                                if (!armyGroup) {
                                    armyGroup = {
                                        label: armyType,
                                        value: armyGroups.length + 1
                                    };
                                    armyGroups.push(armyGroup);
                                    armyGroupLookup[armyType] = armyGroup;
                                }
                                armygroupId = armyGroup.value;
                            }

                            if (armygroupId) {
                                mine.properties.armies.push(army);
                                mine.properties.armygroups.push(armygroupId);
                                if (i === 1) mine.properties.army = army;
                            }
                        }
                        // also filter on "no army presence"
                        if (mine.properties.armygroups.length === 0) mine.properties.armygroups.push(0);

                        // workers
                        if (workers >= 0) {
                            mine.properties.workers = workers;
                            var workergroup = 0;
                            if (workers > 0) workergroup = 1;
                            if (workers >= 50) workergroup = 2;
                            if (workers >= 500) workergroup = 3;
                            mine.properties.workergroup = workergroup;
                        }

                        // services
                        mine.properties.services = []; // do we only include services from the last visit?
                        for (i = 1; i < 5; i++) {
                            var service = d["s" + i];
                            if (service) {
                                if (!servicesLookup[service]) {
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

                        mine.properties.itsci = d.it;

                        // projects
                        if (d.pj) {
                            mine.properties.project = d.pj;
                            if (!projectsLookup[d.pj]) {
                                projects.push(d.pj);
                                projectsLookup[d.pj] = true;
                            }
                        }
                    }
                }

            }

        });
    }


    function featureCollection() {
        return {
            "type": "FeatureCollection",
            "features": []
        }
    }

    function featurePoint(lat, lon) {
        return {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        }
    }

    me.updateFilter = function (filter, item) {

        var values = [];
        filter.filterItems.forEach(function (item) {
            if (item.checked) values.push(item.value);
        });

        if (values.length === filter.filterItems.length) {
            // all items checked - ignore filter
            filterFunctionsLookup[filter.id] = undefined;
        } else {
            if (filter.array) {
                filterFunctionsLookup[filter.id] = function (item) {
                    var value = item.properties[filter.filterProperty];
                    if (value && value.length) {
                        return value.some(function (v) {
                            return values.includes(v);
                        });
                    }
                    return false;
                };
            } else {
                filterFunctionsLookup[filter.id] = function (item) {
                    return values.includes(item.properties[filter.filterProperty]);
                };
            }
        }

        me.filterMines();
    };

    me.filterMines = function () {

        mines.filtered.list = [];
        mines.filtered.ids = [];
        var filterFunctions = [];

        for (var key in  filterFunctionsLookup) {
            if (filterFunctionsLookup.hasOwnProperty(key) && filterFunctionsLookup[key]) {
                filterFunctions.push(filterFunctionsLookup[key]);
            }
        }

        mines.clamped.list.features.forEach(function (mine) {
            var passed = true;
            var filterCount = 0;
            var filterMax = filterFunctions.length;
            while (passed && filterCount < filterMax) {
                passed = filterFunctions[filterCount](mine);
                filterCount++;
            }
            if (passed) {
                mines.filtered.list.push(mine);
                mines.filtered.ids.push(mine.properties.id);
            }
        });

        // filter specs
        // see https://www.mapbox.com/mapbox-gl-js/style-spec/#types-filter
        // performance tests indicate that the fastest way to combine multiple filters is to
        // generate an array with all the matching id's and have only 1 filter of type "id in array"
        map.setFilter("mines", ['in', 'id'].concat(mines.filtered.ids));

        EventBus.trigger(EVENT.filterChanged);
    };

    me.getMines = function () {
        return mines.collection.list;
    };

    me.getMinesTotal = function () {
        return mines.total;
    };

    me.getFilteredMines = function () {
        return mines.filtered.list;
    };

    me.getYearClamp = function () {
        return {start:startYear,end:endYear};
    };

    me.getMineDetail = function (mine) {
        // hmmm... don't use mine directly: apparently mapbox stores the features as shallow copies.

        var p = mines.collection.properties[mine.properties.id];

        if (!p.hasDetail) {
            p.mineralString = p.minerals.join(", ");

            p.fLongitude = decimalToDegrees(mine.geometry.coordinates[0], "lon");
            p.fLatitude = decimalToDegrees(mine.geometry.coordinates[1], "lat");

            var dates = [];

            var infoYears = [];
            var infoData = {};
            var armyYears = [];
            var armyData = {};
            var servicesYears = [];
            var servicesData = {};
            var womanChildrenYears = [];
            var womanChildrenData = {};
            var substanceYears = [];
            var substanceData = {};


            p.visits.forEach(function (visit) {
                var parts = visit.date.split("-");
                var year = parts[0];
                visit.formattedDate = parts[2] + "/" + parts[1] + "/" + parts[0];
                visit.mineralString = visit.minerals.join(", ");

                var visitDateProject = Template.render("visitDateProject", visit);

                if (visit.mercury === 1) visit.mercuryString = "Non traité";
                if (visit.mercury === 2) visit.mercuryString = "Mercure";

                var hasYear;

                hasYear = infoYears.indexOf(year) >= 0;
                if (!hasYear) {
                    infoYears.push(year);
                    infoData[year] = "";
                }
                infoData[year] += Template.render("visitDetail", visit);

                var hasArmy = false;
                if (visit.armies) {
                    var armyDetails = [];
                    visit.armies.forEach(function (army) {
                        if (army.name) {
                            hasArmy = true;
                            armyDetails.push(Template.render("armydetail", army));
                        }
                    });
                    if (hasArmy) {
                        if (armyYears.indexOf(year) < 0) {
                            armyYears.push(year);
                            armyData[year] = "";
                        }
                        armyData[year] += visitDateProject + Template.get("armydetailheader") + armyDetails.join("");
                    }
                }

                if (!hasArmy && visit.armyPresence == 0) {
                    if (armyYears.indexOf(year) < 0) {
                        armyYears.push(year);
                        armyData[year] = "";
                    }

                    armyData[year] += visitDateProject + Template.get("noArmyPresent");
                }

                if (visit.services.length) {
                    hasYear = servicesYears.indexOf(year) >= 0;
                    if (!hasYear) {
                        servicesYears.push(year);
                        servicesData[year] = "";
                    }

                    var servicesFormatted = [];
                    visit.services.forEach(function (service) {
                        var _service = service.toLowerCase();
                        servicesFormatted.push({
                            //className: (_service.indexOf("saesscam")>=0 || _service.indexOf("itsci")>=0) ? "bold" : "",
                            className: "",
                            name: service
                        });
                    });


                    servicesData[year] += visitDateProject + Template.render("servicesdetail", servicesFormatted);
                }

                var hasWomanChildren = false;
                for (var key in visit.womanchildren) {
                    if (visit.womanchildren.hasOwnProperty(key) && visit.womanchildren[key] && visit.womanchildren[key] != "---") hasWomanChildren = true;
                }
                if (hasWomanChildren) {
                    hasYear = womanChildrenYears.indexOf(year) >= 0;
                    if (!hasYear) {
                        womanChildrenYears.push(year);
                        womanChildrenData[year] = "";
                    }
                    womanChildrenData[year] += visitDateProject + Template.render("womanChildrenDetail", visit.womanchildren);
                }


                if (visit.mineralRoutes.length) {
                    hasYear = substanceYears.indexOf(year) >= 0;
                    if (!hasYear) {
                        substanceYears.push(year);
                        substanceData[year] = "";
                    }

                    substanceData[year] += visitDateProject + Template.render("substancesdetail", visit);
                }

            });

            p.infoTab = "Pas de données";
            if (infoYears.length) {
                p.infoYears = [];
                infoYears.forEach(function (year, index) {
                    p.infoYears.unshift({
                        year: year,
                        id: index,
                        data: infoData[year]
                    })
                });
                p.infoTab = Template.render("yearlist", p.infoYears)
            }

            p.armyTab = "Pas de données";
            if (armyYears.length) {
                p.armyYears = [];
                armyYears.forEach(function (armyYear, index) {
                    p.armyYears.unshift({
                        year: armyYear,
                        id: index,
                        data: armyData[armyYear]
                    })
                });

                p.armyTab = Template.render("yearlist", p.armyYears)
            }

            p.servicesTab = "Pas de présence des services constatée";
            if (servicesYears.length) {
                p.servicesYears = [];
                servicesYears.forEach(function (servicesYear, index) {
                    p.servicesYears.unshift({
                        year: servicesYear,
                        id: index,
                        data: servicesData[servicesYear]
                    })
                });

                p.servicesTab = Template.render("yearlist", p.servicesYears)
            }


            p.womanChildrenTab = "Pas de données";
            if (womanChildrenYears.length) {
                p.womanChildrenYears = [];
                womanChildrenYears.forEach(function (year, index) {
                    p.womanChildrenYears.unshift({
                        year: year,
                        id: index,
                        data: womanChildrenData[year]
                    })
                });

                p.womanChildrenTab = Template.render("yearlist", p.womanChildrenYears)
            }

            p.substancesTab = "Pas de données";
            if (substanceYears.length) {
                p.substanceYears = [];
                substanceYears.forEach(function (substanceYear, index) {
                    p.substanceYears.unshift({
                        year: substanceYear,
                        id: index,
                        data: substanceData[substanceYear]
                    })
                });

                p.substancesTab = Template.render("yearlist", p.substanceYears)
            }


            p.hasDetail = true;
        }

        return p;
    };

    me.getYears = function () {
        return years;
    };

    me.getMinerals = function () {
        var result = [];

        var order = ["Or", "Cassitérite", "Coltan", "Wolframite", "Diamant", "Tourmaline", "Cuivre"].reverse();

        minerals.forEach(function (mineral) {
            result.push({
                label: mineral,
                value: mineral,
                color: mineralColors[mineral] || "grey",
                index: order.indexOf(mineral)
            })
        });

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.getArmyGroups = function () {
        var result = armyGroups;

        var order = ["Pas de présence armée constatée", "FARDC - Pas de données sur les ingérences", "FARDC - Pas d’ingérence constatée", "FARDC - Éléments indiciplinés", "Groupe armé local", "Groupe armé étranger"].reverse();

        result.forEach(function (arm) {
            arm.index = order.indexOf(arm.label)
        });

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.getServices = function () {
        var result = [];

        var order = ["SAESSCAM", "Division des mines", "iTSCi (via SAESSCAM)", "Police des Mines", "Anti-fraude", "PNC", "ANR", "Chefferie"].reverse();

        services.forEach(function (item) {
            result.push({label: item, value: servicesLookup[item], index: order.indexOf(item)})
        });

        // temporary filter to make the list of state services only contain main services
        result = result.filter(function(i){return order.indexOf(i.label) > -1});

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.getProjects = function () {
        return projects.reverse().sort(function (a, b) {
            return a.indexOf('status') >= 0;
        });
    };

    // ---- PdV ----


    function loadPdv(next) {
        var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/pdvall?key=ipis";

        var checkpoint = new Date().getTime();
        FetchService.json(url, function (data) {
            var now = new Date().getTime();
            console.log("pdv data loaded in " + (now - checkpoint) + "ms");

            //build pdv
            var counter = 0;
            pdvs = featureCollection();
            data.result.forEach(function (d) {

                var pdv = pdvsLookup[d.i];
                if (pdv) {

                } else {
                    pdv = featurePoint(d.lt, d.ln);
                    counter++;
                    pdv.properties.id = counter;
                    buildProperties(pdv, d);

                    pdvs.features.push(pdv);
                    pdvsLookup[d.i] = pdv;
                    pdvsProperties[counter] = pdv.properties;
                }

                pdv.properties.mineralString = d.m1 + (d.m2 ? (", " + d.m2) : "") + (d.m3 ? (", " + d.m3) : "");
                pdv.properties.date = d.d;
                pdv.properties.fLongitude = decimalToDegrees(d.ln);
                pdv.properties.fLatitude = decimalToDegrees(d.lt);
                pdv.properties.armedGroupString = d.a1 + (d.a2 ? (", " + d.a2) : "");

            });

            pdvLoaded = true;
            if (next) next();
        });
    }

    me.getPdvs = function (layer, show) {
        if (pdvLoaded) {
            return pdvs;
        } else {
            loadPdv(function () {
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
            });
        }
    };

    me.getPdvDetail = function (pdv) {
        var p = pdvsProperties[pdv.properties.id];
        return p;
    };

    // ---- roadblocks ----


    function loadRoadBlocks(next) {
        var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/roadblocksall?key=ipis";

        var checkpoint = new Date().getTime();
        FetchService.json(url, function (data,xhr) {

            if (!data){
                console.error("Failed loading roadblocks");
                if (xhr.hasTimeOut){
                    timeOutCount++;
                    if (timeOutCount<maxTimeOutRetry){
                        UI.showLoaderTimeOut();
                        loadRoadBlocks(next);
                    }else{
                        UI.showLoaderError();
                    }
                }else{
                    UI.showLoaderError();
                }
            }else{
                var now = new Date().getTime();
                console.log("roadblock data loaded in " + (now - checkpoint) + "ms");

                //build grouping variable
                var counter = 0;
                roadblocks = featureCollection();
                data.result.forEach(function (d) {

                    //define items
                    var roadblock = featurePoint(d.lt, d.ln);

                    //create shortcuts for useful variables, e.g. gor lookup function definition below
                    var type = d.t;
                    var barriere = d.b;

                    //add extra properties and rename variable
                    counter++;
                    roadblock.properties.id = counter;
                    roadblock.properties.name = d.lp;
                    roadblock.properties.date = d.d;
                    roadblock.properties.operateur = d.o;
                    roadblock.properties.type = type;
                    roadblock.properties.typeFirst = type ? type.split(",")[0].trim() : null;
                    roadblock.properties.taxCible = d.tc;
                    roadblock.properties.taxMontant = d.tm;
                    roadblock.properties.barriere = d.b;
                    roadblock.properties.resourcesNaturelles = d.r;
                    roadblock.properties.source = d.s;
					roadblock.properties.year = d.d ? parseInt(d.d.substr(0,4)) : 0;

                    // push to grouping variables
                    roadblocks.features.push(roadblock);
                    roadblocksLookup[counter] = roadblock;
                    roadblocksProperties[counter] = roadblock.properties;

                    //define lookup function
                    roadblock.properties.operateurs = [];
                    roadblock.properties.types = [];
                    if (type) {
                        var list = type.split(",");
                        list.forEach(function (s) {
                            s = s.trim();
                            if (!operateursLookup[s]) {
                                operateurs.push(s);
                                operateursLookup[s] = operateurs.length;
                            }
                            roadblock.properties.operateurs.push(operateursLookup[s]);
                        });
                    }
                    var hasResourcesNaturelles = false;
                    if (barriere) {
                        list = barriere.split(",");
                        list.forEach(function (s) {
                            s = s.trim();
                            if (!roadblockTypesLookup[s]) {
                                roadblockTypes.push(s);
                                roadblockTypesLookup[s] = roadblockTypes.length;
                            }
                            roadblock.properties.types.push(roadblockTypesLookup[s]);
                            if (s.indexOf("naturelles") > 0) hasResourcesNaturelles = true;
                        });
                    }
                    if (!hasResourcesNaturelles) roadblock.properties.resourcesNaturelles = "";

                });

                operateurs.sort();
                roadblockTypes.sort();

                roadblocksLoaded = true;
                if (next) next();
            }
        });
    }


    me.getRoadBlocks = function (layer, show) {

        if (roadblocksLoaded) {
            return roadblocks;
        } else {
            loadRoadBlocks(function () {
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
            });
        }
    };

    me.getRoadBlockDetail = function (roadBlock) {
        return roadblocksProperties[roadBlock.properties.id];
    };

    me.getOperateurs = function () {
        var result = [];

        operateurs.forEach(function (item) {
            result.push({label: item, value: operateursLookup[item], color: operateurColors[item]})
        });

        return result;
    };

    me.getRoadblockTypes = function () {
        var result = [];

        roadblockTypes.forEach(function (item) {
            result.push({label: item, value: roadblockTypesLookup[item]})
        });

        return result;
    };

    me.updateRoadblockFilter = function (filter, item) {
        var values = [];
        filter.filterItems.forEach(function (item) {
            if (item.checked) values.push(item.value);
        });

        if (values.length === filter.filterItems.length) {
            // all items checked - ignore filter
            roadBlockFilterFunctionsLookup[filter.id] = undefined;
        } else {
            if (filter.array) {
                roadBlockFilterFunctionsLookup[filter.id] = function (item) {
                    var value = item.properties[filter.filterProperty];
                    if (value && value.length) {
                        return value.some(function (v) {
                            return values.includes(v);
                        });
                    }
                    return false;
                };
            } else {
                roadBlockFilterFunctionsLookup[filter.id] = function (item) {
                    return values.includes(item.properties[filter.filterProperty]);
                };
            }
        }


        me.filterRoadBlocks();
    };

    me.filterRoadBlocks = function () {
        var filteredIds = [];
        var filtered = [];
        var filterFunctions = [];

        for (var key in  roadBlockFilterFunctionsLookup) {
            if (roadBlockFilterFunctionsLookup.hasOwnProperty(key) && roadBlockFilterFunctionsLookup[key]) {
                filterFunctions.push(roadBlockFilterFunctionsLookup[key]);
            }
        }

        roadblocks.features.forEach(function (roadblock) {
            var passed = true;
            var filterCount = 0;
            var filterMax = filterFunctions.length;
            while (passed && filterCount < filterMax) {
                passed = filterFunctions[filterCount](roadblock);
                filterCount++;
            }

            if (passed && startYear){
				passed = (roadblock.properties.year>=startYear && roadblock.properties.year<=endYear);
            }

            if (passed) {
                filtered.push(roadblock);
                filteredIds.push(roadblock.properties.id);
            }
        });


        map.setFilter("roadblocks", ['in', 'id'].concat(filteredIds));

        EventBus.trigger(EVENT.filterChanged);
    };


    // ---- end roadblocks ----

    // ----  concessions ----


    function loadConcessions(next) {
        var url = "http://ipis.annexmap.net/api/geojson/cod_titres.php";
        var checkpoint = new Date().getTime();
        FetchService.json(url, function (data) {
            var now = new Date().getTime();
            console.log("concession data loaded in " + (now - checkpoint) + "ms");

            //build grouping variable
            var counter = 0;
            concessions = featureCollection();
            data.features.forEach(function (d) {

                //define items
                var concession = d; // defines type, properties and geometry

                //create shortcuts for useful variables, e.g. gor lookup function definition below
                var group = d.properties.group;

                //add extra properties and rename variable
                counter++;
                concession.properties.id = counter;

                // push to grouping variables
                concessions.features.push(concession);
                concessionsLookup[counter] = concession;

                //define lookup function
                concession.properties.groups = [];
                if (group) {
                    if (!groupsLookup[group]) {
                        groups.push(group);
                        groupsLookup[group] = groups.length;
                    }
                    concession.properties.groups.push(groupsLookup[group]);
                }
            });

            concessionsLoaded = true;

            if (next) next();
        });
    }


    me.getConcessions = function (layer, show) {
        if (concessionsLoaded) {
            return concessions;
        } else {
            loadConcessions(function () {
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
            });
        }
    };

    me.getConcessionsDetail = function (concession) {
        var p = concessionsLookup[concession.properties.id];
        if (p) return p.properties;
    };

    me.updateConcessionFilter = function (filter, item) {

        if (!concessionsLoaded) return;

        var values = [];
        filter.filterItems.forEach(function (item) {
            if (item.checked) values.push(item.value);
        });

        if (values.length === filter.filterItems.length) {
            // all items checked - ignore filter
            concessionFilterFunctionsLookup[filter.id] = undefined;
        } else {
            if (filter.array) {
                concessionFilterFunctionsLookup[filter.id] = function (item) {
                    var value = item.properties[filter.filterProperty];
                    if (value && value.length) {
                        return value.some(function (v) {
                            return values.includes(v);
                        });
                    }
                    return false;
                };
            } else {
                concessionFilterFunctionsLookup[filter.id] = function (item) {
                    return values.includes(item.properties[filter.filterProperty]);
                };
            }
        }

        me.filterConcessions();
    };

    me.filterConcessions = function () {
        var filteredIds = [];
        var filtered = [];
        var filterFunctions = [];

        for (var key in  concessionFilterFunctionsLookup) {
            if (concessionFilterFunctionsLookup.hasOwnProperty(key) && concessionFilterFunctionsLookup[key]) {
                filterFunctions.push(concessionFilterFunctionsLookup[key]);
            }
        }

        concessions.features.forEach(function (concession) {
            var passed = true;
            var filterCount = 0;
            var filterMax = filterFunctions.length;
            while (passed && filterCount < filterMax) {
                passed = filterFunctions[filterCount](concession);
                filterCount++;
            }
            if (passed) {
                filtered.push(concession);
                filteredIds.push(concession.properties.id);
            }
        });


        map.setFilter("concessions", ['in', 'id'].concat(filteredIds));

        EventBus.trigger(EVENT.filterChanged);
    };


    // ---- end concessions ----

    // ----  tradelines ----


    function loadTradelines(next) {
        var url = "http://ipis.annexmap.net/api/geojson/cod_tradelines.php";

        var checkpoint = new Date().getTime();
        FetchService.json(url, function (data) {
            var now = new Date().getTime();
            console.log("tradeline data loaded in " + (now - checkpoint) + "ms");

            //build grouping variable
            var counter = 0;
            tradelines = featureCollection();
            data.features.forEach(function (d) {

                //define items
                var tradeline = d; // defines type, properties and geometry

				if (d.properties.visit_date) tradeline.properties.year = parseInt(d.properties.visit_date.substr(0,4));

                //create shortcuts for useful variables, e.g. gor lookup function definition below
                var interference = d.properties.interference;

                //add extra properties and rename variable
                counter++;
                tradeline.properties.id = counter;

                // push to grouping variables
                tradelines.features.push(tradeline);
                tradelinesLookup[counter] = tradeline;
                tradelinesProperties[counter] = tradeline.properties;

                //define lookup function
                tradeline.properties.interferences = [];
                if (interference) {
                    if (!interferencesLookup[interference]) {
                        interferences.push(interference);
                        interferencesLookup[interference] = interferences.length;
                    }
                    tradeline.properties.interferences.push(interferencesLookup[interference]);
                }
            });

            tradelinesLoaded = true;
            if (next) next();

        });
    }

    me.getTradelines = function (layer, show) {
        if (tradelinesLoaded) {
            return tradelines;
        } else {
            loadTradelines(function () {
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
            });
        }
    };

    me.getTradelineDetail = function (tradeline) {
        var p = tradelinesProperties[tradeline.properties.id];
        return p;
    };

    me.updateTradelinesFilter = function (filter, item) {

        var values = [];
        filter.filterItems.forEach(function (item) {
            if (item.checked) values.push(item.value);
        });

        if (values.length === filter.filterItems.length) {
            // all items checked - ignore filter
            tradelineFilterFunctionsLookup[filter.id] = undefined;
        } else {
            if (filter.array) {
                tradelineFilterFunctionsLookup[filter.id] = function (item) {
                    var value = item.properties[filter.filterProperty];
                    if (value && value.length) {
                        return value.some(function (v) {
                            return values.includes(v);
                        });
                    }
                    return false;
                };
            } else {
                tradelineFilterFunctionsLookup[filter.id] = function (item) {
                    return values.includes(item.properties[filter.filterProperty]);
                };
            }
        }

        me.filterTradelines();
    };

    me.filterTradelines = function () {
        var filteredIds = [];
        var filtered = [];
        var filterFunctions = [];

        for (var key in  tradelineFilterFunctionsLookup) {
            if (tradelineFilterFunctionsLookup.hasOwnProperty(key) && tradelineFilterFunctionsLookup[key]) {
                filterFunctions.push(tradelineFilterFunctionsLookup[key]);
            }
        }

        tradelines.features.forEach(function (tradeline) {
            var passed = true;
            var filterCount = 0;
            var filterMax = filterFunctions.length;
            while (passed && filterCount < filterMax) {
                passed = filterFunctions[filterCount](tradeline);
                filterCount++;
            }
			if (passed && startYear){
				passed = (tradeline.properties.year>=startYear && tradeline.properties.year<=endYear);
			}
            if (passed) {
                filtered.push(tradeline);
                filteredIds.push(tradeline.properties.id);
            }
        });


        map.setFilter("tradelines", ['in', 'id'].concat(filteredIds));

        EventBus.trigger(EVENT.filterChanged);
    };


    // ---- end tradelines ----

    // ---- armedgroupareas ----


    function loadArmedGroupAreas(next) {
        var url = "http://ipis.annexmap.net/api/data/"+Config.apiScope+"/armedgroupareasall?key=ipis";

        var checkpoint = new Date().getTime();
        FetchService.json(url, function (data,xhr) {

            if (!data){
                console.error("Failed loading armedgroupareas");
                if (xhr.hasTimeOut){
                    timeOutCount++;
                    if (timeOutCount<maxTimeOutRetry){
                        UI.showLoaderTimeOut();
                        loadArmedGroupAreas(next);
                    }else{
                        UI.showLoaderError();
                    }
                }else{
                    UI.showLoaderError();
                }
            }else{
                var now = new Date().getTime();
                console.log("armedgroupareas data loaded in " + (now - checkpoint) + "ms");

                //build grouping variable
                var counter = 0;
                armedgroupareas = featureCollection();
                data.result.forEach(function (d) {

                    //define items
                    var armedgrouparea = featurePoint(d.lt, d.ln);

                    //add extra properties and rename variable
                    counter++;
                    armedgrouparea.properties.id = counter;
                    armedgrouparea.properties.armedgroup = d.ag;
                    armedgrouparea.properties.armedgroup_ = 
                        (d.ag == null) ? 'Pas de présence armée constatée': 
                        (d.ag == 'FARDC') ? d.tag : // "FARDC - Éléments indiciplinés" etc.
                        (d.ag == 'Raïa Mutomboki') ? d.ag : 
                        (d.ag == 'NDC') ? d.ag : 
                        (d.ag == 'NDC-Rénové') ? d.ag : 
                        (d.ag == 'FRPI') ? d.ag : 
                        d.ag.indexOf("FDLR") > -1 ? "FDLR" : // Also FDLR/Rudi
                        d.ag.indexOf("Morgan") > -1 ? "Maï-Maï Simba (Morgan/ex-Morgan)" : // 
                        d.ag.indexOf("Simba") > -1 ? "Maï-Maï Simba" : // 
                        d.ag.indexOf("Yakutumba") > -1 ? "Maï-Maï Yakutumba" : // 
                        (d.ag == 'Maï-Maï UPCP') ? d.ag : 
                        (d.ag == 'Maï-Maï UPLD') ? d.ag : 
                        d.ag.indexOf("Maï-Maï") > -1 ? "Maï-Maï (autre)" : // 
                        'Autre';
                    armedgrouparea.properties.typearmedgroup = d.tag;
					armedgrouparea.properties.workers = d.w;
                    armedgrouparea.properties.pcode = d.i;
                    armedgrouparea.properties.date = d.d;
                    armedgrouparea.properties.year = d.d ? parseInt(d.d.substr(0,4)) : 0;

                    //create shortcuts for useful variables, e.g. gor lookup function definition below
                    var armedgroup_ = armedgrouparea.properties.armedgroup_;
                    armedgrouparea.pcode = d.i;
                    armedgrouparea.date = d.d;

                    // push to grouping variables
                    armedgroupareas.features.push(armedgrouparea);
                    armedgroupareasLookup[counter] = armedgrouparea;
                    armedgroupareasProperties[counter] = armedgrouparea.properties;

                    //define lookup function
                    if (armedgroup_) {
                            if (!armedgroupsLookup[armedgroup_]) {
                                armedgroups.push(armedgroup_);
                                armedgroupsLookup[armedgroup_] = armedgroup_;
                            }
                    }
                    var hasResourcesNaturelles = false;
                    if (!hasResourcesNaturelles) armedgrouparea.properties.resourcesNaturelles = "";

                });

                armedgroups.sort();

                armedgroupareasLoaded = true;
                if (next) next();
            }
        });
    }


    me.getArmedGroupAreas = function (layer, show) {

        if (armedgroupareasLoaded) {
            return armedgroupareas;
        } else {
            loadArmedGroupAreas(function () {
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) MapService.addLayer(layer);
            });
        }
    };

    me.getArmedGroupAreasDetail = function (armedgroup_) {
        return armedgroupsProperties[armedgroup.properties.id];
    };

    me.getArmedGroups = function () {
        var result = [];

        var order = [
            "FARDC - Éléments indiciplinés", 
            "Raïa Mutomboki", 
            "NDC", 
            "NDC-Rénové", 
            "FDLR", 
            "FRPI",
            "Maï-Maï Simba (Morgan/ex-Morgan)",
            "Maï-Maï Simba",
            "Maï-Maï Yakutumba",
            "Maï-Maï UPCP",
            "Maï-Maï UPLD",
            "Maï-Maï (autre)",
            "Autre" // not "Pas de présence armée constatée"
        ].reverse();
        
        armedgroups.forEach(function (item) {
            result.push({label: item, value: armedgroupsLookup[item], color: armedgroupsColors[item], index: order.indexOf(item)})
        });

        // temporary filter to make the list of state services only contain main armedgroups
        result = result.filter(function(i){return order.indexOf(i.label) > -1});

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.updateArmedGroupAreasFilter = function (filter, item) {
        var values = [];
        filter.filterItems.forEach(function (item) {
            if (item.checked) values.push(item.value);
        });

        if (values.length === filter.filterItems.length) {
            // all items checked - ignore filter
            armedGroupAreasFilterFunctionsLookup[filter.id] = undefined;
        } else {
            if (filter.array) {
                armedGroupAreasFilterFunctionsLookup[filter.id] = function (item) {
                    var value = item.properties[filter.filterProperty];
                    if (value && value.length) {
                        return value.some(function (v) {
                            return values.includes(v);
                        });
                    }
                    return false;
                };
            } else {
                armedGroupAreasFilterFunctionsLookup[filter.id] = function (item) {
                    return values.includes(item.properties[filter.filterProperty]);
                };
            }
        }


        me.filterArmedGroupAreas();
    };

    me.filterArmedGroupAreas = function () {
        var filteredIds = [];
        var filtered = [];
        var filterFunctions = [];

        for (var key in  armedGroupAreasFilterFunctionsLookup) {
            if (armedGroupAreasFilterFunctionsLookup.hasOwnProperty(key) && armedGroupAreasFilterFunctionsLookup[key]) {
                filterFunctions.push(armedGroupAreasFilterFunctionsLookup[key]);
            }
        }

        // first filter on year
        if (startYear){
            armedgroupareas.features.forEach(function (armedgrouparea) {
                if (armedgrouparea.properties.year>=startYear && armedgrouparea.properties.year<=endYear){
                    filtered.push(armedgrouparea);
                }
            });
        }else{
            filtered = armedgroupareas.features;
        }


        // Only keep points from latest visit
        var grouped = filtered.groupBy('pcode');
        var filteredByLastVisit = [];
        for (var pcode in grouped) {
            var featureList = grouped[pcode];
            var latestDate = featureList[featureList.length-1].date; // Assuming ordered by date
            featureList.forEach(function(feature) {
                if (feature.date === latestDate) {
                    filteredByLastVisit.push(feature)
                } else {
                }
            })
        }

        // then apply filters
        filtered = [];
        filteredByLastVisit.forEach(function (armedgrouparea) {
            var passed = true;
            var filterCount = 0;
            var filterMax = filterFunctions.length;
            while (passed && filterCount < filterMax) {
                passed = filterFunctions[filterCount](armedgrouparea);
                filterCount++;
            }

            if (passed) {
                filtered.push(armedgrouparea);
                // filteredIds.push(armedgrouparea.properties.id);
            }
        });

        
        for (var i = 0; i < filtered.length; i++) {
          filteredIds.push(filtered[i].properties.id);
        }

        map.setFilter("armedgroupareas", ['in', 'id'].concat(filteredIds));

        EventBus.trigger(EVENT.filterChanged);
    };


    // ---- end armedgroupareas ----


    me.getColorForMineral = function (mineral) {
        return mineralColors[mineral] || "grey";
    };

    me.updateYearFilter = function (start, end) {
        startYear = start;
        endYear = end;

        if (Config.layers.visits.added){
			buildMineData(mines.clamped);
			me.filterMines();
        }
        if (Config.layers.roadblocks.added) me.filterRoadBlocks();
        if (Config.layers.tradelines.added) me.filterTradelines();
        if (Config.layers.armedgroupareas.added) me.filterArmedGroupAreas();

    };


    return me;


}();
