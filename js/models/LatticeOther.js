/**
 * Created by aghassaei on 3/10/15.
 */


////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////CUBE LATTICE//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

OtherLatticeSubclasses = {

    CubeLattice: {

        _initLatticeType: function(){

            //bind events

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
            return scale;
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
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
//////////////////////////////TRUNCATED CUBE LATTICE////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

    TruncatedCubeLattice: {

        _initLatticeType: function(){

            //bind events

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
            return scale*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
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

            //bind events

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
            return scale*2*Math.sqrt(2);
        },

        yScale: function(scale){
            return this.xScale(scale);
        },

        zScale: function(scale){
            return this.xScale(scale);
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