/**
 * Created by aghassaei on 9/22/15.
 */


define(['underscore', 'appState'], function(_, appState){

    var materialNum = 1;

    function DMAMaterial(json, id){
        this.id = id;

        var randomColor = this.randomHexColor();

        var defaults = {
            name: "",
            color: randomColor,
            altColor: randomColor,
            noDelete: false,
            properties:{}
        };
        json = _.extend(defaults, json);
        this.set(json);
    }

    DMAMaterial.prototype.getID = function(){
        return this.id;
    };

    DMAMaterial.prototype.setMetaData = function(data){

        if (data.id) delete data.id;//cannot change id once set
        if (data.noDelete) delete data.noDelete;//immutable

        //check if colors have changed
        var oldColor = this.color;
        var oldAltColor = this.altColor;

        var changed = false;
        var self = this;
        _.each(["name", "color", "altColor"], function(key){
            if (data[key] && data[key] != self[key]) {
                self[key] = data[key];
                changed = true;
            }
        });

        if (this.name = "" && data.name === undefined){
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

    DMAMaterial.prototype.set = function(data){

        var changed = this.setMetaData(data);
        changed |= this.setData(data);

        return changed;
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

    DMAMaterial.prototype.randomHexColor = function(){
        var hex = '#' + Math.floor(Math.random()*16777215).toString(16);
        if (hex.match(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i) !== null) return hex;
        return "#000000";
    };

    DMAMaterial.prototype._makeMaterialObject = function(color, transparent){
        if (transparent) return new THREE.MeshLambertMaterial({color:color, transparent: true, opacity:0.1});
        return new THREE.MeshLambertMaterial({color:color});
    };

    DMAMaterial.prototype.getThreeMaterial = function(){
        if (!this.threeMaterial) {
            console.warn("no three material found for material " + this.getID());
            return null;
        }
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