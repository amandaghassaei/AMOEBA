/**
 * Created by ghassaei on 5/23/16.
 */


define(['three', 'underscore', 'backbone', 'threeModel', 'appState', 'Sim', 'elementMechSimLattice', 'lattice', 'plist', 'globals'],
    function(THREE, _, Backbone, three, appState, Sim, ElementMechSimLattice, lattice, plist, globals){

    var elementFEASim = Sim.extend({

        defaults: _.extend({},Sim.prototype.defaults,
            {
                visibleWire: -1,//-2 show all, -1 show conductors, or wire id, -3 show actuators, -4 show problem actuators
                visibleActuator: 0
            }
        ),

        initialize: function(){

            this.simLattice = new ElementMechSimLattice();

            this.listenTo(this, "change:visibleWire", function(){this.showConductors();});
            this.listenTo(this, "change:visibleActuator", function(){this.showActuator();});

            this._initialize();
        },

        isActive: function(){
            return appState.get("currentNav") == "elementMechNavSim";
        },


        //events

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
                this.simLattice.setCells(lattice.getCells(), this.get("fixedIndices"));
            }

            //var currentTab = appState.get("currentTab");
            //if (currentTab == "emElectronics" || currentTab == "signal"){
            //    this.showConductors();
            //}

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

        showActuator: function(index){
            if (index === undefined) index = this.get("visibleActuator");
            this.simLattice.loopCells(function(cell){
                cell.setTransparent(true);
            });
            this.simLattice.get("actuators")[index].cell.setTransparent(false);
            three.render();
        },

        showConductors: function(groupNum){
            if (groupNum === undefined) groupNum = this.get("visibleWire");
            if (_.keys(this.simLattice.get("wires")).length == 0 || groupNum == -2){
                lattice.setOpaque();
                three.render();
                return;
            }
            var allVisible = groupNum == -1;
            this.simLattice.loopCells(function(cell){
                cell.setTransparent(!cell.conductiveGroupVisible(allVisible, groupNum));
            });
            three.render();
        },





        //run

        _setRunConstants: function(){
            var dt = this.get("dtSolver")/1000000;//convert to sec
            this.simLattice.setConstants(dt);
            return {dt: dt};//eventually we do not need this, only for types fallback
        },





        //save / load

        getSaveData: function(){
            var json = {
                gravity: this.get("gravity"),
                gravityVector: this.get("gravityVector"),
		        dtSolver: this.get("dtSolver"),
		        dtRender: this.get("dtRender"),
                fixedIndices: this.get("fixedIndices"),
                groundHeight: this.get("groundHeight"),
                friction: this.get("friction")
            };
            var signals = [];
            _.each(this.simLattice.get("signals"), function(signal){
                if (!signal.index) return;//deleted
                signals.push(_.extend(signal.getSignalJSON(), {index:signal.getIndex()}));
            });
            var latticeJson = {signals:signals};
            return _.extend(json, {lattice:latticeJson});
        },

        loadData: function(data){
            if (data.gravity) this.set("gravity", data.gravity);
            if (data.gravityVector) this.set("gravityVector", new THREE.Vector3(data.gravityVector.x, data.gravityVector.y, data.gravityVector.z));
            if (data.dtSolver) this.set("dtSolver", data.dtSolver);
            if (data.dtRender) this.set("dtRender", data.dtRender);
            if (data.groundHeight) this.set("groundHeight", data.groundHeight);
            if (data.friction) this.set("friction", data.friction);
            if (data.fixedIndices) {
                var fixedIndices = [];
                _.each(data.fixedIndices, function(index){
                    fixedIndices.push(new THREE.Vector3(index.x, index.y, index.z));
                });
                this.set("fixedIndices", fixedIndices);
            }
            if (data.lattice && data.lattice.signals){
                var signalsData = [];
                _.each(data.lattice.signals, function(signal){
                    var index = new THREE.Vector3(signal.index.x, signal.index.y, signal.index.z);
                    var json = _.omit(signal, "index");
                    signalsData.push({index: index, json:json});
                });
                this.simLattice.set("signalsData", signalsData);
            }
        }



    });

    return new elementFEASim();
});