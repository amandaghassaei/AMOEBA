/**
 * Created by aghassaei on 1/9/15.
 */


$(function(){

    $("#exportSTL").click(function(e){
        e.preventDefault();

        _.each(three.scene.children, function(object){
            if (object instanceof THREE.Mesh){
                console.log(object.geometry);
                stlFromGeometry(object.geometry, {download:true});
            }
        });


    })

});