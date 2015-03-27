/**
 * Created by aghassaei on 1/26/15.
 */


ImportMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "change #uploadMesh":               "_uploadMesh",
        "click .selectMesh":                "_selectMesh",
        "fileselect .btn-file :file":       "_readDataURL",
        "click #removeFillGeo":             "_removeMesh",
        "click #selectWall":                "_buildWall",
        "click #doSubtractGeo":             "_subtractGeo",
        "click #doFillGeo":                 "_fillGeo",
        "click .btn-clearCells":            "_clearCells"
    },

    initialize: function(){

        this.fillGeometry = new FillGeometry();

        this.listenTo(this.fillGeometry, "change", this.render);
    },

    _selectMesh: function(e){//select mesh from dropdown list
        e.preventDefault();
        var filename = $(e.target).data("file");
        this._loadMeshFromURL('assets/stls/' + filename);
        this.fillGeometry.set("filename", filename.split('/')[1]);
    },

    _buildWall: function(e){
        e.preventDefault();
        dmaGlobals.lattice.addCellsInRange({min:{x:-5,y:-5,z:0}, max:{x:5,y:5,z:3}});
    },

    _uploadMesh: function(e){//select a mesh to upload
        e.preventDefault();
        var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label, input.get(0).files]);
        input.val("");
    },

    _readDataURL: function(event, numFiles, filename, files){
        if (files.length>1) console.warn("too many files selected");
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        var self = this;
        reader.onload = (function() {
        return function(e) {
            self._loadMeshFromURL(e.target.result);
            self.fillGeometry.set("filename", filename);
        }
        })();
    },

    _loadMeshFromURL: function(url){
        var self = this;
        var loader = new THREE.STLLoader();
  	    loader.load(url, function(geometry){
            self.fillGeometry.buildNewMesh(geometry);
        });
    },

    _subtractGeo: function(e){
        e.preventDefault();
        this.fillGeometry.subtractGeo();
    },

    _fillGeo: function(e){
        e.preventDefault();
        this.fillGeometry.fillGeo();
    },

    _removeMesh: function(e){
        e.preventDefault();
        this.fillGeometry.removeMesh();
    },

    _clearCells: function(e){
        e.preventDefault();
        dmaGlobals.lattice.clearCells();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "import") return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.fillGeometry.toJSON())));
    },

//    makeDimensionString: function(){
//        var bounds = this.fillGeometry.get("boundingBoxHelper").box;
//        return (bounds.max.x - bounds.min.x).toFixed(1) + " x " +
//            (bounds.max.y - bounds.min.y).toFixed(1) + " x " + (bounds.max.z - bounds.min.z).toFixed(1);
//    },
//
//    getScale: function(){
//        var scale = this.fillGeometry.get("scale");
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
//        this.fillGeometry.scale([this.getDimScale($(".xScale").val()), this.getDimScale($(".yScale").val()), this.getDimScale($(".zScale").val())]);
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
//        this.fillGeometry.rotate(axis);
//    },

    template: _.template('\
        Filename: &nbsp;&nbsp;<%= filename %><br/><br/>\
        <% if (mesh){ %>\
        Scale:<br/><br/>\
        <a href="#" id="doFillGeo" class=" btn btn-block btn-lg btn-default">Fill Mesh</a><br/>\
        <a href="#" id="removeFillGeo" class=" btn btn-block btn-lg btn-default">Remove Mesh</a><br/>\
        <hr>\
        <% } %>\
        <a href="#" class=" btn btn-block btn-lg btn-default btn-clearCells">Clear All Cells</a><br/><br/>\
        <br/><span class="btn btn-default btn-lg btn-file fullWidth">\
            Upload STL<input id="uploadMesh" type="file">\
       </span><br/>\
       <div class="text-center">OR</div>\
        <div class="btn-group fullWidth">\
            <button data-toggle="dropdown" class="btn btn-lg btn-default dropdown-toggle fullWidth" type="button">Select Model <span class="caret"></span></button>\
            <ul role="menu" class="dropdown-menu">\
              <li><a class="selectMesh" data-file="meshes-airbus/wingCrossection.stl" href="#">Wing</a></li>\
              <li><a id="selectWall" href="#">Block</a></li>\
            </ul>\
        </div><!-- /btn-group -->\
        ')

});

//<a href="#" id="doSubtractGeo" class=" btn btn-block btn-lg btn-default">Subtract Mesh</a><br/>\
//<li><a id="selectWall" href="#">Wall</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="river.stl" href="#">Landscape 1</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="terrain.stl" href="#">Landscape 2</a></li>\
//<li><a class="selectMesh" data-file="meshes-airbus/Airbus_A300-600.stl" href="#">Plane</a></li>\