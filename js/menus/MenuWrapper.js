/**
 * Created by aghassaei on 1/26/15.
 */


function MenuWrapper(){

    //init all tab view controllers
    var latticeMenu = new LatticeMenuView();
    var sketchMenu = new SketchMenuView();
    var partMenu = new PartMenuView();
    var scriptMenu = new ScriptMenuView();


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

    latticeMenu.render();//init with lattice menu open

}