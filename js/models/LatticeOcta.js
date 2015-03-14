/**
 * Created by aghassaei on 3/10/15.
 */


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

OctaLatticeSubclasses = {

    OctaFaceLattice: {

        _initLatticeType: function(){
            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaFaceHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+scale/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if ((index.y%2) != 0) position.x -= this.xScale(scale)/2;
            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(2/Math.sqrt(6)+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMAFaceOctaCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaFaceLattice), function(key){
                self[key] = null;
            });
        }
    },



////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA FREEFORM////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


    OctaFreeFormFaceLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaFreeFormHighlighter({scale:this.get("scale")}));

            this.set("freeformCellType", "octa");

        },

        addFreeFormCell: function(parentCellPos, parentCellOrient, direction, parentType, type){
            var scale = this.get("scale");
            var cells = this.get("cells");
            cells[0][0].push(this.makeCellForLatticeType({x:0,y:0,z:cells[0][0].length}, scale, parentCellPos, parentCellOrient, direction, parentType, type));
            this.set("numCells", this.get("numCells")+1);
            dmaGlobals.three.render();
        },

        makeCellForLatticeType: function(index, scale, parentPosition, parentOrientation, direction, parentType, type){
            if (type){
                if (type == "octa") return new DMAFreeFormOctaCell(index, scale, parentPosition, parentOrientation, direction, parentType);
                return new DMAFreeFormTetraCell(index, scale, parentPosition, parentOrientation, direction, parentType);
            }
            if (this.get("freeformCellType") == "octa") return new DMAFreeFormOctaCell(index, scale, parentPosition, parentOrientation, direction, parentType);
            return new DMAFreeFormTetraCell(index, scale, parentPosition, parentOrientation, direction, parentType);
        },

        getIndexForPosition: function(absPosition){//only used by baseplane
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){//only used by baseplane
            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+scale/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if ((index.y%2) != 0) position.x -= this.xScale(scale)/2;
            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            if (this.get("freeformCellType") == "octa") return scale*(2/Math.sqrt(6)+2*this.get("cellSeparation").xy);
            return scale*(2/Math.sqrt(24)+2*this.get("cellSeparation").xy);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            this.set("freeformCellType", null);
            this.clearCells();
            _.each(_.keys(this.OctaFreeFormFaceLattice), function(key){
                self[key] = null;
            });
        }
    },



////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////EDGE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    OctaEdgeLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaEdgeHighlighter({scale:this.get("scale")}));

        },

        getIndexForPosition: function(absPosition){
            //todo finish this
            var scale = this.get("scale");
            var yIndex = Math.floor(absPosition.y/this.yScale(scale));
            if (yIndex%2 != 0) absPosition.x += this.xScale(scale)/2;
            var yScale = scale/Math.sqrt(3);
            var index = this._indexForPosition(absPosition);
            if (index.z%3 == 1) {
                absPosition.x -= this.xScale(scale)/2;
                absPosition.y += yScale/2;
            } else if (index.z%3 == 2){
                absPosition.y += yScale;
            }
            var index = this._indexForPosition(absPosition);
            return index;
        },

        getPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);
            var xScale = this.xScale(scale);
            var yScale = scale/Math.sqrt(3);
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale(scale)+yScale/2;
            position.z = (position.z+0.5)*this.zScale(scale);
            if (index.y%2 != 0) position.x -= this.xScale(scale)/2;
            if (index.z%3 == 1) {
                position.x += this.xScale(scale)/2;
                position.y -= yScale/2;
            } else if (index.z%3 == 2){
                position.y -= yScale;
            }
            return position;
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMAEdgeOctaCell(indices, scale);
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
    },

    OctaRotEdgeLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new RotEdgeOctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaVertexHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            var position = {};
            var scale = this.get("scale");
            position.x = Math.floor(absPosition.x/this.xScale(scale)+0.5);
            position.y = Math.floor(absPosition.y/this.yScale(scale)+0.5);
            position.z = Math.floor(absPosition.z/this.zScale(scale)+0.5);
            return position;
        },

        getPositionForIndex: function(index){
            var scale = this.get("scale");
            var position = _.clone(index);
            if (index.z %2 != 0){
                position.x += 0.5;
                position.y += 0.5;
            }
            position.x = (position.x)*this.xScale(scale);
            position.y = (position.y)*this.yScale(scale);
            position.z = (position.z+1)*this.zScale(scale);
            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            scale *= 1 + 2*this.get("cellSeparation").xy;
            return scale;
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            scale *= Math.sqrt(2)/2 + 2*this.get("cellSeparation").z;
            return scale;
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMARotatedEdgeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaRotEdgeLattice), function(key){
                self[key] = null;
            });
        }
    },



////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////VERTEX CONN OCTA LATTICE//////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    OctaVertexLattice: {

        _initLatticeType: function(){

            //bind events

            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaVertexHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            var position = {};
            var scale = this.get("scale");
            position.x = Math.floor(absPosition.x/this.xScale(scale)+0.5);
            position.y = Math.floor(absPosition.y/this.yScale(scale)+0.5);
            position.z = Math.floor(absPosition.z/this.zScale(scale)+0.5);
            return position;
        },

        getPositionForIndex: function(index){
            var scale = this.get("scale");
            var position = _.clone(index);
            position.x = (position.x)*this.xScale(scale);
            position.y = (position.y)*this.yScale(scale);
            position.z = (position.z+0.5)*this.zScale(scale);
            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMAVertexOctaCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaVertexLattice), function(key){
                self[key] = null;
            });
        }
    }
};
