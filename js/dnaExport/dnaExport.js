/**
 * Created by aghassaei on 9/15/15.
 */


define(['underscore', 'backbone', 'lattice', 'appState', 'fileSaver'],
    function(_, Backbone, lattice, appState, fileSaver){

    var DNAExport = Backbone.Model.extend({

        defaults: {
            sequence32: [],
            sequence16: []
        },


        initialize: function(){

            this.listenTo(appState, "change:currentNav", this._navChanged);

            this.generateSequences();
        },

        _navChanged: function(){
            if (appState.get("currentNav") == "navDNAAssemble") this.generateSequences();
        },

        generateSequences: function(){
            var sequences32 = [];
            var sequences16 = [];
            lattice.loopCells(function(cell, x, y, z){
                if (!cell) return;
                var seq = cell.getSequence();
                if (seq && seq != ""){
                    if (cell.getLength() == 2) sequences32.push(seq);
                    else if (cell.getLength() == 1) sequences16.push(seq);
                    else console.warn("unexpected cell of length " + cell.getLength());
                }
            });
            this.set("sequence32", sequences32);
            this.set("sequence16", sequences16);
        },

        save: function(){
            var data = this.toJSON();
            fileSaver.saveSequences(data);
        }

    });


    return new DNAExport();

});