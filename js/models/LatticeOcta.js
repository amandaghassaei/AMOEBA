/**
 * Created by aghassaei on 3/10/15.
 */


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

OctaLatticeSubclasses = {

    OctaFaceLattice: {

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
            globals.basePlane = new OctaBasePlane();
            globals.highlighter = new OctaFreeFormHighlighter();

            this.set("freeformCellType", "octa");

        },

        addFreeFormCell: function(parentCellPos, parentCellOrient, direction, parentType, type){
            var cells = this.get("cells");
            cells[0][0].push(this.makeCellForLatticeType({x:0,y:0,z:cells[0][0].length}, parentCellPos, parentCellOrient, direction, parentType, type));
            this.set("numCells", this.get("numCells")+1);
            globals.three.render();
        },

        makeCellForLatticeType: function(index, parentPosition, parentOrientation, direction, parentType, type){
            if (type){
                if (type == "octa") return new DMAFreeFormOctaCell(index, parentPosition, parentOrientation, direction, parentType);
                return new DMAFreeFormTetraCell(index, parentPosition, parentOrientation, direction, parentType);
            }
            if (this.get("freeformCellType") == "octa") return new DMAFreeFormOctaCell(index, parentPosition, parentOrientation, direction, parentType);
            return new DMAFreeFormTetraCell(index, parentPosition, parentOrientation, direction, parentType);
        },

        getIndexForPosition: function(absPosition){//only used by baseplane
            var yIndex = Math.floor(absPosition.y/this.yScale());
            if (yIndex%2 != 0) absPosition.x += this.xScale()/2;
            var index = this._indexForPosition(absPosition);
            if (index.z%2 == 1) index.y += 1;
            return index;
        },

        getPositionForIndex: function(index){//only used by baseplane
            var position = _.clone(index);
            var xScale = this.xScale();
            position.x = (position.x+1/2)*xScale;
            position.y = position.y*this.yScale()+1/Math.sqrt(3)/2;
            position.z = (position.z+0.5)*this.zScale();
            if ((index.y%2) != 0) position.x -= xScale/2;
            return position;
        },

        xScale: function(){
            return 1+2*this.get("cellSeparation").xy;
        },

        yScale: function(){
            return this.xScale()/2*Math.sqrt(3);
        },

        zScale: function(){
            if (this.get("freeformCellType") == "octa") return 2/Math.sqrt(6)+2*this.get("cellSeparation").xy;
            return 2/Math.sqrt(24)+2*this.get("cellSeparation").xy;
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
    },

    OctaRotEdgeLattice: {

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
};
