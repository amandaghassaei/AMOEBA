/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "backbone", "threeModel", "lattice"],
    function(THREE, Backbone, three, lattice){

    var normal = "y";

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
            return new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
                new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.4}));
        },

        setPosition: function(info){
            var aspectRatio = lattice.getAspectRatio();
            normal = info.normal;
            aspectRatio[normal] = 0.01;
            this.object3D.position.set(info.position.x, info.position.y, info.position.z);
            this.object3D.scale.set(aspectRatio.x, aspectRatio.y, aspectRatio.z);
            this.setVisiblity(true);
        },

        getPosition: function(){
            return this.object3D.position.clone();
        },

        getNormal: function(){
            return normal;
        },

        isVisible: function(){
            return this.object3D.visible;
        },

        unhighlight: function(){
            this.setVisiblity(false);
        }

    });
    return new Highlighter();
});