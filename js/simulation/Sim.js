/**
 * Created by ghassaei on 5/23/16.
 */

define(['three', 'underscore', 'backbone', 'threeModel', 'appState', 'lattice'],
    function(THREE, _, Backbone, three, appState, lattice){

    var Sim = Backbone.Model.extend({

        defaults:{

            dtSolver: 10,//us
            dtRender: 100,//frames

            isRunning: false,
            needsReset: false,

            viewMode: 'default',
            colorMin: null,
            colorMax: null,
            autoRangeColor: true,
            numSimMaterials: 20,//number of materials used in gradient view

            manualSelectFixed: false,
            showFixed: false,
            fixedIndices: []
        },

        _initialize: function(){

            this.listenTo(appState, "change:currentNav", function(){
                if (!this.isActive()) return;
                this._navChanged();
            });
            this.listenTo(appState, "change:currentTab", function(){
                if (!this.isActive()) return;
                this._tabChanged();
            });
            this.listenTo(this, "change:showFixed", function(){
                if (!this.isActive()) return;
                this._toggleFixedVisibility();
            });
            this.listenTo(this, "change:viewMode change:colorMax change:colorMin", function(){
                if (!this.isActive()) return;
                this._viewModechanged();
            });

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

        _getViewMode: function(){
            return this.get("viewMode");
        },




        run: function(){
            var self = this;
            this.set("isRunning", true);
            this.set("needsReset", true);

            var dt = this.get("dtSolver")/1000000;//convert to sec
            var renderRate = this.get("dtRender");
            var runConstants = this._setRunConstants();

            three.startAnimationLoop(function(){
                for (var i=0;i<renderRate-1;i++){
                    self.time += dt;
                    self.simLattice.iter(self.time, runConstants, false);
                }
                self.time += dt;
                self.simLattice.iter(self.time, runConstants, true);
                //if (self._getViewMode() == "translation"){
                //    self.calcTranslation();
                //}
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
            this.simLattice.reset();
            this.time = 0;
            if (this._getViewMode == "translation"){
                this.calcTranslation();
            }
            three.render();
        },


        fixCellAtIndex: function(index){
            var position = index.clone().sub(lattice.get("cellsMin"));
            var fixed = this.simLattice.fixCellAtIndex(position);
            var fixedIndices = this.get("fixedIndices");
            if (fixed) fixedIndices.push(index.clone());
            else {
                for (var i=0;i<fixedIndices.length;i++){
                    if (fixedIndices[i].equals(index)) {
                        fixedIndices.splice(i, 1);
                        break;
                    }
                }
            }
            this.trigger("change");
        },

        _toggleFixedVisibility: function(){
            var state = this.get("showFixed");
            var cellsMin = lattice.get("cellsMin");
            var self = this;
            lattice.loopCells(function(cell, x, y, z){
                if (!state || self.simLattice.isFixedAtIndex(new THREE.Vector3(x,y,z))) cell.show();
                else cell.hide();
            });
            three.render();
        },


        _viewModechanged: function(){
            //var viewMode = this._getViewMode();
            //if (viewMode == "default") {
            //    this.simLattice.loopCells(function(cell){
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
                this.simLattice.loopCells(function(cell){
                    var translation = cell.getTranslation().length();
                    if (translation>max) max = translation;
                });
                this.set("colorMin", min);
                this.set("colorMax", max);
            }
            this.simLattice.loopCells(function(cell){
                var val = cell.getTranslation().length();
                cell.showTranslation(self._materialForVal(val, min, max, numMaterials));
            });
        }
        
    });

    return Sim;
});