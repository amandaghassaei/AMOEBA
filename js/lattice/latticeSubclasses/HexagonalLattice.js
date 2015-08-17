/**
 * Created by aghassaei on 8/17/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, globals, plist, THREE, three){

    var HexLattice =  {

        _initLatticeType: function(){
            require(['hexBaseplane'], function(BasePlaneClass){
                globals.basePlane = new BasePlaneClass();
            });
            require([this.getHighlighterFile()], function(HighlighterClass){
                globals.highlighter = new HighlighterClass();
            });
        },

        getHighlighterFile: function(){
            return "defaultHighlighter";
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
            return Math.sqrt(3)+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 1.5+2*cellSeparation;
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return 1+2*cellSeparation;
        },

        getCellSubclassFile: function(){
            return "hexCell";
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(HexLattice), function(key){
                self[key] = null;
            });
        }
    };

    return HexLattice;

});
