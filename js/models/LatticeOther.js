/**
 * Created by aghassaei on 3/10/15.
 */


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////CUBE LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

OtherLatticeSubclasses = {

    CubeLattice: {

        _initLatticeType: function(){
            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new CubeHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMACubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.CubeLattice), function(key){
                self[key] = null;
            });
        }
    },

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////GIK LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    GIKLattice: {

        _initLatticeType: function(){
            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new GIKHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(1+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMAGIKCell(indices, scale);
        },

        addSuperCell: function(range){

            var length = this.get("gikLength");
            var superCell = new DMASuperCell(length, range);
            var cells = this.addCellsInRange(range);
            _.each(cells, function(cell, index){
                cell.setSuperCell(superCell, index, length);
            });
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.GIKLattice), function(key){
                self[key] = null;
            });
        }
    },


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////TRUNCATED CUBE LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    TruncatedCubeLattice: {

        _initLatticeType: function(){
            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new TruncatedCubeHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(Math.sqrt(2)+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMATruncCubeCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.TruncatedCubeLattice), function(key){
                self[key] = null;
            });
        }

    },


    ////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////TRUNCATED CUBE LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    KelvinLattice: {

        _initLatticeType: function(){
            this.set("basePlane", new SquareBasePlane({scale:this.get("scale")}));
            this.set("highlighter", new TruncatedCubeHighlighter({scale:this.get("scale")}));
        },

        getIndexForPosition: function(absPosition){
            return this._indexForPosition(absPosition);
        },

        getPositionForIndex: function(index){
            return this._positionForIndex(index);
        },

        xScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(2*Math.sqrt(2)+2*this.get("cellSeparation").xy);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            if (!scale) scale = this.get("scale");
            return scale*(2*Math.sqrt(2)+2*this.get("cellSeparation").z);
        },

        makeCellForLatticeType: function(indices, scale){
            return new DMATruncOctaCell(indices, scale);
        },

        _undo: function(){//remove all the mixins, this will help with debugging later
            var self = this;
            _.each(_.keys(this.KelvinLattice), function(key){
                self[key] = null;
            });
        }

    }

};