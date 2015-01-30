/**
 * Created by aghassaei on 1/7/15.
 */


//model is appState
//not templating this view yet

NavBar = Backbone.View.extend({

    el: "#globalNav",

    events: {
        "click #showHideMenu":                          "_setMenuVis",
        "click .menuHoverControls":                     "_setNavSelection"
    },

    initialize: function(){

        _.bindAll(this, "_setMenuVis", "_setNavSelection");

        this.listenTo(this.model, "change:menuIsVisible", this._updateShowHideButton);
        this.listenTo(this.model, "change:currentNav", this._updateNavSelectionUI);

        this._uiStuff();
        this._updateNavSelectionUI();
    },

    _setMenuVis: function(e){
        e.preventDefault();
        var state = this.model.get("menuIsVisible");
        this.model.set("menuIsVisible", !state);
        $(e.target).blur();
    },

    _updateShowHideButton: function(){
        var $button = $("#showHideMenu");
        var state = this.model.get("menuIsVisible");
        if(state){
            $button.html("Hide Menu >>");
        } else {
            $button.html("<< Show Menu");
        }
    },

    _setNavSelection: function(e){
        e.preventDefault();
        var navSelection = $(e.target).data("menuId");
        if (navSelection == "about") {
            $(e.target).blur();
            return;
        }
        if (navSelection) {
            if (navSelection=="navDesign") this.model.set("currentTab", this.model.get("lastDesignTab"), {silent: true});
            else if (navSelection=="navSim") this.model.set("currentTab", this.model.get("lastSimulationTab"), {silent: true});
            else if (navSelection=="navAssemble") this.model.set("currentTab", this.model.get("lastAssembleTab"), {silent: true});
            this.model.set("currentNav", navSelection);
        }
    },

    _updateNavSelectionUI: function(){
        this._deselectAllNavItems();
        var navSelection = this.model.get("currentNav");
        _.each($(".menuHoverControls"), function(link){
            var $link = $(link);
            if ($link.data("menuId") == navSelection) $link.parent().addClass("open");//highlight
        });
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