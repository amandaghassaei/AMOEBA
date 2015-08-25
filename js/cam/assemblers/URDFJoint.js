/**
 * Created by aghassaei on 8/25/15.
 */


define(['underscore', 'three'], function(_, THREE){

    var num = 1;

    function Joint(json){

        this.object3D = new THREE.Object3D();

        this._name = json.name || "Joint " + num++;
        this._type = json.type || "prismatic";//revolute, continuous, prismatic, fixed, floating, planar



        this.setParent(json.parent);
        this._child = json.child;



        this._origin = json.origin || new THREE.Vector3(0,0,0);//also euler rotation
        this._axis = json.axis || new THREE.Vector3(1,0,0);

        //this.limit

    }

    Joint.prototype.getName = function(){
        return this._name;
    };

    Joint.prototype.setName = function(name){
        this._name = name;
    };

    Joint.prototype.getType = function(){
        return this._type;
    };

    Joint.prototype.setType = function(type){
        this._type = type;
        require([type.charAt(0).toUpperCase() + type.slice(1) + "Joint"], function(SubClass){
            //init subclass
        });

    };

    Joint.prototype.getParent = function(){
        return this._parent;
    };

    Joint.prototype.setParent = function(parent){
        if (this._parent === parent) return;
        if (this._checkDescendants(parent)) {
            console.warn("parent is already a child");
            return;
        }

        this._parent = parent;
    };

    Joint.prototype._checkDescendants = function(parent){
        if (this._child){
            if (this._child === parent) return true;
            else return this._child._checkDescendants(parent);
        } else return false;
    };

    Joint.prototype.getChild = function(){
        return this._child;
    };

    Joint.prototype.setChild = function(child){
        this._child = child;
    };

    Joint.prototype.getObject3D = function(){
        return this.object3D;
    };



    Joint.prototype.toJSON = function(){
        return {

        };
    };

    return Joint;
});