/**
 * Created by aghassaei on 6/4/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var TetraStackedLattice = {

        _initLatticeType: function(){
            require(['octaBaseplane'], function(OctaBasePlane){
                globals.basePlane = new OctaBasePlane();
            });
            require(['defaultHighlighter'], function(DefaultHighlighter){
                globals.highlighter = new DefaultHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            var index = this._indexForPosition(absPosition);
            if (index.y%2 != 0) {
                absPosition.x += this.xScale()/2;
                index = this._indexForPosition(absPosition);
            }
            return index;
        },

        getPositionForIndex: function(index){
            var position = this._positionForIndex(index);
            if ((index.y%2) != 0) position.x -= this.xScale()/2;
            return position;
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 1+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation)/2*Math.sqrt(3);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return 2/Math.sqrt(6)+2*cellSeparation;
        },

        makeCellForLatticeType: function(indices, callback){
            require(['tetraStackedCell'], function(TetraStackedCell){
                var cell = new TetraStackedCell(indices);
                if (callback) callback(cell);
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(TetraStackedLattice), function(key){
                self[key] = null;
            });
        }
    };

    return TetraStackedLattice;
});
