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

        getCellSubclassFile: function(){
            return "octaFaceCell";
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
