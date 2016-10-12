/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "backbone", "threeModel", "lattice", "baseplane"],
    function(THREE, Backbone, three, lattice, baseplane){

    var Highlighter = Backbone.Model.extend({

        defaults: {

        },

        initialize: function(){
            this.object3D = this._makeMesh();
            three.sceneAdd(this.object3D);
            this.setVisiblity(false);

            this.listenTo(lattice, "change:aspectRatio", this._scaleMesh);
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
            var aspectRatio = lattice.getAspectRatio();
            aspectRatio[info.normal] = 0.01;
            this.object3D.position.set(info.position.x, info.position.y, info.position.z);
            this.object3D.scale.set(aspectRatio.x, aspectRatio.y, aspectRatio.z);
            this.setVisiblity(true);
            three.render();
        }

    });
    return new Highlighter();
});