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

        leftClick: false,//store state of mouse click inside this el
        rightClick: false,

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
            this.controls.noPan = state;
            this.controls.noZoom = state;
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
            this.controls.noRotate = false;
            this.controls.noPan = false;
            this.controls.noZoom = false;
        },

        _isDragging: function(){
            return this.leftClick || this.rightClick;
        },

        _mouseUp: function(e){

            if (appState.get("currentTab") == "emBoundaryCond"){
                var position = globals.get("highlighter").getHighlightedObjectPosition();
                if (position){
                    require(['emSim'], function(emSim){
                        if (emSim.get("manualSelectFixed")){
                            emSim.fixCellAtIndex(position);
                        }
                    });
                    return;
                }
            }
            //if (this.currentIntersectedPart) this.currentIntersectedPart.removeFromCell();
            var highlighter = globals.get("highlighter");
            if (this.rightClick && !this.leftClick){
                if (highlighter.highlightingCell()){
                    require(['cellContextMenu'], function(cellContextMenu){
                        cellContextMenu.render(highlighter.highlightedObject);
                    });
                }
            } else if (this.leftClick && !this.rightClick) {
                highlighter.addRemoveVoxel(!appState.get("deleteMode"));
                if (highlighter.highlightingArrow()) {
                    this.controls.noRotate = false;
                    this.controls.noPan = false;
                    this.controls.noZoom = false;
                }
            }
            switch (e.which) {
                case 1:
                    this.leftClick = false;
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    this.rightClick = false;
                    break;
                default:
                    break;
            }
        },

        _mouseDown: function(e){
            switch (e.which) {
                case 1:
                    this.leftClick = true;
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    this.rightClick = true;
                    break;
                default:
                    break;
            }

            globals.get("highlighter").mouseDown();
            if (globals.get("highlighter").highlightingArrow()){
                this.controls.noRotate = true;
                this.controls.noPan = true;
                this.controls.noZoom = true;
            }
        },

        _mouseMoved: function(e){

            if (!globals.get("highlighter")) return;//highlighter not loaded yet

            //if (!(appState.get("manualSelectOrigin"))) return;//todo ?

            if (this._isDragging() && !this.controls.noRotate) {//in the middle of a camera move
                globals.get("highlighter").setNothingHighlighted();
                this._setNoPartIntersections();
                return;
            }

            //make projection vector
            var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
            this.mouseProjection.setFromCamera(vector, this.model.camera);

            var target = globals.get("selection3D");
            if (!target) target = globals.get("highlighter");

            var objsToIntersect = target.getObjToIntersect(this._isDragging());

            var deleteMode = appState.get("deleteMode");

            var intersections = this.mouseProjection.intersectObjects(objsToIntersect, false);

            if (this._isDragging() && globals.get("highlighter").highlightingArrow()){
                if (!intersections || !intersections[0]) return;
                globals.get("selection3D").dragArrow(globals.get("highlighter").highlightedObject, intersections[0].point, this.rightClick);
                return;
            }

            if (intersections.length == 0) {//no intersections
                globals.get("highlighter").setNothingHighlighted();
                this._setNoPartIntersections();
                return;
            }

            if(intersections[0].object == globals.get("highlighter").mesh) return;

            globals.get("highlighter").highlight(intersections[0]);

            if (this.leftClick) {
                if (deleteMode){
                    //globals.get("highlighter").addRemoveVoxel(false);
                } else if (appState.get("shift")){
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