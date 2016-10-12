/**
 * Created by ghassaei on 10/11/16.
 */


define(["backbone", "three"], function(Backbone, THREE){

    var Lattice = Backbone.Model.extend({
        defaults: {
            scale: new THREE.Vector3(1,1,1),
            aspectRatio: new  THREE.Vector3(1,1,1)
        },

        initialize: function(){

        },

        getScale: function(){
            return this.get("scale").clone();
        },

        getAspectRatio: function(){
            return this.get("aspectRatio").clone();
        }
    });
    return new Lattice();
});