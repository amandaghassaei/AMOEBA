/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "backbone", "threeModel"], function(THREE, Backbone, three){

    var Highlighter = Backbone.Model.extend({

        defaults: {

        },

        initialize: function(){
            this.object3D = this._makeMesh();
            three.sceneAdd(this.object3D);
            this.setVisiblity(false);
        },

        setVisiblity: function(visible){
            this.object3D.visible = visible;
            three.render();
        },

        _makeMesh: function(){
            return new THREE.Mesh(new THREE.BoxGeometry(1,0.01,1),
                new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.4}));
        },

        setPosition: function(info){
            this.object3D.position.set(info.position.x, info.position.y, info.position.z);
            this.setVisiblity(true);
            three.render();
        }


    });
    return new Highlighter();
});