/**
 * Created by amandaghassaei on 3/9/17.
 */

define(["three", "underscore"], function(THREE, _) {

    function Material(json, id, customMeshTypes) {

        var self = this;
        _.each(_.keys(json), function (key) {
            self[key] = json[key];
        });

        this.id = id;
        if (this.mesh) this.geo = customMeshTypes[this.mesh];

        var polygonOffset = 0.5;
        this.THREEMaterial = new THREE.MeshLambertMaterial({
            color: this.color,
            shading: THREE.FlatShading,
            polygonOffset: true,
            polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
        this.THREEAltMaterial = new THREE.MeshLambertMaterial({
            color: this.altColor,
            shading: THREE.FlatShading,
            polygonOffset: true,
            polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
    }

    Material.prototype.getTHREEMaterial = function () {
        return this.THREEMaterial;
    };

    Material.prototype.getTHREEAltMaterial = function () {
        return this.THREEAltMaterial;
    };

    Material.prototype.destroy = function () {

    };

    return Material;
});