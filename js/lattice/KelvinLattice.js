/**
 * Created by aghassaei on 5/26/15.
 */


define(['lattice', 'globals'], function(lattice, globals){

    var KelvinLattice =  {

        _initLatticeType: function(){
            require(['squareBaseplane'], function(SquareBasePlane){
                globals.basePlane = new SquareBasePlane();
            });
            require(['truncatedCubeHighlighter'], function(TruncatedCubeHighlighter){
                globals.highlighter = new TruncatedCubeHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 2*Math.sqrt(2)+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return 2*Math.sqrt(2)+2*cellSeparation;
        },

        makeCellForLatticeType: function(indices){
            require(['kelvinCell'], function(KelvinCell){
                return new KelvinCell(indices);
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(KelvinLattice), function(key){
                self[key] = null;
            });
        }
    };

    return KelvinLattice;

});
