/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

    var OctaFaceLattice = {

        _initLatticeType: function(){
            require(['octaBaseplane'], function(OctaBasePlane){
                globals.basePlane = new OctaBasePlane();
            });
            require([this.getHighlighterFile()], function(OctaFaceHighlighter){
                globals.highlighter = new OctaFaceHighlighter();
            });
        },

        getHighlighterFile: function(){
            return "octaFaceHighlighter";
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

        makeCellForLatticeType: function(json, callback){
            require(['octaFaceCell'], function(OctaFaceCell){
                var cell = new OctaFaceCell(json);
                if (callback) callback(cell);
            });
        },

        _undo: function(){//remove all the mixins
            var self = this;
            _.each(_.keys(OctaFaceLattice), function(key){
                self[key] = null;
            });
        }
    };

    return OctaFaceLattice;
});
