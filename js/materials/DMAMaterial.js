/**
 * Created by aghassaei on 9/22/15.
 */


define(['underscore', 'appState'], function(_, appState){

    var materialNum = 0;

    function getNextMaterialNum(){
        return materialNum++;
    }


    function DMAMaterial(json, id){//todo defaults
        this.id = id;

        var defaults = {
            name: "",
            color: "#000000",
            altColor: "#000000",
            noDelete: false,
            properties:{}
        };
        json = _.extend(defaults, json);
        this.set(json);
    }

    DMAMaterial.prototype.getID = function(){
        return this.id;
    };

    DMAMaterial.prototype.set = function(data){

        if (data.id) delete data.id;//cannot change id once set

        //check if colors have changed
        var oldColor = this.color;
        var oldAltColor = this.altColor;

        var self = this;
        _.each(_.keys(data), function(key){
            if (data[key] && data[key].x) self[key] = new THREE.Vector3(data[key].x, data[key].y, data[key].z);
            else self[key] = data[key];
        });
        if (this.name === "") this.name = "Material " + getNextMaterialNum();

        if (!this.threeMaterial ||
            (data.color && oldColor != data.color) ||
            (data.altColor && oldAltColor != data.altColor)) this.changeColorScheme();//don't need to set edited flag for this, render will handle it

        return false;//composite materials have edited flag to trigger upstream changes
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

    DMAMaterial.prototype._makeMaterialObject = function(color, transparent){
        if (transparent) return new THREE.MeshLambertMaterial({color:color, transparent: true, opacity:0.1});
        return new THREE.MeshLambertMaterial({color:color});
    };

    DMAMaterial.prototype.getThreeMaterial = function(){
        if (!this.threeMaterial) {
            console.warn("no transparentMaterial found for material " + this.getID());
            return null;
        }
        return this.threeMaterial;
    };

    DMAMaterial.prototype.getTransparentMaterial = function(){
        if (!this.transparentMaterial) {
            console.warn("no transparentMaterial found for material " + this.getID());
            return null;
        }
        return this.transparentMaterial;
    };

    DMAMaterial.prototype.getDimensions = function(){
        return false;
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

    DMAMaterial.prototype.canDelete = function(){
        return !this.noDelete;
    };

//    DMAMaterial.prototype.clone = function(){
//        return JSON.parse(JSON.stringify(this.toJSON()));
//    };

    DMAMaterial.prototype.toJSON = function(){
        return {
                name: this.name,
                color: this.color,
                id: this.getID(),
                altColor: this.altColor,
                noDelete: this.noDelete,
                properties: this.getProperties()
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