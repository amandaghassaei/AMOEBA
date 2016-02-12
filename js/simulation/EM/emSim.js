/**
 * Created by aghassaei on 1/11/16.
 */


define(['three', 'underscore', 'backbone', 'threeModel', 'appState', 'emSimLattice', 'lattice', 'plist'],
    function(THREE, _, Backbone, three, appState, emSimLattice, lattice, plist){

    var emSim = Backbone.Model.extend({

        defaults:{

            gravity: 9.8,//m/s^2
            gravityVector: new THREE.Vector3(0,0,-1),

            dtSolver: 50,//us
            dtRender: 100,//frames

            isRunning: false,
            needsReset: false,

            viewMode: 'default',
            colorMin: null,
            colorMax: null,
            autoRangeColor: true,

            manualSelectFixed: false,
            showFixed: false,
            numFixed: 0,

            numSimMaterials: 20//number of materials used in gradient view

        },

        initialize: function(){

            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(appState, "change:currentTab", this._tabChanged);
            this.listenTo(this, "change:showFixed", this._toggleFixedVisibility);
            this.listenTo(this, "change:viewMode change:colorMax change:colorMin", this._viewModechanged);

            this._navChanged();

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
            if (currentNav != "emNavSim") {
                this.reset();
                this._viewModechanged();
                return;
            }

            emSimLattice.setCells(lattice.getCells());
        },

        _tabChanged: function(){
            var currentTab = appState.get("currentTab");
            if (currentTab != "emRun"){
                this.reset();
            }
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
                    emSimLattice.iter(dt, gravityVect, false);
                }
                emSimLattice.iter(dt, gravityVect, true);
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
            if (this._getViewMode == "translation"){
                this.calcTranslation();
            }
            three.render();
        },


        fixCellAtPosition: function(position){
            position.sub(lattice.get("cellsMin"));
            var cell = emSimLattice._getCellAtIndex(position);
            var numFixed = this.get("numFixed");
            if (cell.isFixed()) {
                numFixed--;
                cell.float();
            } else {
                numFixed++;
                cell.fix();
            }
            this.set("numFixed", numFixed);
        },

        _toggleFixedVisibility: function(){
            var state = this.get("showFixed");
            emSimLattice.loopCells(function(cell){
                if (!state || cell.isFixed()) cell.show();
                else cell.hide();
            });
            three.render();
        },


        _viewModechanged: function(){
            var viewMode = this._getViewMode();
            if (viewMode == "default") {
                emSimLattice.loopCells(function(cell){
                    cell.showDefaultColor();
                });
            } else if (viewMode == "translation") {
                this.calcTranslation();
            }
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