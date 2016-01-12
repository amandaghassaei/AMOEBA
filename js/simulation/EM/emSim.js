/**
 * Created by aghassaei on 1/11/16.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'emSimLattice', 'lattice'],
    function(_, Backbone, three, appState, emSimLattice, lattice){

    var emSim = Backbone.Model.extend({

        defaults:{

            gravity: 9.8,//m/s^2

            isRunning: false,

            viewMode: 'default'

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
//            while(this.get("isRunning")){
                emSimLattice.iter();
//            }
        },

        pause: function(){
            this.set("isRunning", false);
        },

        reset: function(){
            this.set("isRunning", false);
            emSimLattice.reset();
        }



    });

    return new emSim();
});