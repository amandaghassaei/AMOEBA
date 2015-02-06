/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    window.three = new ThreeModel();

    //setup ui
    window.appState = new AppState();
    var highlighter = new Highlighter({model:window.appState.get("lattice")});
    new NavBar({model:window.appState});

    //threeJS View
    new ThreeView({model:window.three, appState:window.appState, highlighter:highlighter});
});
