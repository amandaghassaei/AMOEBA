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

        lattice: null,
        menuWrapper: null,

        cellMode: "cell",
        cellType: "octa",
        connectionType: "face",
        partType: "triangle",

        allCellTypes: {octa:"Octahedron", cube:"Cube"},
        allConnectionTypes: {
            octa: {face:"Face", edge:"Edge", edgeRot:"Rotated Edge", vertex:"Vertex"},
            cube: {face:"Face"}
        },
        allPartTypes:{
            octa:{
                face: {triangle:"Triangle"},
                edge: {triangle:"Triangle"},
                edgeRot: {triangle:"Triangle"},
                vertex:{square:"Square", xShape:"X"}
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

    initialize: function(){

        _.bindAll(this, "_handleKeyStroke");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);

        this.listenTo(this, "change:currentTab", this._storeTab);
        this.listenTo(this, "change:currentNav", this._updateCurrentTabForNav);

        this.listenTo(this, "change:currentTab", this._updateCellMode);
        this.listenTo(this, "change:cellMode", this._cellModeDidChange);
        this.listenTo(this, "change:cellType change:connectionType", this._buildNewLattice);

        this._buildNewLattice();
        this.get("lattice").addCellAtIndex({x:0,y:0,z:0});
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
        if (currentTab == "lattice") this.set("cellMode", "cell");
        else if (currentTab == "import") this.set("cellMode", "cell");
        else if (currentTab == "sketch") this.set("cellMode", "cell");
        else if (currentTab == "part") this.set("cellMode", "part");
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

    _cellModeDidChange: function(){
        this.get("lattice").cellModeDidChange(this.get("cellMode"));
    },

    _buildNewLattice: function(){
        var currentLattice = this.get("lattice");
        if (currentLattice) {
            currentLattice.destroy();
        }
        var type = this.get("cellType");
        var connectionType = this.get("connectionType");
        if (type == "octa"){
            if (connectionType == "face"){
                this.set("lattice", new OctaFaceLattice({appState:this}));
            } else if (connectionType == "edge"){
                this.set("lattice", new OctaEdgeLattice({appState:this}));
            } else if (connectionType == "edgeRot"){

            } else if (connectionType == "vertex"){

            }
        } else if (type == "cube"){

        }
        var currentMenu = this.get("menuWrapper");
        if (currentMenu) {
            currentMenu.destroy();
        }
        this.set("menuWrapper", new MenuWrapper({lattice:this.get("lattice"), model:this}));
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
                if (this.get("cellMode") == "cell") this.set("deleteMode", state);//only for cell mode
                else this.set("deleteMode", false);
                break;
            case 69://e
//                if (currentTab != "sketch") return;
                this.set("extrudeMode", state);
                break;
            case 76://l lattice mode
                this.set("cellMode", "cell");
                break;
            case 80://p part mode
                this.set("cellMode", "part");
                break;
            default:
                break;
        }
    }

});