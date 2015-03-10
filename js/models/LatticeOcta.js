/**
 * Created by aghassaei on 3/10/15.
 */

if (typeof dmaGlobals === "undefined") dmaGlobals = {};

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////FACE CONN OCTA LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

dmaGlobals.OctaLatticeSubclasses = {

    OctaFaceLattice: {

        _initLatticeType: function(){

            //bind events
            this.set("columnSeparation", 0.0);
            this.listenTo(this, "change:columnSeparation", this._changeColSeparation);

            this.set("basePlane", new OctaBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaFaceHighlighter({scale:this.get("scale")}));
        },

        _changeColSeparation: function(){
            var colSep = this.get("columnSeparation");
            var scale = this.get("scale");
            var cellMode = this.get("cellMode");
            this.get("basePlane").updateColSeparation(colSep);
            this._iterCells(this.get("cells"), function(cell){
                if (cell) cell.updateForScale(scale, cellMode);
            });
            dmaGlobals.three.render();
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

        getInvCellPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);

            var oddZ = position.z%2 != 0;
            var upPoint = (position.z%4 == 0 || Math.abs(position.z%4) == 3);
            position.z = Math.floor(position.z/2);

            if (!upPoint){
                position.x = (position.x)*this.xScale(scale);
                position.y = position.y*this.yScale(scale);
            } else {
                position.x = (position.x+0.5)*this.xScale(scale);
                position.y = (position.y)*this.yScale(scale)-scale/Math.sqrt(3)/2;
            }

            if (oddZ){
                position.z = (position.z + 1)*this.zScale(scale);
            } else {
                position.z = (position.z)*this.zScale(scale);
            }

//            if (Math.abs(index.z%4) == 1 || Math.abs(index.z%4) == 2) position.z += this.zScale(scale);

            if ((index.y%2) != 0) {
                if (!upPoint){
                    position.x += this.xScale(scale)/2;
                } else {
                    position.x -= this.xScale(scale)/2;
                }
            }

            return position;
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            var colSep = this.get("columnSeparation");
            return scale*(1+2*colSep);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return 2*scale/Math.sqrt(6);
        },

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAFaceOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATetraFaceCell(indices, scale, true);
        },

        _inverseIndicesToAdd: function(index){

            var oddZ = index.z%2 != 0;

            index = _.clone(index);
            index.z*=2;

            var z0 = 0;
            if (oddZ) z0 = 1;

            if (this.get("connectionType") == "edge") z0 = 0;
            var z1 = Math.abs(z0-1);

            var inverseIndicesToAdd;
            if (index.y%2 == 0){

                inverseIndicesToAdd = [
                    this._add(index, {x:0,y:0,z:z0}),
                    this._add(index, {x:0,y:1,z:z0}),
                    this._add(index, {x:1,y:1,z:z0}),

                    this._add(index, {x:0,y:0,z:z1}),
                    this._add(index, {x:0,y:1,z:z1}),
                    this._add(index, {x:1,y:0,z:z1})
                ];
            } else {
                inverseIndicesToAdd = [
                    this._add(index, {x:0,y:0,z:z0}),
                    this._add(index, {x:-1,y:1,z:z0}),
                    this._add(index, {x:0,y:1,z:z0}),

                    this._add(index, {x:-1,y:0,z:z1}),
                    this._add(index, {x:0,y:1,z:z1}),
                    this._add(index, {x:0,y:0,z:z1})
                ];
            }
            return inverseIndicesToAdd;
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            this.stopListening(this, "change:columnSeparation");
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
            cells[0][0].push(this._makeCellForLatticeType({x:0,y:0,z:cells[0][0].length}, scale, parentCellPos, parentCellOrient, direction, parentType, type));
            this.set("numCells", this.get("numCells")+1);
            dmaGlobals.three.render();
        },

        _makeCellForLatticeType: function(index, scale, parentPosition, parentOrientation, direction, parentType, type){
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
            var colSep = this.get("columnSeparation");
            return scale*(1+2*colSep);
        },

        yScale: function(scale){
            return this.xScale(scale)/2*Math.sqrt(3);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
//            if (this.get("freeformCellType") == "octa") return 2*scale/Math.sqrt(6);
            return 2*scale/Math.sqrt(24);
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
            this.set("columnSeparation", 0.0);
//            this.listenTo(this, "change:columnSeparation", this._changeColSeparation);

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

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAEdgeOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATetraEdgeCell(indices, scale);
        },

        getInvCellPositionForIndex: function(index){

            var scale = this.get("scale");
            var position = _.clone(index);

            var oddZ = position.z%2 != 0;
            position.z = Math.floor(position.z/2);
            var yScale = scale/Math.sqrt(3);

            if (oddZ){
                position.x = (position.x)*this.xScale(scale);
                position.y = position.y*this.yScale(scale);
            } else {
                position.x = (position.x+0.5)*this.xScale(scale);
                position.y = (position.y)*this.yScale(scale)-yScale/2;
            }

            if (oddZ){
                position.z = (position.z + 1)*this.zScale(scale);
            } else {
                position.z = (position.z)*this.zScale(scale);
            }

            if ((index.y%2) != 0) {
                if (oddZ){
                    position.x += this.xScale(scale)/2;
                } else {
                    position.x -= this.xScale(scale)/2;
                }
            }

            var zLayer = Math.floor(index.z/2)%3;
            if (zLayer == 1) {
                position.x += this.xScale(scale)/2;
                position.y -= yScale/2;
            } else if (zLayer == 2){
                position.y -= yScale;
            }

            return position;
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

            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new OctaVertexHighlighter({scale:this.get("scale")}));

        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        _makeCellForLatticeType: function(indices, scale){
//            this._addInverseCellsForIndex(indices);
            return new DMAVertexOctaCell(indices, scale);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
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
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        getInvCellPositionForIndex: function(index){

            var position = this._positionForIndex(index);

            var scale = this.get("scale");
            position.x -= this.xScale(scale)/2;
            position.y -= this.yScale(scale)/2;
            position.z -= this.zScale(scale)/2;
            return position;
        },

        _inverseIndicesToAdd: function(index){
            return [
                this._add(index, {x:0,y:0,z:0}),
                this._add(index, {x:0,y:1,z:0}),
                this._add(index, {x:1,y:0,z:0}),
                this._add(index, {x:1,y:1,z:0}),

                this._add(index, {x:0,y:0,z:1}),
                this._add(index, {x:0,y:1,z:1}),
                this._add(index, {x:1,y:0,z:1}),
                this._add(index, {x:1,y:1,z:1})
            ];
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
        },

        _makeCellForLatticeType: function(indices, scale){
            this._addInverseCellsForIndex(indices);
            return new DMAVertexOctaCell(indices, scale);
        },

        _makeInvCellForLatticeType: function(indices, scale){
            return new DMATruncCubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.OctaVertexLattice), function(key){
                self[key] = null;
            });
        }
    }
};
