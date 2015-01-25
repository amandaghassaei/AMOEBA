/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {
        scale: 30.0,
        type: "octagonFace",
        nodes: [],
        cells: []
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events
    },

    addCell: function(position){
        new Cell(position);
        window.three.render();
    },

    clearCells: function(){
        _.each(this.get("cells"), function(cell){
            cell.remove();
        });
        this.set("cells", []);
    }

});