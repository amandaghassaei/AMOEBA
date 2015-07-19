/**
 * Created by aghassaei on 5/28/15.
 */


define(['underscore', 'assembler', 'stlLoader', 'gikSuperCell',
    'bin!assets/stls/stapler/frame.stl',
    'bin!assets/stls/stapler/xAxis.stl',
    'bin!assets/stls/stapler/yAxis.stl',
    'bin!assets/stls/stapler/zAxis.stl',
    'bin!assets/stls/stapler/substrate.stl'],
    function(_, Assembler, THREE, StockClass, frame, xAxis, yAxis, zAxis, substrate){

    function geometryPreProcess(geometry){
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-4.0757, -4.3432, -6.2154));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

        var unitScale = 20;
        geometry.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-21, -0.63, 0));
        return geometry;
    }

    var loader = new THREE.STLLoader();
    var _frameGeo = geometryPreProcess(loader.parse(frame));
    var _xAxisGeo = geometryPreProcess(loader.parse(xAxis));
    var _yAxisGeo = geometryPreProcess(loader.parse(yAxis));
    var _zAxisGeo = geometryPreProcess(loader.parse(zAxis));
    var _substrateGeo = geometryPreProcess(loader.parse(substrate));

    function StaplerAssembler(){
        this.stockAttachedToEndEffector = true;//no need for "stock position"
        Assembler.call(this);
    }
    StaplerAssembler.prototype = Object.create(Assembler.prototype);

    StaplerAssembler.prototype._buildStock = function(){
        return new StockClass({});
    };

    StaplerAssembler.prototype._positionStockRelativeToEndEffector = function(stock){//relative position between stock and end effector
        var object3D = stock.getObject3D();
        object3D.position.set((2.4803+0.2)*20, (-1.9471+0.36)*20, 1.7*20);
    };

    StaplerAssembler.prototype._configureAssemblerMovementDependencies = function(){
        this.zAxis.addChild(this.stock);
        this.xAxis.addChild(this.zAxis);
        this.frame.addChild(this.xAxis);
        this.frame.addChild(this.yAxis);
        this.object3D.add(this.frame.getObject3D());
        this.object3D.add(this.substrate.getObject3D());
    };

    StaplerAssembler.prototype._getSTLs = function(){
        return {
            xAxis: _xAxisGeo,
            yAxis: _yAxisGeo,
            zAxis: _zAxisGeo,
            frame: _frameGeo,
            substrate: _substrateGeo
        }
    };


    return StaplerAssembler;
});