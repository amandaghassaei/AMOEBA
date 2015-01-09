/**
 * Created by aghassaei on 1/8/15.
 */

//todo - put stl loading in background thread, allow scaling when loaded

$(function(){

    threeMain = threeMain || {};

    function loadSTL(file){

        var loader = new THREE.STLLoader();
  	    loader.addEventListener( 'load', function (e) {
  		    var geometry = e.content;
  		    threeMain.scene.add( new THREE.Mesh( geometry ) );
            threeMain.render();
        });

  	    loader.load(file);
    }

    $(".stlImport").click(function(e){
        e.preventDefault();
        loadSTL('data/' + $(this).data("file"));
    });

    $("#uploadSTL").change(function() {
        console.log("here");
        var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label, input.get(0).files]);
        input.val("");
    });

     $('.btn-file :file').on('fileselect', function(event, numFiles, label, files) {
         var reader = new FileReader();
         reader.readAsDataURL(files[0]);
         reader.onload = (function() {
            return function(e) {
                loadSTL(e.target.result);
            }
        })();
        console.log("loaded" + label);
     });

});