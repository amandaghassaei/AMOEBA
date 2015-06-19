/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'three', 'threeModel', 'latticeBase'],
    function(_, Backbone, appState, globals, plist, THREE, three, LatticeBase){

    var Lattice = LatticeBase.extend({

        defaults: _.extend(_.clone(LatticeBase.prototype.defaults), {

            units: "mm",

            cellType: "cube",
            connectionType: "face",
            partType: null,

            nodes: [],

            cellSeparation: {xy:0, z:0}//spacing for connectors/joints
        }),



        __bindEvents: function(){

            this.listenTo(this, "change:partType", this._updatePartType);
            this.listenTo(this, "change:cellType change:connectionType", function(){
                this._updateLatticeType();
            });
            this.listenTo(this, "change:cellSeparation", this._updateCellSeparation);

            this.listenTo(appState, "change:currentNav", this._navChanged);
        },

        __initialize: function(){
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

        showCellAtIndex: function(index){
            var latticeIndex = (new THREE.Vector3()).subVectors(index, this.get("cellsMin"));//index is probably a json object from gcode comment
            var cell = this.cells[latticeIndex.x][latticeIndex.y][latticeIndex.z];
            if (cell) cell.show();
            else console.warn("placing a cell that does not exist");
        },

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






        //fill geometry

        subtractMesh: function(mesh){
            //todo this is specific to octa face

            var xScale = this.xScale();
            var yScale = this.yScale();
            var zScale = this.zScale();

            var cells = this.cells;
            var cellsMin = this.get("cellsMin");

            var allVertexPos = mesh.geometry.attributes.position.array;

            var zHeight = 0;
            for (var x=0;x<cells.length;x++){
                for (var y=0;y<cells[0].length;y++){
                    var firstCell = null;
                    for (var z=0;z<cells[0][0].length;z++){
                        firstCell = cells[x][y][z];
                        if (firstCell) break;
                    }
                    if (!firstCell) continue;//nothing in col

                    var origin = this._positionForIndex(firstCell.indices);
    //                    firstCell._calcPosition(0, this._add({x:x,y:y,z:z}, cellsMin));
                    zHeight = this._findIntersectionsInWindow(xScale/2, yScale/2, origin, allVertexPos) || zHeight;

                    zHeight = Math.floor(zHeight/zScale);
                    for (var z=0;z<zHeight;z++){
                        var cell = cells[x][y][z];
                        if (cell) cell.destroy();
                        cells[x][y][z] = null;
                    }
                }

            }
            three.render();
        },

        _findIntersectionsInWindow: function(windowX, windowY, origin, allVertexPos){
            for (var i=0;i<allVertexPos.length;i+=3){
                if (allVertexPos[i] > origin.x-windowX && allVertexPos[i] < origin.x+windowX
                    && allVertexPos[i+1] > origin.y-windowY && allVertexPos[i+1] < origin.y+windowY){
                    return allVertexPos[i+2];
                }
            }
            return null
        },







        //composite Cells

        _navChanged: function(){
            var currentNav = appState.get("currentNav");
            if (currentNav != "navComposite" && this.compositeEditor && this.exitCompositeEditing) this.exitCompositeEditing();
        },

        getCompositeData: function(){
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
            if (this.compositeEditor) return true;
            return false;
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







        //utils

        rasterCells: function(order, callback, var1, var2, var3, cells){//used for CAM raster x/y/z in any order permutation
            //order is of form 'XYZ'
            var firstLetter = order.charAt(0);
            order = order.substr(1);
            var isNeg = false;
            if (firstLetter == "-") {
                isNeg = true;
                firstLetter = order.charAt(0);
                order = order.substr(1);
            }
            if (!cells) cells = this.cells;//grab cells once at beginning and hold onto it in case changes are made while looping
            var newVarOrder;
            var newVarDim;
            if (firstLetter == 'X'){
                newVarOrder = 0;
                newVarDim = cells.length;
            } else if (firstLetter == 'Y'){
                newVarOrder = 1;
                newVarDim = cells[0].length;
            } else if (firstLetter == 'Z'){
                newVarOrder = 2;
                newVarDim = cells[0][0].length;
            } else if (firstLetter == ""){
                this._rasterCells(order, callback, var1, var2, var3, cells);
                return;
            }
            if (var3 == null) var3 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            else if (var2  == null) var2 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            else var1 = {order: newVarOrder, dim: newVarDim, neg:isNeg};
            this.rasterCells(order, callback, var1, var2, var3, cells);
        },

        _rasterCells: function(order, callback, var1, var2, var3, cells){
            for (var i=this._getRasterLoopInit(var1);this._getRasterLoopCondition(i,var1);i+=this._getRasterLoopIterator(var1)){
                for (var j=this._getRasterLoopInit(var2);this._getRasterLoopCondition(j,var2);j+=this._getRasterLoopIterator(var2)){
                    for (var k=this._getRasterLoopInit(var3);this._getRasterLoopCondition(k,var3);k+=this._getRasterLoopIterator(var3)){
                        if (var1.order == 0){
                            if (var2.order == 1) callback(cells[i][j][k], i, j, k);
                            else if (var2.order == 2) callback(cells[i][k][j], i, k, j);
                        } else if (var1.order == 1){
                            if (var2.order == 0) callback(cells[j][i][k], j, i, k);
                            else if (var2.order == 2) callback(cells[k][i][j], k, i, j);
                        } else {
                            if (var2.order == 0) callback(cells[j][k][i], j, k, i);
                            else if (var2.order == 1) {
                                callback(cells[k][j][i], k, j, i);
                            }
                        }

                    }
                }
            }
        },

        _getRasterLoopInit: function(variable){
            if (variable.neg) return variable.dim-1;
            return 0;
        },

        _getRasterLoopCondition: function(iter, variable){
            if (variable.neg) return iter>=0;
            return iter<variable.dim;
        },

        _getRasterLoopIterator: function(variable){
            if (variable.neg) return -1;
            return 1;
        }
    });



    var lattice = new Lattice();
    appState.setLattice(lattice);
    return lattice;

});