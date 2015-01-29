/**
 * Created by aghassaei on 1/7/15.
 */


//model is appState
//not templating this view yet

NavBar = Backbone.View.extend({

    el: "#globalNav",

    events: {
        "click #showHideMenu":                          "_setMenuVis",
        "click .menuHoverControls":                     "_setNavSelection",
        "click .navDropdown":                           "_deselectAllNavItems"
    },

    initialize: function(){

        _.bindAll(this, "_setMenuVis");

        this._uiStuff();

    },

    _setMenuVis: function(e){
        e.preventDefault();
        var $button = $(e.target);
        var state = this.model.get("menuIsVisible");
        if(state){
            $button.html("<< Show Menu");
        } else {
            $button.html("Hide Menu >>");
        }
        this.model.set("menuIsVisible", !state);
        $button.blur();
    },

    _setNavSelection: function(e){
        e.preventDefault();
        var $link = $(e.target);
        this._deselectAllNavItems();
        $link.parent().addClass("open");//highlight
        var navSelection = $link.data("menuId");
        if (navSelection == "about") return;
        if (navSelection) this.model.set("currentNav", navSelection);
    },

    _uiStuff: function(){
        var $logo = $("#logo");
        $logo.mouseover(function(){
            $logo.attr("src","assets/logo-active.png");
        });
        $logo.mouseout(function(){
            $logo.attr("src","assets/logo.png");
        });
    },

    _deselectAllNavItems: function(){
        $(".menuHoverControls").parent().removeClass("open");//no highlight
    }

});