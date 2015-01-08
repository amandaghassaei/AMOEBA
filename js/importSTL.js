/**
 * Created by aghassaei on 1/8/15.
 */

$(function(){

    threeMain = threeMain || {};

    function loadSTL(filename){

        var loader = new THREE.STLLoader();
  	    loader.addEventListener( 'load', function (e) {
  		    var geometry = e.content;
  		    threeMain.scene.add( new THREE.Mesh( geometry ) );
        });

  	    loader.load( 'data/' + filename );
    }

    $(".stlImport").click(function(e){
        e.preventDefault();
        loadSTL($(this).data("file"));
    });

});