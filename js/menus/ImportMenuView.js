/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'lattice'], function($, _, MenuParentView, lattice){

    return MenuParentView.extend({

        events: {
            "change #importMenuUploadSTL":      "_uploadSTL",
            "click .importMenuSelectMesh":      "_selectMesh",
            "click #importMenuSelectWall":      "_buildWall",
            "fileselect .btn-file :file":       "_readDataURL",
            "click #removeFillGeo":             "_removeMesh",

            "click #doSubtractGeo":             "_subtractGeo",
            "click #doFillGeo":                 "_fillGeo"
        },

        _initialize: function(){

            this.fillGeometry = new FillGeometry();
            this.listenTo(this.fillGeometry, "change", this.render);
        },

        _uploadSTL: function(e){//select a mesh to upload
            e.preventDefault();
            var input = $(e.target),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label, input.get(0).files]);
            input.val("");
        },

        _selectMesh: function(e){//select mesh from dropdown list
            e.preventDefault();
            var filename = $(e.target).data("file");
            this._loadMeshFromURL('assets/stls/' + filename, filename.split('/')[1]);
        },

        _buildWall: function(e){
            e.preventDefault();
            lattice.addCellsInRange({min:{x:-5,y:-5,z:0}, max:{x:5,y:5,z:3}});
        },

        _readDataURL: function(event, numFiles, filename, files){
            if (files.length>1) console.warn("too many files selected");
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            var self = this;
            reader.onload = (function() {
            return function(e) {
                self._loadMeshFromURL(e.target.result, filename);
            }
            })();
        },

        _loadMeshFromURL: function(url, filename){
            var self = this;
            var loader = new THREE.STLLoader();
            loader.load(url, function(geometry){
                self.fillGeometry.buildNewMesh(geometry);
                self.fillGeometry.set("filename", filename);
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

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), this.fillGeometry.toJSON());
        },

        template: _.template('\
            Filename: &nbsp;&nbsp;<%= filename %><br/><br/>\
            <% if (mesh){ %>\
            Scale:<br/><br/>\
            <a href="#" id="doFillGeo" class=" btn btn-block btn-lg btn-default">Fill Mesh</a><br/>\
            <a href="#" id="removeFillGeo" class=" btn btn-block btn-lg btn-default">Remove Mesh</a><br/>\
            <hr>\
            <% } %>\
            <a href="#" class=" btn btn-block btn-lg btn-danger clearCells">Clear All Cells</a><br/><br/>\
            <br/><span class="btn btn-default btn-lg btn-file fullWidth">\
                Upload STL<input id="importMenuUploadSTL" type="file">\
           </span><br/>\
           <div class="text-center">OR</div>\
            <div class="btn-group fullWidth">\
                <button data-toggle="dropdown" class="btn btn-lg btn-default dropdown-toggle fullWidth" type="button">Select Model <span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                  <li><a class="importMenuSelectMesh" data-file="meshes-airbus/wingCrossSection.stl" href="#">Wing</a></li>\
                  <li><a id="importMenuSelectWall" href="#">Block</a></li>\
                </ul>\
            </div><!-- /btn-group -->\
            ')

    });
});

//<a href="#" id="doSubtractGeo" class=" btn btn-block btn-lg btn-default">Subtract Mesh</a><br/>\
//<li><a id="selectWall" href="#">Wall</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="river.stl" href="#">Landscape 1</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="terrain.stl" href="#">Landscape 2</a></li>\
//<li><a class="selectMesh" data-file="meshes-airbus/Airbus_A300-600.stl" href="#">Plane</a></li>\