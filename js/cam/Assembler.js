/**
 * Created by aghassaei on 3/10/15.
 */

Assembler = Backbone.Model.extend({

    defaults: {
        camStrategy: "xRaster",
        placementOrder: "XYZ",//used for manual strategy entry
        camProcess: "shopbot",
        machineName: "shopbot",
        machine: null,
        exporter: null,

        dataOut: "",
        needsPostProcessing: true,
        editsMadeToProgram: false,//warn the user that they will override changes

        rapidHeight: 6,
        safeHeight: 0.5,//inches above stock or assembly, when feed rate should slow

        origin: null,
        originPosition: new THREE.Vector3(20,0,0),
        stock: null,
        stockPosition: new THREE.Vector3(20,0,0),

        rapidSpeeds:{xy: 3, z: 2},//rapids at clearance height
        feedRate:{xy: 0.1, z: 0.1},//speed when heading towards assembly

        simLineNumber: 1,//used for stock simulation, reading through gcode
        simSpeed: 4//#X times real speed
    },

    initialize: function(options){

        this.set("machine", new Machine());

        _.bindAll(this, "postProcess");

        //bind events
        this.listenTo(options.appState, "change:currentTab", this._setCAMVisibility);
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
                "change:rapidHeight",
            this._setNeedsPostProcessing);
        this.listenTo(options.lattice,
                "change:numCells " +
                "change:units " +
                "change:scale " +
                "change:cellType " +
                "change:connectionType",
            this._setNeedsPostProcessing);
        this.listenTo(options.lattice, "change:scale", this._setCAMScale);
        this.listenTo(dmaGlobals.appState, "change:stockSimulationPlaying", this._stockSimulation);

        //init origin mesh
        var origin = new THREE.Mesh(new THREE.SphereGeometry(1),
            new THREE.MeshBasicMaterial({color:0xff0000}));
        dmaGlobals.three.sceneAdd(origin);
        this.set("origin", origin);
        this._moveOrigin();
        //init stock mesh
        var stock = new THREE.Mesh(new THREE.SphereGeometry(1),
            new THREE.MeshBasicMaterial({color:0xff00ff}));
        dmaGlobals.three.sceneAdd(stock);
        this.set("stock", stock);
        this._moveStock();
        this._setCAMScale(options.lattice.get("scale"));
        this._setCAMVisibility();
    },

    makeProgramEdits: function(data){
        this.set("dataOut", data, {silent:true});
        this.set("editsMadeToProgram", true, {silent: true});
    },

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////STOCK / ORIGIN/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    _setCAMScale: function(){
        var scale = dmaGlobals.lattice.get("scale")/8;
        this.get("origin").scale.set(scale, scale, scale);
        this.get("stock").scale.set(scale, scale, scale);
    },

    _setCAMVisibility: function(){
        var visible = false;
        var currentTab = dmaGlobals.appState.get("currentTab");
        if (currentTab == "cam" || currentTab == "animate" || currentTab == "send") visible = true;
        this.get("origin").visible = visible;
        this.get("stock").visible = visible;
        dmaGlobals.three.render();
    },

    _moveOrigin: function(){
        var position = this.get("originPosition");
        this.get("origin").position.set(position.x, position.y, position.z);
        dmaGlobals.three.render();
    },

    _moveStock: function(){
        var position = this.get("stockPosition");
        this.get("stock").position.set(position.x, position.y, position.z);
        dmaGlobals.three.render();
    },

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////SIMULATION//////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    _stockSimulation: function(){
        if (dmaGlobals.appState.get("stockSimulationPlaying")){
            var currentLine = this.get("simLineNumber");
            var allLines = this.get("dataOut").split("\n");
            if(currentLine<allLines.length){
                var self = this;
                this.get("exporter").simulate(allLines[currentLine], this.get("machine"),
                    this.get("originPosition"), function(){
                    currentLine++;
                    self.set("simLineNumber", currentLine, {silent:true});
                    self._stockSimulation();
                });
            } else {
                //finished simulation
                this.set("simLineNumber", 1);
                dmaGlobals.appState.set("stockSimulationPlaying", false);
            }
        } else {
            this.get("machine").pause();
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

        var rapidHeight = this.get("rapidHeight");
        var safeHeight = this.get("safeHeight");
        data += exporter.moveZ(rapidHeight);
        data += "\n";

        var wcs = this.get("originPosition");
        var stockPosition = this.get("stockPosition");
        var self = this;
        dmaGlobals.lattice.rasterCells(this._getOrder(this.get("camStrategy")), function(cell){
            if (!cell) return;
            data += self._grabStock(exporter, stockPosition, rapidHeight, safeHeight);
            data += self._placeCell(cell, exporter, rapidHeight, wcs, safeHeight);
            data += "\n";
        });
        data += exporter.rapidXY(0, 0);

        data += "\n\n";
        data += exporter.addComment("end program");
        data += "\n";
        data += exporter.makeFooter();

        this.set("dataOut", data);
        this.set("exporter", exporter);
        this.set("simLineNumber", 1);
        return {data:data, exporter:exporter};
    },

    _getExporter: function(){
        var currentExporter = this.get("exporter");
        if (this.get("camProcess") == "shopbot") {
            if (currentExporter && currentExporter.constructor == ShopbotExporter){
                return currentExporter;
            } else {
                return new ShopbotExporter();
            }
        } else if (this.get("camProcess") == "gcode") {
            if (currentExporter && currentExporter.constructor == GCodeExporter){
                return currentExporter;
            } else {
                return new GCodeExporter();
            }
        } else console.warn("cam process not supported");
    },

    _getOrder: function(strategy){
        if (strategy == "xRaster") return "XYZ";
        if (strategy == "yRaster") return "YXZ";
        if (strategy == "manual") return this.get("placementOrder");
        console.warn("strategy not recognized");
        return "";
    },

    _grabStock: function(exporter, stockPosition, rapidHeight, safeHeight){
        var data = "";
        data += exporter.rapidXY(stockPosition.x, stockPosition.y);
        data += exporter.rapidZ(stockPosition.z+safeHeight);
        data += exporter.moveZ(stockPosition.z);
        data += exporter.moveZ(stockPosition.z+safeHeight);
        data += exporter.rapidZ(rapidHeight);
        return data;
    },

    _placeCell: function(cell, exporter, rapidHeight, wcs, safeHeight){
        var data = "";
        var cellPosition = cell.getPosition();
        data += exporter.rapidXY(cellPosition.x-wcs.x, cellPosition.y-wcs.y);
        data += exporter.rapidZ(cellPosition.z-wcs.z+safeHeight);
        data += exporter.moveZ(cellPosition.z-wcs.z);
        data += exporter.moveZ(cellPosition.z-wcs.z+safeHeight);
        data += exporter.rapidZ(rapidHeight);
        return data;
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