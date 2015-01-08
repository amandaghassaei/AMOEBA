/**
 * Created by aghassaei on 1/7/15.
 */

$(function(){

    var allMenus = $(".navMenu");
    var allNavMenuLinks = $(".menuHoverControls");
    var allNavDropdownMenus = $(".navDropdown");
    var allNavTitles = $(".navbar-nav li a");

    $("a[href='#']").click(function(e){
        e.preventDefault();
    });
    $("a[href='#fakelink']").click(function(e){
        e.preventDefault();
    });

    allNavMenuLinks.mouseover(function(){
        hideAllMenus();
        $(this).parent().addClass("open");//highlight
        var menuId = "#".concat($(this).data("menuId"));
        $(menuId).show();
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

});