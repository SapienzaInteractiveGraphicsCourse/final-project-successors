$(document).ready(function () {
    // Handler for .ready() called.
    //init();
});


function loop() {
    // handle car movement and collisions
    car.update();
    //console.log(car.mesh.position);

    // handle all growth animations
    animationforObjGrowth();
    animationforObjShrink();

    rainGeo.vertices.forEach(r => {
        r.velocity -=0.1 + Math.random() * 0.1;
        r.y += r.velocity;

        if(r.y < -200) {
            r.y = 200;
            r.velocity = 0;
        }
    });

    rainGeo.verticesNeedUpdate = true;
    rain.rotation.y += 0.002;

    // render the scene
    renderer.render(scene, camera);
    scene.rotation.y = 0.0025; // change camera rotation if you would like 
    camera.lookAt(car.mesh.position);
    // check global collisions
    objCollided();

    //stats is added here 
    var time = performance.now() / 1000;

    context.clearRect( 0, 0, 512, 512 );

    stats.begin();

    for ( var i = 0; i < 2000; i ++ ) {

        var x = Math.cos( time + i * 0.01 ) * 196 + 256;
        var y = Math.sin( time + i * 0.01234 ) * 196 + 256;

        context.beginPath();
        context.arc( x, y, 10, 0, Math.PI * 2, true );
        context.fill();

    }

    stats.end();

    // call the loop function again
    requestAnimationFrame(loop);
}


function addControltoCar() {
    document.addEventListener(
        'keydown',
        function (ev) {
            key = ev.keyCode;

            if (key == 37 || key == 65) { // checking for both left and A key
                car.TurnCarLeft();
            }
            if (key == 39 || key == 68) { // checking for both right and D key
                car.TurnCarRight();
            }
            if (key == 38 || key == 87) {
                car.moveCarForward();

                //start engine sound 
            }
            if (key == 40 || key == 83) {
                car.moveCarBackward();

            }
            if (key == 27) { // pause menu 
                pauseMenu();
            }

            if (key == 72) { // if H is pushed 
                //horn sound start 
                createCarHornSound();
            }
            if (key == 69) {
                //car engine start 
                createEngineStartSound();
            }
            if(key == 76) {
                turnoffLights();
            }
            if(key == 80) {
                turnoffPoliceLights();
            }
        }
    );

    document.addEventListener(
        'keyup',
        function (ev) {
            key = ev.keyCode;

            if (key == 37 || key == 65) {
                car.StopCarLeft();
            }
            if (key == 39 || key == 68) {
                car.StopCarRight();
            }
            if (key == 38 || key == 87) {
                car.stopCarForward();
                //car 
                Wpushed = false;
                createCarEngineSound(Wpushed);
            }
            if (key == 40 || key == 83) {
                car.stopCarBackward();
            }
            if (key == 72) {
                // horn sound stop 
            }
            if(key == 76) {
                turnonLights();
            }
            if(key == 80) {
                turnonPoliceLights();
            }
        }
    );
}



window.addEventListener('load', init, false);
