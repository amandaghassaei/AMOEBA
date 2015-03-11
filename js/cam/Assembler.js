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
        if (exporter) exporter.processAndSave();
        else console.warn("cam process not supported");
    },

    destroy: function(){
    }

});