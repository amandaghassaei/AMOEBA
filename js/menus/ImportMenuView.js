/**
 * Created by aghassaei on 1/26/15.
 */


ImportMenuView = Backbone.View.extend({

    el: "#menuContent",
    model: new FillGeometry(),

    events: {
        "change #uploadMesh":               "_uploadMesh",
        "click .selectMesh":                "_selectMesh",
        "fileselect .btn-file :file":       "_readDataURL",
        "click #removeFillGeo":             "_removeMesh"
    },

    currentlySelected: false,

    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render", "_onMeshLoad");
        this.listenTo(this.model, "change", function(){
            if (!this.currentlySelected) return;
            this.render();
        });
//        this.listenTo(this.model, "change:filename change:boundingBoxHelper", this.render);//boundingBoxHelper covers orientation


    },

    _selectMesh: function(e){//select mesh from dropdown list
        e.preventDefault();
        var filename = $(e.target).data("file");
        this._loadMeshFromURL('data/' + filename);
        this.model.set("filename", filename);
    },

    _uploadMesh: function(e){//select a mesh to upload
        var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label, input.get(0).files]);
        input.val("");
    },

    _readDataURL: function(event, numFiles, filename, files){
        if (files.length>1) console.log("too many files selected");
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        var self = this;
        reader.onload = (function() {
        return function(e) {
            self._loadMeshFromURL(e.target.result);
            self.model.set("filename", filename);
        }
        })();
    },

    _loadMeshFromURL: function(url){
        var loader = new THREE.STLLoader();
  	    loader.addEventListener('load', this._onMeshLoad);
  	    loader.load(url);
    },

    _onMeshLoad: function(e){
        this.model.set("geometry", e.content);
    },

    _removeMesh: function(){
        this.model.remove();
    },

    render: function(){
        this.currentlySelected = true;
        this.$el.html(this.template(this.model.attributes));
        this.lattice.set("cellMode", "cell");
    },

//    makeDimensionString: function(){
//        var bounds = this.model.get("boundingBoxHelper").box;
//        return (bounds.max.x - bounds.min.x).toFixed(1) + " x " +
//            (bounds.max.y - bounds.min.y).toFixed(1) + " x " + (bounds.max.z - bounds.min.z).toFixed(1);
//    },
//
//    getScale: function(){
//        var scale = this.model.get("scale");
//        var dimensions = {};
//        dimensions.xScale = scale[0];
//        dimensions.yScale = scale[1];
//        dimensions.zScale = scale[2];
//        dimensions.dimensions = this.makeDimensionString();
//        return dimensions;
//    },
//
//    scale: function(e){
//
//        this.model.scale([this.getDimScale($(".xScale").val()), this.getDimScale($(".yScale").val()), this.getDimScale($(".zScale").val())]);
//    },
//
//    getDimScale: function(val){
//        if (val == "") return null;
//        return parseFloat(val);
//    },
//
//    rotate: function(e){
//        e.preventDefault();
//        var axis = $(e.target).data("axis");
//        this.model.rotate(axis);
//    },

    template: _.template('\
        Filename:&nbsp;&nbsp;<%= filename %><br/>\
        Rotate:<br/>\
        Scale:<br/><br/>\
        <a href="#" id="removeFillGeo" class=" btn btn-block btn-lg btn-default">Remove Mesh</a><br/>\
        <span class="btn btn-default btn-file fullWidth">\
            Upload STL<input id="uploadMesh" type="file">\
       </span><br/>\
       <div class="text-center">OR</div>\
        <div class="btn-group fullWidth">\
            <button data-toggle="dropdown" class="btn btn-default dropdown-toggle fullWidth" type="button">Select Model <span class="caret"></span></button>\
            <ul role="menu" class="dropdown-menu">\
              <li><a class="selectMesh" data-file="Airbus_A300-600.stl" href="#">Plane</a></li>\
            </ul>\
        </div><!-- /btn-group -->')

});