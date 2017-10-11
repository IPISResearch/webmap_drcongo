var Main = function(){

    var me = {};

    me.init = function(){
        Template.load('_templates/'+Config.templateURL+'?v' + version, function(templates) {
           if (Config.preLoad){
                UI.showLoader();
                Config.preLoad();
           }else{
               EventBus.trigger(EVENT.preloadDone);
           }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        me.init();
    });

	EventBus.on(EVENT.preloadDone,function(){
		MapService.init();
		UI.init();
    });

    return me;


}();