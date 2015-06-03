/**
 * Created by aghassaei on 5/26/15.
 */

define(['lattice', 'globals'], function(lattice, globals){

    _.extend(lattice, {

        GIKLattice: {

            _initLatticeType: function(){
                globals.basePlane = new SquareBasePlane();
                globals.highlighter = new GIKHighlighter();
                globals.highlighter.updateGikLength();
            },

            getIndexForPosition: function(absPosition){
                return this._indexForPosition(absPosition);
            },

            getPositionForIndex: function(index){
                return this._positionForIndex(index);
            },

            xScale: function(cellSeparation){
                if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
                return 1+2*cellSeparation;
            },

            yScale: function(cellSeparation){
                return this.xScale(cellSeparation);
            },

            zScale: function(cellSeparation){
                if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
                return 1.28*(1+2*cellSeparation);
            },

            makeCellForLatticeType: function(indices){
                 return new GIKSuperCell(indices);
            },

            _undo: function(){//remove all the mixins, this will help with debugging later
                var self = this;
                _.each(_.keys(this.GIKLattice), function(key){
                    self[key] = null;
                });
            }
        }
    });
});
