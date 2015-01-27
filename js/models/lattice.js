/**
 * Created by aghassaei on 1/16/15.
 */


Lattice = Backbone.Model.extend({

    defaults: {
        scale: 30.0,
        cellType: "octa",
        connectionType: "face",
        nodes: [],
        cells: [],
        numCells: 0
    },

    //pass in fillGeometry

    initialize: function(){

        //bind events
    },

    addCell: function(position){
        var cells = this.get("cells");
        cells.push(new Cell(position));
        this.set("numCells", cells.length);
        window.three.render();
    },

    removeCell: function(object){
        var cells = this.get("cells");
        var index = cells.indexOf(object.parent.myCell);
        if (index == -1) {
            console.warn("problem located cell in cell array");
            return;
        }
        cells.splice(index, 1);
        this.set("numCells", cells.length);
        window.three.sceneRemove(object);
        window.three.render();
    },

    clearCells: function(){
        _.each(this.get("cells"), function(cell){
            cell.remove();
        });
        this.set("cells", []);
        this.set("numCells", 0);
        window.three.render();
    }

});