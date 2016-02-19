/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//never deallocated

define(['underscore', 'backbone', 'threeModel', 'three', 'plist', 'globals'],
    function(_, Backbone, three, THREE, plist, globals){

    var AppState = Backbone.Model.extend({

        defaults: {//menu and view/render/interaction states

            currentNav:"navDesign",// design, sim, assemble
            currentTab:"lattice",

            lastNavTab: {},//last tab that one open in each of the main menus

            menuIsVisible: true,
            scriptIsVisible: false,
            consoleIsVisible: false,
            ribbonIsVisible: true,
            turnOffRendering: false,

            basePlaneIsVisible:true,
            highlighterIsVisible:true,
            axesAreVisible: false,
            focusOnLattice: true,
            showOneLayer: false,

            //key bindings
            shift: false,
            deleteMode: false,
            extrudeMode: false,
            cellMode: "cell",//supercell, cell, part, hide

            superCellIndex: new THREE.Vector3(0,0,0),//offset of superCell adds
            gikLength: 4,//this updates super cell range when using non-composite materials
            superCellRange: new THREE.Vector3(1,1,1),

            realisticColorScheme: false,
            materialType: null,
            materialClass: null,

            stockSimulationPlaying: false
        },

        initialize: function(){

            this.lattice = null;

             _.bindAll(this, "_handleKeyStroke", "_handleScroll");

            //bind events
            $(document).bind('keydown', {state:true}, this._handleKeyStroke);
            $(document).bind('keyup', {state:false}, this._handleKeyStroke);
            $(document).bind('mousewheel', {}, this._handleScroll);//disable browser back scroll

            this.listenTo(this, "change:currentTab", this._tabChanged);
            this.listenTo(this, "change:currentNav", this._navChanged);
            this.listenTo(this, "change:materialType", this._materialTypeChanged);
            this.listenTo(this, "change:gikLength", this._gikLengthChanged);
            this.listenTo(this, "change:turnOffRendering", this._renderingOnOff);
            this.listenTo(this, "change:axesAreVisible", this._showAxes);
            this.listenTo(this, "change:focusOnLattice", this._focusOnLattice);
            this.listenTo(this, "change:showOneLayer", this.showSketchLayer);

            this.downKeys = {};//track keypresses to prevent repeat keystrokes on hold
            this.lastCellMode = this.get("cellMode");//store this to toggle on/off hide mode

            if (this.isMobile()) this.set("menuIsVisible", false);

            var mousePosition = { x: -1, y: -1 };
            $(document).mousemove(function(event) {
                mousePosition.x = event.pageX;
                mousePosition.y = event.pageY;
            });
            this.mousePosition = mousePosition;

            this._showAxes();
        },

        isMobile: function() {
            return (window.innerWidth <= 700);
        },

        setLattice: function(lattice){
            //a little bit hacky, wait for lattice to init then pass reference
            this.lattice = lattice;
        },





        //events

        _tabChanged: function(){
            var currentTab = this.get("currentTab");
            if (currentTab != "animate") this.set("stockSimulationPlaying", false);
            if (currentTab == "import" && this.lattice.get("connectionType") == "edgeRot") this.lattice.set("partType", "voxLowPoly");
            this.get("lastNavTab")[this.get("currentNav")] = currentTab;//store tab
            this._updateCellMode(currentTab);
        },

        _updateCellMode: function(currentTab){
//            if (currentTab == "lattice" || currentTab == "import") this.set("cellMode", "cell");
            //else if (currentTab == "import") this.set("cellMode", "cell");
            //else if (currentTab == "sketch") this.set("cellMode", "cell");
            if (currentTab == "part") this.set("cellMode", "part");
        },

        _navChanged: function(){
            //update to last tab open in that section
            var navSelection = this.get("currentNav");
            var nextTab = this.get("lastNavTab")[navSelection] || _.keys(plist.allMenus[navSelection].tabs)[0];
            this.set("currentTab", nextTab, {silent:true});

            if (plist.allMenus[navSelection].parentNav) navSelection = plist.allMenus[navSelection].parentNav;
            if (plist.allMenus[navSelection].parent) navSelection = plist.allMenus[navSelection].parent;

            if (navSelection == "navDesign") {
                this.set("basePlaneIsVisible", true);
                this.set("highlighterIsVisible", true);
            } else if (navSelection == "navSim"){
                this.set("basePlaneIsVisible", false);
                this.set("highlighterIsVisible", false);
            } else if (navSelection == "navAssemble"){
                this.set("highlighterIsVisible", false);
            } else if (navSelection == "navComm"){
                this.set("basePlaneIsVisible", false);
                this.set("highlighterIsVisible", false);
            }

            if (navSelection != "navDesign") this.set("showOneLayer", false);

            if (this.get("cellMode") == "hide") this.set("cellMode", "cell");
            this.lattice.showCells();
        },

        _materialTypeChanged: function(){
            var self = this;
            require(['materials'], function(materials){
                var materialType = self.get("materialType");
                //verify that correct class is in sync
                if (!materials.isComposite(materialType)) {
////                    if (self.previous("materialType") && !materials.isComposite(self.previous("materialType"))) return;
//                    //re init highlighter
//                    if (!self.lattice.getHighlighterFile) return;
//                    require([self.lattice.getHighlighterFile()], function(HighlighterClass){
//                        globals.get("highlighter") = new HighlighterClass();
//                    });
                    return;
                }
                //composite material
                require(['superCellHighlighter'], function(SuperCellHighlighter){
                    globals.get("highlighter").destroy();
                    globals.get("highlighter").set(new SuperCellHighlighter());
                });
            });

        },

        _gikLengthChanged: function(){
            if (this.get("materialType").substr(0,5) != "super"){
                this.set("superCellRange", new THREE.Vector3(this.get("gikLength"), 1, 1));
            }
        },

        _drawingWithCompositeMaterialType: function(){
            return this.get("materialType").substr(0,5) == "super";
        },

        _renderingOnOff: function(){
            if (!this.get("turnOffRendering")) three.render();
        },

        _showAxes: function(){
            var visible = this.get("axesAreVisible");
            require(['axes'], function(axes){
                axes.setVisibility(visible);
                three.render();
            })
        },

        _focusOnLattice: function(){
            if (this.get("focusOnLattice")) this.lattice.updateThreeViewTarget();
            else {
                this.lattice.updateThreeViewTarget(new THREE.Vector3(0,0,0));
                this.reset3DNavigation();
            }
        },

        reset3DNavigation: function(){
            three.resetCameraPosition();
        },

        openAssembly: function(){
            this.set("currentNav", "navDesign");
            $("#jsonInput").click();
        },

        showSketchLayer: function(){
            var index;
            if (this.get("showOneLayer")){
                index = globals.get("baseplane").get("zIndex");
                var planeType = globals.get("baseplane").get("planeType");
                this.lattice.loopSketchLayer(index, planeType, function(cell){
                    cell.setTransparent(false);
                    cell.show();
                }, true);
                var transIndex = index - 1;
                if (globals.get("baseplane").get("orientationFlipped")) transIndex = index +1;
                this.lattice.loopSketchLayer(transIndex, planeType, function(cell){
                    cell.setTransparent(true);
                    cell.show();
                });
                three.render();
            } else {
                this.lattice.showCells();
                if (this.lattice.get("numCells") == 0) three.render();
            }
            this.lattice.makeHighlightableCells(index);
        },

        changeSketchLayer: function(visibleIndex, orientationFlipped){
            this.lattice.makeHighlightableCells(visibleIndex);
            if (this.get("showOneLayer")) {
                var lastVisibleIndex = globals.get("baseplane").previous("zIndex");
                var translucentIndex = visibleIndex - 1;
                var lastTranlsucentIndex = lastVisibleIndex - 1;
                if (orientationFlipped){
                    translucentIndex = visibleIndex + 1;
                    lastTranlsucentIndex = lastVisibleIndex + 1;
                }

                var planeType = globals.get("baseplane").get("planeType");
                this.lattice.loopSketchLayer(visibleIndex, planeType, function (cell) {
                    cell.setTransparent(false);
                    cell.show();
                });
                this.lattice.loopSketchLayer(translucentIndex, planeType, function (cell) {
                    cell.setTransparent(true);
                    cell.show();
                });
                if ((visibleIndex != lastTranlsucentIndex) && (translucentIndex != lastTranlsucentIndex)) {
                    this.lattice.loopSketchLayer(lastTranlsucentIndex, planeType, function (cell) {
                        cell.setTransparent(false);
                        cell.hide();
                    });
                }
                if ((visibleIndex != lastVisibleIndex) && (translucentIndex != lastVisibleIndex)) {
                    this.lattice.loopSketchLayer(lastVisibleIndex, planeType, function (cell) {
                        cell.hide();
                    });
                }
            }
            three.render();
        },



        //key bindings

        _handleKeyStroke: function(e){//receives keyup and keydown

            var hoverEl = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
            if (hoverEl && hoverEl.tagName != "CANVAS") {
                if ($("input").is(':focus')) return;//we are typing in an input
                if ($("textarea").is(':focus')) return;//we are typing in an input
            }

            var state = e.data.state;
            var currentTab = this.get("currentTab");

            this.set("shift", e.shiftKey);

            if (e.ctrlKey || e.metaKey){
            } else if (state) {
                if (this.downKeys[e.keyCode]) return;
                this.downKeys[e.keyCode] = true;
            } else this.downKeys[e.keyCode] = false;

            //console.log(e);
            //console.log(e.keyCode);
            switch(e.keyCode){
                case 8://delete key - causes back nav in chrome, super annoying
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 68://d delete mode
                    var currentNav = this.get("currentNav");
                    if (plist.allMenus[currentNav].parent == "navSim") return;
                    this.set("deleteMode", state);
                    break;
                case 27://esc key
                    globals.destroySelection3D();
                    break;
                case 82://r
                    if (state && (e.ctrlKey || e.metaKey)){
                        if (e.shiftKey){
                            e.preventDefault();
                            location.reload();
                            return;
                        }
                    }
                    break;
                case 86://cell (voxel) mode
                    if (state) {
                        this.lastCellMode = this.get("cellMode");
                        this.set("cellMode", "cell");
                    }
                    else this.set("cellMode", this.lastCellMode);
                    break;
                case 72://h hierarchical mode
                    if (state) {
                        this.lastCellMode = this.get("cellMode");
                        this.set("cellMode", "supercell");
                    }
                    else this.set("cellMode", this.lastCellMode);
                    break;
                case 69://e
    //                if (currentTab != "sketch") return;
//                    this.set("extrudeMode", state);
                    break;
                case 80://p
                    if (e.ctrlKey || e.metaKey){//command + shift + p = print svg screenshot
                        if (e.shiftKey){
                            e.preventDefault();
                            three.saveSVG();
                            return;
                        }
                    }
                    if (state) {//p part mode
                        this.lastCellMode = this.get("cellMode");
                        this.set("cellMode", "part");
                    }
                    else this.set("cellMode", this.lastCellMode);
                    break;
                case 83://s save
                    if (e.ctrlKey || e.metaKey){//command
                        e.preventDefault();
                        if (e.shiftKey){
                            $("#saveAsModel").modal("show");
                        } else {
                            globals.fileSaver.save();
                        }
                    } else {
                        if (state) this.set("superCellIndex", this._incrementSuperCellIndex("y", this.get("superCellIndex").clone()));
                    }
                    break;
                case 79://o open
                    if (e.ctrlKey || e.metaKey){//command
                        e.preventDefault();
                        this.openAssembly();
                        return;
                    }
                    if (state) {//hide mode
                        this.lastCellMode = this.get("cellMode");
                        this.set("cellMode", "hide");
                    }
                    else this.set("cellMode", this.lastCellMode);
                    break;
                case 32://space bar (play/pause simulation)
                    e.preventDefault();
                    if (state && this.get("currentTab") == "animate") this.set("stockSimulationPlaying", !this.get("stockSimulationPlaying"));
                    break;
                case 49://1-9
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    if (this.lattice.get("connectionType") != "gik") break;
                    if (state) {
                        var val = e.keyCode-48;
                        var range = plist.allLattices[this.lattice.get("cellType")].connection[this.lattice.get("connectionType")].type[this.lattice.get("applicationType")].options.gikRange;
                        if (range){
                            if ((range[0] > 0 && val < range[0]) || (range[1] > 1 && val > range[1])){
                                console.warn("gik length out of range");
                                return;
                            }
                        }
                        this.set("gikLength", val);
                    }
                    break;
                case 87://w - increase supercell index
                    if (state) this.set("superCellIndex", this._incrementSuperCellIndex("x", this.get("superCellIndex").clone()));
                    break;
                case 81://q - decrease supercell index
                    if (state) this.set("superCellIndex", this._decrementSuperCellIndex("x", this.get("superCellIndex").clone()));
                    break;
                case 65://a - decrease supercell index
                    if (state) this.set("superCellIndex", this._decrementSuperCellIndex("y", this.get("superCellIndex").clone()));
                    break;
                case 88://x - increase supercell index
                    if (state) this.set("superCellIndex", this._incrementSuperCellIndex("z", this.get("superCellIndex").clone()));
                    break;
                case 90://z - decrease supercell index
                    if (state) this.set("superCellIndex", this._decrementSuperCellIndex("z", this.get("superCellIndex").clone()));
                    break;
                case 38://up arrow
                    if (!state || this.get("currentNav") != "electronicNavSim") return;
                    require(['eSim'], function(eSim){
                        eSim.setZSimHeight(eSim.get("simZHeight")+1);
                    });
                    break;
                case 40://down arrow
                    if (!state || this.get("currentNav") != "electronicNavSim") return;
                    require(['eSim'], function(eSim){
                        eSim.setZSimHeight(eSim.get("simZHeight")-1);
                    });
                    break;
                case 13://enter
                    if (state){
                        var selection3D = globals.get("selection3D");
                        if (selection3D && selection3D.get("editMode")) selection3D.finish();
                    }
                    break;
                case 46://delete
                    if (state){
                        var selection3D = globals.get("selection3D");
                        if (selection3D && selection3D.get("editMode")) selection3D.cut();
                    }
                    break;
                default:
                    break;
            }
        },

        _incrementSuperCellIndex: function(key, object){
            object[key] += 1;
            if (object[key] > this.get("superCellRange")[key]-1) object[key] = 0;
            return object;
        },

        _decrementSuperCellIndex: function(key, object){
            object[key] -= 1;
            if (object[key] < 0) object[key] = this.get("superCellRange")[key]-1;
            return object;
        },

        _handleScroll: function(e){//disable two finger swipe back
            if (Math.abs(e.originalEvent.deltaX) > Math.abs(e.originalEvent.deltaY)) e.preventDefault();
        }

    });

    return new AppState();//return singleton

});