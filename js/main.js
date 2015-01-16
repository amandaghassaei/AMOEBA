/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = Three();
    _.extend(three, Backbone.Events);
    three.on("threeRender", three.render);
    three.on("threeAdd", function(object){
        three.scene.add(object);
    });
    three.on("threeRemove", function(object){
        three.scene.remove(object);
    });

    //init models and views
    window.fillGeometry = new FillGeometry();//init a singleton, add to global scope
    new ImportView({model: window.fillGeometry});


    //window.fillGeometry.set({geometry:"stuff"});

    setupNavBar();
    workers = persistentWorkers(8);



});
