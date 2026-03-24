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

    var invalidImages = ["1603371888717.jpg" ,"1604043075787.jpg" ,"1536311829829.jpg" ,"1536564795613.jpg" ,"1536655069146.jpg" ,"1536317211845.jpg" ,"1513429596179.jpg" ,"1536652796478.jpg" ,"1537262057296.jpg" ,"1537362509424.jpg" ,"1633502295582.jpg" ,"1502454447396.jpg" ,"1633761719058.jpg" ,"1622715337820.jpg" ,"1622641401012.jpg" ,"1621341939294.jpg" ,"1442478962688.jpg" ,"1536146890849.jpg" ,"1536737289715.jpg" ,"1536143707638.jpg" ,"1503920809983.jpg" ,"1622024072426.jpg" ,"1536830432573.jpg" ,"1603616730698.jpg" ,"1504256860351.jpg" ,"1439400890201.jpg" ,"1536307353936.jpg" ,"1437201567846.jpg" ,"1622816935949.jpg" ,"1603442281466.jpg" ,"1598617838267.jpg" ,"1632569814479.jpg" ,"1598964890474.jpg" ,"1514765068436.jpg" ,"1514958031625.jpg" ,"1603542125891.jpg" ,"1603443882685.jpg" ,"1603795611591.jpg" ,"1515190832144.jpg" ,"1535545911128.jpg" ,"1625324707955.jpg" ,"1573811819770.jpg" ,"1445060185220.jpg" ,"1624523253126.jpg" ,"1535972912768.jpg" ,"1535974722168.jpg" ,"1536117286795.jpg" ,"1622375110300.jpg" ,"1622716991880.jpg" ,"1598617491546.jpg" ,"1635420382458.jpg" ,"1635251944312.jpg" ,"1535785322894.jpg" ,"1622214778215.jpg" ,"1622816966074.jpg" ,"1598599130799.jpg" ,"1633340898665.jpg" ,"1598609671665.jpg" ,"1621410537000.jpg" ,"1441805075504.jpg" ,"1626080946949.jpg" ,"1626086507416.jpg" ,"1625745323405.jpg" ,"1632829054032.jpg" ,"1626876639804.jpg" ,"1632405775844.jpg" ,"1632383979202.jpg" ,"1626853026359.jpg" ,"1573040734705.jpg" ,"1621425792818.jpg" ,"1622205482536.jpg" ,"1635596947332.jpg" ,"1536058478473.jpg" ,"1536062947400.jpg" ,"1629127764733.jpg" ,"1629451224915.jpg" ,"1535788660610.jpg" ,"1536058600561.jpg" ,"1535973314184.jpg" ,"1535706545020.jpg" ,"1535709146151.jpg" ,"1536050163552.jpg" ,"1536150758337.jpg" ,"1536399672345.jpg" ,"1536763515187.jpg" ,"1536666208480.jpg" ,"1536571687558.jpg" ,"1536750309706.jpg" ,"1537277450662.jpg" ,"1536926276791.jpg" ,"1536997913157.jpg" ,"1537000639230.jpg" ,"1537272747081.jpg" ,"1536831552654.jpg" ,"1429963705642.jpg" ,"1429965561509.jpg" ,"1537776219841.jpg" ,"1515105354677.jpg" ,"1501833401796.jpg" ,"1595581619290.jpg" ,"1633347115938.jpg" ,"1501930157595.jpg" ,"1633606460042.jpg" ,"1633590899590.jpg" ,"1633077544064.jpg" ,"1633006781968.jpg" ,"1632917034773.jpg" ,"1502541462762.jpg" ,"1632746597049.jpg" ,"1632824956390.jpg" ,"1502702350988.jpg" ,"1502623546265.jpg" ,"1539073536330.jpg" ,"1539079074638.jpg" ,"1537696616022.jpg" ,"1537436751469.jpg" ,"1539158720723.jpg" ,"1535534206079.jpg" ,"1621073859912.jpg" ,"1621257087324.jpg" ,"1512378190786.jpg" ,"1598600324681.jpg" ,"1431795320217.jpg" ,"1539155455560.jpg" ,"1539164911834.jpg" ,"1432545844232.jpg" ,"1434271138406.jpg" ,"1488044117601.jpg" ,"1434629496759.jpg" ,"1632033772404.jpg" ,"1435896236652.jpg" ,"1436192613594.jpg" ,"1436032347874.jpg" ,"1436189722199.jpg" ,"1436080820702.jpg" ,"1622806484884.jpg" ,"1437235377370.jpg" ,"1439360235557.jpg" ,"1439205672000.jpg" ,"1535543670768.jpg" ,"1439401442434.jpg" ,"1440384999534.jpg" ,"1440758229701.jpg" ,"1440820559382.jpg" ,"1440986224876.jpg" ,"1441252995889.jpg" ,"1635498973878.jpg" ,"1622196312644.jpg" ,"1536053793870.jpg" ,"1622623924186.jpg" ,"1623086758703.jpg" ,"1443620195744.jpg" ,"1446106695054.jpg" ,"1446021589255.jpg" ,"1446020862347.jpg" ,"1388556452414.jpg" ,"1388550471156.jpg" ,"1446272570170.jpg" ,"1446275124034.jpg" ,"1537351004017.jpg" ,"1537435370747.jpg" ,"1621852782875.jpg" ,"1485278890974.jpg" ,"1625908095637.jpg" ,"1626336546080.jpg" ,"1626698197184.jpg" ,"1625640877077.jpg" ,"1625731709052.jpg" ,"1625136994223.jpg" ,"1632744237534.jpg" ,"1626770144809.jpg" ,"1621679566164.jpg" ,"1622034264727.jpg" ,"1635849794017.jpg" ,"1622799284128.jpg" ,"1536211468592.jpg" ,"1622449407371.jpg" ,"1536826818241.jpg" ,"1536913436475.jpg" ,"1595154144891.jpg" ,"1632298534905.jpg" ,"1501145295725.jpg" ,"1501150260322.jpg" ,"1501227165073.jpg" ,"1501237521957.jpg" ,"1501243494535.jpg" ,"1501246690306.jpg" ,"1501318403129.jpg" ,"1501326268211.jpg" ,"1501397109094.jpg" ,"1501412714651.jpg" ,"1501498712970.jpg" ,"1501509632792.jpg" ,"1501754403602.jpg" ,"1501839562735.jpg" ,"1632564652895.jpg" ,"1501918280004.jpg" ,"1502187582913.jpg" ,"1633676040263.jpg" ,"1502197956130.jpg" ,"1502201415590.jpg" ,"1502276107900.jpg" ,"1502348357252.jpg" ,"1502364500880.jpg" ,"1633249745535.jpg" ,"1502372317440.jpg" ,"1502515681643.jpg" ,"1633678022477.jpg" ,"1502536924341.jpg" ,"1502957261372.jpg" ,"1503124545590.jpg" ,"1503127124206.jpg" ,"1504001221809.jpg" ,"1503992450167.jpg" ,"1504071778026.jpg" ,"1504074376907.jpg" ,"1504168983648.jpg" ,"1504175227100.jpg" ,"1504252061528.jpg" ,"1512206886464.jpg" ,"1512642117695.jpg" ,"1512806986832.jpg" ,"1598599059660.jpg" ,"1633654035361.jpg" ,"1598610324353.jpg" ,"1598978832189.jpg" ,"1632023209644.jpg" ,"1539680885891.jpg" ,"1539616077390.jpg" ,"1598618129653.jpg" ,"1632475370478.jpg" ,"1598615657875.jpg" ,"1632172696699.jpg" ,"1598608153195.jpg" ,"1598716143520.jpg" ,"1535621768634.jpg" ,"1622290364086.jpg" ,"1622803238647.jpg" ,"1622462339428.jpg" ,"1536225795699.jpg" ,"1536485498236.jpg" ,"1536577371835.jpg" ,"1536744702771.jpg" ,"1536924638463.jpg" ,"1537020047103.jpg" ,"1537171842704.jpg" ,"1537175937533.jpg" ,"1537189577476.jpg" ,"1537622036238.jpg" ,"1537610950437.jpg" ,"1537616299187.jpg" ,"1537783717569.jpg" ,"1538302555778.jpg" ,"1539075001319.jpg" ,"1539081063886.jpg" ,"1539333984899.jpg" ,"1539337323891.jpg" ,"1539616763835.jpg" ,"1539679436434.jpg" ,"1539685350664.jpg" ,"1603702302815.jpg" ,"1632494813341.jpg" ,"1576747220855.jpg" ,"1621777950051.jpg" ,"1622890283035.jpg" ,"1622456836867.jpg" ,"1621425687837.jpg" ,"1622717337470.jpg" ,"1632577127506.jpg" ,"1633177923608.jpg" ,"1622798300460.jpg" ,"1632737643937.jpg" ,"1633425276903.jpg" ,"1632836272870.jpg" ,"1595840756791.jpg" ,"1622360906473.jpg" ,"1622545533833.jpg" ,"1632919037379.jpg" ,"1622734718742.jpg" ,"1595926362624.jpg" ,"1633085979387.jpg" ,"1623067774785.jpg" ,"1633415455621.jpg" ,"1598612365790.jpg" ,"1633001421787.jpg" ,"1598964565354.jpg" ,"1632765763874.jpg" ,"1632827186492.jpg" ,"1631444738514.jpg" ,"1598180664945.jpg" ,"1631523048334.jpg" ,"1631863563622.jpg" ,"1632041150677.jpg" ,"1631694064315.jpg" ,"1624085751914.jpg" ,"1630483448642.jpg" ,"1631180688089.jpg" ,"1630397951241.jpg" ,"1629339757875.jpg" ,"1631008507262.jpg" ,"1633523291808.jpg" ,"1631359673599.jpg" ,"1632315831989.jpg" ,"1632648777838.jpg" ,"1632213243030.jpg" ,"1514764891255.jpg" ,"1515016794278.jpg" ,"1603796826875.jpg" ,"1603873890546.jpg" ,"1603886297253.jpg" ,"1604137091210.jpg" ,"1630330168229.jpg" ,"1630578868278.jpg" ,"1630686240625.jpg" ,"1631035848106.jpg" ,"1631093621592.jpg" ,"1635602370660.jpg"]

    var pdvs, pdvLoaded;
    var pdvsLookup = {};
    var pdvsProperties = {};
    var roadblocks, roadblocksLoaded;
    var roadblocksFiltered = [];
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
    var traceabilities = [];
    var traceabilitiesLookup = {};
    var operateurs = [];
    var operateursLookup = {};
    var roadblockTypes = [];
    var roadblockTypesLookup = {};
    var armedgroupareas, armedgroupareasLoaded,armedgroupareasFiltered;
    var armedgroupareasLookup = {};
    var armedgroupareasProperties = {};
    var armedgroups = {};
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
        "Digénite": "#8889a1",
        "Cobalt" : "#0047ab",
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
        "FARDC - Éléments indisciplinés": "#AD5936", // #ac5023
        "FARDC - Pas d’ingérence constatée": "#AD5936",
        "FARDC - Pas de données sur les ingérences": "#AD5936",
        "Police Nationale Congolaise (sauf PMH)" : "#a936ad",
        "Police des Mines (PMH)": "#8536ad",
        "PNC - Éléments indisciplinés" : "#a936ad",
        "PMH - Éléments indisciplinés": "#8536ad",
        "Raïa Mutomboki": "#c3a710", // c3a710
        "Jeunesse Autodéfense Zaïre": "#a4810e",
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
        "UPLC": "#53ad5f",
        "CODECO": "#3a7c23",
        "Autre": "#636465",
        'Pas de présence armée constatée': "transparent"
    };

    var qualifications = {
        "not class": 0,
        "vert": 1,
        "jaune": 2,
        "rouge": 3,
        "bleu": 4
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
        item.properties.images = [];
    };


    me.init = function () {

        var checkpoint = new Date().getTime();
        var now;

        var dataDone = function () {

            if (mines.loaded && roadblocksLoaded  && armedgroupareasLoaded) {

                now = new Date().getTime();
                console.log("datasets generated in " + (now - checkpoint) + "ms");

                EventBus.trigger(EVENT.preloadDone);
                //EventBus.trigger(EVENT.filterChanged);
                CodChart.render();
                CodChartRoadblocks.render();
            }
        };

        function loadMines() {
            var url = "https://geo.ipisresearch.be/api/data/"+Config.apiScope+"/all?key=ipis";

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
        loadArmedGroupAreas(dataDone);
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
                        //mine.properties.itsci = "Pas actif";
                        mines.filtered.ids.push(mineId);
                        buildProperties(mine, d);

                        target.list.features.push(mine);
                        target.lookup[d.i] = mine;
                        target.properties[mineId] = mine.properties;
                    }

                    mine.properties.mineral = d.m1;

                    if (d.pi && invalidImages.indexOf(d.pi)<0){
                        mine.properties.picture = d.pi;
                        mine.properties.images.unshift({imageurl: d.pi});
                        mine.properties.slideshow = mine.properties.images.length>1;
                    }


                    var workers = isNaN(parseInt(d.w)) ? -1 : parseInt(d.w);
                    if (isNaN(workers)) {
                        console.error("Workers NAN: " + d.w);
                        workers = -1;
                    }

                    if (d.tr === "iTSCI (not visited by IPIS)"){
                        d.tr = "iTSCI (pas visité par IPIS)";
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

                    for (i = 1; i < 4; i++) {
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
                                pillaging: d["a" + i + "p"] == 1 ? "oui" : "---",
                                pitOwnership: d["a" + i + "o"] == 1 ? "oui" : "---"
                            });

                            if (d["a" + i + "o"] == 1){
                                //console.error(d.i);
                            }
                        }

                        //if (d["a" + i + "c"] == 1) console.error(mine.properties.name);
                        //if (d["m" + i + "fd"]) console.error(mine.properties.name);
                    }

                    // services
                    for (i = 1; i<5; i++){
                      if (d["s" + i] && (d["s" + i].indexOf("iTSCi")<0)){

                          d["s" + i] = d["s" + i].split("SAESSCAM").join("SAEMAPE");
                          d["s" + i] = d["s" + i].split("Police des Mines").join("PMH");
                          
                          visit.services.push(d["s" + i]);
                      }
                    }
                    var phone = d.ph;
                    if (phone){
                      phone = "<b>Couverture téléphonique</b>: " + phone;
                      if (d.pc) phone += " (<small>" + d.pc + "</small>)";
                      visit.services.push(phone);
                    }
                    
                    if (d.tr){
                        visit.services.push("<b>Présence traçabilité</b>: " + d.tr);
                    }
                    /*
                    if (d.it) {
                        visit.services.push("<b>iTSCi</b>: " + d.it);
                        visit.itsciStatus = "Actif";
                        mine.properties.itsci = "Actif";
                    }else{
                        visit.itsciStatus = "Pas actif";
                    }
                     */

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
                        child1518work: d.pw,
                    };

                    visit.womanchildrencount = {
                        womenCount: parseInt(d.wo),
                        childCount: parseInt(d.cu),
                    }


                    mine.properties.visits.push(visit);


                    if (d.q && visit.project.toLowerCase().indexOf("qualification") >= 0) {
                        mine.properties.qualificationString = d.q;
                        mine.properties.qualificationYear = year;
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
                        mine.properties.traceability = d.tr || "Aucun";
                        mine.properties.hasTraceability = !!d.tr;

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
                        }else{
                            //mine.properties.workers = 0;
                            //if (mine.properties.workers){
                            //    console.error(mine.properties);
                            //}
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

                        // children<15
                        mine.properties.children = -1;
                        if (d.cu == 0) mine.properties.children = 0;
                        if (d.cu == 1) mine.properties.children = 1;
                       

                        // mercury
                        mine.properties.mercury = 0;
                        if (d.m == 0) mine.properties.mercury = 1;
                        if (d.m == 1) mine.properties.mercury = 2;
                        

                        // projects
                        if (d.pj) {
                            mine.properties.project = d.pj;
                            if (!projectsLookup[d.pj]) {
                                projects.push(d.pj);
                                projectsLookup[d.pj] = true;
                            }
                        }

                        if (mine.properties.traceability){
                            if (!traceabilitiesLookup[mine.properties.traceability]) {
                                traceabilities.push(mine.properties.traceability);
                                traceabilitiesLookup[mine.properties.traceability] = true;
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

                if (!visit.services.length && visit.project && visit.project.toLowerCase() === "qualification status"){
                    visit.services.push("Pas de données collectées");
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

                var hasNoWomanChildren = false;
                if (visit.womanchildrencount && visit.womanchildrencount.womenCount === 0 && visit.womanchildrencount.childCount === 0){
                    hasNoWomanChildren = true;
                }

                if (hasWomanChildren || hasNoWomanChildren) {
                    hasYear = womanChildrenYears.indexOf(year) >= 0;
                    if (!hasYear) {
                        womanChildrenYears.push(year);
                        womanChildrenData[year] = "";
                    }

                    if (hasWomanChildren){
                        if (visit.womanchildren.women === "---" && visit.womanchildren.child15 === "oui"){
                            visit.womanchildren.women = "non"
                        }
                        if (visit.womanchildren.women === "oui" && visit.womanchildren.child15 === "---"){
                            visit.womanchildren.child15 = "non"
                        }
                        womanChildrenData[year] += visitDateProject + Template.render("womanChildrenDetail", visit.womanchildren);
                    }else{
                        womanChildrenData[year] += visitDateProject + "Ni femme, ni enfant de moins de 15 ans ne travaille sur le site";
                    }

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

            p.pCode = mine.properties.pcode;


            p.hasDetail = true;
        }

        return p;
    };

    me.getYears = function () {
        return years;
    };

    me.getMinerals = function () {
        var result = [];

        var order = ["Or", "Cassitérite", "Coltan", "Diamant", "Cobalt", "Wolframite","Tourmaline", "Cuivre"].reverse();

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

        var order = ["Pas de présence armée constatée", "FARDC - Pas de données sur les ingérences", "FARDC - Pas d’ingérence constatée", "FARDC - Éléments indisciplinés", "Groupe armé local", "Groupe armé étranger"].reverse();


        result.forEach(function (arm) {
            arm.index = order.indexOf(arm.label)
        });

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.getServices = function () {
        var result = [];

        var order = ["SAEMAPE", "Division des mines", "PMH", "Anti-fraude", "ANR", "Chefferie"].reverse();

        services.forEach(function (item) {
            var data = {label: item, value: servicesLookup[item], index: order.indexOf(item)};
            result.push(data)
        });

        // temporary filter to make the list of state services only contain main services
        result = result.filter(function(i){return order.indexOf(i.label) > -1});

        return result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

    };

    me.getTraceabilities = function(){
       return traceabilities;
    }

    me.getProjects = function () {
        return projects.reverse().sort(function (a, b) {
            return a.indexOf('status') >= 0;
        });
    };

    // ---- PdV ----


    function loadPdv(next) {
        var url = "https://geo.ipisresearch.be/api/data/"+Config.apiScope+"/pdvall?key=ipis";

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
        var url = "https://geo.ipisresearch.be/api/data/"+Config.apiScope+"/roadblocksall?key=ipis";

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

        if (!Config.layers.roadblocks.added) return;


        var filteredIds = [];
        roadblocksFiltered = [];
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
                roadblocksFiltered.push(roadblock);
                filteredIds.push(roadblock.properties.id);
            }
        });


        map.setFilter("roadblocks", ['in', 'id'].concat(filteredIds));

        EventBus.trigger(EVENT.filterChanged);
    };


    me.getFilteredRoadblocks = function(){
        return roadblocksFiltered;
    };


    // ---- end roadblocks ----

    // ----  concessions ----


    function loadConcessions(next) {
        var url = "https://geo.ipisresearch.be/api/geojson/cod_titres2023.php";
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
        var url = "https://geo.ipisresearch.be/api/geojson/cod_tradelines.php";

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
                if (show && layer.labelElm && !(layer.labelElm.classList.contains("inactive"))) {
                    MapService.addLayer(layer);
                }
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
        if (!tradelines) return;
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
        var url = "https://geo.ipisresearch.be/api/data/"+Config.apiScope+"/armedgroupareasall?key=ipis";
        //url = "https://geo.ipisresearch.be/api/data/cod_dev/armedgroupareasall?key=ipis";

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

                    var armedgroup_;

                    armedgroup_ = sanitizeArmedGroup(d.ag,d.tag);
                    armedgrouparea.properties.armedgroup_ = armedgroup_;

                    armedgroups[armedgroup_] = armedgroups[armedgroup_] || 0;
                    armedgroups[armedgroup_]++;

                    armedgrouparea.properties.typearmedgroup = d.tag;
                    armedgrouparea.properties.workers = d.w;
                    armedgrouparea.properties.pcode = d.i;
                    armedgrouparea.properties.date = d.d;
                    armedgrouparea.properties.year = d.d ? parseInt(d.d.substr(0,4)) : 0;
                    armedgrouparea.properties.resourcesNaturelles = "";


                    armedgrouparea.pcode = d.i;
                    armedgrouparea.date = d.d;

                    // push to grouping variables
                    armedgroupareas.features.push(armedgrouparea);
                    armedgroupareasLookup[counter] = armedgrouparea;
                    armedgroupareasProperties[counter] = armedgrouparea.properties;

                });

                // set <5 armed groups to 'other'
                var othercount = 0;
                var otherGroups = [];
                for (var key in armedgroups) {
                    if (armedgroups[key] < 10) {
                        othercount += armedgroups[key];
                        delete armedgroups[key];
                        otherGroups.push(key);
                    }
                }
                if (othercount > 0){
                    armedgroupareas.features.forEach(function (armedgrouparea) {
                        if (otherGroups.includes(armedgrouparea.properties.armedgroup_)){
                            armedgrouparea.properties.armedgroup_ = 'Autre';
                        }
                    });
                }
                armedgroups['Autre'] = othercount;



                armedgroupareasLoaded = true;
                if (next) next();
            }
        });
    }

    function sanitizeArmedGroup(armedgroup,tag){
        if (armedgroup == null) return 'Pas de présence armée constatée';
        if (armedgroup === 'FARDC') return tag;
        if (armedgroup === 'Police des Mines (PMH)') return tag;
        if (armedgroup === 'Police Nationale Congolaise (sauf PMH)') return tag;
        if (armedgroup === 'CODECO ') return 'CODECO';
        if (armedgroup === 'Maï-Maï UPCP') return 'Maï-Maï UPCP';
        if (armedgroup === 'Maï-Maï UPLD') return 'Maï-Maï UPLD';
        if (armedgroup.indexOf("Morgan")>=0) return "Maï-Maï Simba (Morgan/ex-Morgan)";
        if (armedgroup.indexOf("Simba")>=0) return 'Maï-Maï Simba';
        if (armedgroup.indexOf("Yakutumba")>=0) return 'Maï-Maï Yakutumba';
        if (armedgroup.indexOf("Maï-Maï")>=0) return 'Maï-Maï (autre)';
        return armedgroup || 'Autre';

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


    me.getArmedGroups = function () {

        var result = [];

        Object.keys(armedgroups).forEach(function (item) {
            if (item === 'Pas de présence armée constatée') return;
            result.push({label: item, value: item, color: armedgroupsColors[item] || "#636465" ,index: armedgroups[item]});
        });

        // order on number of occurrences
        result.sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
        });

        // group similar armed groups together, push 'other' to the end
        var names = [];
        result.forEach(function (item) {
            var firstWord = item.label.split(" ")[0];
            var index = names.indexOf(firstWord);
            if (index < 0) {
                names.push(firstWord);
                index = names.length - 1;
            }
            item.index = index;
            if (item.label === 'Autre') item.index = 1000;
        });

        result.sort(function (a, b) {
            return a.index > b.index ? 1 : -1;
        });




        return result;

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

        if (!Config.layers.armedgroupareas.added) return;
        if (map.getLayer("armedgroupareas") === undefined) return;

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
        console.log("updating YearFilter");
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

    var errorImages = [];

    me.listImages = function(){
        var list = [];
        for (var key in mines.collection.lookup){
            var mine = mines.collection.lookup[key];
            if (mine.properties.images.length>0){
                list = list.concat(mine.properties.images);
            }
        }


        var index = -1;
        function nextImage(){
            index++;
            if (index<list.length){
                console.log("todo: " + (list.length-index));
                var item = list[index];
                var image = new Image();
                image.onerror = function(){
                    console.error("image error");
                    errorImages.push(item.imageurl);
                    setTimeout(function(){
                        nextImage();
                    },100)
                }
                image.onload = function(){
                    setTimeout(function(){
                        nextImage();
                    },100)
                }
                image.src = "https://www.ipisresearch.be/mapping/webmapping/resources/img_sites/" + item.imageurl;
            }else{
                console.log("done");
            }

        }

        nextImage();


    }

    me.getErrorImages = function(){
        console.error(errorImages);
    }


    return me;


}();
