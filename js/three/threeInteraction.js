/**
 * Created by ghassaei on 10/11/16.
 */

define(["baseplane", "three", "threeModel", "highlighter"],
    function(baseplane, THREE, three, highlighter){

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var ThreeInteraction = Backbone.View.extend({

        events: {
            "mousemove":                        "_mouseMoved",
            "mouseup":                          "_mouseUp",
            "mousedown":                        "_mouseDown",
            "mouseout":                         "_mouseOut"
        },

        el: "#threeContainer",

        initialize: function(){

        },

        _mouseOut: function(e){
            console.log("mouseOut");
        },

        _mouseUp: function(e){
            console.log("mouseUp");
        },

        _mouseDown: function(e){
            console.log("mouseDown");
        },

        _mouseMoved: function(e){
            mouse.x = (e.clientX/window.innerWidth)*2-1;
            mouse.y = - (e.clientY/window.innerHeight)*2+1;
            raycaster.setFromCamera(mouse, three.camera);

            var _highlightedObj = this._checkForIntersections(e, three.getCells());
            if (_highlightedObj === null){
                //no intersected cells
                var intersection = new THREE.Vector3();
                raycaster.ray.intersectPlane(baseplane.getIntersectionPlane(), intersection);
                highlighter.setPosition(baseplane.getHighlighterPosition(intersection));
            }
        },

        _checkForIntersections: function(e, objects){
            var _highlightedObj = null;
            var intersections = raycaster.intersectObjects(objects);
            if (intersections.length > 0) {
                var objectFound = false;
                _highlightedObj = intersections[0];
            }
            return _highlightedObj;
        }



    });
    return new ThreeInteraction();
});