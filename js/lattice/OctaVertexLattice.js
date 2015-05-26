/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["OctaVertexLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new SquareBasePlane();
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
            position.x = (position.x)*this.xScale();
            position.y = (position.y)*this.yScale();
            position.z = (position.z+0.5)*this.zScale();
            return position;
        },

        xScale: function(){
            return Math.sqrt(2)+this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale();
        },

        zScale: function(){
            return Math.sqrt(2)+this.get("cellSeparation").z;
        },

        makeCellForLatticeType: function(indices){
            return new DMAVertexOctaCell(indices);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaVertexLattice), function(key){
                self[key] = null;
            });
        }
    }
