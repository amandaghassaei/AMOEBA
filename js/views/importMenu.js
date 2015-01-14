/**
 * Created by aghassaei on 1/8/15.
 */


$(function(){

    three = three || {};
    workers = workers || {};

    modelMesh = {};
    var modelScaleSlider = $('#stlModelScale');

    function loadSTL(file){
        var loader = new THREE.STLLoader();
  	    loader.addEventListener( 'load', function (e) {
  		    var geometry = e.content;
            resetUI();
//            _.each(workers.allWorkers, function(worker){
//                worker.postMessage({model: JSON.stringify(e.content)});
//            });
            var material = new THREE.MeshLambertMaterial( { color:0xffa500, shading: THREE.FlatShading, transparent:true, opacity:0.5, side:THREE.DoubleSide} );
            modelMesh = new THREE.Mesh(geometry, material);
  		    three.scene.add(modelMesh);
            three.render();
            showDimensions(1);
            $("#STLImportStats").fadeIn();
        });

  	    loader.load(file);
    }

    function resetUI(){
        three.clearAll();
        modelScaleSlider.slider('setValue', 1);
    }

    //load file from data folder
    $(".stlImport").click(function(e){
        e.preventDefault();
        var fileName = $(this).data("file");
        loadSTL('data/' + fileName);
        setFileName(fileName);
    });

    //upload from local filesystem
    $("#uploadSTL").change(function() {
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
                setFileName(label);
            }
        })();
     });

    modelScaleSlider.slider({
	    formatter: function(value) {
		    return value;
	    }
    });

    modelScaleSlider.change(function(){
        var value = $(this).slider('getValue');
        modelMesh.scale.set(value,value,value);
        showDimensions(value);
        three.render();
    });

    function setFileName(name){
        $("#STLFilename").html("Current file loaded:&nbsp&nbsp"+name);
    }

    function showDimensions(scale){
        var boundingBox = modelMesh.geometry.boundingBox;
        $("#meshDimensions").html("Dimensions: " + ((boundingBox.max.x - boundingBox.min.x)*scale).toFixed(1) + " x " +
            ((boundingBox.max.y - boundingBox.min.y)*scale).toFixed(1) + " x " + ((boundingBox.max.z - boundingBox.min.z)*scale).toFixed(1));
    }

    $("#stlRotateX").click(function(e){
        e.preventDefault();
        modelMesh.rotateX(Math.PI/2);
        three.render();
    });

    $("#stlRotateY").click(function(e){
        e.preventDefault();
        modelMesh.rotateY(Math.PI/2);
        three.render();
    });

    $("#stlRotateZ").click(function(e){
        e.preventDefault();
        modelMesh.rotateZ(Math.PI/2);
        three.render();
    });
});