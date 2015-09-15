/**
 * Created by aghassaei on 9/14/15.
 */


define(['underscore', 'stlLoader', 'gikPart'], function(_, THREE, GIKPart){

    var zScale = 1.08/8;
    var unitGeo = new THREE.BoxGeometry(0.2, 0.2, zScale);

    var bridgeGeo = new THREE.BoxGeometry(0.3, 0.4, zScale);
    console.log(bridgeGeo);
    bridgeGeo.vertices[4].y = 0;
    bridgeGeo.vertices[5].y = 0;
    bridgeGeo.vertices[2].y = -0.1;
    bridgeGeo.vertices[3].y = -0.1;
    bridgeGeo.vertices[0].y = 0.1;
    bridgeGeo.vertices[1].y = 0.1;
    var bridgeMaterial = new THREE.MeshLambertMaterial({color:'#000000'});

    var nuclMaterials = {
        a: new THREE.MeshLambertMaterial({color:"#cc00cc"}),
        t: new THREE.MeshLambertMaterial({color:"#ff6600"}),
        c: new THREE.MeshLambertMaterial({color:"#66ffff"}),
        g: new THREE.MeshLambertMaterial({color:"#00ff33"})
    };


    function DNAStraightPart(index, parent, options){

        this._isBridge = options.isBridge;
        if (!this._isBridge){
            this._vertIndex = options.vertIndex;
            if (!options.nuclType) this._nuclType = this._randomNucleotide();
            else this._nuclType = options.nuclType;
        }


        GIKPart.call(this, index, parent, options);
    }
    DNAStraightPart.prototype = Object.create(GIKPart.prototype);

    DNAStraightPart.prototype._randomNucleotide = function(){
        var rand = Math.random();
        if (rand < 0.25) return 'a';
        if (rand < 0.5) return 't';
        if (rand < 0.75) return 'c';
        return 'g';
    };

    DNAStraightPart.prototype.getNucleotide = function(){
        return this._nuclType;
    };

    DNAStraightPart.prototype._getGeometry = function(){
        if (this._isBridge) return bridgeGeo;
        return unitGeo;
    };

    DNAStraightPart.prototype.getMaterial = function(returnTHREEObject){
        if (returnTHREEObject) {
            if (this._isBridge) return bridgeMaterial;
            return nuclMaterials[this._nuclType];
        }
        return GIKPart.prototype.getMaterial.call(this, returnTHREEObject);
    };

    DNAStraightPart.prototype._translatePart = function(mesh){
        if (this._isBridge){
            mesh.translateX(0.15+0.2);
            mesh.translateZ(this.parentCell.zScale()/2-zScale/2);
            return mesh;
        }
        var xOffset = 0.1;
        var yOffset = -0.1;
        if (this.index == 1) {
            xOffset = -0.1;
            yOffset = 0.1;
        }
        mesh.position.set(xOffset, yOffset, this.parentCell.zScale()/2-zScale/2-this._vertIndex*zScale);
        return mesh;
    };

    return DNAStraightPart;

});