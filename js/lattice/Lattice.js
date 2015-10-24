/**
 * Created by aghassaei on 1/16/15.
 */


define(['underscore', 'backbone', 'appState', 'globals', 'plist', 'materialsPlist', 'three', 'threeModel', 'latticeBase'],
    function(_, Backbone, appState, globals, plist, materialsPlist, THREE, three, LatticeBase){

    var Lattice = LatticeBase.extend({

        defaults: _.extend(_.clone(LatticeBase.prototype.defaults), {

            units: "mm",
            scale: 1.0,

            cellType: "cube",
            connectionType: "gik",
            applicationType: "willGik",
            partType: null,

            aspectRatio: null,

            denseCellsMin: null,
            overlappingCells: [],

            nodes: []
        }),


        __initialize: function(){

            this.listenTo(this, "change:partType", this._updatePartType);

            this.listenTo(this, "change:cellType", function(){
                this._cellTypeChanged();
                this.reloadCells();
            });
            this.listenTo(this, "change:connectionType", function(){
                this._connectionTypeChanged();
                this.reloadCells();
            });
            this.listenTo(this, "change:applicationType", function(){
                this._applicationTypeChanged();
                this.reloadCells();
            });
            this.listenTo(this, "change:aspectRatio", function(){
                this.reloadCells();
            });

            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(this, "change:cellsMin change:cellsMax", function(){
                this.updateThreeViewTarget();
            });

            this._applicationTypeChanged();
            this.reloadCells();
        },





        //getters

        getUnits: function(){
            return this.get("units");
        },

        getScale: function(){
            return this.get("scale");
        },

        getAspectRatio: function(){
            return this.get("aspectRatio").clone();
        },

        getCellType: function(){
            return this.get("cellType");
        },

        getConnectionType: function(){
            return this.get("connectionType");
        },

        getApplicationType: function(){
            return this.get("applicationType");
        },

        getPartType: function(){
            return this.get("partType");
        },



        //setters


        setProperty: function(property, value, silent){
            var changed = this.get(property) != value;
            if (silent !== true) silent = false;
            this.set(property, value, {silent:silent});
            return changed;
        },

        _getSetterName: function(property){
            return "set" + property.charAt(0).toUpperCase() + property.slice(1);
        },

        setAspectRatio: function(aspectRatio, silent){
            if (!aspectRatio.x || !aspectRatio.y || !aspectRatio.z || aspectRatio.x<0 || aspectRatio.y<0 || aspectRatio.z<0) {//no 0, undefined, null, or neg #'s
                console.warn("invalid aspect ratio params");
                return;
            }
            return this.setProperty("aspectRatio", new THREE.Vector3(aspectRatio.x, aspectRatio.y, aspectRatio.z), silent);
        },

        setCellType: function(cellType, silent){
            if (plist.allLattices[cellType] === undefined){
                console.warn("no cell type " + cellType);
                return;
            }
            return this.setProperty("cellType", cellType, silent);
        },

        setConnectionType: function(connectionType, silent){
            var cellType = this.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            if (plistCellData.connection[connectionType] === undefined){
                console.warn("no connection type " + connectionType + " for cell type " + plistCellData.name);
                return;
            }
            return this.setProperty("connectionType", connectionType, silent);
        },

        setApplicationType: function(applicationType, silent){
            var cellType = this.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            var connectionType = this.get("connectionType");
            var plistConnectionData = plistCellData.connection[connectionType];
            if (plistConnectionData.type[applicationType] === undefined){
                console.warn("no application type " + applicationType + " for cell type " + plistCellData.name + " and connection type " + plistConnectionData.name);
                return;
            }
            return this.setProperty("applicationType", applicationType, silent);
        },

        setPartType: function(partType, silent){
            var cellType = this.get("cellType");
            var plistCellData = plist.allLattices[cellType];
            var connectionType = this.get("connectionType");
            var plistConnectionData = plistCellData.connection[connectionType];
            var applicationType = this.get("applicationType");
            var plistAppData = plistConnectionData.type[applicationType];
            if (plistAppData.parts[partType] === undefined){
                console.warn("no part type " + partType + " for cell type " + plistCellData.name + " and connection type " + plistConnectionData.name + " and application type " + plistAppData.name);
                return;
            }
            return this.setProperty("partType", partType, silent);
        },

        setLatticeMetaData: function(data){
            if (!data) {
                console.warn("no data received");
                return;
            }
            var changed = false;
            var self = this;
            _.each(data, function(val, key){
                if (self[self._getSetterName(key)]) {
                    changed |= self[self._getSetterName(key)](val, true);
                }
                else console.warn("no setter found for param " + key);
            });
            if (changed){
                //todo trigger event
            }
        },







        //latticeType

        _cellTypeChanged: function(){
            var cellType = this.getCellType();
            if (plist.allLattices[cellType].connection[this.getConnectionType()] === undefined){
                var connectionType = _.keys(plist.allLattices[cellType].connection)[0];
                this.set("connectionType", connectionType, {silent:true});
            }
            this._connectionTypeChanged();
        },

        _connectionTypeChanged: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            var appType = _.keys(plist.allLattices[cellType].connection[connectionType].type)[0];
            this.set("applicationType", appType, {silent:true});
            this._applicationTypeChanged();
        },

        _applicationTypeChanged: function(){
            var latticeData = this._getLatticePlistData();
            this.set("aspectRatio", latticeData.aspectRatio.clone(), {silent:true});

            var newPartType = null;
            if (latticeData.parts) newPartType = _.keys(latticeData.parts)[0];
            this.set("partType", newPartType, {silent:true});

            var newMaterialClass = (latticeData.materialClasses || _.keys(materialsPlist.allMaterialClasses))[0];
            appState.set("materialClass", newMaterialClass);

            if (latticeData.options){
                if (latticeData.options.gikLength) appState.set("gikLength", latticeData.options.gikLength);
            }
        },

        _setDefaultCellMode: function(){//if no part associated with this lattice type
            var latticeData = this._getLatticePlistData();
            if (latticeData.parts === null){
                var currentMode = appState.get("cellMode");
                if (currentMode == "cell" || currentMode == "supercell") return;
                appState.set("cellMode", "cell");
            }
        },

        _getSubclassForLatticeType: function(){
            var cellType = this.get("cellType");
            var connectionType = this.get("connectionType");
            var subclass = plist.allLattices[cellType].connection[connectionType].subclass;
            if (subclass === undefined){
                console.warn("unrecognized cell type " + cellType);
                return null;
            }
            return subclass;
        },

        xScale: function(){
            return this.get("aspectRatio").x;
        },

        yScale: function(){
            return this.get("aspectRatio").y;
        },

        zScale: function(){
            return this.get("aspectRatio").z;
        },







        //events

        __clearCells: function(silent){
            three.removeAllCells();//todo add flag in cell destroy to avoid redundancy here
            this.set("nodes", [], {silent:silent});
            if (globals.basePlane) globals.basePlane.set("zIndex", 0, {silent:silent});
        },

        updateThreeViewTarget: function(target){
            if (target) {
                globals.threeView.setOrbitControlsFor(target);
                return;
            }
            if (!appState.get("focusOnLattice")) return;
            var cellsMin = this.get("cellsMin");
            var cellsMax = this.get("cellsMax");
            if (cellsMax === null || cellsMin === null) return;
            var center = cellsMax.clone().sub(cellsMin).divideScalar(2).add(cellsMin);
            if (globals.threeView && this.getPositionForIndex) globals.threeView.setOrbitControlsFor(this.getPositionForIndex(center));
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
            if (currentNav != "navComposite" && this.compositeEditor) this.exitCompositeEditing();

            currentNav = plist.allMenus[currentNav].parent || currentNav;
            if (currentNav == "navSim" || currentNav == "navAssemble") this._parseSparseCell();
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

        setToCompositeMode: function(compositeLattice){
            this.compositeEditor = compositeLattice;
        },

        inCompositeMode: function(){
            return this.compositeEditor !== null && this.compositeEditor !== undefined;
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

        reinitAllCellsOfTypes: function(types){//when material definition is changed
            this._loopCells(this.sparseCells, function(cell, x, y, z, self){
                if (!cell) return;
                var material = cell.getMaterial();
                if (material && material.isComposite() && types.indexOf(material.getID()) > -1){
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