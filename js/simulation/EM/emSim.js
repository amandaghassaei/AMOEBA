/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'emSimLattice', 'lattice'],
    function(_, Backbone, three, appState, emSimLattice, lattice){

    var emSim = Backbone.Model.extend({

        defaults:{

            gravity: 9.8,//m/s^2

            isRunning: false,

            viewMode: 'default',

            manualSelectFixed: false,
            showFixed: false

        },

        initialize: function(){

            this.listenTo(appState, "change:currentNav", this._navChanged);
            this.listenTo(this, "change:showFixed", this._toggleFixedVisibility);

            this._navChanged();
        },

        _navChanged: function(){
            var currentNav = appState.get("currentNav");
            if (currentNav != "emNavSim") return;

            emSimLattice.setCells(lattice.getCells());
        },




        run: function(){
            this.set("isRunning", true);
            three.startAnimationLoop(function(){
                emSimLattice.iter();
            });
        },

        pause: function(){
            three.stopAnimationLoop();
            this.set("isRunning", false);
        },

        reset: function(){
            this.set("isRunning", false);
            emSimLattice.reset();
        },


        fixCellAtPosition: function(position){
            position.sub(lattice.get("cellsMin"));
            var cell = emSimLattice.getCellAtIndex(position);
            if (cell.isFixed()) cell.float();
            else cell.fix();
        },

        _toggleFixedVisibility: function(){
            var state = this.get("showFixed");
            emSimLattice.loopCells(function(cell){
                if (!state || cell.isFixed()) cell.show();
                else cell.hide();
            });
            three.render();
        }



    });

    return new emSim();
});