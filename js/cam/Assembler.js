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
        editsMadeToProgram: false//warn the user that they will override changes
    },

    initialize: function(){

        //bind events
        this.listenTo(this, "change:camProcess", this._setNeedsPostProcessing);
        this.listenTo(dmaGlobals.appState, "change:units", this._setNeedsPostProcessing);

    },

    _setNeedsPostProcessing: function(){
        this.set("needsPostProcessing", true);
    },

    setProgramEditsMade: function(){
        this.set("editsMadeToProgram", true);
    },

    postProcess: function(){
        var exporter;
        if (this.get("camProcess") == "shopbot") exporter = new ShopbotExporter();
        else if (this.get("camProcess") == "gcode") exporter = new GCodeExporter();
        if (exporter) {
            var data = "";
            data += exporter.makeHeader();
            data += "\n\n";
            data += exporter.addComment("begin program");
            data += "\n";
            data += exporter.moveZ(3);
            data += exporter.move3(1, 4, 5);
            data += "\n\n";
            data += exporter.addComment("end program");
            data += "\n";
            data += exporter.makeFooter();
            this.set("dataOut", data);
            this.set("exporter", exporter);
        }
        else console.warn("cam process not supported");
        this.set("needsPostProcessing", false);
        return {data:data, exporter:exporter};
    },

    save: function(data, exporter){
        if (this.get("needsPostProcessing")){
            var output = this.postProcess();
            output.exporter.save(output.data);
            return;
        }
        if (!data) data = this.get("dataOut");
        if (!exporter) exporter = this.get("exporter");
        exporter.save(data);
    },

    destroy: function(){
    }

});