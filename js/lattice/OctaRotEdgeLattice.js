/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["OctaRotEdgeLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new RotEdgeOctaBasePlane();
            globals.highlighter = new OctaVertexHighlighter();
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

        xScale: function(){
            return 1 + 2*this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale();
        },

        zScale: function(){
            return Math.sqrt(2)/2 + 2*this.get("cellSeparation").z;
        },

        makeCellForLatticeType: function(indices){
            return new DMARotatedEdgeCell(indices);
        },

        _undo: function(){//remove all the mixins
            var self = this;
            _.each(_.keys(this.OctaRotEdgeLattice), function(key){
                self[key] = null;
            });
        }
    }
