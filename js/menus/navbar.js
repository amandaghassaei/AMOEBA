/**
 * Created by aghassaei on 1/7/15.
 */


function NavBar(menu){

    var allMenus = $(".navMenu");
    var allNavMenuLinks = $(".menuHoverControls");
    var allNavDropdownMenus = $(".navDropdown");
    var allNavTitles = $(".navbar-nav li a");

//    allNavMenuLinks.mouseover(function(){
//        hideAllMenus();
//        $(this).parent().addClass("open");//highlight
//        var menuId = "#" + $(this).data("menuId");
//        $(menuId).show();
//    });

    var showHideMenuBtn = $("#showHideMenu");
    showHideMenuBtn.mouseout(function(){
        $(this).parent().removeClass("open");
    });
    //show/hide menu
    showHideMenuBtn.click(function(e){
        e.preventDefault();
        var $this = $(this);
        var state = $this.data('state');
        if(state){
            $this.html("<< Show Menu");
            menu.hide();
        } else {
            $this.html("Hide Menu >>");
            menu.show();
        }
        $this.data('state', !state);
        $this.blur();
    });

    function hideAllMenus(){
        allMenus.hide();
        allNavMenuLinks.parent().removeClass("open");//no highlight
        allNavDropdownMenus.removeClass("open");//no highlight
        allNavTitles.blur();
    }

    $("#threeContainer").mousedown(function(){
        hideAllMenus();
    });
    $("#mainNavLink").mouseover(function(){
        hideAllMenus();
    });
    allNavDropdownMenus.mouseover(function(){
        hideAllMenus();
        $(this).addClass("open");
    });

    //remove nav text coloring on click
    allNavTitles.click(function(e){
        e.preventDefault();
        return false;
    });

}