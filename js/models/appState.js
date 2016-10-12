/**
 * Created by ghassaei on 10/11/16.
 */


define(["backbone"], function(Backbone){

    var AppState = Backbone.Model.extend({
        defaults: {

            baseplaneIsVisible: true

        }
    });
    return new AppState();
});
