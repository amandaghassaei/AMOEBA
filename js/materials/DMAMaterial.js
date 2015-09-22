/**
 * Created by aghassaei on 9/22/15.
 */


define(['appState'], function(appState){

    function DMAMaterial(json){
        this.set(json);
    }

    DMAMaterial.prototype.set = function(data){

        //check if colors have changed
        var oldColor = this.color;
        var oldAltColor = this.altColor;

        var edited = false;
        if (this.sparseCells) edited = !(_.isEqual(data.sparseCells, this.sparseCells));

        var self = this;
        _.each(_.keys(data), function(key){
            if (data[key] && data[key].x) self[key] = new THREE.Vector3(data[key].x, data[key].y, data[key].z);
            else self[key] = data[key];
        });

        if (!this.threeMaterial || oldColor != this.color || oldAltColor != this.altColor) this.changeColorScheme();

        if (!data.noDelete) this.noDelete = false;
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

    DMAMaterial.prototype.getThreeMaterial = function(id){
        if (!this.threeMaterial) {
            console.warn("no transparentMaterial found for material " + id);
            return null;
        }
        return this.threeMaterial;
    };

    DMAMaterial.prototype.getTransparentMaterial = function(id){
        if (!this.transparentMaterial) {
            console.warn("no transparentMaterial found for material " + id);
            return null;
        }
        return this.transparentMaterial;
    };

    DMAMaterial.prototype.getDimensions = function(){
        return false;
    };

    DMAMaterial.prototype.getProperties = function(){
        return this.properties;
    };

    DMAMaterial.prototype.canDelete = function(){
        return !this.noDelete;
    };

    DMAMaterial.prototype.clone = function(){
        return JSON.parse(JSON.stringify(this.toJSON()));
    };

    DMAMaterial.prototype.toJSON = function(){
        return {
                name: this.name,
                color: this.color,
                altColor: this.altColor,
                noDelete: this.noDelete,
                properties: this.properties
            }
    };

    DMAMaterial.prototype.destroy = function(){

    };

    return DMAMaterial;
});