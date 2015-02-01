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

        menuIsVisible: true,

        //key bindings
        shift: false,
        deleteMode: false,
        extrudeMode: false
    },

    initialize: function(options){

        _.bindAll(this, "_handleKeyStroke");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);
        this.listenTo(this, "change:currentTab", this._storeTab);
        this.listenTo(this, "change:currentTab", this._updateLatticeMode);
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);

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
        else if (currentTab == "part") this.lattice.set("cellMode", "part");
    },

    //update to last tab open in that section
    _updateCurrentTabForNav: function(){
        var navSelection = this.get("currentNav");
        if (navSelection == "navDesign") this.set("currentTab",
            this.get("lastDesignTab"), {silent:true});
        else if (navSelection == "navSim") this.set("currentTab",
            this.get("lastSimulationTab"), {silent:true});
        else if (navSelection == "navAssemble") this.set("currentTab",
            this.get("lastAssembleTab"), {silent:true});
        this._updateLatticeMode();//a little bit hacky, this updates the lattice, but holds off on updating the menus til the animation has happened
    },

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        var state = e.data.state;
        var currentTab = this.get("currentTab");

        switch(e.keyCode){
            case 16://shift
                e.preventDefault();
                this.set("shift", state);
                break;
            case 32://space bar
                e.preventDefault();
                if (this.lattice.get("cellMode") == "cell") this.set("deleteMode", state);//only for cell mode
                else this.set("deleteMode", false);
                break;
            case 69://e
//                if (currentTab != "sketch") return;
                this.set("extrudeMode", state);
                break;

            default:
                break;
        }
    }

});