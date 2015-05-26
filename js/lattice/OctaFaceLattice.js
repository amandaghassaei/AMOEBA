/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["OctaFaceLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new OctaBasePlane();
            globals.highlighter = new OctaFaceHighlighter();
        },

        getIndexForPosition: function(absPosition){
            var yIndex = Math.floor(absPosition.y/this.yScale());
            if (yIndex%2 != 0) absPosition.x += this.xScale()/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){
            var position = _.clone(index);
            position.x = (position.x+1/2);
            position.y = position.y*this.yScale()+1/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale();
            if ((index.y%2) != 0) position.x -= this.xScale()/2;
            return position;
        },

        xScale: function(){
            return 1+2*this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale()/2*Math.sqrt(3);
        },

        zScale: function(){
            return 2/Math.sqrt(6)+2*this.get("cellSeparation").z;
        },

        makeCellForLatticeType: function(indices){
            return new DMAFaceOctaCell(indices);
        },

        _undo: function(){//remove all the mixins
            var self = this;
            _.each(_.keys(this.OctaFaceLattice), function(key){
                self[key] = null;
            });
        }
    }
