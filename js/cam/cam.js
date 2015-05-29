/**
 * Created by aghassaei on 3/10/15.
 */

Cam = Backbone.Model.extend({

    defaults: {
        camStrategy: "raster",
        placementOrder: "XYZ",//used for raster strategy entry
        camProcess: "gcode",
        machineName: "stapler",
        assembler: null,
        exporter: null,

        dataOut: "",
        needsPostProcessing: true,
        editsMadeToProgram: false,//warn the user that they will override changes

        rapidHeight: 6,//always store relative to origin
        rapidHeightRelative: true,
        safeHeight: 0.5,//inches above stock or assembly, when feed rate should slow

        origin: null,
        originPosition: new THREE.Vector3(20,0,0),//in abs coordinates
        stock: null,
        stockPosition: new THREE.Vector3(20,0,0),//in abs coordinates
        stockPositionRelative: true,
        stockFixed: false,//stock is fixed position from origin
        multipleStockPositions: false,
        stockArraySize: {x:4, y:4},
        stockSeparation: 2.78388,

        rapidSpeeds:{xy: 3, z: 2},//rapids at clearance height
        feedRate:{xy: 0.1, z: 0.1},//speed when heading towards assembly

        simLineNumber: 0,//used for stock simulation, reading through gcode
        simSpeed: 4//#X times real speed
    },

    initialize: function(){

        _.bindAll(this, "postProcess");

        //bind events
        this.listenTo(globals.appState, "change:currentTab", this._tabChanged);
        this.listenTo(this, "change:originPosition", this._moveOrigin);
        this.listenTo(this, "change:stockPosition", this._moveStock);
        this.listenTo(this,
                "change:originPosition " +
                "change:stockPosition " +
                "change:feedRate " +
                "change:rapidSpeeds " +
                "change:camProcess " +
                "change:camStrategy " +
                "change:placementOrder " +
                "change:safeHeight " +
                "change:stockArraySize " +
                "change:stockSeparation " +
                "change:multipleStockPositions " +
                "change:rapidHeight " +
                "change:machineName",
            this._setNeedsPostProcessing);
        this.listenTo(globals.lattice,
                "change:numCells " +
                "change:units " +
                "change:scale " +
                "change:cellType " +
                "change:connectionType",
            this._setNeedsPostProcessing);
        this.listenTo(globals.appState, "change:stockSimulationPlaying", this._stockSimulation);

        this.listenTo(globals.lattice, "change:partType", this._updatePartType);
        this.listenTo(globals.lattice, "change:cellType change:connectionType", this._updateCellType);
        this.listenTo(globals.appState, "change:cellMode", this._updateCellMode);
        this.listenTo(this, "change:machineName", this.selectMachine);

//        this._initOriginAndStock();
    },

    selectMachine: function(){
        var machineName = this.get("machineName");
        if (this.get("assembler")) this.get("assembler").destroy();
        this.set("assembler", null);
        this._setMachineDefaults(machineName);
        globals.appState.set("basePlaneIsVisible", false);
        if (machineName == "shopbot"){
            this.set("assembler", new Shopbot());
        } else if (machineName == "handOfGod"){
            this.set("assembler", new God());
        } else if (machineName == "oneBitBot"){
            this.set("assembler", new OneBitBot());
        } else if (machineName == "stapler"){
            this.set("assembler", new StaplerAssembler());
        } else if (machineName == "staplerDual"){
            this.set("assembler", new DualStaplerAssembler());
        } else{
            console.warn("selected assembler not recognized");
        }
    },

    _setMachineDefaults: function(machineName){
        if (globals.plist.allMachineDefaults[machineName]){
            _.each(_.keys(globals.plist.allMachineDefaults[machineName]), function(key){
                globals.cam.set(key, globals.plist.allMachineDefaults[machineName][key], {silent:true});
            });
        }
    },

    makeProgramEdits: function(data){
        this.set("dataOut", data, {silent:true});
        this.set("editsMadeToProgram", true, {silent: true});
    },

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////VISUALIZATION//////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    isVisible: function(){
        var currentTab = globals.appState.get("currentTab");
        return (currentTab == "cam" || currentTab == "animate" || currentTab == "send");
    },

    _updateCellType: function(){
        if (this.get("assembler")) this.get("assembler").updateCellType();
        this.set("machineName", "handOfGod");//todo this should go away with dynamic allocation of this model

    },

    _updatePartType: function(){
        if (this.get("assembler")) this.get("assembler").updatePartType();
    },

    _updateCellMode: function(){
        if (this.get("assembler")) this.get("assembler").updateCellMode();
        globals.three.render();
    },

    _tabChanged: function(){
        this._setCAMVisibility();
        if (globals.appState.get("currentTab") != "animate") this.resetSimulation();
    },

    _setCAMVisibility: function(){
        var visible = this.isVisible();
//        this.get("origin").visible = visible;
//        this.get("stock").visible = visible;
        if (visible && !this.get("assembler")) this.selectMachine();
        if (this.get("assembler")) this.get("assembler").setVisibility(visible);
        if (globals.appState.get("currentNav") == "navAssemble") globals.appState.set("basePlaneIsVisible", !visible);
        globals.three.render();
    },

    _initOriginAndStock: function(){//todo this is ugly
        var origin = new THREE.Mesh(new THREE.SphereGeometry(1),
            new THREE.MeshBasicMaterial({color:0xff0000}));
        globals.three.sceneAdd(origin);
        this.set("origin", origin);
        this._moveOrigin();
        //init stock mesh
        var stock = new THREE.Mesh(new THREE.SphereGeometry(1),
            new THREE.MeshBasicMaterial({color:0xff00ff}));
        globals.three.sceneAdd(stock);
        this.set("stock", stock);
        this._moveStock();
        this._setCAMScale();
        this._setCAMVisibility();
    },

    _moveOrigin: function(){
        var position = this.get("originPosition");
//        this.get("origin").position.set(position.x, position.y, position.z);
        if (this.get("stockFixed")) this._updateStockPosToOrigin(position, this.previous("originPosition"));
        globals.three.render();
        if (this.get("assembler") && this.get("assembler").setMachinePosition) this.get("assembler").setMachinePosition();
    },

    _updateStockPosToOrigin: function(newOrigin, lastOrigin){
        var newStockPosition = _.clone(this.get("stockPosition"));
        console.log(newStockPosition);
        _.each(_.keys(newStockPosition), function(key){
            console.log(key);
            newStockPosition[key] += newOrigin[key] - lastOrigin[key];
            newStockPosition[key] = parseFloat(newStockPosition[key].toFixed(4));
        });
        this.set("stockPosition", newStockPosition);
    },

    _moveStock: function(){
        var position = this.get("stockPosition");
        this.get("stock").position.set(position.x, position.y, position.z);
        globals.three.render();
    },

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////SIMULATION//////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    resetSimulation: function(){
        this.set("simLineNumber", 0, {silent:true});
        globals.appState.set("stockSimulationPlaying", false);
        globals.three.stopAnimationLoop();
        globals.lattice.showCells();
    },

    _stockSimulation: function(){
        if (globals.appState.get("stockSimulationPlaying")){
            globals.three.startAnimationLoop();
            var currentLine = this.get("simLineNumber");
            if (currentLine == 0) globals.lattice.hideCells();
            var allLines = this.get("dataOut").split("\n");
            if(currentLine<allLines.length){
                var self = this;
                this.get("exporter").simulate(allLines[currentLine], this.get("assembler"),
                    this.get("originPosition"), function(){
                    currentLine++;
                    self.set("simLineNumber", currentLine);
                    self._stockSimulation();
                });
            } else {
                //finished simulation
                this.resetSimulation();
            }
        } else {
            globals.three.stopAnimationLoop();
            this.get("assembler").pause();
        }

    },

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////POST PROCESSING////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    _setNeedsPostProcessing: function(){
        this.set("needsPostProcessing", true);
    },

    postProcess: function(){
        this.set("needsPostProcessing", false);
        var exporter = this._getExporter();

        var data = "";
        data += exporter.makeHeader();
        data += "\n\n";
        data += exporter.addComment("begin program");
        data += "\n";

        data = this.get("assembler").postProcess(data, exporter);

        data += "\n\n";
        data += exporter.addComment("end program");
        data += "\n";
        data += exporter.makeFooter();

        this.set("dataOut", data);
        this.set("editsMadeToProgram", false);
        this.set("exporter", exporter);
        if (!globals.appState.get("stockSimulationPlaying")) this.resetSimulation();
        return {data:data, exporter:exporter};
    },

    _getExporter: function(){
//        var currentExporter = this.get("exporter");
        var camProcess = this.get("camProcess");
        if (camProcess == "shopbot") {
            return new ShopbotExporter();
        } else if (camProcess == "gcode") {
            return new GCodeExporter();
        } else if (camProcess == "tinyG"){
            return new TinyGExporter();
        }
        console.warn("cam process not supported");
        return null;
    },

    _getOrder: function(strategy){
        if (strategy == "raster") return this.get("placementOrder");
        console.warn("strategy not recognized");
        return "";
    },

    save: function(){
        if (this.get("needsPostProcessing")){
            var output = this.postProcess();
            output.exporter.save(output.data);
            return;
        }
        this.get("exporter").save(this.get("dataOut"));
    }

});