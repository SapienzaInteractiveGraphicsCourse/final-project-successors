

/*
*
* Init functions  
*
*/
function init() {

    // set up the scene, the camera and the renderer
    createScene();

    // add the lights
    createLights();

    //add the sounds 
    createForestSound();
    // add the objects
    createGround();
    createCar();
    createLevel();

    // add controls
    addControltoCar();

    // reset game
    resetGame();
    loop();
}