/**
 * Created by aghassaei on 6/10/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase', 'materials'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase, materials){


    var CompositeEditorLattice = LatticeBase.extend({

        __initialize: function(options, callback){

            if (callback) callback(this);
        },


        setSparseCells: function(cells, offset){
            if (cells === undefined || cells == null) {
                console.warn("no cells given to setSparseCells");
                return;
            }
            this._setSparseCells(cells, offset);
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
