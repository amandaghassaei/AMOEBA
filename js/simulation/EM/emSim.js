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

            manualSelectFixed: false

        },

        initialize: function(){

            this.listenTo(appState, "change:currentNav", this._navChanged);

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
        }



    });

    return new emSim();
});