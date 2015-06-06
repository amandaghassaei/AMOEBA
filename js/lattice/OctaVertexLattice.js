/**
 * Created by aghassaei on 5/26/15.
 */

define(['underscore', 'backbone', 'appState', 'lattice', 'globals', 'plist', 'three', 'threeModel'],
    function(_, Backbone, appState, lattice, globals, plist, THREE, three){

    var OctaVertexLattice = {

        _initLatticeType: function(){
            require(['squareBaseplane'], function(SquareBasePlane){
                globals.basePlane = new SquareBasePlane();
            });
            require(['defaultHighlighter'], function(DefaultHighlighter){
                globals.highlighter = new DefaultHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            return new THREE.Vector3(
                Math.floor(absPosition.x/this.xScale()+0.5),
                Math.floor(absPosition.y/this.yScale()+0.5),
                Math.floor(absPosition.z/this.zScale())+0.5);
        },

        getPositionForIndex: function(index){
            var position = index.clone();
            position.x = (position.x)*this.xScale();
            position.y = (position.y)*this.yScale();
            position.z = (position.z+0.5)*this.zScale();
            return position;
        },

        xScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").xy;
            return Math.sqrt(2)+2*cellSeparation;
        },

        yScale: function(cellSeparation){
            return this.xScale(cellSeparation);
        },

        zScale: function(cellSeparation){
            if (cellSeparation === undefined) cellSeparation = this.get("cellSeparation").z;
            return Math.sqrt(2)+2*cellSeparation;
        },

        makeCellForLatticeType: function(indices, callback){
            require(['octaVertexCell'], function(OctaVertexCell){
                var cell = new OctaVertexCell(indices);
                if (callback) callback(cell);
                return cell;
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(OctaVertexLattice), function(key){
                self[key] = null;
            });
        }
    };

    return OctaVertexLattice;
});
