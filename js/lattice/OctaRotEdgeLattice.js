/**
 * Created by aghassaei on 5/26/15.
 */

define(['lattice', 'globals'], function(lattice, globals){

    var OctaRotEdgeLattice = {

        _initLatticeType: function(){
            require(['rotEdgeOctaBasePlane'], function(RotEdgeOctaBasePlane){
                globals.basePlane = new RotEdgeOctaBasePlane();
            });
            require(['defaultHighlighter'], function(DefaultHighlighter){
                globals.highlighter = new DefaultHighlighter();
            });
        },

        getIndexForPosition: function(absPosition){
            var position = {};
            position.x = Math.floor(absPosition.x/this.xScale()+0.5);
            position.y = Math.floor(absPosition.y/this.yScale()+0.5);
            position.z = Math.floor(absPosition.z/this.zScale()+0.5);
            return position;
        },

        getPositionForIndex: function(index){
            var position = _.clone(index);
            if (index.z %2 != 0){
                position.x += 0.5;
                position.y += 0.5;
            }
            position.x = (position.x)*this.xScale();
            position.y = (position.y)*this.yScale();
            position.z = (position.z+1)*this.zScale();
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

        makeCellForLatticeType: function(indices){
            return new OctaRotEdgeCell(indices);
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
