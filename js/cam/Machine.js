/**
 * Created by fab on 3/16/15.
 */


function Machine() {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2));
    //dmaGlobals.three.sceneAdd(mesh);
    this.mesh = mesh;
}

Machine.prototype.pause = function(){

};

Machine.prototype.moveTo = function(x, y, z, speed, wcs, callback){
    var self = this;
    setTimeout( function() {
        if (x != "") self.mesh.position.x = parseFloat(x)+wcs.x;
        if (y != "") self.mesh.position.y = parseFloat(y)+wcs.y;
        if (z != "") self.mesh.position.z = parseFloat(z)+wcs.z;
        dmaGlobals.three.render();
        return callback();
    }, 300);

};