/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["CubeLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane();
            globals.highlighter = new CubeHighlighter();
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(){
            return 1+2*this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale();
        },

        zScale: function(){
            return 1+2*this.get("cellSeparation").z;
        },

        makeCellForLatticeType: function(indices){
            return new DMACubeCell(indices);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.CubeLattice), function(key){
                self[key] = null;
            });
        }
    }
