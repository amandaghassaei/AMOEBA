/**
 * Created by aghassaei on 3/10/15.
 */

Assembler = Backbone.Model.extend({

    defaults: {
        camStrategy: "xRaster",
        camProcess: "shopbot",
        machine: "shopbot",
        exporter: null,
        dataOut: "",
        needsPostProcessing: true,
        editsMadeToProgram: false,//warn the user that they will override changes

        rapidHeight: 12,
        stockHeight: 3,
        origin: null,
        originPosition: new THREE.Vector3(0,0,0),
        stock: null,
        stockPosition: new THREE.Vector3(0,0,0),

        rapidSpeeds:{xy: 12, z: 4},
        feedRate:{xy: 12, z: 4}
    },

    initialize: function(){

        _.bindAll(this, "postProcess");

        //bind events
        this.listenTo(dmaGlobals.appState, "change:currentTab", this._setCAMVisibility);
        this.listenTo(this, "change:originPosition", this._moveOrigin);
        this.listenTo(this, "change:stockPosition", this._moveStock);
        this.listenTo(dmaGlobals.appState, "change:units", this._setNeedsPostProcessing);
        this.listenTo(this,
                "change:originPosition " +
                "change:stockPosition " +
                "change:feedRate " +
                "change:rapidSpeeds " +
                "change:camProcess " +
                "change:camStrategy",
            this._setNeedsPostProcessing);
        this.listenTo(dmaGlobals.lattice,
                "change:numCells " +
                "change:scale " +
                "change:cellType " +
                "change:connectionType",
            this._setNeedsPostProcessing);

        //init origin mesh
        var scale = dmaGlobals.lattice.get("scale");
        var origin = new THREE.Mesh(new THREE.SphereGeometry(dmaGlobals.lattice.get("scale")/4),
            new THREE.MeshBasicMaterial({color:0xff0000}));
        dmaGlobals.three.sceneAdd(origin);
        this.set("origin", origin);
        //init stock mesh
        var stock = new THREE.Mesh(new THREE.SphereGeometry(dmaGlobals.lattice.get("scale")/4),
            new THREE.MeshBasicMaterial({color:0xff00ff}));
        dmaGlobals.three.sceneAdd(stock);
        this.set("stock", stock);
        this._setCAMVisibility();
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

    _getOrder: function(strategy){
        if (strategy == "xRaster") return "XYZ";
        if (strategy == "yRaster") return "YXZ";
        console.warn("strategy not recognized");
        return "";
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

        var wcs = this.get("originPosition");
        var stockPosition = this.get("stockPosition");
        dmaGlobals.lattice.rasterCells(this._getOrder(this.get("camStrategy"), function(cell){
            if (!cell) return;

            data += exporter.rapidXY(stockPosition.x-wcs.x, stockPosition.y-wcs.y);
            data += exporter.moveZ(stockHeight);
            data += exporter.moveZ(rapidHeight);

            var cellPosition = cell.getPosition();
            data += exporter.rapidXY(cellPosition.x-wcs.x, cellPosition.y-wcs.y);
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