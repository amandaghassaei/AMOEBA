/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase){

    var Lattice = LatticeBase.extend({

        defaults: _.extend(_.clone(LatticeBase.prototype.defaults), {

            units: "mm",

            cellType: "cube",
            connectionType: "gik",
            partType: null,

            nodes: [],

            cellSeparation: {xy:0, z:0}//spacing for connectors/joints
        }),


        __initialize: function(){

            this.listenTo(this, "change:partType", this._updatePartType);
            this.listenTo(this, "change:cellType change:connectionType", function(){
                this._updateLatticeType();//pass no params
            });
            this.listenTo(this, "change:cellSeparation", this._updateCellSeparation);

            this.listenTo(appState, "change:currentNav", this._navChanged);

            this._updateLatticeType();
        },







        //latticeType

        _setToDefaultsSilently: function(){
            var newCellType = this.get("cellType");
            var newConnectionType = this.get("connectionType");
            if (newConnectionType == this.previous("connectionType")){
                newConnectionType = _.keys(plist["allConnectionTypes"][newCellType])[0];
                this.set("connectionType", newConnectionType, {silent:true});
            }
            var partType = _.keys(plist["allPartTypes"][newCellType][newConnectionType])[0];
            this.set("partType", partType, {silent:true});
            appState.set("materialClass", plist.allMaterialTypes[newCellType][newConnectionType], {silent:true});
        },

        _setDefaultCellMode: function(){//if no part associated with this lattice type
            if (!plist["allPartTypes"][this.get("cellType")][this.get("connectionType")]){
                var currentMode = appState.get("cellMode");
                if (currentMode == "cell" || currentMode == "supercell") return;
                appState.set("cellMode", "cell");
            }
        },

        _getSubclassForLatticeType: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            if (cellType == "octa"){
                if (connectionType == "face"){
                    return "octaFaceLattice";
                } else if (connectionType == "edge"){
                    return "octaEdgeLattice";
                } else if (connectionType == "edgeRot"){
                    return "octaRotEdgeLattice";
                } else if (connectionType == "vertex"){
                    return "octaVertexLattice";
                }
            } else if (cellType == "tetra"){
                if (connectionType == "stacked") return "tetraStackedLattice";
                else if (connectionType == "vertex") return "tetraVertexLattice";
            } else if (cellType == "cube"){
                if (connectionType == "face"){
                    return "cubeLattice";
                } else if (connectionType == "gik"){
                    return "gikLattice";
                }
            } else if (cellType == "truncatedCube"){
                return "truncatedCubeLattice";
            } else if (cellType == "kelvin"){
                return "kelvinLattice";
            } else {
                console.warn("unrecognized cell type " + cellType);
            }
            return null;
        },







        //events

        _updateCellSeparation: function(){
            var cellSep = this.get("cellSeparation");
            globals.basePlane.updateXYSeparation(cellSep.xy);

            var cellMode = appState.get("cellMode");
            var partType = this.get("partType");
//            this._iterCells(this.cells, function(cell){
//                if (cell) cell.updateForScale(cellMode, partType);
//            });
            three.render();
        },

        __clearCells: function(silent){
            three.removeAllCells();//todo add flag in cell destroy to avoid redundancy here
            this.set("nodes", [], {silent:silent});
            if (globals.basePlane) globals.basePlane.set("zIndex", 0, {silent:silent});
        },







        //3d ui

        addHighlightableCell: function(cell){
            three.addCell(cell);
        },

        removeHighlightableCell: function(cell){
            three.removeCell(cell);
        },

        getHighlightableCells: function(){
            return three.getCells();
        },







        //composite Cells

        _navChanged: function(){
            var currentNav = appState.get("currentNav");
            if (currentNav != "navComposite" && this.compositeEditor && this.exitCompositeEditing) this.exitCompositeEditing();
        },

        getCompositeData: function(){
            if (this.get("numCells") == 0) return null;
            return {
                cellsMin: this.get("cellsMin").clone(),
                cellsMax: this.get("cellsMax").clone(),
                sparseCells: JSON.parse(JSON.stringify(this.sparseCells)),
                numCells: this.get("numCells")
            };
        },

        setToCompositeMode: function(id, data){
            var self = this;
            require(['compositeEditorLattice'], function(CompositeEditorLattice){
                self.hideCells();
                if (self.compositeEditor) {
                    console.warn("composite editor already allocated");
                    self.compositeEditor.destroy();
                }
                self.compositeEditor = new CompositeEditorLattice(_.extend({id:id}, _.omit(data, "sparseCells")), null, function(_self){
                    var cells = null;
                    if (data) cells = data.sparseCells;
                    _self._updateLatticeType(cells, self._getSubclassForLatticeType());
                    appState.set("currentNav", "navComposite");
                });

            });
        },

        inCompositeMode: function(){
            return this.compositeEditor != null;
        },

        _isSingltonLattice: function(){
            return true;
        },

        exitCompositeEditing: function(){
            if (this.compositeEditor) this.compositeEditor.destroy();
            this.compositeEditor = null;
            this.showCells();
        },

        getUItarget: function(){
            if (this.inCompositeMode()) return this.compositeEditor;
            return this;
        },

        reinitAllCellsOfTypes: function(types){
            this._loopCells(this.sparseCells, function(cell, x, y, z, self){
                if (cell && cell.materialName.substr(0,5) == "super" && types.indexOf(cell.materialName) > -1){
                    //re-init cell;
                    var json = cell.toJSON();
                    json.index = cell.getIndex();
                    self.makeCellForLatticeType(json, function(newCell){
                        self.sparseCells[x][y][z] = newCell;
                        cell.destroy();
                    });
                }
            });
        }
    });



    var lattice = new Lattice();
    appState.setLattice(lattice);
    return lattice;

});