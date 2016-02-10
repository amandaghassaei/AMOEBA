/**
 * Created by ghassaei on 2/10/16.
 */


define(['backbone', 'lattice', 'three', 'threeModel', 'globals'], function(Backbone, lattice, THREE, three, globals){

    
    return Backbone.Model.extend({
        
        defaults: {
            bound1: null,
            bound2: null,
            min: null,
            max: null,
            cutMode: false
        },
        
        initialize: function(options){
            this.set("bound1", options.bound.clone());

            var scale = lattice.getAspectRatio();
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(scale.x, scale.y, scale.z), new THREE.MeshBasicMaterial({
                        transparent:true,
                        opacity:0.4,
                        color:0xffffff
                }));
            this.mesh = mesh;

            this.listenTo(this, "change:min change:max", this._sizeChanged);
    
            this.setBound(options.bound);
    
            three.sceneAdd(mesh);
        },
        
        setBound: function(bound){
            if (this.get("bound2") && bound.equals(this.get("bound2"))) {
                return;
            }

            var normalAxis = globals.baseplane.getNormalAxis();
            bound[normalAxis] = this.get("bound1")[normalAxis];

            this.set("bound2", bound.clone());
    
            this.set("min", this.get("bound1").clone().min(this.get("bound2")), {silent: true});
            this.set("max", this.get("bound1").clone().max(this.get("bound2")), {silent: true});

            this._sizeChanged();

        },

        _sizeChanged: function(){
            var size = this.getSize();
            this.mesh.scale.set(size.x, size.y, size.z);

            var scale = lattice.getAspectRatio();
            var center = this.get("min").clone().add(this.get("max").clone().sub(this.get("min")).multiplyScalar(0.5).multiply(scale));
            this.mesh.position.set(center.x, center.y, center.z);
        },
        
        getSize: function(){
            return this.get("max").clone().sub(this.get("min")).add(new THREE.Vector3(1,1,1));
        },
        
        fill: function(){
            lattice.addCellsInRange({min: this.get("min").clone(), max: this.get("max").clone()});
            globals.highlighter.destroyFillRect();
        },

        cut: function(){
            lattice.removeCellsInRange({min: this.get("min").clone(), max: this.get("max").clone()});
            globals.highlighter.destroyFillRect();
        },
        
        toJSON: function(){
            return {
                min: this.get("min"),
                max: this.get("max"),
                size: this.getSize(),
                cutMode: this.get("cutMode")
            };
        },
        
        destroy: function(){
            this.off();
            this.set("bound1", null, {silent:true});
            this.set("bound2", null, {silent:true});
            this.set("min", null, {silent:true});
            this.set("max", null, {silent:true});
            three.sceneRemove(this.mesh);
            this.mesh = null;
        }
        
        
    });

});