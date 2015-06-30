/**
 * Created by aghassaei on 6/23/15.
 */


define(['stlLoader', 'bin!assets/stls/crab/crab.stl', 'threeModel', 'assembler'], function(THREE, geometry, three, Assembler){


    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(geometry));

    function preProcessGeo(geo){
        var unitScale = 1/4;
        geo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(0.6, 0.7, 0.5));
        return geo;
    }

    function CrabAssembler(){
        this.stockAttachedToEndEffector = true;//no need for "stock position"
        Assembler.call(this);
    }
    CrabAssembler.prototype = Object.create(Assembler.prototype);

    CrabAssembler.prototype._buildStock = function(){
        return null;
//        return new StockClass({});
    };

    CrabAssembler.prototype._configureAssemblerMovementDependencies = function(){
        this.object3D.add(this.frame.getObject3D());
    };

    CrabAssembler.prototype._getSTLs = function(){
        return {
            frame: unitGeo
        }
    };

    return CrabAssembler;
});