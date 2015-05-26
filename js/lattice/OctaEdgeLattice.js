/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["OctaEdgeLattice"] = {

        _initLatticeType: function(){
            globals.basePlane = new OctaBasePlane();
            globals.highlighter = new OctaEdgeHighlighter();

        },

        getIndexForPosition: function(absPosition){
            //todo finish this
            var yIndex = Math.floor(absPosition.y/this.yScale());
            if (yIndex%2 != 0) absPosition.x += this.xScale()/2;
            var yScale = 1/Math.sqrt(3);
            var index = this._indexForPosition(absPosition);
            if (index.z%3 == 1) {
                absPosition.x -= this.xScale()/2;
                absPosition.y += yScale/2;
            } else if (index.z%3 == 2){
                absPosition.y += yScale;
            }
            var index = this._indexForPosition(absPosition);
            return index;
        },

        getPositionForIndex: function(index){

            var position = _.clone(index);
            var xScale = this.xScale();
            var yScale = 1/Math.sqrt(3);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale()+yScale/2;
            position.z = (position.z+0.5)*this.zScale();
            if (index.y%2 != 0) position.x -= this.xScale()/2;
            if (index.z%3 == 1) {
                position.x += this.xScale()/2;
                position.y -= yScale/2;
            } else if (index.z%3 == 2){
                position.y -= yScale;
            }
            return position;
        },

        makeCellForLatticeType: function(indices){
            return new DMAEdgeOctaCell(indices);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaEdgeLattice), function(key){
                self[key] = null;
            });
            _.each(_.keys(this.OctaFaceLattice), function(key){
                self[key] = null;
            });
        }
    }
