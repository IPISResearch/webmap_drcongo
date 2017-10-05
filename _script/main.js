var Main = function(){

    var me = {};

    me.init = function(){

        Template.load('_templates/'+Config.templateURL+'?v' + version, function(templates) {
            MapService.init();
            UI.init();
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        me.init();
    });

    return me;


}();