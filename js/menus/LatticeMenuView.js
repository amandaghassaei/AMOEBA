/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'genericModalView', 'text!menus/templates/LatticeMenuView.html'],
    function($, _, MenuParentView, plist, lattice, GenericModalView, template){

        var genericModal = new GenericModalView();

        return MenuParentView.extend({

            events: {
                "click .clearCells":                           "_clearCells",
            },

            _initialize: function(){
                this.listenTo(lattice, "change", this.render);
            },

            _clearCells: function(e){
                e.preventDefault();
                genericModal.render({
                    title: "Clear Current Assembly?",
                    message: "Are you sure you would like to clear the current assembly?",
                    affirmation: "Clear",
                    buttonStyle: "danger",
                    callback: function(){
                        lattice.clearCells();
                    }
                });
            },

            _makeTemplateJSON: function(){
                return _.extend(lattice.toJSON(), plist);
            },

            template: _.template(template)
        });
});