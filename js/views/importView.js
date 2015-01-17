/**
 * Created by aghassaei on 1/16/15.
 */


ImportView = Backbone.View.extend({

    el: "#importGeometry",

    events: {
        "change #uploadMesh":               "uploadMesh",
        "click .selectMesh":                "selectMesh",
        "fileselect .btn-file :file":       "readDataURL",
        "click .stlRotate":                 "rotate"
    },

    initialize: function(){

        _.bindAll(this, "render", "onMeshLoad");
        this.listenTo(this.model, "change:filename change:boundingBoxHelper", this.render);//boundingBoxHelper covers orientation

        this.render();
    },

    selectMesh: function(e){//select mesh from dropdown list
        e.preventDefault();
        var filename = $(e.target).data("file");
        this.loadMeshFromURL('data/' + filename);
        this.model.set("filename", filename);
    },

    uploadMesh: function(e){//select a mesh to upload
        var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label, input.get(0).files]);
        input.val("");
    },

    readDataURL: function(event, numFiles, filename, files){
        if (files.length>1) console.log("too many files selected");
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        var self = this;
        reader.onload = (function() {
        return function(e) {
            self.loadMeshFromURL(e.target.result);
            self.model.set("filename", filename);
        }
        })();
    },

    loadMeshFromURL: function(url){
        var loader = new THREE.STLLoader();
  	    loader.addEventListener('load', this.onMeshLoad);
  	    loader.load(url);
    },

    onMeshLoad: function(e){
        this.model.set("geometry", e.content);
    },

//    scale: function(e){
//        this.model.set("scale", $(e.target).slider('getValue'));
//    },

    makeDimensionString: function(){
        var bounds = this.model.get("boundingBoxHelper").box;
        return (bounds.max.x - bounds.min.x).toFixed(1) + " x " +
            (bounds.max.y - bounds.min.y).toFixed(1) + " x " + (bounds.max.z - bounds.min.z).toFixed(1);
    },

    rotate: function(e){
        e.preventDefault();
        var axis = $(e.target).data("axis");
        this.model.rotate(axis);
    },

    render: function(){
        this.$el.html(this.template(_.extend(this.model.attributes, {dimensions:this.makeDimensionString()})));
    },



    template: _.template(
        '<div class="row demo-row">\
            <div class="col-xs-3">\
            <div>\
               <span class="btn btn-default btn-file fullWidth">\
                    Upload STL<input id="uploadMesh" type="file">\
               </span>\
            </div>\
            <div class="text-center">\
                OR\
            </div>\
            <div>\
              <div class="btn-group fullWidth">\
                <button data-toggle="dropdown" class="btn btn-primary dropdown-toggle fullWidth" type="button">Select Model <span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                  <li><a class="selectMesh" data-file="Airbus_A300-600.stl" href="#">Plane</a></li>\
                </ul>\
              </div><!-- /btn-group -->\
            </div>\
            </div> <!-- /.col-xs-3 -->\
            <div class="col-xs-9">\
                <div>Geometry:&nbsp;&nbsp;<%= filename %><br/>\
                Dimensions:&nbsp;&nbsp;<%= dimensions %><br/>\
                Units:&nbsp;&nbsp;</div></br>\
                <div class="col-xs-4">\
                    <a href="#" data-axis="z" class="stlRotate btn btn-block btn-lg btn-default">Rotate X</a>\
                </div>\
                <div class="col-xs-4">\
                    <a href="#" data-axis="y" class="stlRotate btn btn-block btn-lg btn-default">Rotate Y</a>\
                </div>\
                <div class="col-xs-4">\
                    <a href="#" data-axis="x" class="stlRotate btn btn-block btn-lg btn-default">Rotate Z</a>\
                </div>\
            </div>\
        </div>')
});