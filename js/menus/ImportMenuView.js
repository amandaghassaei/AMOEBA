/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!importMenuTemplate', 'fillGeometry', 'stlLoader'],
    function($, _, MenuParentView, plist, lattice, template, fillGeometry, THREE){

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

            this.listenTo(fillGeometry, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("fillGeometry")) return fillGeometry;
            return null;
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
            lattice.getUItarget().addCellsInRange({min:{x:-5,y:-5,z:0}, max:{x:5,y:5,z:3}});
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
            var loader = new THREE.STLLoader();
            loader.load(url, function(geometry){
                fillGeometry.buildNewMesh(geometry);
                fillGeometry.set("filename", filename);
            });
        },

        _subtractGeo: function(e){
            e.preventDefault();
            fillGeometry.subtractGeo();
        },

        _fillGeo: function(e){
            e.preventDefault();
            fillGeometry.fillGeo();
        },

        _removeMesh: function(e){
            e.preventDefault();
            fillGeometry.removeMesh();
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), fillGeometry.toJSON());
        },

        template: _.template(template)
    });
});

//<a href="#" id="doSubtractGeo" class=" btn btn-block btn-lg btn-default">Subtract Mesh</a><br/>\
//<li><a id="selectWall" href="#">Wall</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="river.stl" href="#">Landscape 1</a></li>\
//<li><a class="selectMesh cutTerrain" data-file="terrain.stl" href="#">Landscape 2</a></li>\
//<li><a class="selectMesh" data-file="meshes-airbus/Airbus_A300-600.stl" href="#">Plane</a></li>\