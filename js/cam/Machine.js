/**
 * Created by fab on 3/16/15.
 */


function Machine() {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2));
    dmaGlobals.three.sceneAdd(mesh);
    this.mesh = mesh;
}

Machine.prototype.pause = function(){

};

Machine.prototype.moveTo = function(x, y, z, speed, callback){
    var self = this;
    setTimeout( function() {
        if (x != "") self.mesh.position.x = x;
        if (y != "") self.mesh.position.y = y;
        if (z != "") self.mesh.position.z = z;
        dmaGlobals.three.render();
        return callback();
    }, 300);

};