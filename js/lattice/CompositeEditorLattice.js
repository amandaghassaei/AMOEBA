/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase', 'materials'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase, materials){


    var CompositeEditorLattice = LatticeBase.extend({

        __initialize: function(options, callback){

            if (callback) callback(this);
        },





        //3d ui

        addHighlightableCell: function(cell){
            three.addCompositeCell(cell);
        },

        removeHighlightableCell: function(cell){
            three.removeCompositeCell(cell);
        },

        getHighlightableCells: function(){
            return three.getCompositeCells();
        },




        _setSparseCells: function(cells, subclass){

            this._clearCells();//composite lattice should always be empty

            console.log(this.get("numCells"));
            var numCells = this.get("numCells");

            var cellsMax = this.get("cellsMax");
            var cellsMin = this.get("cellsMin");
            if (cellsMax && cellsMin) this._checkForMatrixExpansion(cellsMax, cellsMin);

            var self = this;
            require([subclass], function(subclassObject){
                _.extend(self, subclassObject);
                if (numCells>0) {
                    self._bindRenderToNumCells(numCells);
                    self.parseCellsJSON(cells);
                }
            });
        },








        //deallocate

        __clearCells: function(silent){
            three.removeAllCompositeCells();//todo add flag in cell destroy to avoid redundancy here
        },

        destroy: function(){
            this._clearCells(true);
            var self = this;
            _.each(_.keys(this.attributes), function(key){
                self.set(key, null, {silent:true});
                self.unset(key, {silent:true});
            });
        }
    });

    return CompositeEditorLattice;
});
