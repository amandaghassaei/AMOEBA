/**
 * Created by aghassaei on 3/10/15.
 */

Assembler = Backbone.Model.extend({

    defaults: {
        camStrategy: "raster",
        placementOrder: "XYZ",//used for raster strategy entry
        camProcess: "gcode",
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
        stockPosition: new THREE.Vector3(20,0,0),//in abs coordinates
        stockPositionRelative: true,
        multipleStockPositions: true,
        stockArraySize: {x:4, y:4},
        stockSeparation: 2.78388,
        postStockNum: 0,//which piece of stock to pick up

        rapidSpeeds:{xy: 3, z: 2},//rapids at clearance height
        feedRate:{xy: 0.1, z: 0.1},//speed when heading towards assembly

        simLineNumber: 0,//used for stock simulation, reading through gcode
        simSpeed: 4,//#X times real speed
        simStockNum:0//which piece of stock to pick up
    },

    initialize: function(options){

        this.set("machine", new Machine());

        _.bindAll(this, "postProcess");

        //bind events
        this.listenTo(options.appState, "change:currentTab", this._tabChanged);
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

        this.listenTo(options.lattice, "change:partType", this._updatePartType);
        this.listenTo(options.appState, "change:cellMode", this._updateCellMode);

        this._initOriginAndStock(options.lattice);
    },

    makeProgramEdits: function(data){
        this.set("dataOut", data, {silent:true});
        this.set("editsMadeToProgram", true, {silent: true});
    },

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////VISUALIZATION//////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

    _isVisible: function(){
        var currentTab = dmaGlobals.appState.get("currentTab");
        return (currentTab == "cam" || currentTab == "animate" || currentTab == "send");
    },

    _updatePartType: function(){
        if (this._isVisible()) this.get("machine").updatePartType();
    },

    _updateCellMode: function(){
        this.get("machine").setVisibility(this._isVisible());
        dmaGlobals.three.render();
    },

    _setCAMScale: function(){
        var scale = dmaGlobals.lattice.get("scale")/8;
        this.get("origin").scale.set(scale, scale, scale);
        this.get("stock").scale.set(scale, scale, scale);
    },

    _tabChanged: function(){
        this._setCAMVisibility();
        if (dmaGlobals.appState.get("currentTab") != "animate") this.resetSimulation();
    },

    _setCAMVisibility: function(){
        var visible = this._isVisible();
        this.get("origin").visible = visible;
        this.get("stock").visible = visible;
        this.get("machine").setVisibility(visible);
        dmaGlobals.three.render();
    },

    _initOriginAndStock: function(lattice){//todo this is ugly
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
        this._setCAMScale(lattice.get("scale"));
        this._setCAMVisibility();
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

    resetSimulation: function(){
        this.set("simLineNumber", 0, {silent:true});
        dmaGlobals.appState.set("stockSimulationPlaying", false);
        this.set("simStockNum", 0);
        this.set("postStockNum", 0);
        dmaGlobals.lattice.showCells();
    },

    _stockSimulation: function(){
        if (dmaGlobals.appState.get("stockSimulationPlaying")){
            var currentLine = this.get("simLineNumber");
            if (currentLine == 0) dmaGlobals.lattice.hideCells();
            var allLines = this.get("dataOut").split("\n");
            if(currentLine<allLines.length){
                var self = this;
                this.get("exporter").simulate(allLines[currentLine], this.get("machine"),
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
        var wcs = this.get("originPosition");
        data += exporter.moveZ(rapidHeight+wcs.z);
        data += "\n";

        var stockPosition = this.get("stockPosition");
        var multStockPositions = this.get("multipleStockPositions");
        var self = this;
        dmaGlobals.lattice.rasterCells(this._getOrder(this.get("camStrategy")), function(cell){
            if (!cell) return;
            var stockNum = self.get("postStockNum");
            var stockNumPosition = {x:stockPosition.x, y:stockPosition.y, z:stockPosition.z};
            if (multStockPositions) {
                var stockArraySize = self.get("stockArraySize");
                stockNumPosition.x += stockNum % stockArraySize.y * self.get("stockSeparation");
                stockNumPosition.y -= Math.floor(stockNum / stockArraySize.y) * self.get("stockSeparation");
            }
            data += self._grabStock(exporter, stockNumPosition, rapidHeight, wcs, safeHeight);
            if (multStockPositions) {
                stockNum += 1;
                if (stockNum >= stockArraySize.x * stockArraySize.y) stockNum = 0;
                self.set("postStockNum", stockNum, {silent: true});
                data += exporter.rapidXY(stockPosition.x-wcs.x, stockPosition.y-wcs.y);//move to stock origin
            }
            data += self._placeCell(cell, exporter, rapidHeight, wcs, safeHeight);
            if (multStockPositions) {
                data += exporter.rapidXY(stockPosition.x-wcs.x, stockPosition.y-wcs.y);//move to stock origin
            }
            data += "\n";
        });
        data += exporter.rapidXY(0, 0);

        data += "\n\n";
        data += exporter.addComment("end program");
        data += "\n";
        data += exporter.makeFooter();

        this.set("dataOut", data);
        this.set("editsMadeToProgram", false);
        this.set("exporter", exporter);
        this.resetSimulation();
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
        if (strategy == "raster") return this.get("placementOrder");
        console.warn("strategy not recognized");
        return "";
    },

    _grabStock: function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
        var data = "";
        data += exporter.rapidXY(stockPosition.x-wcs.x, stockPosition.y-wcs.y);
        data += exporter.rapidZ(stockPosition.z-wcs.z+safeHeight);
        data += exporter.moveZ(stockPosition.z-wcs.z);
        data += exporter.addComment("get stock");
        data += exporter.moveZ(stockPosition.z-wcs.z+safeHeight);
        data += exporter.rapidZ(rapidHeight+wcs.z);
        return data;
    },

    _placeCell: function(cell, exporter, rapidHeight, wcs, safeHeight){
        var data = "";
        var cellPosition = cell.getPosition();
        data += exporter.rapidXY(cellPosition.x-wcs.x, cellPosition.y-wcs.y);
        data += exporter.rapidZ(cellPosition.z-wcs.z+safeHeight);
        data += exporter.moveZ(cellPosition.z-wcs.z);
        data += exporter.addComment(JSON.stringify(cell.indices));
        data += exporter.moveZ(cellPosition.z-wcs.z+safeHeight);
        data += exporter.rapidZ(rapidHeight+wcs.z);
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