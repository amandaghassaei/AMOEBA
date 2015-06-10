/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var OctaEdgeLattice = {

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

//        getIndexForPosition: function(absPosition){
//            var yIndex = Math.floor(absPosition.y/this.yScale());
//            if (yIndex%2 != 0) absPosition.x += this.xScale()/2;
//            var yScale = 1/Math.sqrt(3);
//            var index = this._indexForPosition(absPosition);
//            if (index.z%3 == 1) {
//                absPosition.x -= this.xScale()/2;
//                absPosition.y += yScale/2;
//            } else if (index.z%3 == 2){
//                absPosition.y += yScale;
//            }
//            return this._indexForPosition(absPosition);
//        },
//
//        getPositionForIndex: function(index){
//            var position = index.clone();
//            var xScale = this.xScale();
//            var yScale = 1/Math.sqrt(3);
//            position.x = (position.x+1/2)*xScale;
//            position.y = position.y*this.yScale()+yScale/2;
//            position.z = (position.z+0.5)*this.zScale();
//            if (index.y%2 != 0) position.x -= this.xScale()/2;
//            if (index.z%3 == 1) {
//                position.x += this.xScale()/2;
//                position.y -= yScale/2;
//            } else if (index.z%3 == 2){
//                position.y -= yScale;
//            }
//            return position;
//        },

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
            require(['octaEdgeCell'], function(OctaEdgeCell){
                var cell = new OctaEdgeCell(indices);
                if (callback) callback(cell);
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(OctaEdgeLattice), function(key){
                self[key] = null;
            });
        }
    };

    return OctaEdgeLattice;
});
