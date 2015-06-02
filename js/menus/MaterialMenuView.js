/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent'], function($, _, MenuParentView){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
        },

        _makeTemplateJSON: function(){
            return null;
        },

        template: _.template('\
            create materials and assign them to parts in the model\
            <br/><br/>\
            stiffness, elastic modulus\
            ')

    });
});