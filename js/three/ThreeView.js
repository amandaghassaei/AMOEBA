/**
 * Created by aghassaei on 1/16/15.
 */

define(['underscore', 'backbone', 'three', 'appState', 'globals', 'lattice', 'orbitControls'],
    function(_, Backbone, THREE, appState, globals, lattice){

    return Backbone.View.extend({

        events: {
            "mousemove":                            "_mouseMoved",
            "mouseup":                              "_mouseUp",
            "mousedown":                            "_mouseDown",
            "mouseout":                             "_mouseOut"
        },

        mouseIsDown: false,//store state of mouse click inside this el

        //intersections/object highlighting
        mouseProjection: new THREE.Raycaster(),
        currentIntersectedPart: null,

        el: "#threeContainer",

        controls: null,

        initialize: function(){

            _.bindAll(this, "_mouseMoved", "_animate");

            //bind events
            this.listenTo(appState, "change:deleteMode change:extrudeMode change:shift", this._setControlsEnabled);

            this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
            this.controls.addEventListener('change', this.model.render);

            this.$el.append(this.model.domElement);//render only once

            this.model.setThreeView(this);

            this.model.render();
    //        this._animate();
        },

        ////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////CONTROLS/////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////

        _animate: function(){
    //        requestAnimationFrame(this._animate);
    //        this.controls.update();
        },

        _setControlsEnabled: function(){
            var state = appState.get("shift") || appState.get("extrudeMode");
            this.controls.noRotate = state;
        },

        reset3DNavigation: function(){
            this.controls.reset();
        },

        setOrbitControlsFor: function(center){//lattice min max
            this.controls.setTarget(center);//center of lattice bounds
        },

        ////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////MOUSE EVENTS/////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////

        _mouseOut: function(){
            if (globals.get("highlighter")) globals.get("highlighter").setNothingHighlighted();
            this._setNoPartIntersections();
        },

        _mouseUp: function(){
            this.mouseIsDown = false;
            if (appState.get("currentTab") == "emBoundaryCond"){
                var position = globals.get("highlighter").getHighlightedObjectPosition();
                if (position){
                    require(['emSim'], function(emSim){
                        if (emSim.get("manualSelectFixed")){
                            emSim.fixCellAtPosition(position);
                        }
                    });
                    return;
                }
            }
            if (this.currentIntersectedPart) this.currentIntersectedPart.removeFromCell();
            else globals.get("highlighter").addRemoveVoxel(!appState.get("deleteMode"));
            if (globals.get("highlighter").highlightingArrow()) this.controls.noRotate = false;
        },

        _mouseDown: function(){
            this.mouseIsDown = true;
            globals.get("highlighter").mouseDown();
            if (globals.get("highlighter").highlightingArrow()){
                this.controls.noRotate = true;
            }
        },

        _mouseMoved: function(e){

            if (!globals.get("highlighter")) return;//highlighter not loaded yet

            if (!appState.get("highlightMode") && !(appState.get("manualSelectOrigin"))) return;

            if (this.mouseIsDown && !this.controls.noRotate) {//in the middle of a camera move
                globals.get("highlighter").setNothingHighlighted();
                this._setNoPartIntersections();
                return;
            }

            //make projection vector
            var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
            this.mouseProjection.setFromCamera(vector, this.model.camera);

            var deleteMode = appState.get("deleteMode");
            var sketchMode = appState.get("shift");
            var sketchEditMode = globals.get("highlighter").get("sketchEditMode");

            var objsToIntersect;
            if (this.mouseIsDown && globals.get("highlighter").highlightingArrow()){
                var dragPlane = this.model.setupDragPlane(globals.get("highlighter").highlightedObject.getPosition(),
                    globals.get("highlighter").highlightedObject.getRotation());
                objsToIntersect = [dragPlane];
            } else if (sketchEditMode){
                objsToIntersect = globals.get("highlighter").get("selection3D").highlightTargets;
            } else {
                 objsToIntersect= lattice.getUItarget().getHighlightableCells();
                if (!deleteMode) objsToIntersect = objsToIntersect.concat(this.model.getBasePlane());
                //        if (globals.get("highlighter").isVisible()) objsToIntersect = objsToIntersect.concat(globals.get("highlighter").mesh);
            }
            var intersections = this.mouseProjection.intersectObjects(objsToIntersect, false);

            if (this.mouseIsDown && globals.get("highlighter").highlightingArrow()){
                if (!intersections || !intersections[0]) return;
                globals.get("highlighter").get("selection3D").dragArrow(globals.get("highlighter").highlightedObject, intersections[0].point);
                return;
            }


            if (intersections.length == 0) {//no intersections
                globals.get("highlighter").setNothingHighlighted();
                this._setNoPartIntersections();
                return;
            }

            if(intersections[0].object == globals.get("highlighter").mesh) return;


            globals.get("highlighter").highlight(intersections[0]);

            if (this.mouseIsDown) {
                if (deleteMode){
                    //globals.get("highlighter").addRemoveVoxel(false);
                } else if (sketchMode){
                    globals.get("highlighter").adjustSelection3D();
                }
            }

    //        if (appState.get("cellMode") == "part"){//additionally check for part intersections in part mode
    //            var partIntersections = this.mouseProjection.intersectObjects(this.model.parts, false);
    //            if (partIntersections.length == 0) {
    //                this._setNoPartIntersections();
    //                return;
    //            }
    //            this._handlePartIntersections(partIntersections, intersections[0].distance);
    //        }
        },

        ////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////INTERSECTIONS////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////

        _setNoPartIntersections: function(){
            if (this.currentIntersectedPart){
                this.currentIntersectedPart.unhighlight();
                this.currentIntersectedPart = null;
                this.model.render();
            }
        },

        _handlePartIntersections: function(intersections, distanceToNearestCell){
            var part = intersections[0].object.myPart;
            if (globals.get("highlighter").isVisible() && intersections[0].distance > distanceToNearestCell){
                this._setNoPartIntersections();
                return;
            }
            globals.get("highlighter").hide();
            if (part!= this.currentIntersectedPart){
                if (this.currentIntersectedPart) this.currentIntersectedPart.unhighlight();
                part.highlight();
                this.currentIntersectedPart = part;
                this.model.render();
            }
        }

    });
});