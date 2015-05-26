/**
 * Created by aghassaei on 5/26/15.
 */


_.extend(Lattice, {

    KelvinLattice: {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane();
            globals.highlighter = new TruncatedCubeHighlighter();
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(){
            return 2*Math.sqrt(2)+2*this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale();
        },

        zScale: function(){
            return 2*Math.sqrt(2)+2*this.get("cellSeparation").z;
        },

        makeCellForLatticeType: function(indices){
            return new DMATruncOctaCell(indices);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.KelvinLattice), function(key){
                self[key] = null;
            });
        }
    }
});