/**
 * Created by aghassaei on 3/10/15.
 */

define(['underscore', 'three', 'backbone', 'appState', 'latticeCAM', 'threeModel', 'camPlist', 'materials'],
    function(_, THREE, Backbone, appState, lattice, three, camPlist, materials){

    var Cam = Backbone.Model.extend({

        defaults: {

            camStrategy: "raster",
            placementOrder: "XYZ",//used for raster strategy entry
            camProcess: "gcode",
            machineName: "stapler",
            assembler: null,
            exporter: null,

            editingComponent: null,

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
            simSpeed: 4,//#X times real speed

            allCAMMaterialTypes: []//all types of stock needed
        },

        initialize: function(){

            _.bindAll(this, "postProcess");

            //bind events
            this.listenTo(appState, "change:currentTab", this._tabChanged);
            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(this, "change:originPosition", this._moveOrigin);
//            this.listenTo(this, "change:stockPosition", this._moveStock);
//            this.listenTo(this,
//                    "change:originPosition " +
//                    "change:stockPosition " +
//                    "change:feedRate " +
//                    "change:rapidSpeeds " +
//                    "change:camProcess " +
//                    "change:camStrategy " +
//                    "change:placementOrder " +
//                    "change:safeHeight " +
//                    "change:stockArraySize " +
//                    "change:stockSeparation " +
//                    "change:multipleStockPositions " +
//                    "change:rapidHeight " +
//                    "change:machineName",
//                this._setNeedsPostProcessing);
//            this.listenTo(lattice,
//                    "change:scale" +
//                    "change:units" +
//                    "change:numCells " +
//                    "change:cellType " +
//                    "change:connectionType",
//                this._setNeedsPostProcessing);
//            this.listenTo(appState, "change:stockSimulationPlaying", this._stockSimulation);

            this.listenTo(lattice, "change:partType", this._updatePartType);
            this.listenTo(appState, "change:cellMode", this._updateCellMode);
            this.listenTo(this, "change:machineName", this.selectMachine);

            this._navChanged();
    //        this._initOriginAndStock();

            this.selectMachine();
        },




        _calculateNumMaterials: function(){//todo calc length of gik cells as separate material types
            this.set("allCAMMaterialTypes", materials.getChildCellTypes(lattice.sparseCells, true) || []);
        },


        selectMachine: function(){

            var machineName = this.get("machineName");
            if (this.get("assembler")){
                if (this.get("assembler").getID() == machineName) return;
                else {
                    this.get("assembler").destroy();
                    this.set("assembler", null);
                }
            }
            var machineJSON = camPlist.allMachines[machineName];
            if (machineJSON.defaults) this._setMachineDefaults(machineJSON.defaults);

            var self = this;
            require(['assembler'], function(Assembler){
                self.set('assembler', new Assembler(machineName, machineJSON));
            });
        },

        _setMachineDefaults: function(defaults){
            var self = this;
            _.each(defaults, function(value, key){
                self.set(key, value, {silent:true});
            });
        },

        makeProgramEdits: function(data){
            this.set("dataOut", data, {silent:true});
            this.set("editsMadeToProgram", true, {silent: true});
        },











        //events

        _navChanged: function(){
            if (appState.get("currentNav") == "navAssemble") {
                this._setDefaultMachineForLatticeType();
                this._calculateNumMaterials();
            }
        },

        _setDefaultMachineForLatticeType: function(){
            //call this each time we switch to assemble tab
            var availableMachines = camPlist.machineTypesForLattice[lattice.get("cellType")][lattice.get("connectionType")];
            if (availableMachines.indexOf(this.get("machineName")) < 0){
                this.set("machineName", availableMachines[0], {silent:true});
            }
        },

        _tabChanged: function(){
            this._setCAMVisibility();
            if (appState.get("currentTab") != "animate") this.resetSimulation();
        },

        _setCAMVisibility: function(){
            var visible = this.isVisible();
    //        this.get("origin").visible = visible;
    //        this.get("stock").visible = visible;
            if (visible && !this.get("assembler")) this.selectMachine();
            if (this.get("assembler")) this.get("assembler").setVisibility(visible);
            if (appState.get("currentNav") == "navAssemble") {
                appState.set("basePlaneIsVisible", !visible);
            }
            three.render();
        },

        _updatePartType: function(){
            if (this.get("assembler")) this.get("assembler").updatePartType();
        },

        _updateCellMode: function(){
            if (this.get("assembler")) this.get("assembler").updateCellMode();
            three.render();
        },









        //visualization

        isVisible: function(){
            var currentTab = appState.get("currentTab");
            return (currentTab == "assemblerSetup" || currentTab == "cam" || currentTab == "animate" || currentTab == "send");
        },


        _initOriginAndStock: function(){//todo this is ugly
            var origin = new THREE.Mesh(new THREE.SphereGeometry(1),
                new THREE.MeshBasicMaterial({color:0xff0000}));
            three.sceneAdd(origin);
            this.set("origin", origin);
            this._moveOrigin();
            //init stock mesh
            var stock = new THREE.Mesh(new THREE.SphereGeometry(1),
                new THREE.MeshBasicMaterial({color:0xff00ff}));
            three.sceneAdd(stock);
            this.set("stock", stock);
            this._moveStock();
            this._setCAMVisibility();
        },

        _moveOrigin: function(){
            var position = this.get("originPosition");
    //        this.get("origin").position.set(position.x, position.y, position.z);
            if (this.get("stockFixed")) this._updateStockPosToOrigin(position, this.previous("originPosition"));
            three.render();
            if (this.get("assembler")) this.get("assembler").moveMachine(position);
        },

        _updateStockPosToOrigin: function(newOrigin, lastOrigin){
            var newStockPosition = _.clone(this.get("stockPosition"));
            _.each(_.keys(newStockPosition), function(key){
                newStockPosition[key] += newOrigin[key] - lastOrigin[key];
                newStockPosition[key] = parseFloat(newStockPosition[key].toFixed(4));
            });
            this.set("stockPosition", newStockPosition);
        },

        _moveStock: function(){
            var position = this.get("stockPosition");
            this.get("stock").position.set(position.x, position.y, position.z);
            three.render();
        },












        //simulation

        resetSimulation: function(){
            this.set("simLineNumber", 0, {silent:true});
            appState.set("stockSimulationPlaying", false);
            three.stopAnimationLoop();
            lattice.showCells();
        },

        _stockSimulation: function(){
            if (appState.get("stockSimulationPlaying")){
                three.startAnimationLoop();
                var currentLine = this.get("simLineNumber");
                if (currentLine == 0) lattice.hideCells();
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
                three.stopAnimationLoop();
                this.get("assembler").pause();
            }

        },













        //post processing

        _setNeedsPostProcessing: function(){
            this.set("needsPostProcessing", true);
        },

        postProcess: function(){
            this.set("needsPostProcessing", false);
            var self = this;
            this._getExporter(function(exporter){
                var data = "";
                data += exporter.makeHeader();
                data += "\n\n";
                data += exporter.addComment("begin program");
                data += "\n";

                data = self.get("assembler").postProcess(data, exporter);

                data += "\n\n";
                data += exporter.addComment("end program");
                data += "\n";
                data += exporter.makeFooter();

                self.set("dataOut", data);
                self.set("editsMadeToProgram", false);
                self.set("exporter", exporter);
                if (!appState.get("stockSimulationPlaying")) self.resetSimulation();
            });
//            return {data:data, exporter:exporter};//todo this breaks save
        },

        _getExporter: function(callback){
    //        var currentExporter = this.get("exporter");
            var camProcess = this.get("camProcess");
            require([camProcess], function(ProcessClass){
                if (callback) callback(new ProcessClass());
            });
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

    return new Cam();
});