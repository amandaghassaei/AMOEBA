/**
 * Created by aghassaei on 1/11/16.
 */


define(['three', 'underscore', 'backbone', 'threeModel', 'appState', 'emSimLattice', 'lattice', 'plist'],
    function(THREE, _, Backbone, three, appState, emSimLattice, lattice, plist){

    var emSim = Backbone.Model.extend({

        defaults:{

            gravity: 9.8,//m/s^2
            gravityVector: new THREE.Vector3(0,0,-1),

            dtSolver: 10,//us
            dtRender: 100,//frames

            isRunning: false,
            needsReset: false,

            viewMode: 'default',
            colorMin: null,
            colorMax: null,
            autoRangeColor: true,

            manualSelectFixed: false,
            showFixed: false,
            fixedIndices: [],

            numSimMaterials: 20,//number of materials used in gradient view

            visibleWire: -1//-2 show all, -1 show conductors, or wire id

        },

        initialize: function(){

            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(appState, "change:currentTab", this._tabChanged);
            this.listenTo(this, "change:showFixed", this._toggleFixedVisibility);
            this.listenTo(this, "change:viewMode change:colorMax change:colorMin", this._viewModechanged);
            this.listenTo(this, "change:visibleWire", function(){this.showConductors();});

            this._navChanged();

            this.time = 0;

            this.simMaterials = this._buildSimMaterials();
        },

        _buildSimMaterials: function(){
            var materials = [];
            var numMaterials = this.get("numSimMaterials");
            for (var i=0;i<numMaterials;i++){
                materials.push(new THREE.MeshLambertMaterial({color: this._colorForVal(i, 0, numMaterials-1)}));
            }
            return materials;
        },

        _colorForVal : function(val, min, max){
            if (min==max) return new THREE.Color();
            var scaledVal = (1-(val - min)/(max - min)) * 0.7;
            var color = new THREE.Color();
            color.setHSL(scaledVal, 1, 0.5);
            return color;
        },

        _materialForVal: function(val, min, max, numMaterials){
            var index = Math.round((numMaterials-1)*(val-min)/(max-min));
            if (min == max) index = 0;
            return this.simMaterials[index];
        },

        _navChanged: function(){

            var currentNav = appState.get("currentNav");
            if (plist.allMenus[currentNav].parentNav) currentNav = plist.allMenus[currentNav].parentNav;
            if (plist.allMenus[currentNav].parent) currentNav = plist.allMenus[currentNav].parent;

            if (currentNav != "navSim") {
                this.reset();
                this._viewModechanged();
                return;
            }

            var previous = appState.previous("currentNav");
            if (previous != "emNavSignal" && plist.allMenus[appState.get("currentNav")].parent != "emNavSim"){
                emSimLattice.setCells(lattice.getCells(), this.get("fixedIndices"));
            }

            var currentTab = appState.get("currentTab");
            if (currentTab == "emElectronics" || currentTab == "signal"){
                this.showConductors();
            }
        },

        _tabChanged: function(){
            var currentTab = appState.get("currentTab");
            var currentNav = appState.get("currentNav");
            var lastNav = appState.previous("currentNav");
            if ((lastNav == "emNavSim" || currentNav == "emNavSim")) {
                if (currentTab != "emRun"){
                    this.reset();
                }

                if (currentTab == "emElectronics") {
                    this.showConductors();
                    return;
                }
                var previousTab = appState.previous("currentTab");
                if (previousTab == "emElectronics") {
                    this.showConductors(-2);//show all if not in electronics tab
                }
            }
        },

        showConductors: function(groupNum){
            if (groupNum === undefined) groupNum = this.get("visibleWire");
            if (_.keys(emSimLattice.get("wires")).length == 0 || groupNum == -2){
                lattice.setOpaque();
                three.render();
                return;
            }
            var allVisible = groupNum == -1;
            emSimLattice.loopCells(function(cell){
                cell.setTransparent(!cell.conductiveGroupVisible(allVisible, groupNum));
            });
            three.render();
        },

        _getViewMode: function(){
            var currentTab = appState.get("currentTab");
            if (currentTab != "emRun") return "default";
            return this.get("viewMode");
        },




        run: function(){
            var self = this;
            this.set("isRunning", true);
            this.set("needsReset", true);
            var dt = this.get("dtSolver")/1000000;//convert to sec

            var renderRate = this.get("dtRender");
            var gravityVect = this.get("gravityVector").clone().normalize().multiplyScalar(this.get("gravity"));

            three.startAnimationLoop(function(){
                for (var i=0;i<renderRate-1;i++){
                    self.time += dt;
                    emSimLattice.iter(dt, self.time, gravityVect, false);
                }
                self.time += dt;
                emSimLattice.iter(dt, self.time, gravityVect, true);
                if (self._getViewMode() == "translation"){
                    self.calcTranslation();
                }
            });
        },

        pause: function(){
            three.stopAnimationLoop();
            this.set("isRunning", false);
        },

        reset: function(){
            three.stopAnimationLoop();
            this.set("isRunning", false);
            this.set("needsReset", false);
            emSimLattice.reset();
            this.time = 0;
            if (this._getViewMode == "translation"){
                this.calcTranslation();
            }
            three.render();
        },


        fixCellAtIndex: function(index){
            var position = index.clone().sub(lattice.get("cellsMin"));
            var fixed = emSimLattice.fixCellAtIndex(position);
            var fixedIndices = this.get("fixedIndices");
            if (fixed) fixedIndices.push(index.clone());
            else {
                _.each(fixedIndices, function(fixedIndex, i){
                    if (fixedIndex.equals(index)) fixedIndices.splice(i, 1);
                });
            }
            this.trigger("change");
        },

        _toggleFixedVisibility: function(){
            var state = this.get("showFixed");
            var cellsMin = lattice.get("cellsMin");
            lattice.loopCells(function(cell, x, y, z){
                if (!state || emSimLattice.isFixedAtIndex(new THREE.Vector3(x,y,z))) cell.show();
                else cell.hide();
            });
            three.render();
        },


        _viewModechanged: function(){
            //var viewMode = this._getViewMode();
            //if (viewMode == "default") {
            //    emSimLattice.loopCells(function(cell){
            //        cell.showDefaultColor();
            //    });
            //} else if (viewMode == "translation") {
            //    this.calcTranslation();
            //}
            three.render();
        },

        calcTranslation: function(){
            var max = 0;
            var min = 0;
            var self = this;
            var numMaterials = this.get("numSimMaterials");
            if (!this.get("autoRangeColor")){
                if (this.get("colorMin")) min = this.get("colorMin");
                if (this.get("colorMax")) max = this.get("colorMax");
            } else {
                emSimLattice.loopCells(function(cell){
                    var translation = cell.getTranslation().length();
                    if (translation>max) max = translation;
                });
                this.set("colorMin", min);
                this.set("colorMax", max);
            }
            emSimLattice.loopCells(function(cell){
                var val = cell.getTranslation().length();
                cell.showTranslation(self._materialForVal(val, min, max, numMaterials));
            });
        }



    });

    return new emSim();
});