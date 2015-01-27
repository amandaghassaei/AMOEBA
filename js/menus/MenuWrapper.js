/**
 * Created by aghassaei on 1/26/15.
 */


function MenuWrapper(){

    var $el = $("#menuWrapper");

    //init all tab view controllers
    var latticeMenu = new LatticeMenuView();
    var sketchMenu = new SketchMenuView();
    var partMenu = new PartMenuView();
    var scriptMenu = new ScriptMenuView();

    init();

    var tabItems = $(".nav-tabs>li>a");
    tabItems.click(function(e){
        e.preventDefault();
        var $this = $(this);

        _.each(tabItems, function(tab){
            $(tab).parent().removeClass("active");
        });
        $this.parent().addClass("active");

        var tabName = $this.parent().data('name');
        if (tabName == "lattice"){
            latticeMenu.render();
        } else if (tabName == "sketch"){
            sketchMenu.render();
        } else if (tabName == "part"){
            partMenu.render();
        } else if (tabName == "script"){
            scriptMenu.render();
        } else {
            console.warn("no tab initialized!");
            $("menuContent").html('');//clear out content from menu
        }
    });

    function init(){
        latticeMenu.render();//init with lattice menu open
    }

    function hide(){
        $el.animate({right: "-400"});
    }

    function show(){
        $el.animate({right: "0"});
    }

    return {//return public properties and methods
        hide: hide,
        show:show
    };
}