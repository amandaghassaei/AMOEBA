/**
 * Created by aghassaei on 3/10/15.
 */

Assembler = Backbone.Model.extend({

    defaults: {
        camStrategy: "xRaster",
        camProcess: "shopbot",
        exporter: null,
        dataOut: "",
        needsPostProcessing: true,
        editsMadeToProgram: false,//warn the user that they will override changes

        rapidHeight: 12,
        stockHeight: 3,
        origin: null,
        originPosition: new THREE.Vector3(0,0,0)
    },

    initialize: function(){

        _.bindAll(this, "postProcess");

        //bind events
        this.listenTo(this, "change:camProcess", this._setNeedsPostProcessing);
        this.listenTo(dmaGlobals.appState, "change:units", this._setNeedsPostProcessing);
        this.listenTo(dmaGlobals.appState, "change:currentTab", this._setOriginVisibility);
        this.listenTo(this, "change:originPosition", this._moveOrigin);

        //init origin mesh
        var origin = new THREE.Mesh(new THREE.SphereGeometry(dmaGlobals.lattice.get("scale")/4), new THREE.MeshBasicMaterial({color:0xff0000}));
        dmaGlobals.three.sceneAdd(origin);
        this.set("origin", origin);
        this._setOriginVisibility();
    },

    _setOriginVisibility: function(){
        var visible = false;
        var currentTab = dmaGlobals.appState.get("currentTab");
        if (currentTab == "cam" || currentTab == "animate" || currentTab == "send") visible = true;
        this.get("origin").visible = visible;
        dmaGlobals.three.render();
    },

    _moveOrigin: function(){
        var position = this.get("originPosition");
        this.get("origin").position.set(position.x, position.y, position.z);
        dmaGlobals.three.render();
    },

    _setNeedsPostProcessing: function(){
        this.set("needsPostProcessing", true);
    },

    makeProgramEdits: function(data){
        this.set("dataOut", data, {silent:true});
        this.set("editsMadeToProgram", true, {silent: true});
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

    postProcess: function(){
        this.set("needsPostProcessing", false);
        var exporter = this._getExporter();

        var data = "";
        data += exporter.makeHeader();
        data += "\n\n";
        data += exporter.addComment("begin program");
        data += "\n";

        var rapidHeight = this.get("rapidHeight");
        var stockHeight = this.get("stockHeight");
        data += exporter.moveZ(rapidHeight);
        data += "\n";
        dmaGlobals.lattice.rasterCells("XYZ", function(cell, x, y, z){
            if (!cell) return;

            data += exporter.rapidXY(0, 0);
            data += exporter.moveZ(stockHeight);
            data += exporter.moveZ(rapidHeight);

            var cellPosition = cell.getPosition();
            data += exporter.rapidXY(cellPosition.x.toFixed(3), cellPosition.y.toFixed(3));
            data += exporter.moveZ(stockHeight);
            data += exporter.moveZ(rapidHeight);

            data += "\n";
        });
        data += exporter.rapidXY(0, 0);

        data += "\n\n";
        data += exporter.addComment("end program");
        data += "\n";
        data += exporter.makeFooter();

        this.set("dataOut", data);
        this.set("exporter", exporter);
        return {data:data, exporter:exporter};
    },

    save: function(){
        if (this.get("needsPostProcessing")){
            var output = this.postProcess();
            output.exporter.save(output.data);
            return;
        }
        this.get("exporter").save(this.get("dataOut"));
    },

    destroy: function(){
    }

});