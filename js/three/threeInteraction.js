/**
 * Created by ghassaei on 10/11/16.
 */

define(["baseplane", "three", "threeModel", "highlighter", "lattice"],
    function(baseplane, THREE, three, highlighter, lattice){

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var isDragging = false;

    var highlightedObject;

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
            highlighter.unhighlight();
        },

        _mouseUp: function(e){
            console.log("mouseUp");
            isDragging = false;
        },

        _mouseDown: function(e){
            console.log("mouseDown");
            isDragging = true;

            if (highlighter.isVisible() && highlightedObject){
                var index = highlightedObject.getNextCellIndex(highlighter.getPosition(), highlighter.getNormal());
                lattice.addCellAtIndex(index);
            }
        },

        _mouseMoved: function(e){
            mouse.x = (e.clientX/window.innerWidth)*2-1;
            mouse.y = - (e.clientY/window.innerHeight)*2+1;
            raycaster.setFromCamera(mouse, three.camera);

            var intersection = this._checkForIntersections(e, three.getCells());

            if (intersection === null){
                //no intersected cells, try baseplane
                var intersectionPt = new THREE.Vector3();
                raycaster.ray.intersectPlane(baseplane.getIntersectionPlane(), intersectionPt);
                highlighter.setPosition(baseplane.getHighlighterPosition(intersectionPt));
                highlightedObject = baseplane;
            } else {
                //intersectedCell
                if (intersection.object._myCell) {
                    highlightedObject = intersection.object._myCell;
                    highlighter.setPosition(highlightedObject.getHighlighterPosition(intersection, lattice.getAspectRatio()));
                }
                else console.warn("no _myCell found on intersected cell");
            }
        },

        _checkForIntersections: function(e, objects){
            var intersections = raycaster.intersectObjects(objects);
            if (intersections.length > 0) return intersections[0];
            return null;
        }



    });
    return new ThreeInteraction();
});