/**
 * Created by aghassaei on 9/22/15.
 */


define(['underscore', 'appState', 'three'], function(_, appState, THREE){

    var materialNum = 1;//outward facing name

    var torsion1dof = new THREE.Geometry();
        //torsion
    torsion1dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5)

    ];
    torsion1dof.faces  = [
        new THREE.Face3(5, 0, 2),
        new THREE.Face3(5, 2, 1),
        new THREE.Face3(4, 3, 6),
        new THREE.Face3(3, 4, 7),
        new THREE.Face3(1, 2, 6),
        new THREE.Face3(1, 6, 3),
        new THREE.Face3(0, 7, 4),
        new THREE.Face3(0, 5, 7),
        new THREE.Face3(2, 0, 4),
        new THREE.Face3(2, 4, 6),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7)
    ];

    var bending1dof = new THREE.Geometry();

        //1dof hinge vertices and faces
    bending1dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, 0, -0.5)
    ];
    bending1dof.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 8),
        new THREE.Face3(3, 8, 9),
        new THREE.Face3(9, 6, 7),
        new THREE.Face3(9, 8, 6),
        new THREE.Face3(0, 1, 8),
        new THREE.Face3(1, 9, 8),
        new THREE.Face3(4, 9, 5),
        new THREE.Face3(8, 9, 4),
        new THREE.Face3(2, 0, 8),
        new THREE.Face3(8, 4, 6),
        new THREE.Face3(1, 3, 9),
        new THREE.Face3(5, 9, 7)
    ];

    var bending2dof = new THREE.Geometry();

        //2dof hinge vertices and faces
    bending2dof.vertices = [
        new THREE.Vector3(0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, 0.5, -0.5),
        new THREE.Vector3(0.5, -0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(-0.5, 0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 0.5),
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(0, 0, 0)
    ];
    bending2dof.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 8),
        new THREE.Face3(8, 6, 7),
        new THREE.Face3(8, 8, 6),
        new THREE.Face3(0, 1, 8),
        new THREE.Face3(4, 8, 5),
        new THREE.Face3(8, 8, 4),
        new THREE.Face3(2, 0, 8),
        new THREE.Face3(8, 4, 6),
        new THREE.Face3(1, 3, 8),
        new THREE.Face3(5, 8, 7)
    ];

    var wireStraight = new THREE.Geometry();
    wireStraight.vertices = [
        new THREE.Vector3(0.3, 0.3, 0.5),
        new THREE.Vector3(0.3, 0.3, -0.5),
        new THREE.Vector3(0.3, -0.3, 0.5),
        new THREE.Vector3(0.3, -0.3, -0.5),
        new THREE.Vector3(-0.3, 0.3, 0.5),
        new THREE.Vector3(-0.3, 0.3, -0.5),
        new THREE.Vector3(-0.3, -0.3, 0.5),
        new THREE.Vector3(-0.3, -0.3, -0.5)

    ];
    wireStraight.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 6),
        new THREE.Face3(3, 6, 7),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(4, 1, 5),
        new THREE.Face3(2, 0, 4),
        new THREE.Face3(2, 4, 6),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7)
    ];

    var wireBent = new THREE.Geometry();
    wireBent.vertices = [
        new THREE.Vector3(0.5, 0.3, -0.3),
        new THREE.Vector3(0.3, 0.3, -0.5),
        new THREE.Vector3(0.5, -0.3, -0.3),
        new THREE.Vector3(0.3, -0.3, -0.5),
        new THREE.Vector3(-0.3, 0.3, 0.3),
        new THREE.Vector3(-0.3, 0.3, -0.5),
        new THREE.Vector3(-0.3, -0.3, 0.3),
        new THREE.Vector3(-0.3, -0.3, -0.5),
        new THREE.Vector3(0.5, 0.3, 0.3),
        new THREE.Vector3(0.5, -0.3, 0.3)
    ];
    wireBent.faces  = [
        new THREE.Face3(1, 0, 2),
        new THREE.Face3(1, 2, 3),
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 5, 7),
        new THREE.Face3(3, 2, 6),
        new THREE.Face3(3, 6, 7),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(4, 1, 5),
        new THREE.Face3(2, 0, 8),
        new THREE.Face3(2, 8, 9),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7),
        new THREE.Face3(9, 8, 4),
        new THREE.Face3(9, 4, 6),
        new THREE.Face3(2, 9, 6),
        new THREE.Face3(0, 4, 8)
    ];

    var siliconModule = new THREE.Geometry();
    siliconModule.vertices = [
        new THREE.Vector3(0.4, 0.4, 0.4),
        new THREE.Vector3(0.4, 0.4, -0.4),
        new THREE.Vector3(0.4, -0.4, 0.4),
        new THREE.Vector3(0.4, -0.4, -0.4),
        new THREE.Vector3(-0.4, 0.4, 0.4),
        new THREE.Vector3(-0.4, 0.4, -0.4),
        new THREE.Vector3(-0.4, -0.4, 0.4),
        new THREE.Vector3(-0.4, -0.4, -0.4),

        new THREE.Vector3(0.4, 0.3, 0.3),
        new THREE.Vector3(0.4, 0.3, -0.3),
        new THREE.Vector3(0.4, -0.3, 0.3),
        new THREE.Vector3(0.4, -0.3, -0.3),

        new THREE.Vector3(-0.4, 0.3, 0.3),
        new THREE.Vector3(-0.4, 0.3, -0.3),
        new THREE.Vector3(-0.4, -0.3, 0.3),
        new THREE.Vector3(-0.4, -0.3, -0.3),

        new THREE.Vector3(0.5, 0.3, 0.3),
        new THREE.Vector3(0.5, 0.3, -0.3),
        new THREE.Vector3(0.5, -0.3, 0.3),
        new THREE.Vector3(0.5, -0.3, -0.3),

        new THREE.Vector3(-0.5, 0.3, 0.3),
        new THREE.Vector3(-0.5, 0.3, -0.3),
        new THREE.Vector3(-0.5, -0.3, 0.3),
        new THREE.Vector3(-0.5, -0.3, -0.3)
    ];
    siliconModule.faces  = [
        new THREE.Face3(3, 2, 6),
        new THREE.Face3(3, 6, 7),
        new THREE.Face3(0, 1, 4),
        new THREE.Face3(4, 1, 5),
        new THREE.Face3(2, 0, 4),
        new THREE.Face3(2, 4, 6),
        new THREE.Face3(1, 3, 5),
        new THREE.Face3(5, 3, 7),

        new THREE.Face3(0,8,1),
        new THREE.Face3(1,8,9),
        new THREE.Face3(2,3,10),
        new THREE.Face3(3,11,10),
        new THREE.Face3(2,10,0),
        new THREE.Face3(0,10,8),
        new THREE.Face3(3,1,11),
        new THREE.Face3(11,1,9),

        new THREE.Face3(4,5,12),
        new THREE.Face3(5,13,12),
        new THREE.Face3(7,6,14),
        new THREE.Face3(15,7,14),
        new THREE.Face3(14,6,4),
        new THREE.Face3(14,4,12),
        new THREE.Face3(5,7,15),
        new THREE.Face3(5,15,13),

        new THREE.Face3(8,16,9),
        new THREE.Face3(9,16,17),
        new THREE.Face3(10,11,18),
        new THREE.Face3(11,19,18),
        new THREE.Face3(10,18,8),
        new THREE.Face3(8,18,16),
        new THREE.Face3(11,9,19),
        new THREE.Face3(19,9,17),

        new THREE.Face3(17, 16, 18),
        new THREE.Face3(17, 18, 19),

        new THREE.Face3(4,5,12),
        new THREE.Face3(5,13,12),
        new THREE.Face3(7,6,14),
        new THREE.Face3(15,7,14),
        new THREE.Face3(14,6,4),
        new THREE.Face3(14,4,12),
        new THREE.Face3(5,7,15),
        new THREE.Face3(5,15,13),

        new THREE.Face3(12,13,20),
        new THREE.Face3(13,21,20),
        new THREE.Face3(15,14,22),
        new THREE.Face3(23,15,22),
        new THREE.Face3(22,14,12),
        new THREE.Face3(22,12,20),
        new THREE.Face3(13,15,23),
        new THREE.Face3(13,23,21),

        new THREE.Face3(20, 21, 22),
        new THREE.Face3(22, 21, 23)
    ];

    torsion1dof.computeFaceNormals();
    bending1dof.computeFaceNormals();
    bending2dof.computeFaceNormals();
    wireStraight.computeFaceNormals();
    wireBent.computeFaceNormals();
    siliconModule.computeFaceNormals();
    assignUVs(torsion1dof);
    assignUVs(bending1dof);
    assignUVs(bending2dof);
    assignUVs(wireStraight);
    assignUVs(wireBent);
    assignUVs(siliconModule);

    function assignUVs( geometry ){
        geometry.computeBoundingBox();
        var max     = geometry.boundingBox.max;
        var min     = geometry.boundingBox.min;
        var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);
        geometry.faceVertexUvs[0] = [];
        var faces = geometry.faces;
        for (i = 0; i < geometry.faces.length ; i++) {
          var v1 = geometry.vertices[faces[i].a];
          var v2 = geometry.vertices[faces[i].b];
          var v3 = geometry.vertices[faces[i].c];
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
            new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
            new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
          ]);
        }
        geometry.uvsNeedUpdate = true;
    }

    function DMAMaterial(json, id){
        this.id = id;

        var randomColor = this.randomHexColor();

        var defaults = {
            name: "",
            color: randomColor,
            altColor: randomColor,
            noDelete: false,
            properties:{},
            hidden: false,//global material visibility setting
            transparent:false//global material visibility setting
        };
        json = _.extend(defaults, json);
        this.set(json, true);
        if (json.texture) this.texture = json.texture;
        if (json.mesh) {
            if (json.mesh == "torsion1dof") this.mesh = torsion1dof;
            else if (json.mesh == "bending1dof") this.mesh = bending1dof;
            else if (json.mesh == "bending2dof") this.mesh = bending2dof;
            else if (json.mesh == "wireStraight") this.mesh = wireStraight;
            else if (json.mesh == "wireBent") this.mesh = wireBent;
            else if (json.mesh == "siliconModule") this.mesh = siliconModule;
            else console.warn("no mesh for type " + json.mesh);
        }
    }

    DMAMaterial.prototype.getID = function(){
        return this.id;
    };

    DMAMaterial.prototype.setMetaData = function(data){

        if (data.id) delete data.id;//cannot change id once set

        //check if colors have changed
        var oldColor = this.color;
        var oldAltColor = this.altColor;

        var changed = false;
        var self = this;
        _.each(["name", "color", "altColor", "noDelete", "texture"], function(key){
            if (data[key] !== undefined && data[key] != self[key]) {
                self[key] = data[key];
                changed = true;
            }
        });

        if (this.name == "" && data.name == ""){
            this.name = this.generateMaterialName();
            changed = true;
        }

        if (!this.threeMaterial ||
            (data.color && oldColor != data.color) ||
            (data.altColor && oldAltColor != data.altColor)) this.changeColorScheme();//don't need to set edited flag for this, render will handle it

        this.properties = this.properties || {};
        if (data.properties){
            _.each(data.properties, function(val, key){
                if (self.properties[key] != val){
                    self.properties[key] = val;
                    changed  = true;
                }
            });
        }

        return changed;
    };

    DMAMaterial.prototype.generateMaterialName = function(){
        return "Material " + materialNum++;
    };

    DMAMaterial.prototype.setData = function(data){
        return false;
    };

    DMAMaterial.prototype.set = function(data, silent){

        var edited = this.setMetaData(data);
        edited |= this.setData(data);

        if (silent) return false;

        if (edited){
            var self = this;
            require(['materials', 'lattice'], function(materials, lattice){

                var changed = false;
                if (self.isComposite()) changed = self.recalcChildren(materials);

                var parentComposites = self.getParentComposites(materials);
                if (changed){
                    _.each(parentComposites, function(parentID){
                        var parent = materials.getMaterialForId(parentID);
                        parent.recalcChildren(materials);
                    });
                }
                parentComposites.push(self.getID());

            });
        }
        return edited;
    };

    DMAMaterial.prototype.getParentComposites = function(materials){
        var parentComposites = [];
        var id = this.getID();
        _.each(materials.compositeMaterialsList, function(material, key){
            if (key == id) return;
            var compositeChildren = material.getCompositeChildren();
            if (compositeChildren.indexOf(id) >= 0){
                parentComposites.push(key);
            }
        });
        return parentComposites;
    };

    DMAMaterial.prototype.changeColorScheme = function(state){
        if (!state) state = appState.get("realisticColorScheme");
        var color = this._getColorForState(state);

        if (this.threeMaterial) this.threeMaterial.color = new THREE.Color(color);
        else this.threeMaterial = this._makeMaterialObject(color);

        if (this.transparentMaterial) this.transparentMaterial.color = new THREE.Color(color);
        else this.transparentMaterial = this._makeMaterialObject(color, true);
    };

    DMAMaterial.prototype._getColorForState = function(state){
        if (state) return this.color;
        return this.altColor;
    };

    DMAMaterial.prototype.changeRandomColor = function(){
        this.set({altColor: this.randomHexColor()});
    };

    DMAMaterial.prototype.randomHexColor = function(){
        var hex = '#' + Math.floor(Math.random()*16777215).toString(16);
        if (hex.match(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i) !== null) return hex;
        return "#000000";
    };

    DMAMaterial.prototype._makeMaterialObject = function(color, transparent){
        if (transparent) return new THREE.MeshLambertMaterial({color:color, transparent:true, opacity:0.4});
        var json = {color: color};
        if (this.texture) json.map = THREE.ImageUtils.loadTexture("assets/textures/"+this.texture+".png");
        return new THREE.MeshLambertMaterial(json);
    };

    DMAMaterial.prototype.getThreeMaterial = function(){
        if (!this.threeMaterial) {
            console.warn("no three material found for material " + this.getID());
            return null;
        }
        if (this.isTransparent()) return this.getTransparentMaterial();
        return this.threeMaterial;
    };

    DMAMaterial.prototype.getTransparentMaterial = function(){
        if (!this.transparentMaterial) {
            console.warn("no transparent material found for material " + this.getID());
            return null;
        }
        return this.transparentMaterial;
    };

    DMAMaterial.prototype.isComposite = function(){
        return false;
    };

    DMAMaterial.prototype.getName = function(){
        return this.name;
    };

    DMAMaterial.prototype.getProperties = function(){
        return this.properties;
    };

    DMAMaterial.prototype.isConductive = function(){
        return this.properties.conductive;
    };

    DMAMaterial.prototype.getDensity = function(){
        return this.properties.density;
    };

    DMAMaterial.prototype.getElasticMod = function(){
        return this.properties.elasMod*1000000000;
    };

    DMAMaterial.prototype.getK = function(){
        return this.properties.k;
    };

    DMAMaterial.prototype.getMesh = function(){
        return this.mesh;
    };

    DMAMaterial.prototype.canDelete = function(){
        return !this.noDelete;
    };

    DMAMaterial.prototype.setTransparent = function(state){
        this.transparent = state;
        require(['lattice'], function(lattice){
            lattice.refreshCellsMaterial();
        });
    };

    DMAMaterial.prototype.isTransparent = function(){
        return this.transparent && appState.get("currentNav") == "navDesign";
    };

    DMAMaterial.prototype.toJSON = function(){
        return {
                name: this.name,
                color: this.color,
                id: this.getID(),
                altColor: this.altColor,
                noDelete: this.noDelete,
                properties: this.getProperties(),
                texture: this.texture,
                mesh: this.mesh,
                hidden: this.hidden,
                transparent: this.transparent
            }
    };

    DMAMaterial.prototype.destroy = function(){
        var self = this;
        _.each(this, function(property, key){
            self[key] = null;
        });
    };

    return DMAMaterial;
});