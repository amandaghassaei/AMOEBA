/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//maybe other things eventually

AppState = Backbone.Model.extend({

    defaults: {
        currentNav:"navDesign",//design, sim, assemble
        currentTab:"lattice",

        //last tab that one open in each of the main menus
        lastDesignTab: "lattice",
        lastSimulationTab: "physics",
        lastAssembleTab: "assembler",

        menuIsVisible: true
    },

    initialize: function(options){

        this.listenTo(this, "change:currentTab", this._storeTab);
        this.listenTo(this, "change:currentTab", this._updateLatticeMode);

        this.lattice = options.lattice;
    },

    _storeTab: function(){
        var currentNav = this.get("currentNav");
        var currentTab = this.get("currentTab");
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navSim") this.set("lastSimulationTab", currentTab);
        else if (currentNav == "navAssemble") this.set("lastAssembleTab", currentTab);
    },

    _updateLatticeMode: function(){
        var currentTab = this.get("currentTab");
        if (currentTab == "lattice") this.lattice.set("cellMode", "cell");
        else if (currentTab == "import") this.lattice.set("cellMode", "cell");
        else if (currentTab == "sketch") this.lattice.set("cellMode", "cell");
        else if (currentTab == "part") this.lattice.set("cellMode", "parts");
    }

});