/**
 * Created by ghassaei on 2/27/16.
 */


define(['underscore', 'backbone', 'threeModel', 'lattice', 'three', 'emWire', 'GPUMath'],
    function(_, Backbone, three, lattice, THREE, EMWire, gpuMath) {

        var EMSimLattice = Backbone.Model.extend({

            defaults: {
               wires: {},
               signals: [],
               signalConflict: false
            },

            initialize: function(){
                //this.listenTo(this, "change:wires", this._assignSignalsToWires);
            },

            setCells: function(){

            },

            iter: function(){

            },

            reset: function(){

            }

        });


        return new EMSimLattice();


    });