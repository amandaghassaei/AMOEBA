/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

    var OctaRotEdgeLattice = {

        _initLatticeType: function(){
            require(['rotEdgeOctaBaseplane'], function(RotEdgeOctaBasePlane){
                globals.basePlane = new RotEdgeOctaBasePlane();
            });
            require([this.getHighlighterFile()], function(DefaultHighlighter){
                globals.highlighter = new DefaultHighlighter();
            });
        },

        getHighlighterFile: function(){
            return "defaultHighlighter";
        },

        getIndexForPosition: function(absPosition){
            var index = this._indexForPosition(absPosition);
            if (index.z %2 != 0){
                absPosition.x += this.xScale()/2;
                absPosition.y += this.yScale()/2;
            }
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            index = index.clone();
            if (index.z %2 != 0){
                index.x -= 0.5;
                index.y -= 0.5;
            }
            var position = this._positionForIndex(index);
            return position;
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 1 + 2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return Math.sqrt(2)/2 + 2*cellSeparation;
        },

        getCellSubclassFile: function(){
            return "octaRotEdgeCell";
        },

        _undo: function(){//remove all the mixins
            var self = this;
            _.each(_.keys(OctaRotEdgeLattice), function(key){
                self[key] = null;
            });
        }
    };

    return OctaRotEdgeLattice;
});
