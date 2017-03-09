/**
 * Created by ghassaei on 10/11/16.
 */

define(["three", "baseplane", "threeModel", "highlighter", "lattice", "appState"],
    function(THREE, baseplane, three, highlighter, lattice, appState){

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var leftClick = false;
    var rightClick = false;
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

            this.listenTo(appState, "change:deleteMode", this._updateHighlighterForMouseMove);
        },

        _mouseOut: function(e){
            highlighter.unhighlight();
        },

        _mouseUp: function(e){
            switch (e.which) {
                case 1:
                    leftClick = false;
                    break;
                case 2:
                    //middle
                    break;
                case 3:
                    rightClick = false;
                    break;
                default:
                    break;
            }
            if (!isDragging){
                if (highlightedObject){
                    if (highlightedObject.isInDeleteMode && highlightedObject.isInDeleteMode()){
                        var index = highlightedObject.getIndex();
                        highlightedObject = null;
                        lattice.deleteCellAtIndex(index);
                    } else if (highlighter.isVisible()){
                        var index = highlightedObject.getNextCellIndex(highlighter.getPosition(), highlighter.getNormal());
                        lattice.addCellAtIndex(index);
                    }
                }
            }
            isDragging = false;
        },

        _mouseDown: function(e){
            switch (e.which) {
            case 1:
                leftClick = true;
                break;
            case 2:
                //middle
                break;
            case 3:
                rightClick = true;
                break;
            default:
                break;
            }
        },

        _mouseMoved: function(e){

            if (leftClick || rightClick) {
                if (!isDragging){
                    highlighter.unhighlight();
                }
                isDragging = true;
                return;
            }

            mouse.x = (e.clientX/window.innerWidth)*2-1;
            mouse.y = - (e.clientY/window.innerHeight)*2+1;
            raycaster.setFromCamera(mouse, three.camera);

            this._updateHighlighterForMouseMove();
        },

        _updateHighlighterForMouseMove: function(){
            var intersection = this._checkForIntersections(three.getCells());

            if (appState.get("deleteMode") && intersection){
                if (intersection.object._myCell) {
                    if (highlightedObject && highlightedObject != intersection.object._myCell && highlightedObject.setDeleteMode) highlightedObject.setDeleteMode(false);
                    highlightedObject = intersection.object._myCell;
                    highlightedObject.setDeleteMode(true);
                }
                highlighter.unhighlight();
            } else {
                if (highlightedObject && highlightedObject.setDeleteMode) highlightedObject.setDeleteMode(false);
                if (intersection) {
                    //intersectedCell
                    if (intersection.object._myCell) {
                        highlightedObject = intersection.object._myCell;
                        highlighter.setPosition(highlightedObject.getHighlighterPosition(intersection, lattice.getAspectRatio()));
                    }
                    else console.warn("no _myCell found on intersected cell");
                } else {
                    //no intersected cells, try baseplane
                    var intersectionPt = new THREE.Vector3();
                    raycaster.ray.intersectPlane(baseplane.getIntersectionPlane(), intersectionPt);
                    var highlighterPosition = baseplane.getHighlighterPosition(intersectionPt);
                    if (highlighterPosition.position) {
                        highlighter.setPosition(highlighterPosition);
                        highlightedObject = baseplane;
                    }
                    else {
                        highlighter.unhighlight();
                    }
                }
            }
        },

        _checkForIntersections: function(objects){
            var intersections = raycaster.intersectObjects(objects);
            if (intersections.length > 0) return intersections[0];
            return null;
        }



    });
    return new ThreeInteraction();
});