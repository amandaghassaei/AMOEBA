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
            world physics: gravity, global forces\
            <br/><br/>\
            part connection stiffness\
            <br/><br/>\
            ground/fixed/boundary conditions definition\
            ')

    });
});