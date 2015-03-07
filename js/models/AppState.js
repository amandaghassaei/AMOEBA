/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//never deallocated

AppState = Backbone.Model.extend({

    defaults: {
        currentNav:"navDesign",// design, sim, assemble
        currentTab:"lattice",

        //last tab that one open in each of the main menus
        lastDesignTab: "lattice",
        lastSimulationTab: "physics",
        lastAssembleTab: "assembler",

        menuWrapper: null,

        allCellTypes: {octa:"Octahedron", cube:"Cube"},
        allConnectionTypes: {
            octa: {face:"Face", freeformFace:"Freeform Face", edge:"Edge", edgeRot:"Rotated Edge", vertex:"Vertex"},
            cube: {face:"Face"}
        },
        allPartTypes:{
            octa:{
                face: {triangle:"Triangle", default:"Default"},
                edge: {triangle:"Triangle", default:"Default"},
                edgeRot: {triangle:"Triangle", default:"Default"},
                vertex: {square:"Square", xShape:"X", default:"Default"}
            },
            cube:{
                face: null
            }
        },

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
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);
        this.listenTo(this, "change:currentTab", this._updateCellMode);

        this.lattice = options.lattice;//this doesn't need to be tracked for changes
        this.downKeys = {};//track keypresses to prevent repeat keystrokeson hold

        this.set("menuWrapper", new MenuWrapper({model: this}));
    },


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////EVENTS////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////


    _storeTab: function(){
        var currentNav = this.get("currentNav");
        var currentTab = this.get("currentTab");
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navSim") this.set("lastSimulationTab", currentTab);
        else if (currentNav == "navAssemble") this.set("lastAssembleTab", currentTab);
    },

    _updateCellMode: function(){
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
        this._updateCellMode();//a little bit hacky, this updates the cell mode, but holds off on updating the menus til the animation has happened
    },

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        var state = e.data.state;
        var currentTab = this.get("currentTab");

        if (e.ctrlKey || e.metaKey){

        }else if (state) {
            if (this.downKeys[e.keyCode]) return;
            this.downKeys[e.keyCode] = true;
        } else this.downKeys[e.keyCode] = false;


        console.log(e.keyCode);
        switch(e.keyCode){
            case 16://shift
                e.preventDefault();
                this.set("shift", state);
                break;
            case 68://d delete mode
                e.preventDefault();
                if (this.get("cellMode") == "cell") this.set("deleteMode", state);//only for cell mode
                else this.set("deleteMode", false);
                break;
            case 69://e
//                if (currentTab != "sketch") return;
                this.set("extrudeMode", state);
                break;
            case 80://p part mode
                var cellMode = this.lattice.get("cellMode");
                if (cellMode == "part") this.lattice.set("cellMode", "cell");
                else if (cellMode == "cell") this.lattice.set("cellMode", "part");
                break;
            case 73://i inverse mode
                this.lattice.set("inverseMode", !this.lattice.get("inverseMode"));
                break;
            case 83://s save
//                e.preventDefault();
//                if (e.ctrlKey || e.metaKey){//command
//                    console.log("here");
//                    dmaGlobals.lattice.saveAsJSON();
//                }
                break;
            default:
                break;
        }
    }

});