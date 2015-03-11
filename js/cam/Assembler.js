/**
 * Created by aghassaei on 3/10/15.
 */

Assembler = Backbone.Model.extend({

    defaults: {
        camStrategy: "xRaster",
        camProcess: "shopbot"
    },

    initialize: function(){

        //bind events

    },

    processAndSave: function(){
        var exporter;
        if (this.get("camProcess") == "shopbot") exporter = new ShopbotExporter();
        else if (this.get("camProcess") == "gcode") exporter = new GCodeExporter();
        if (exporter) {
            var data = "";
            data += exporter.makeHeader();
            data += exporter.moveZ(3);
            data += exporter.move3(1, 4, 5);
            data += exporter.makeFooter();
            exporter.save(data);
        }
        else console.warn("cam process not supported");
    },

    destroy: function(){
    }

});