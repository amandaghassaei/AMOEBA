/**
 * Created by aghassaei on 5/26/15.
 */

latticeSubclasses = latticeSubclasses || {};

latticeSubclasses["OctaFreeFormFaceLattice"] = {

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

        _undo: function(){//remove all the mixins
            var self = this;
            this.set("freeformCellType", null);//todo get rid of this property
            this.clearCells();
            _.each(_.keys(this.OctaFreeFormFaceLattice), function(key){
                self[key] = null;
            });
        }
    }