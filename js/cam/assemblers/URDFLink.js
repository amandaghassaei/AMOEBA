/**
 * Created by aghassaei on 8/25/15.
 */


define(['underscore', 'three'], function(_, THREE){

    var num = 1;

    function Link(json){

        this._name = json.name || "Link " + num++;
        this._origin = json.origin || new THREE.Vector3(0,0,0);//also euler rotation
        this._axis = json.axis || new THREE.Vector3(1,0,0);

        this.object3D = new THREE.Object3D();

    }

    Link.prototype.getName = function(){
        return this._name;
    };

    Link.prototype.setName = function(name){
        this._name = name;
    };

    Link.prototype.getObject3D = function(){
        return this.object3D;
    };



    Link.prototype.toJSON = function(){
        return {

        };
    };

    return Link;
});