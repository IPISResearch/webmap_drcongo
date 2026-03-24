var Kufatilia = function(){
    var me = {};

    me.fetch = function() {
        var target = document.getElementById('kufatilia');
        if (!target) return;
        var  pcode = target.getAttribute('data-id');

        target.innerHTML = '<div class="lds-dual-ring"></div>';
        console.log('Fetching data for ' + pcode, target);

        var url = "https://kufatilia.ipisresearch.be/api/pcode/" + pcode;
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (data && data.incidents && data.incidents.length > 0){
                var  html = '';

                data.incidents.forEach(function(incident){
                    var parts = incident.date.split("/");
                    var year = parts[0];
                    incident.formattedDate = parts[2] + "/" + parts[1] + "/" + parts[0];
                    html += Template.render("kufatiliaDetail", incident);
                });

                target.innerHTML = html;

            }else{
                target.innerHTML = "Pas de données";

            }
          console.error(data);
        }).catch(function() {
            console.error('Error fetching data');
            target.innerHTML = "Pas de données";
        });
    }

    return me;

}();