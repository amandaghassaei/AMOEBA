/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//never deallocated

AppState = Backbone.Model.extend({

    defaults: {//menu and view/render/interaction states

        currentNav:"navDesign",// design, sim, assemble
        currentTab:"lattice",

        //last tab that one open in each of the main menus
        lastDesignTab: "lattice",
        lastSimulationTab: "physics",
        lastAssembleTab: "assembler",

        menuIsVisible: true,
        scriptIsVisible: false,
        consoleIsVisible: false,
        ribbonIsVisible: true,

        basePlaneIsVisible:true,
        highlighterIsVisible:true,
        axesAreVisible: false,

        //key bindings
        shift: false,
        deleteMode: false,
        highlightMode: true,
        extrudeMode: false,
        cellMode: "cell",//show cells vs part
        cellsVisible: true,

        superCellIndex: 0,//offset of superCell adds todo lattice?

        realisticColorScheme: false,

        stockSimulationPlaying: false,
        manualSelectOrigin: false//mode that allows user ot select origin from existing cell
    },

    initialize: function(){

         _.bindAll(this, "_handleKeyStroke", "_handleScroll");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);
        $(document).bind('mousewheel', {}, this._handleScroll);//disable browser back scroll

        this.listenTo(this, "change:currentTab", this._tabChanged);
        this.listenTo(this, "change:currentNav", this._navChanged);
        this.listenTo(this, "change:realisticColorScheme", this._updateColorScheme);

        this.downKeys = {};//track keypresses to prevent repeat keystrokeson hold

        if (this.isMobile()) this.set("menuIsVisible", false);
    },

    isMobile: function() {
        return (window.innerWidth <= 700);
    },


    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////EVENTS////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////


    _tabChanged: function(){
        var currentTab = this.get("currentTab");
        if (currentTab != "animate") this.set("stockSimulationPlaying", false);
        if (currentTab != "cam") this.set("manualSelectOrigin", false);
        if (currentTab == "import" && globals.lattice.get("connectionType") == "edgeRot") globals.lattice.set("partType", "voxLowPoly");
        this._storeTab(this.get("currentNav"), currentTab);
        this._updateCellMode(currentTab);
    },

    _storeTab: function(currentNav, currentTab){
        if (currentNav == "navDesign") this.set("lastDesignTab", currentTab);
        else if (currentNav == "navSim") this.set("lastSimulationTab", currentTab);
        else if (currentNav == "navAssemble") this.set("lastAssembleTab", currentTab);
    },

    _updateCellMode: function(currentTab){
        if (currentTab == "lattice" || currentTab == "import") this.set("cellMode", "cell");
        //else if (currentTab == "import") this.set("cellMode", "cell");
        //else if (currentTab == "sketch") this.set("cellMode", "cell");
        else if (currentTab == "part") this.set("cellMode", "part");
    },

    _navChanged: function(){
        //update to last tab open in that section
        var navSelection = this.get("currentNav");
        if (navSelection == "navDesign") {
            this.set("currentTab", this.get("lastDesignTab"));
            this.set("basePlaneIsVisible", true);
            this.set("highlighterIsVisible", true);
        }
        else if (navSelection == "navSim") {
            this.set("currentTab", this.get("lastSimulationTab"));
        }
        else if (navSelection == "navAssemble") {
            this.set("currentTab", this.get("lastAssembleTab"));
        }
    },

    _updateColorScheme: function(){
        changeGikMaterials();
        globals.three.render();
    },

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////KEY BINDINGS//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    _handleKeyStroke: function(e){//receives keyup and keydown

        if ($("input").is(':focus')) return;//we are typing in an input
        if ($("textarea").is(':focus')) return;//we are typing in an input

        var state = e.data.state;
        var currentTab = this.get("currentTab");

        this.set("shift", false);//just in case, this is getting all weird during other meta commands in the browser

        if (e.ctrlKey || e.metaKey){
        } else if (state) {
            if (this.downKeys[e.keyCode]) return;
            this.downKeys[e.keyCode] = true;
        } else this.downKeys[e.keyCode] = false;

//        console.log(e);
//        console.log(e.keyCode);
        switch(e.keyCode){
            case 8://delete key - causes back nav in chrome, super annoying
                e.preventDefault();
                e.stopPropagation();
            case 16://shift
//                this.set("shift", state);
                break;
            case 68://d delete mode
                this.set("deleteMode", state);
                break;
            case 69://e
//                if (currentTab != "sketch") return;
                this.set("extrudeMode", state);
                break;
            case 80://p part mode
                var cellMode = this.get("cellMode");
                if (cellMode == "part") this.set("cellMode", "cell");
                else if (cellMode == "cell") this.set("cellMode", "part");
                break;
            case 83://s save
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    if (e.shiftKey){
                        this.set("shift", false);
                        $("#saveAsModel").modal("show");
                    } else {
                        globals.fileSaver.save();
                    }
                }
                break;
            case 79://o open
                if (e.ctrlKey || e.metaKey){//command
                    e.preventDefault();
                    $("#jsonInput").click();
                }
                break;
            case 32://space bar (play/pause simulation)
                e.preventDefault();
                if (state && this.get("currentTab") == "animate") this.set("stockSimulationPlaying", !this.get("stockSimulationPlaying"));
                break;
            case 50://2-9
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                if (globals.lattice.get("connectionType") != "gik") break;
                if (state) globals.lattice.set("gikLength", e.keyCode-48);
                break;
            case 81://q - increase supercell index
                if (state) {
                    var index = this.get("superCellIndex")+1;
                    if (index > globals.lattice.get("gikLength")-1) index = 0;
                    this.set("superCellIndex", index);
                }
                break;
            case 65://a - decrease supercell index
                if (state) {
                    var index = this.get("superCellIndex")-1;
                    if (index < 0) index = globals.lattice.get("gikLength")-1;
                    this.set("superCellIndex", index);
                }
                break;
            default:
                break;
        }
    },

    _handleScroll: function(e){//disable two finger swipe back
        if (Math.abs(e.originalEvent.deltaX) > Math.abs(e.originalEvent.deltaY)) e.preventDefault();
    }

});