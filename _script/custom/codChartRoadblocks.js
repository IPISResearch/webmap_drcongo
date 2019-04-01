var CodChartRoadblocks = function(){

    var me = {};
    var chart;
    var initDone = false;

    me.init = function(){
        document.getElementById("legendRoadblocks").innerHTML = Template.get("legendroadblockschart");
        initDone = true;
    };

    me.render = function(){
        if (!initDone) return;
        if (chart) chart = chart.destroy();

        var roadblocks = Data.getRoadBlocks(); // TODO: get Filtered roadblocks

        var max = Data.getRoadBlocks().features.length;
        var current = Data.getRoadBlocks().features.length; // TODO: adapt to Filtered roadblocks

        // document.getElementById("chart2_current").innerHTML = current.toLocaleString();
        document.getElementById("chart2_total").innerHTML = max.toLocaleString();
        document.getElementById("legendRoadblocks").classList.add("hidden", "high");
        
        var data = {};
        var chartData = {
            columns: [],
            colors: [],
            type : 'donut',
            onclick: function (d, i) { /*console.log("onclick", d, i);*/ },
            onmouseover: function (d, i) { /*console.log("onmouseover", d, i);*/ },
            onmouseout: function (d, i) { /*console.log("onmouseout", d, i);*/ }
        };

        var data = roadblocks.features.map(o => {
            return o.properties.typeFirst;
        });

        var num_acteurs_etatiques =data.filter(function(x){ return x == "Acteurs étatiques"; }).length;
        var num_forces_de_securite =data.filter(function(x){ return x == "Forces de sécurité"; }).length;
        var num_groupes_armes =data.filter(function(x){ return x == "Groupes armés"; }).length;
        var num_elements_independants =data.filter(function(x){ return x == "Eléments indépendants"; }).length;
        var num_acteurs_civils =data.filter(function(x){ return x == "Acteurs civils"; }).length;
        var num_no_data = data.filter(function(x){ return x === null; }).length;
        var num_total = data.length;

        chartData.columns = [
            ['Acteurs étatiques', num_acteurs_etatiques],
            ['Forces de sécurité', num_forces_de_securite],
            ['Groupes armés', num_groupes_armes],
            ['Eléments indépendants', num_elements_independants],
            ['Acteurs civils', num_acteurs_civils],
            ['No data', num_no_data]
        ];
        chartData.colors = {
            'Acteurs étatiques': '#D64217',
            'Forces de sécurité': '#570708',
            'Groupes armés': '#F40013',
            'Eléments indépendants': '#AC7D7F',
            'Acteurs civils': '#F54989',
            'No data': '#0040ff'
        };

        chart = c3.generate({
            bindto: '#chart2',
            size:{
                height: 200,
                width: 190
            },
            data: chartData,
            donut: {
                title: current.toLocaleString(),
                label: {
                    format: function (value) { return Math.round(value*100/current) + "%"}
                }
            },
			      legend: {show: false},
            tooltip: {
                format: {
                    title: function (d) { return "Type&nbsp;d'operateurs"},
                    value: function (value, ratio, id) {
                        return value.toLocaleString() + "&nbsp;barrières";
                    }
                    // value: d3.format(',') // apply this format to both y and y2
                }
            }
        });


    };

    EventBus.on(EVENT.filterChanged,me.render);

    EventBus.on(EVENT.UIReady,function(){
        me.init();
    });



    return me;

}();
