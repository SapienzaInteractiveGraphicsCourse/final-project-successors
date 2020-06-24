
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
    createControls();

    // reset game
    resetGame();
    loop();
}