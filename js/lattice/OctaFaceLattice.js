/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var OctaFaceLattice = {

        _initLatticeType: function(){
            require(['octaBaseplane'], function(OctaBasePlane){
                globals.basePlane = new OctaBasePlane();
            });
            require(['octaFaceHighlighter'], function(OctaFaceHighlighter){
                globals.highlighter = new OctaFaceHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            var yIndex = Math.floor(absPosition.y/this.yScale());
            if (yIndex%2 != 0) absPosition.x += this.xScale()/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){
            var position = index.clone();
            position.x = (position.x+1/2);
            position.y = position.y*this.yScale()+1/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale();
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
            require(['octaFaceCell'], function(OctaFaceCell){
                var cell = new OctaFaceCell(indices);
                if (callback) callback(cell);
                return cell;
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
