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
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return 2*Math.sqrt(3)+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
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
