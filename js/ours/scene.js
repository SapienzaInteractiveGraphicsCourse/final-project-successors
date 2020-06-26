var Colors = {
    red: 0xf25346,
    black:0x000000,
    white: 0xd8d0d1,
    brown: 0x59332e,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
    green: 0x496d01,
    greenDark: 0x669900,
    golden: 0xff9900,
    yellow: 0xffff00,
    carv3: 0xf4796a,
    jeep: 0x51503c,
    police: 0x621FE9,
    police2: 0x4E70D2,
    //buildings
    brick: 0x822e00,
    cement: 0xdbca9a,
    brown: 0x4a2a0a,
    lightgray: 0x969696,
};




/**
 *
 * SOUNDS
 * ------
 * Utilities for applying sounds in scene
 */


var inGameSound;
function createForestSound() {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    var sound = new THREE.Audio(listener);

    inGameSound = new THREE.AudioLoader();
    inGameSound.load('sounds/forest.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
    //console.log("Sounds is working!");
}

var engineSound;
function createEngineStartSound() {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    var sound = new THREE.Audio(listener);

    inGameSound = new THREE.AudioLoader();
    inGameSound.load('sounds/car-start.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        sound.play();
    });
}

function createCarHornSound() {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    var sound = new THREE.Audio(listener);

    inGameSound = new THREE.AudioLoader();
    inGameSound.load('sounds/car-horn.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.2);
        sound.play();
    });
}

function createCarEngineSound(isGoing) {

    if (isGoing == true) {
        var listener = new THREE.AudioListener();
        camera.add(listener);

        var sound = new THREE.Audio(listener);

        inGameSound = new THREE.AudioLoader();
        inGameSound.load('sounds/car-drive.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.1);
            sound.play();
        });
    } else {
    }

}

var hemisphereLight, shadowLight;

function createSceneLights() {

    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)


    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    //handle lights 
    //scene.add(hemisphereLight);
    scene.add(shadowLight);
}

function createObjectLights() {
    //handle police car lights 
    redlight = new THREE.PointLight( 0xfc0303, 2, 100 );
    redlight.position.set(350, 50, -320 );
    scene.add(redlight);
    // //this.mesh.add(redlight);

    bluelight = new THREE.PointLight( 0x3300FF, 2, 100 );
    bluelight.position.set(350, 50, -280 );
    bluelight.rotation.set(0, 90, 0);
    scene.add(bluelight);
    //this.mesh.add(bluelight);

    //pole light
    var pointligghtPole = new THREE.PointLight( Colors.yellow, 2, 100 );
    pointligghtPole.position.set(-80, 70, 70);
    pointligghtPole.rotation.set(0, 45, 0);
    // var pointligghtPole = new THREE.SpotLight( Colors.yellow );
    // pointligghtPole.position.set(-70, 50, 70);
    // pointligghtPole.rotation.set(0, 135, 0);
    // pointligghtPole.castShadow = true;
    //pointligghtPole.target = pole;
    //pointligghtPole.rotation.z = (Math.PI/2) +135;

    scene.add( pointligghtPole );
    //headLightLeftLight.visible=false;
    //this.mesh.add(pointligghtPole);

    //traffic lights 
    var light = new THREE.PointLight(Colors.green, 20, 100);
    light.position.set(-80, 75, -200);
    light.rotation.set(0, 0, 90);
    scene.add(light);
}

var LightButtonPushedDown;
function carBackLightsOn(ifPressed) {


    if (ifPressed == true) {
        var backLightLeft = new THREE.PointLight(0xff00000, 2, 100);
        var backLightRight = new THREE.PointLight(0xff0000, 1, 100);

        backLightLeft.castShadow = true;
        backLightRight.castShadow = true;

        backLightLeft.position.set(-70, 5, -15);
        backLightRight.position.set(-70, 5, 15);
        car.mesh.add(backLightLeft);
        car.mesh.add(backLightRight);

    }
    if (ifPressed == false) {
        car.mesh.remove(backLightLeft);
        car.mesh.remove(backLightRight);
    }
}

var scene, stats, context,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

var sunAngle; 
function DayNightCycle() {
    var onRenderFcts = [];
    sunAngle = -1 / 6 * Math.PI * 2;
    sunAngle = -3 / 6 * Math.PI * 2;
    onRenderFcts.push(function (delta, now) {
        var dayDuration = 10;	// nb seconds for a full day cycle
        sunAngle += delta / dayDuration * Math.PI * 2
    })

    var sunSphere = new THREEx.DayNight.SunSphere();
    var sunLight = new THREEx.DayNight.SunLight();
    var skydom = new THREEx.DayNight.Skydom();

    scene.add(sunSphere.object3d);
    scene.add(sunLight.object3d);
    scene.add(skydom.object3d);

    onRenderFcts.push(function (delta, now) {
        sunSphere.update(sunAngle);
    });
    onRenderFcts.push(function (delta, now) {
        sunLight.update(sunAngle);
    });
    onRenderFcts.push(function (delta, now) {
        skydom.update(sunAngle);
    });


    onRenderFcts.push(function () {
        renderer.render(scene, camera);
    })

    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        // call each update function
        onRenderFcts.forEach(function (onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000);
        })
    })

}

function RainSnowCycle() {

    var rainCount = 1400;
    rainGeo = new THREE.Geometry();
    for (var i = 0; i < rainCount; i++) {
        rainDrop = new THREE.Vector3(
            Math.random() * 400 - 200,
            Math.random() * 500 - 250,
            Math.random() * 400 - 200
        );

        rainDrop.velocity = {};
        rainDrop.velocity = 0;
        rainGeo.vertices.push(rainDrop);
    }
    rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.2,
        transparent: true
    });

    rain = new THREE.Points(rainGeo, rainMaterial);
    rain.position.set(0, 200, 500);
    scene.add(rain);
    //camera.add(rain);

    //console.log(rain.position);
}

function createScene() {

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    scene = new THREE.Scene();
    stats = new Stats();
    scene.fog = new THREE.Fog(0xbadbe4, 100, 3000);

    // Create the camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    RainSnowCycle();
    DayNightCycle();

    //stats 
	stats.showPanel( 0 );
	document.body.appendChild( stats.dom );

    // Set the position of the camera
    camera.position.set(0, 400, 400);

    camera.lookAt(0, 0, 0);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    container = document.getElementById('WorldScene');
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', handleWindowResize, false);

    //const controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.update();

    //Orbit controls doesnt work 

    var canvas = document.createElement( 'canvas' );
    canvas.width = 512;
    canvas.height = 512;
    document.body.appendChild( canvas );

    context = canvas.getContext( '2d' );
    context.fillStyle = 'rgba(127,0,255,0.05)';
}

function handleWindowResize() {
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

//adding lights for cars and police
function turnoffLights() {
    headLightLeftLight.visible = false;
    headLightRightLight.visible = false;
}

function turnonLights() {
    headLightLeftLight.visible = true;
    headLightRightLight.visible = true;
}

function turnonPoliceLights() {
    redlight.visible = true;
    bluelight.visible = true;
}

function turnoffPoliceLights() {
    redlight.visible = false;
    bluelight.visible = false;
    
}