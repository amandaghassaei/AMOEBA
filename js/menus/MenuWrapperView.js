/**
 * Created by aghassaei on 1/26/15.
 */


function MenuWrapper(args){

    var $el = $("#menuWrapper");

    //init all tab view controllers
    var latticeMenu = new LatticeMenuView({model:args.lattice});
    var importMenu = new ImportMenuView({lattice:args.lattice});
    var sketchMenu = new SketchMenuView({model:args.lattice});
    var partMenu = new PartMenuView({model:args.lattice});
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

        deselectAllMenus();
        var tabName = $this.parent().data('name');
        if (tabName == "lattice"){
            latticeMenu.render();
        } else if (tabName == "import"){
            importMenu.render();
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

    function deselectAllMenus(){
        latticeMenu.currentlySelected = false;
        importMenu.currentlySelected = false;
        sketchMenu.currentlySelected = false;
        partMenu.currentlySelected = false;
//        scriptMenu.currentlySelected = false;
    }

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