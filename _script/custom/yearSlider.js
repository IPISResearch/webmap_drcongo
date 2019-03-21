var YearSlider = function(){
    var me = {};


    me.init = function(){
        var start = document.getElementById("sliderstart");
        var end = document.getElementById("sliderend");
        var bar = document.getElementById("sliderprogress");

        start.left = 1;
        start.min = 1;

        end.left = 196;
        end.max = 196;

        bar.left = 0;
        bar.width = 196;
        bar.min=0;
        bar.max = 196;

        var yearContainer = document.getElementById("slideryears");
        var years =  Data.getYears();
        var yearsElements = [];
        var w = ((end.max + 18) / years.length);

        var currentStartYear = years[0];
        var currentEndYear = years[years.length-1];


        years.forEach(function(year,index){
            var d = div("year",year);
            d.id = "sy" + year;
            d.style.left = Math.floor(index*w) + "px";
            d.year = parseInt(year);
            yearContainer.appendChild(d);
            yearsElements.push(d);
        });


        var isDragging;
        var dragElement;
        var updateTimeout;

        setupDrag(start);
        setupDrag(end);

        // check if the yearslider is in the URL filter
        if (Config.initfilterIds && Config.initfilterIds[0] && Config.initfilterIds[0].substr(0,2) == "1."){
            var initYears = Config.initfilterIds[0].substr(2).split(".");
            if (initYears.length == 2){
                currentStartYear = parseInt(initYears[0]) + 2000;
                currentEndYear = parseInt(initYears[1]) + 2000;
                var startYear = years.indexOf(currentStartYear);
                var endYear = years.indexOf(currentEndYear);
                if (startYear>=0 && endYear>=0){
                    start.left = Math.round(startYear*w) + 1;
                    start.style.left = start.left + "px";
                    end.left = Math.round(endYear*w) + 3;
                    end.style.left = end.left + "px";

                    updateBar();
                    updateMinMax();
                    EventBus.on(EVENT.mapStyleLoaded,function(){
                        Data.updateYearFilter(currentStartYear,currentEndYear);
                    });
                }
            }
        }


        document.body.addEventListener("mousemove",function(e){
            if (isDragging){
                e.preventDefault();
                var delta = e.pageX - dragElement.startX;
                var target = dragElement.startLeft + delta;
                if (target < dragElement.min) target=dragElement.min;
                if (target > dragElement.max) target=dragElement.max;
                dragElement.left = target;
                dragElement.style.left = target + "px";
                if (dragElement.id == "sliderprogress"){
                    updateHandles();
                }else{
                    updateBar();
                }
            }
        });

        document.body.addEventListener("mouseup",function(){
            if (isDragging){
                isDragging = false;
                dragElement.classList.remove("active");
                start.classList.remove("baractive");
                end.classList.remove("baractive");
                updateYears();
                updateMinMax();
            }
        });

        function updateBar(){
            bar.width = Math.max((end.left - start.left),2);
            bar.left = start.left-2;

            bar.style.width = bar.width + "px";
            bar.style.left = bar.left + "px";

            // use a timeout to avoid flooding
            clearTimeout(updateTimeout);
            setTimeout(function(){
                var startYear = years[Math.round((start.left-2)/w)];
                var endYear = years[Math.round((end.left-2)/w)];
                yearsElements.forEach(function(elm){
                    var passed = (elm.year>=startYear && elm.year<=endYear);
                    elm.classList.toggle("inactive",!passed);
                })
            },100);
        }

        function updateHandles(){
            start.left = bar.left+2;
            end.left = bar.left+bar.width+1;
            start.style.left = start.left + "px";
            end.style.left = end.left + "px";

            // use a timeout to avoid flooding
            clearTimeout(updateTimeout);
            setTimeout(function(){
                var startYear = years[Math.round((start.left-2)/w)];
                var endYear = years[Math.round((end.left-2)/w)];
                yearsElements.forEach(function(elm){
                    var passed = (elm.year>=startYear && elm.year<=endYear);
                    elm.classList.toggle("inactive",!passed);
                })
            },100);
        }

        function updateMinMax(){
            start.max = end.left-2;
            end.min = start.left+2;
            bar.max = 196 - bar.width;
        }

        function updateYears(){
            var startYear = Math.round((start.left-2)/w);
            start.left = Math.round(startYear*w) + 1;
            start.style.left = start.left + "px";

            var endYear = Math.round((end.left-2)/w);
            end.left = Math.round(endYear*w) + 3;
            end.style.left = end.left + "px";

            updateBar();

            if (years[startYear] !== currentStartYear){
                currentStartYear = years[startYear];
                UI.hideDashboard();
                Data.updateYearFilter(currentStartYear,currentEndYear);
            }
            if (years[endYear] !== currentEndYear){
                currentEndYear = years[endYear];
                UI.hideDashboard();
                Data.updateYearFilter(currentStartYear,currentEndYear);
            }

        }

        function setupDrag(elm){
            updateMinMax();
            elm.onmousedown = function(e){
                dragElement = elm;
                dragElement.classList.add("ontop");
                if (dragElement.classList.contains("start")){
                    end.classList.remove("ontop");
                }else{
                    start.classList.remove("ontop");
                }
                elm.startX = e.pageX;
                elm.startLeft = elm.left;
                elm.classList.add("active");
                isDragging = true;
            };

        }

        bar.onmouseover = function(){
            if (!isDragging){
                start.classList.add("baractive");
                end.classList.add("baractive");
            }

        };

        bar.onmousedown = function(e){
            dragElement = bar;
            bar.startX = e.pageX;
            bar.startLeft = bar.left;
            bar.classList.add("active");
            isDragging = true;
        };

        bar.onmouseout = function(){
            if (!isDragging){
                start.classList.remove("baractive");
                end.classList.remove("baractive");
            }

        }

    };

    EventBus.on(EVENT.UIReady,function(){
        me.init();
    });

    return me;

}();

