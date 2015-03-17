/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":                            "_mouseMoved",
        "mouseup":                              "_mouseUp",
        "mousedown":                            "_mouseDown",
        "mouseout":                             "_mouseOut"
    },

    mouseIsDown: false,//store state of mouse click inside this el

    //intersections/object highlighting
    mouseProjection: new THREE.Raycaster(),
    highlighter: null,
    currentIntersectedPart: null,

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.appState = options.appState;

        _.bindAll(this, "_mouseMoved", "_animate");

        //bind events
        this.listenTo(this.appState, "change:deleteMode change:extrudeMode change:shift", this._setControlsEnabled);
        this.listenTo(dmaGlobals.lattice, "change:highlighter", this._saveHighlighter);

        this._saveHighlighter();//need a reference to the highlighter

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);//render only once

        this.model.render();
        this._animate();
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////CONTROLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _animate: function(){
        requestAnimationFrame(this._animate);
        this.controls.update();
    },

    _setControlsEnabled: function(){
        var state = this.appState.get("deleteMode") || this.appState.get("shift") || this.appState.get("extrudeMode");
        this.controls.enabled = !state;
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////MOUSE EVENTS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _mouseOut: function(){
        this.highlighter.setNothingHighlighted();
        this._setNoPartIntersections();
    },

    _mouseUp: function(){
        this.mouseIsDown = false;
        if (this.currentIntersectedPart) this.currentIntersectedPart.removeFromCell();
        else this.highlighter.addRemoveVoxel(!this.appState.get("deleteMode"));
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){

        if (this.mouseIsDown && this.controls.enabled) {//in the middle of a camera move
            this.highlighter.setNothingHighlighted();
            this._setNoPartIntersections();
            return;
        }

        //make projection vector
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        this.mouseProjection.setFromCamera(vector, this.model.camera);

        var objsToIntersect = this.model.cells.concat(this.model.basePlane);
        if (this.highlighter.isVisible()) objsToIntersect = objsToIntersect.concat(this.highlighter.mesh);
        var intersections = this.mouseProjection.intersectObjects(objsToIntersect, false);
        if (intersections.length == 0) {//no intersections
            this.highlighter.setNothingHighlighted();
            this._setNoPartIntersections();
            return;
        }

        if(intersections[0].object == this.highlighter.mesh) return;

        this.highlighter.highlight(intersections[0]);

        if (this.mouseIsDown) {
            if (this.appState.get("deleteMode")){
                this.highlighter.addRemoveVoxel(false);
            } else if (this.appState.get("shift")){
                this.highlighter.addRemoveVoxel(true);
            }
        }

        if (this.appState.get("cellMode") == "part"){//additionally check for part intersections in part mode
            var partIntersections = this.mouseProjection.intersectObjects(this.model.parts, false);
            if (partIntersections.length == 0) {
                this._setNoPartIntersections();
                return;
            }
            this._handlePartIntersections(partIntersections, intersections[0].distance);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////INTERSECTIONS////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _saveHighlighter: function(){
        this.highlighter = dmaGlobals.lattice.get("highlighter");
    },

    _setNoPartIntersections: function(){
        if (this.currentIntersectedPart){
            this.currentIntersectedPart.unhighlight();
            this.currentIntersectedPart = null;
            dmaGlobals.three.render();
        }
    },

    _handlePartIntersections: function(intersections, distanceToNearestCell){
        var part = intersections[0].object.myPart;
        if (this.highlighter.isVisible() && intersections[0].distance > distanceToNearestCell){
            this._setNoPartIntersections();
            return;
        }
        this.highlighter.hide();
        if (part!= this.currentIntersectedPart){
            if (this.currentIntersectedPart) this.currentIntersectedPart.unhighlight();
            part.highlight();
            this.currentIntersectedPart = part;
            dmaGlobals.three.render();
        }
    }

});