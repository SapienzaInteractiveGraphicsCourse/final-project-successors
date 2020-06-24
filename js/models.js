
var car, fuel, ground, trees = [], poles = [], trafficLight = [], collidableTrees = [], collidablePoles = [], collidableTrafficLight = [], numTrees = 1000, numPoles = 3,
    collidableFuels = [], collidableBuildings = [], collidableBins=[], collidableCars=[];

function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: notFlatShading != true, transparent: true });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

function createCylinder(radiusTop, radiusBottom, height, radialSegments, color,
    x, y, z) {
    var geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}

function createRoofCylinder(radiusTop, radiusBottom, height, radialSegments, color,
    x, y, z) {
    var geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    cylinder.rotation.y = 18;
    return cylinder;
}

function createTire(radiusTop, radiusBottom, height, radialSegments, color, x, y, z) {
    var cylinder = createCylinder(radiusTop, radiusBottom, height, radialSegments, color, x, y, z);
    cylinder.rotation.x = Math.PI / 2;  // hardcoded for tires in the car below
    return cylinder;
}

var headLightLeftLight, headLightRightLight;
var redlight, bluelight;
function Car() {

    var direction = new THREE.Vector3(1., 0., 0.);
    var maxSpeed = 10.;
    var acceleration = 0.25;
    var currentSpeed = 0;
    var steeringAngle = Math.PI / 24;

    var movement = {
        'forward': false,
        'left': false,
        'right': false,
        'backward': false
    }

    this.mesh = new THREE.Object3D();
    this.berth = 100; // berth for new collidables (e.g., if berth is 100, no
    // tree will be initialized with 100 units)

    var body = createBox(120, 30, 60, Colors.green, 0, 5, 0);
    var roof = createBox(60, 30, 45, Colors.green, 0, 30, 0);
    var bumper = createBox(90, 10, 45, Colors.brown, 20, -10, 0);
    var headLightLeft = createBox(7, 7, 7, Colors.white, 60, 5, 15);
    var headLightRight = createBox(7, 7, 7, Colors.white, 60, 5, -15);
    var tailLightLeft = createBox(5, 5, 10, Colors.red, -60, 5, 26)
    var tailLightRight = createBox(5, 5, 10, Colors.red, -60, 5, -26)
    var grate = createBox(5, 5, 15, Colors.brownDark, 40, 5, 0);
    var windshield = createBox(3, 20, 35, Colors.white, 30, 25, 0, true);
    var rearshield = createBox(3, 20, 35, Colors.white, -30, 25, 0, true);
    var leftWindow = createBox(40, 20, 3, Colors.white, 0, 25, 22, true);
    var rightWindow = createBox(40, 20, 3, Colors.white, 0, 25, -22, true);
    var leftDoor = createBox(30, 30, 3, Colors.green, 10, 8, 29);
    var rightDoor = createBox(30, 30, 3, Colors.green, 10, 8, -29);
    var leftHandle = createBox(10, 3, 3, Colors.brownDark, 5, 8, 31);
    var rightHandle = createBox(10, 3, 3, Colors.brownDark, 5, 8, -31);
    var frontLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 30, -12, 23);
    var frontRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 30, -12, -23);
    var backLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, -30, -12, 23);
    var backRightTire = createTire(10, 10, 10, 32, Colors.brownDark, -30, -12, -23);

    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(bumper);
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(grate);
    this.mesh.add(windshield);
    this.mesh.add(rearshield);
    this.mesh.add(leftWindow);
    this.mesh.add(rightWindow);
    this.mesh.add(leftDoor);
    this.mesh.add(rightDoor);
    this.mesh.add(leftHandle);
    this.mesh.add(rightHandle);
    this.mesh.add(frontLeftTire);
    this.mesh.add(frontRightTire);
    this.mesh.add(backLeftTire);
    this.mesh.add(backRightTire);

    headLightLeftLight = new THREE.PointLight(Colors.white, 1, 200);
    headLightLeftLight.position.set(70, 5, 15);
    //headLightLeftLight.visible=false;
    this.mesh.add(headLightLeftLight);

    headLightRightLight = new THREE.PointLight(Colors.white, 1, 200);
    headLightRightLight.position.set(70, 5, -15);
    //headLightRightLight.visible=false;
    this.mesh.add(headLightRightLight);


    function computeR(radians) {
        var M = new THREE.Matrix3();
        M.set(Math.cos(radians), 0, -Math.sin(radians),
            0, 1, 0,
            Math.sin(radians), 0, Math.cos(radians));
        return M;
    }

    this.update = function () {
        var sign, R, currentAngle;
        var is_moving = currentSpeed != 0;
        var is_turning = movement.left || movement.right;
        this.mesh.position.addScaledVector(direction, currentSpeed);
        this.mesh.updateMatrixWorld();

        // disallow travel through trees
        if (objectInBound(this.collidable, collidableTrees) || objectInBound(this.collidable, collidableBuildings) || objectInBound(this.collidable, collidableCars) && is_moving) {
            while (objectInBound(this.collidable, collidableTrees) || objectInBound(this.collidable, collidableBuildings) || objectInBound(this.collidable, collidableCars)) {
                this.mesh.position.addScaledVector(direction, -currentSpeed);
                this.mesh.updateMatrixWorld();
            }
            currentSpeed = 0;
            is_moving = false;
        }

        // update speed according to acceleration
        if (movement.forward) {
            currentSpeed = Math.min(maxSpeed, currentSpeed + acceleration);
        } else if (movement.backward) {
            currentSpeed = Math.max(-maxSpeed, currentSpeed - acceleration);
        }

        // update current position based on speed
        if (is_moving) {
            sign = currentSpeed / Math.abs(currentSpeed);
            currentSpeed = Math.abs(currentSpeed) - acceleration / 1.5;
            currentSpeed *= sign;

            // update and apply rotation based on speed
            if (is_turning) {
                currentAngle = movement.left ? -steeringAngle : steeringAngle;
                currentAngle *= currentSpeed / maxSpeed;
                R = computeR(currentAngle);
                direction = direction.applyMatrix3(R);
                this.mesh.rotation.y -= currentAngle;
            }
        }
    }

    this.moveForward = function () { movement.forward = true; }
    this.stopForward = function () { movement.forward = false; }

    this.turnLeft = function () { movement.left = true; }
    this.stopLeft = function () { movement.left = false; }

    this.turnRight = function () { movement.right = true; }
    this.stopRight = function () { movement.right = false; }

    this.moveBackward = function () { movement.backward = true; }
    this.stopBackward = function () { movement.backward = false; }

    this.collidable = body;

    this.reset = function () {
        car.mesh.position.set(-300, 25, -150);
        direction = new THREE.Vector3(1., 0., 0.);
        currentSpeed = 0;
        movement['forward'] = movement['backward'] = false
        movement['left'] = movement['right'] = false
        car.mesh.rotation.y = 0;
    }
}

function CarVersion2() {
    this.mesh = new THREE.Object3D();
    this.berth = 100; 

    var body = createBox(160, 30, 50, Colors.blue, -20, 30, 0);
    var roof = createBox(60, 30, 45, Colors.blue, 0, 60, 0);
    var bumper = createBox(90, 10, 45, Colors.brownDark, 0, 30, 0);

    var kuza1 = createBox(60, 3, 40, Colors.white, -65, 50, 1);
    var kuza2 = createBox(65, 15, 10, Colors.white, -65, 50, 18);
    var kuza3 = createBox(65, 15, 10, Colors.white, -65, 50, -18);
    var kuza4 = createBox(5, 10, 40, Colors.white, -95, 50, 0);
    var headLightLeft = createBox(5, 5, 5, Colors.white, 60, 35, 15);
    var headLightRight = createBox(5, 5, 5, Colors.white, 60, 35, -15);
    var tailLightLeft = createBox(5, 5, 10, Colors.red, -100, 35, 21)
    var tailLightRight = createBox(5, 5, 10, Colors.red, -100, 35, -21)
    var grate = createBox(5, 5, 15, Colors.brownDark, 40, 35, 0);
    var windshield = createBox(3, 20, 35, Colors.blue, 30, 55, 0, true);
    var rearshield = createBox(3, 20, 35, Colors.blue, -30, 55, 0, true);
    var leftWindow = createBox(40, 20, 3, Colors.white, 0, 55, 22, true);
    var rightWindow = createBox(40, 20, 3, Colors.white, 0, 55, -22, true);
    var leftDoor = createBox(30, 30, 3, Colors.blue, 0, 30, 25);
    var rightDoor = createBox(30, 30, 3, Colors.blue, 0, 20, -25);
    var leftHandle = createBox(10, 3, 3, Colors.brown, -5, 28, 27);
    var rightHandle = createBox(10, 3, 3, Colors.brown, -5, 28, -27);
    var frontLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, 15);
    var frontRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, -15);
    var backLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, -60, 8, 15);
    var backRightTire = createTire(10, 10, 10, 32, Colors.brownDark, -60, 8, -15);

    var taxi = createBox(15, 7, 5, Colors.yellow, 0, 79, 5);

    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(bumper);
    this.mesh.add(kuza1);
    this.mesh.add(kuza2);
    this.mesh.add(kuza3);
    this.mesh.add(kuza4);
    this.mesh.add(taxi);
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(grate);
    this.mesh.add(windshield);
    this.mesh.add(rearshield);
    this.mesh.add(leftWindow);
    this.mesh.add(rightWindow);
    this.mesh.add(leftDoor);
    this.mesh.add(rightDoor);
    this.mesh.add(leftHandle);
    this.mesh.add(rightHandle);
    this.mesh.add(frontLeftTire);
    this.mesh.add(frontRightTire);
    this.mesh.add(backLeftTire);
    this.mesh.add(backRightTire);
    
    this.collidable = body;
}

function createCarVersion2(x, z) {
    carv2 = new CarVersion2();
    carv2.mesh.position.set(x, 0, z);
    scene.add(carv2.mesh);

    collidableCars.push(carv2.collidable);
}


// Police Car
function createPoliceCar(x, z) {
    carv2 = new PoliceCar();
    carv2.mesh.position.set(x, 0, z);
    scene.add(carv2.mesh);

    collidableCars.push(carv2.collidable);
}

function PoliceCar() {
    this.mesh = new THREE.Object3D();
    this.berth = 100; 

    var body = createBox(160, 30, 50, Colors.police, -20, 30, 0);
    var roof = createBox(120, 30, 45, Colors.police2, 0, 60, 0);
    var headLightLeft = createBox(5, 5, 5, Colors.white, 60, 35, 15);
    var headLightRight = createBox(5, 5, 5, Colors.white, 60, 35, -15);
    var tailLightLeft = createBox(5, 5, 10, Colors.red, -100, 35, 21);
    var tailLightRight = createBox(5, 5, 10, Colors.red, -100, 35, -21);
    var leftWindow = createBox(40, 20, 3, Colors.black, 0, 55, 22, true);
    var rightWindow = createBox(40, 20, 3, Colors.black, 0, 55, -22, true);
    var leftDoor = createBox(30, 30, 3, Colors.blue, 0, 30, 25);
    var rightDoor = createBox(30, 30, 3, Colors.blue, 0, 20, -25);
    var leftHandle = createBox(10, 3, 3, Colors.brown, -5, 28, 27);
    var rightHandle = createBox(10, 3, 3, Colors.brown, -5, 28, -27);
    var frontLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, 15);
    var frontRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, -15);
    var backLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, -60, 8, 15);
    var backRightTire = createTire(10, 10, 10, 32, Colors.brownDark, -60, 8, -15);

    var signal1 = createBox(15, 7, 15, Colors.red, 40, 79, 20);
    var signal2 = createBox(15, 7, 15, Colors.police, 40, 79, -10);

    this.mesh.add(body);
    this.mesh.add(roof);

    redlight = new THREE.PointLight( 0xfc0303, 20, 100 );
    redlight.position.set(40, 79, 29 );
    this.mesh.add(redlight);

    bluelight = new THREE.PointLight( 0x3300FF, 20, 100 );
    bluelight.position.set(40, 79, -10 );
    this.mesh.add(bluelight);


 

    this.mesh.add(signal1);
    this.mesh.add(signal2);

    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(leftWindow);
    this.mesh.add(rightWindow);
    this.mesh.add(leftDoor);
    this.mesh.add(rightDoor);
    this.mesh.add(leftHandle);
    this.mesh.add(rightHandle);
    this.mesh.add(frontLeftTire);
    this.mesh.add(frontRightTire);
    this.mesh.add(backLeftTire);
    this.mesh.add(backRightTire);
    
    this.collidable = body;
}

function CarVersion3() {
    this.mesh = new THREE.Object3D();
    this.berth = 100; 

    var body = createBox(130, 30, 50, Colors.carv3, 60, 30, 100);
    var roof = createBox(60, 30, 45, Colors.carv3, 70, 60, 100);
    var bumper = createBox(90, 10, 45, Colors.brownDark, 70, 30, 100);

    var headLightLeft = createBox(5, 5, 5, Colors.white, 126, 35, 15+100);
    var headLightRight = createBox(5, 5, 5, Colors.white, 126, 35, -15+100);
    var tailLightLeft = createBox(5, 5, 10, Colors.black, -5, 35, 21+100);
    var tailLightRight = createBox(5, 5, 10, Colors.black, -5, 35, -21+100);
    var grate = createBox(5, 5, 15, Colors.brownDark, 110, 35, 0+100);
    var windshield = createBox(3, 20, 35, Colors.white, 100, 55, 0+100, true);
    var rearshield = createBox(3, 20, 35, Colors.white, 40, 55, 0+100, true);
    var leftWindow = createBox(40, 20, 3, Colors.white, 70, 55, 22+100, true);
    var rightWindow = createBox(40, 20, 3, Colors.white, 70, 55, -22+100, true);
    var leftDoor = createBox(30, 30, 3, Colors.carv3, 70, 30, 25+100);
    var rightDoor = createBox(30, 30, 3, Colors.carv3, 70, 20, -25+100);
    var leftHandle = createBox(10, 3, 3, Colors.brown, 65, 28, 27+100);
    var rightHandle = createBox(10, 3, 3, Colors.brown, 65, 28, -27+100);
    var frontLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 100, 8, 15+100);
    var frontRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 100, 8, -15+100);
    var backLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, 15+100);
    var backRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, -15+100);

    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(bumper);  
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(grate);
    this.mesh.add(windshield);
    this.mesh.add(rearshield);
    this.mesh.add(leftWindow);
    this.mesh.add(rightWindow);
    this.mesh.add(leftDoor);
    this.mesh.add(rightDoor);
    this.mesh.add(leftHandle);
    this.mesh.add(rightHandle);
    this.mesh.add(frontLeftTire);
    this.mesh.add(frontRightTire);
    this.mesh.add(backLeftTire);
    this.mesh.add(backRightTire);

    this.collidable = body;

}

function createCarVersion3(x, z, rotation) {
    carv3 = new CarVersion3();
    carv3.mesh.position.set(x, 0, z);
    carv3.mesh.rotation.y = (Math.PI/2) * rotation;
    scene.add(carv3.mesh);
    //coll.push(building.collidable);
    collidableCars.push(carv3.collidable);

}

function hsl(h, s, l) {
    return (new THREE.Color()).setHSL(h, s, l);
  }

function Jeep() {
    this.mesh = new THREE.Object3D();
    this.berth = 100; 

    var body = createBox(130, 20, 50, Colors.jeep, 60, 30, 100);
    var body1 = createBox(50, 15, 50, Colors.jeep, 100, 46, 100);
    var body2 = createBox(50, 15, 50, Colors.jeep, 10, 46, 100);
    var body2 = createBox(50, 15, 50, Colors.jeep, 10, 46, 100);
    //var rail1 = createCylinder(1, 30, 30, 4, Colors.green, 0, 90, 0);
    var rail1 = createBox(2, 40, 1, Colors.jeep, 75, 65, 75);
    var rail2 = createBox(2, 40, 1, Colors.jeep, 75, 65, 125);
    var rail3 = createBox(2, 2, 50, Colors.jeep, 95, 105, 125);

    var rail4 = createBox(2, 40, 1, Colors.jeep, 35, 65, 75);
    var rail5 = createBox(2, 40, 1, Colors.jeep, 35, 65, 125);
    var rail6 = createBox(2, 2, 50, Colors.jeep, 56, 105, 125);

    var sit1 = createBox(5, 30, 15, Colors.black, 60, 70, 200+5-80);
    var sit2 = createBox(20, 4, 20, Colors.black, 60, 50, 200-80);

    var sit3 = createBox(5, 30, 15, Colors.black, 60, 70, 200+5-105);
    var sit4 = createBox(20, 4, 20, Colors.black, 60, 50, 200-105);

    var bumper = createBox(90, 10, 45, Colors.brownDark, 70, 30, 100);

    var headLightLeft = createBox(5, 5, 5, Colors.white, 126, 35, 15+100);
    var headLightRight = createBox(5, 5, 5, Colors.white, 126, 35, -15+100);
    var tailLightLeft = createBox(5, 5, 10, Colors.black, -5, 35, 21+100);
    var tailLightRight = createBox(5, 5, 10, Colors.black, -5, 35, -21+100);
    var grate = createBox(5, 5, 15, Colors.brownDark, 110, 35, 0+100);
    var leftDoor = createBox(30, 30, 3, Colors.jeep, 70, 30, 25+100);
    var rightDoor = createBox(30, 30, 3, Colors.jeep, 70, 20, -25+100);
    var leftHandle = createBox(10, 3, 3, Colors.brown, 65, 28, 27+100);
    var rightHandle = createBox(10, 3, 3, Colors.brown, 65, 28, -27+100);
    var frontLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 100, 8, 15+100);
    var frontRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 100, 8, -15+100);
    var backLeftTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, 15+100);
    var backRightTire = createTire(10, 10, 10, 32, Colors.brownDark, 20, 8, -15+100);

    this.mesh.add(body);
    this.mesh.add(body1);
    this.mesh.add(body2);
    this.mesh.add(sit1);
    this.mesh.add(sit2);

    this.mesh.add(sit3);
    this.mesh.add(sit4);
    this.mesh.add(rail1);
    this.mesh.add(rail2);
    this.mesh.add(rail3);

    this.mesh.add(rail4);
    this.mesh.add(rail5);
    this.mesh.add(rail6);
    this.mesh.add(bumper);  
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(grate);
    this.mesh.add(leftDoor);
    this.mesh.add(rightDoor);
    this.mesh.add(leftHandle);
    this.mesh.add(rightHandle);
    this.mesh.add(frontLeftTire);
    this.mesh.add(frontRightTire);
    this.mesh.add(backLeftTire);
    this.mesh.add(backRightTire);

    this.collidable = body;

}

function createJeep(x, z, rotation) {
    carjeep = new Jeep();
    carjeep.mesh.position.set(x, 0, z);
    carjeep.mesh.rotation.y = (Math.PI/2) * rotation;
    scene.add(carjeep.mesh);
    collidableCars.push(carjeep.collidable);

}

function createCar() {
    car = new Car();
    scene.add(car.mesh);
}

function Tree() {

    this.mesh = new THREE.Object3D();
    var top = createCylinder(1, 30, 30, 4, Colors.green, 0, 90, 0);
    var mid = createCylinder(1, 40, 40, 4, Colors.green, 0, 70, 0);
    var bottom = createCylinder(1, 50, 50, 4, Colors.green, 0, 40, 0);
    var trunk = createCylinder(10, 10, 30, 32, Colors.brownDark, 0, 0, 0);

    this.mesh.add(top);
    this.mesh.add(mid);
    this.mesh.add(bottom);
    this.mesh.add(trunk);

    this.collidable = bottom;
}


function createTree(x, z, scale, rotation) {
    var tree = new Tree();
    trees.push(tree);
    scene.add(tree.mesh);
    tree.mesh.position.set(x, 0, z);
    tree.mesh.scale.set(scale, scale, scale);
    tree.mesh.rotation.y = rotation;
    return tree;
}

function Road() {
    this.mesh = new THREE.Object3D();
    this.berth = 100; 
    
    var roadMesh = createBox(200, 2, 600, Colors.white, 126, 0, 10);
    var roadBlackcenter = createBox(10, 2, 600, Colors.black, 126, 0.5, 10);
    var roadBlackleft = createBox(10, 2, 600, Colors.black, 30, 0.5, 10);
    var roadBlackright = createBox(10, 2, 600, Colors.black, 220, 0.5, 10);

    this.mesh.add(roadMesh);
    this.mesh.add(roadBlackcenter);
    this.mesh.add(roadBlackleft);
    this.mesh.add(roadBlackright);

    //add collidable 
}

function createRoad(x, z, scalex, scaley, scalez, rotation) {
    road = new Road();
    road.mesh.position.set(x, 0, z);
    road.mesh.scale.set(scalex, scaley, scalez);
    road.mesh.rotation.y = Math.PI / 2 * rotation;
    scene.add(road.mesh);

    //console.log(road.mesh.position);
    //console.log("road berth is ", road.berth);
}


// Parking

function Parking() {
    this.mesh = new THREE.Object3D();
    this.berth = 200; 
    var parkMesh = createBox(1800, 0, 750, Colors.red, 1500, 0, 0);
    var p1 = createBox(20, 60, 0, Colors.yellow, 650, 0, 0);
    var p2 = createBox(20, 60, 0, Colors.yellow, 750, 0, 0);
    var p3 = createBox(20, 60, 0, Colors.yellow, 850, 0, 0);
    var p4 = createBox(20, 60, 0, Colors.yellow, 950, 0, 0);
    var p5 = createBox(20, 60, 0, Colors.yellow, 1050, 0, 0);
    var p6 = createBox(20, 60, 0, Colors.yellow, 1150, 0, 0);
    var p7 = createBox(20, 60, 0, Colors.yellow, 1250, 0, 0);
    var p8 = createBox(20, 60, 0, Colors.yellow, 1350, 0, 0);
    var p9 = createBox(20, 60, 0, Colors.yellow, 1450, 0, 0);
    var p10 = createBox(20, 60, 0, Colors.yellow, 1550,0, 0);

    this.mesh.add(parkMesh);
    this.mesh.add(p1);
    this.mesh.add(p2);
    this.mesh.add(p3);
    this.mesh.add(p4);
    this.mesh.add(p5);
    this.mesh.add(p6);
    this.mesh.add(p7);
    this.mesh.add(p8);
    this.mesh.add(p9);
    this.mesh.add(p10);

}

// Parking Lot
function createParking(x, z, scalex, scaley, scalez, rotation) {
    parking = new Parking();
    parking.mesh.position.set(x, 0, z);
    parking.mesh.scale.set(scalex, scaley, scalez);
    parking.mesh.rotation.y = Math.PI / 2 * rotation;
    scene.add(parking.mesh);
}

// Pole
function Pole() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var body = createBox(7, 200, 7, Colors.cement, 0, 0, -40);
    var pole = createBox(30, 5, 5, Colors.cement, 20, 90, -40);
    var pole1 = createBox(30, 5, 5, Colors.cement, 10, 80, -40);
    var lightpole = createBox(10, 5, 5, Colors.red, 30, 86, -40);


    pole1.rotation.z = (Math.PI/2) - 45;

    var pointligghtPole = new THREE.PointLight(Colors.red, 100, 100);
    pointligghtPole.position.set(30, 86, -40);
    //headLightLeftLight.visible=false;
    this.mesh.add(pointligghtPole);

    this.mesh.add(body);
    this.mesh.add(pole);
    this.mesh.add(pole1);
    this.mesh.add(lightpole);
    this.collidable = body;
}

/**
 * Creates pole according to specifications
 */
function createPole(x, z, rotation) {
    pole = new Pole();
    pole.mesh.position.set(x, 0, z);
    pole.mesh.rotation.y = (Math.PI/2) * rotation;
    scene.add(pole.mesh);

    collidablePoles.push(pole.collidable);
}

// Traffic Light
function TrafficLight() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;


    var body0 = createBox(5, 150, 5, Colors.black, 0, 0, 0);
    var body = createBox(15, 30, 10, Colors.black, 0, 80, 0);
    var red = createBox(5, 5, 2, Colors.red, 0, 95, 10);
    var yellow = createBox(5, 5, 2, Colors.yellow, 0, 85, 10);
    var green = createBox(5, 5, 2, Colors.green, 0, 75, 10);

    var light = new THREE.PointLight(Colors.red, 1, 100);
    light.position.set(4, 95, 10);

    this.mesh.add(body0);
    this.mesh.add(body);
    this.mesh.add(red);
    this.mesh.add(yellow);
    this.mesh.add(green);
    this.mesh.add(light);

    this.collidable = body0;

}

/**
 * Creates traffic light according to specifications
 */
function createTrafficLight(x, z, rotation) {
    // trafficLight = new TrafficLight();
    // trafficLight.mesh.position.set(x, 0, z);
    // scene.add(trafficLight.mesh);

    // collidableTrafficLight.push(trafficLight.collidable);

    trafficLight = new TrafficLight();
    trafficLight.mesh.position.set(x, 0, z);
    trafficLight.mesh.rotation.y = (Math.PI / 2) * rotation
    scene.add(trafficLight.mesh);

    collidableTrafficLight.push(trafficLight.collidable);
}

/**
 * Create simple green, rectangular ground
 */
function createGround() {
    ground = createBox(5000, 20, 5000, Colors.greenDark, 0, -10, 0);
    scene.add(ground);
}





/**
 * Template for fuel container
 */
function Fuel() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var slab = createBox(50, 5, 50, Colors.brown, 0, 0, 0);
    var body = createBox(20, 100, 15, Colors.red, 0, 0, 0);
    var leftArm = createBox(3, 80, 10, Colors.red, 12.5, 0, 0);
    var rightArm = createBox(3, 80, 10, Colors.red, -12.5, 0, 0);
    var frontWindow = createBox(10, 10, 2, Colors.blue, 0, 35, 10);
    var backWindow = createBox(10, 10, 2, Colors.blue, 0, 35, -10);
    var frontBox = createBox(8, 8, 3, Colors.red, 0, 15, 10);
    var backBox = createBox(8, 8, 3, Colors.red, 0, 15, -10);
    var head = createTire(10, 10, 5, 32, Colors.red, 0, 60, 0);
    var headHighlight = createTire(6, 6, 8, 32, Colors.golden, 0, 60, 0);

    var light = new THREE.PointLight(0xffcc00, 1, 100);
    light.position.set(0, 60, 0);

    this.mesh.add(slab);
    this.mesh.add(body);
    this.mesh.add(leftArm);
    this.mesh.add(rightArm);
    this.mesh.add(frontWindow);
    this.mesh.add(backWindow);
    this.mesh.add(frontBox);
    this.mesh.add(backBox);
    this.mesh.add(head);
    this.mesh.add(headHighlight);
    this.mesh.add(light);

    this.collidable = slab;
}

function createFuel(x, z) {
    fuel = new Fuel();
    fuel.mesh.position.set(x, 0, z);
    scene.add(fuel.mesh);

    collidableFuels.push(fuel.collidable);
}

/*** BUILDINGS  ***/

function Building() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var body = createBox(100, 550, 150, Colors.cement, 0, 0, -40);
    var roof = createBox(90, 50, 140, Colors.brick, 0, 260, -40);

    var windows1 = createBox(0, 40, 20, Colors.red, -50, 0, 0);
    var windows2 = createBox(0, 40, 20, Colors.red, -50, 60, 0);
    var windows3 = createBox(0, 40, 20, Colors.red, -50, 120, 0);
    var windows4 = createBox(0, 40, 20, Colors.red, -50, 180, 0);
    var windows5 = createBox(0, 40, 20, Colors.red, -50, 240, 0);

    var windows6 = createBox(0, 40, 20, Colors.red, -50, 0, -90);
    var windows7 = createBox(0, 40, 20, Colors.red, -50, 60, -90);
    var windows8 = createBox(0, 40, 20, Colors.red, -50, 120, -90);
    var windows9 = createBox(0, 40, 20, Colors.red, -50, 180, -90);
    var windows10 = createBox(0, 40, 20, Colors.red, -50, 240, -90);

    var windows11 = createBox(0, 40, 20, Colors.red, 50, 0, 0);
    var windows12 = createBox(0, 40, 20, Colors.red, 50, 60, 0);
    var windows13 = createBox(0, 40, 20, Colors.red, 50, 120, 0);
    var windows14 = createBox(0, 40, 20, Colors.red, 50, 180, 0);
    var windows15 = createBox(0, 40, 20, Colors.red, 50, 240, 0);


    var windows16 = createBox(0, 40, 20, Colors.red, 50, 0, -90);
    var windows17 = createBox(0, 40, 20, Colors.red, 50, 60, -90);
    var windows18 = createBox(0, 40, 20, Colors.red, 50, 120, -90);
    var windows19 = createBox(0, 40, 20, Colors.red, 50, 180, -90);
    var windows20 = createBox(0, 40, 20, Colors.red, 50, 240, -90);


    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(windows3);
    this.mesh.add(windows4);
    this.mesh.add(windows5);

    this.mesh.add(windows6);
    this.mesh.add(windows7);
    this.mesh.add(windows8);
    this.mesh.add(windows9);
    this.mesh.add(windows10);

    this.mesh.add(windows11);
    this.mesh.add(windows12);
    this.mesh.add(windows13);
    this.mesh.add(windows14);
    this.mesh.add(windows15);

    this.mesh.add(windows16);
    this.mesh.add(windows17);
    this.mesh.add(windows18);
    this.mesh.add(windows19);
    this.mesh.add(windows20);

    this.collidable = body;    //car wont pass inside of object
}

function createBuilding(x, z, rotation) {
    building = new Building();
    building.mesh.position.set(x, 0, z);
    building.mesh.rotation.y = (Math.PI / 2) * rotation
    scene.add(building.mesh);

    collidableBuildings.push(building.collidable);
}

function Building4() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var body = createBox(100, 350, 150, Colors.brick, 0, 0, -40);
    var roof = createBox(90, 50, 140, Colors.cement, 0, 160, -40);

    var windows1 = createBox(0, 40, 20, Colors.red, -50, 0, 0);
    var windows2 = createBox(0, 40, 20, Colors.red, -50, 60, 0);
    var windows3 = createBox(0, 40, 20, Colors.red, -50, 120, 0);

    var windows6 = createBox(0, 40, 20, Colors.red, -50, 0, -90);
    var windows7 = createBox(0, 40, 20, Colors.red, -50, 60, -90);
    var windows8 = createBox(0, 40, 20, Colors.red, -50, 120, -90);

    var windows11 = createBox(0, 40, 20, Colors.red, 50, 0, 0);
    var windows12 = createBox(0, 40, 20, Colors.red, 50, 60, 0);
    var windows13 = createBox(0, 40, 20, Colors.red, 50, 120, 0);

    var windows16 = createBox(0, 40, 20, Colors.red, 50, 0, -90);
    var windows17 = createBox(0, 40, 20, Colors.red, 50, 60, -90);
    var windows18 = createBox(0, 40, 20, Colors.red, 50, 120, -90);

    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(windows3);

    this.mesh.add(windows6);
    this.mesh.add(windows7);
    this.mesh.add(windows8);

    this.mesh.add(windows11);
    this.mesh.add(windows12);
    this.mesh.add(windows13);

    this.mesh.add(windows16);
    this.mesh.add(windows17);
    this.mesh.add(windows18);

    this.collidable = body;    //car wont pass inside of object
}

function createBuilding4(x, z, rotation) {
    building = new Building4();
    building.mesh.position.set(x, 40, z);
    building.mesh.rotation.y = (Math.PI/2)*rotation;
    scene.add(building.mesh);

    collidableBuildings.push(building.collidable);
}


// Hospital
function createBuildingHospital(x, z, rotation) {
    building = new BuildingHospital();
    building.mesh.position.set(x, 40, z);
    building.mesh.rotation.y = (Math.PI/2)*rotation;
    scene.add(building.mesh);

    collidableBuildings.push(building.collidable);
}

function BuildingHospital() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var body = createBox(100, 350, 150, Colors.white, 0, 0, -40);
    var roof = createBox(90, 50, 140, Colors.brick, 0, 160, -40);

    var windows1 = createBox(0, 40, 20, Colors.blue, -50, 0, 0);
    var windows2 = createBox(0, 40, 20, Colors.blue, -50, 60, 0);
    var windows6 = createBox(0, 40, 20, Colors.blue, -50, 0, -90);
    var windows7 = createBox(0, 40, 20, Colors.blue, -50, 60, -90);

    var windows3 = createBox(10, 40, 0, Colors.red, -50, 120, -30);
    var windows8 = createBox(10, 40, 0, Colors.red, -50, 120, -50);
    var windows9 = createBox(10, 0, 20, Colors.red, -50, 120, -40);
    
    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(windows6);
    this.mesh.add(windows7);

    this.mesh.add(windows3);
    this.mesh.add(windows8);
    this.mesh.add(windows9);

    this.collidable = body;    //car wont pass inside of object
}

// House
function createHouse(x, z, rotation) {
    house = new House();
    house.mesh.position.set(x, 40, z);
    house.mesh.rotation.y = (Math.PI/2)*rotation;
    scene.add(house.mesh);

    collidableBuildings.push(house.collidable);
}

function House() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var body = createBox(50, 60, 60, Colors.white, 0, 0, -40);
    var roof = createRoofCylinder(5, 50, 60, 4, Colors.brick, 0, 59, -40);
    
    var windows1 = createBox(0, 20, 5, Colors.blue, -30, 0, -20);
    var windows2 = createBox(0, 20, 5, Colors.blue, -30, 0, -50);

    var door = createBox(8, 30, 10, Colors.brick, -22, -10, -37);
    
    this.mesh.add(body);
    this.mesh.add(roof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(door);

    this.collidable = body;    //car wont pass inside of object
}

/**
 * Template for fuel container
 */
function Bin() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var layer = createBox(50, 5, 50, Colors.grey, 0, 5, 0);
    var wall1 = createBox(2, 100, 50, Colors.grey, -25, 5, 0);
    var wall2 = createBox(52, 100, 2, Colors.grey, 0, 5, 25);
    var wall3 = createBox(52, 100, 2, Colors.grey, 0, 5, -25);
    var wall4 = createBox(2, 100, 50, Colors.grey, 25, 5, 0);
    var handle1 = createBox(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = createBox(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = createBox(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = createBox(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = createTire(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = createTire(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = createTire(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = createTire(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = createTire(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = createTire(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

    this.mesh.add(layer);
    this.mesh.add(wall1);
    this.mesh.add(wall2);
    this.mesh.add(wall3);
    this.mesh.add(wall4);
    this.mesh.add(handle1);
    this.mesh.add(handle2);
    this.mesh.add(handle3);
    this.mesh.add(handle4);
    this.mesh.add(tire1);
    this.mesh.add(tire2);
    this.mesh.add(tire3);
    this.mesh.add(tire4);
    this.mesh.add(pin1);
    this.mesh.add(pin2);
    this.mesh.add(pin3);
    this.mesh.add(pin4);

    this.collidable = layer;
}

function createbin(x, z, scalex, scaley, scalez) {
    trashbin = new Bin();
    trashbin.mesh.position.set(x, 0, z);
    trashbin.mesh.scale.set(scalex, scaley, scalez);
    scene.add(trashbin.mesh);

    collidableBins.push(trashbin.collidable);
}


function Bin1() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var layer = createBox(50, 5, 50, Colors.yellow, 0, 5, 0);
    var wall1 = createBox(2, 100, 50, Colors.yellow, -25, 5, 0);
    var wall2 = createBox(52, 100, 2, Colors.yellow, 0, 5, 25);
    var wall3 = createBox(52, 100, 2, Colors.yellow, 0, 5, -25);
    var wall4 = createBox(2, 100, 50, Colors.yellow, 25, 5, 0);
    var handle1 = createBox(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = createBox(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = createBox(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = createBox(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = createTire(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = createTire(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = createTire(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = createTire(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = createTire(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = createTire(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

    this.mesh.add(layer);
    this.mesh.add(wall1);
    this.mesh.add(wall2);
    this.mesh.add(wall3);
    this.mesh.add(wall4);
    this.mesh.add(handle1);
    this.mesh.add(handle2);
    this.mesh.add(handle3);
    this.mesh.add(handle4);
    this.mesh.add(tire1);
    this.mesh.add(tire2);
    this.mesh.add(tire3);
    this.mesh.add(tire4);
    this.mesh.add(pin1);
    this.mesh.add(pin2);
    this.mesh.add(pin3);
    this.mesh.add(pin4);

    this.collidable = layer;
}

function createbin1(x, z, scalex, scaley, scalez) {
    trashbin1 = new Bin1();
    trashbin1.mesh.position.set(x, 0, z);
    trashbin1.mesh.scale.set(scalex, scaley, scalez);
    scene.add(trashbin1.mesh);

    collidableFuels.push(trashbin1.collidable);
}

function Bin2() {
    this.mesh = new THREE.Object3D();
    this.berth = 100;

    var layer = createBox(50, 5, 50, Colors.green, 0, 5, 0);
    var wall1 = createBox(2, 100, 50, Colors.green, -25, 5, 0);
    var wall2 = createBox(52, 100, 2, Colors.green, 0, 5, 25);
    var wall3 = createBox(52, 100, 2, Colors.green, 0, 5, -25);
    var wall4 = createBox(2, 100, 50, Colors.green, 25, 5, 0);
    var handle1 = createBox(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = createBox(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = createBox(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = createBox(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = createTire(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = createTire(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = createTire(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = createTire(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = createTire(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = createTire(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = createTire(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

    this.mesh.add(layer);
    this.mesh.add(wall1);
    this.mesh.add(wall2);
    this.mesh.add(wall3);
    this.mesh.add(wall4);
    this.mesh.add(handle1);
    this.mesh.add(handle2);
    this.mesh.add(handle3);
    this.mesh.add(handle4);
    this.mesh.add(tire1);
    this.mesh.add(tire2);
    this.mesh.add(tire3);
    this.mesh.add(tire4);
    this.mesh.add(pin1);
    this.mesh.add(pin2);
    this.mesh.add(pin3);
    this.mesh.add(pin4);

    this.collidable = layer;
}

function createbin2(x, z, scalex, scaley, scalez) {
    trashbin2 = new Bin2();
    trashbin2.mesh.position.set(x, 0, z);
    trashbin2.mesh.scale.set(scalex, scaley, scalez);
    scene.add(trashbin2.mesh);

    collidableFuels.push(trashbin2.collidable);
}


function createTrees() { 
    var x, z, scale, rotate, delay;
    for (var i = 0; i < 150; i++) {
        x = Math.random() * -5500 + 3000;
        z = Math.random() * -5000 + 2300;
        scale = Math.random() * 1 + 0.5;
        rotate = Math.random() * Math.PI * 2;
        delay = 2000 * Math.random();

        var treePosition = new THREE.Vector3(x, 0, z);
        // if (treePosition.distanceTo(car.mesh.position) < car.berth || treePosition.distanceTo(road.mesh.position) < road.berth * 20 || 
        //     treePosition.distanceTo(fuel.mesh.position) < fuel.berth || treePosition.distanceTo(building.mesh.position) < building.berth || treePosition.distanceTo(carjeep.mesh.position) < carjeep.berth 
        //     || treePosition.distanceTo(carv2.mesh.position) < carv2.berth || treePosition.distanceTo(carv3.mesh.position) < carv3.berth) {
        //     continue;
        // }


        if (treePosition.distanceTo(car.mesh.position) < car.berth || 
            treePosition.distanceTo(fuel.mesh.position) < fuel.berth || treePosition.distanceTo(building.mesh.position) < building.berth || treePosition.distanceTo(carjeep.mesh.position) < carjeep.berth 
            || treePosition.distanceTo(carv2.mesh.position) < carv2.berth || treePosition.distanceTo(carv3.mesh.position) < carv3.berth || treePosition.distanceTo(road.mesh.position) < road.berth  ) {
            continue;
        }
        var tree = createTree(x, z, 0.01, rotate);

        setTimeout(function (object, scale) {
            startGrowth(object, 50, 10, scale);
        }.bind(this, tree.mesh, scale), delay);

        collidableTrees.push(tree.collidable);
    }
}

function endTrees() {
    for (let tree of trees) {
        scale = tree.mesh.scale.x;
        delay = delay = 2000 * Math.random();
        setTimeout(function (object, scale) {
            startShrink(object, 25, -10, scale);
        }.bind(this, tree.mesh, scale), delay);
    }
    collidableTrees = [];
    collidableFuels = [];
    collidableBuildings = [];
    collidablePoles = [];
    collidableCars = [];
    collidableBins = [];
    trees = [];
}

// Pole 
function createPoles() {
// Pole 1
var x = -70;
var y = 50;
createPole(x, y, 2);
startGrowth(pole.mesh, 50, 10, 1);

// Overloads fragment shader
// // Pole 2
// var x = -70;
// var y = -550;
// createPole(x, y, 2);
// startGrowth(pole.mesh, 50, 10, 1);
}

function endPoles() {
    scale = pole.mesh.scale.x;
    startShrink(pole.mesh, 25, -10, scale);
}

// Traffic Lights

function createTrafficLights() {
// Traffic Light 1
var x = -70;
var y = -210;
createTrafficLight(x, y, 0);
startGrowth(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 2
// var x = -70;
// var y = -710;
// createTrafficLight(x, y, 0);
// startGrowth(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 3
// var x = 520;
// var y = -710;
// createTrafficLight(x, y, 0);
// startGrowth(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 4
// var x = 520;
// var y = -210;
// createTrafficLight(x, y, 0);
// startGrowth(trafficLight.mesh, 50, 10, 1);   

}

function endTrafficLights() {
    scale = trafficLight.mesh.scale.x;
    startShrink(trafficLight.mesh, 25, -10, scale);
}

function createFuels() {
    var x = Math.random() * 600 - 300;
    var y = Math.random() * 400 - 200;
    createFuel(x, y);
    startGrowth(fuel.mesh, 50, 10, 1);
}

function endFuels() {
    scale = fuel.mesh.scale.x;
    startShrink(fuel.mesh, 25, -10, scale);
}

function createBuildings() {
    var x = -1500;
    var y = -1800;
    createBuilding(x, y, 0);
    startGrowth(building.mesh, 50, 10, 1);

    var x = -1200;
    var y = -580;
    createBuilding(x, y, 2);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -1460;
    var y = 550;
    createBuilding(x, y, 0);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -1500;
    var y = -1800;
    createBuilding(x, y, 0);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -800;
    var y = -500;
    createBuilding4(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -600;
    var y = -500;
    createBuilding4(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -400;
    var y = -500;
    createBuilding(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 200;
    var y = -480;
    createBuildingHospital(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 563;
    var y = 640;
    createBuildingHospital(x, y, 0);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 100;
    var y = 200;
    createHouse(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 180;
    var y = 200;
    createHouse(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 260;
    var y = 200;
    createHouse(x, y, 1);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 550;
    var y = -550;
    createHouse(x, y, 0);
    startGrowth(building.mesh, 40, 10, 1);

    var x = 550;
    var y = -450;
    createHouse(x, y, 0);
    startGrowth(building.mesh, 40, 10, 1);

    var x = -300;
    var y = 120;
    createHouse(x, y, 2);
    startGrowth(building.mesh, 40, 10, 1);
}

function endBuildings() {
    scale = building.mesh.scale.x;
    startShrink(building.mesh, 25, -10, scale);
}

function createCarV2() {
    var x = -400;
    var y = 400;
    createCarVersion2(x, y);
    startGrowth(carv2.mesh, 50, 10, 1);

    var x = -600;
    var y = -300;
    createCarVersion2(x, y);
    startGrowth(carv2.mesh, 50, 10, 1);

    var x = -220;
    var y = -500;
    createCarVersion3(x, y, 1);
    startGrowth(carv2.mesh, 50, 10, 1);

    // Police Car create
    var x = 316;
    var y = -277;
    createPoliceCar(x, y);
    startGrowth(carv2.mesh, 50, 10, 1);


    var x = -100;
    var y = -350;
    createJeep(x, y, 0);
    startGrowth(carjeep.mesh, 50, 10, 1);
}

function createRoads() {
    var x = -1400;
    var y = -1900;
    createRoad(x, y, 1, 1, 1, 0);

    var x = -1400;
    var y = -1500;
    createRoad(x, y, 1, 1, 1, 0);

    var x = -1400;
    var y = -1000;
    createRoad(x, y, 1, 1, 1, 0);

    var x = -900;
    var y = -700;
    createRoad(x, y, 1, 1, 5, 1);

    var x = -1170;
    var y = 720;
    createRoad(x, y, 1, 1, 5, 0);

    var x = -300;
    var y = -700;
    createRoad(x, y, 1, 1, 6, 0);

    var x = -300;
    var y = -200;
    createRoad(x, y, 1, 1, 6, 1);

    var x = 300;
    var y = 450;
    createRoad(x, y, 1, 1, 6, 1);

    var x = 300;
    var y = -200;
    createRoad(x, y, 1, 1, 7, 0);

}

function createParkings() {
    var x = -50;
    var y = -50;
    createParking(x, y, 1, 1, 1, 0);
}

function createBins(){
    var x = 100;
    var y = -200;
    createbin(x, y, 10, 10, 10);
    startGrowth(trashbin.mesh, 40, 10, 1);
    var x = 250;
    var y = -200;
    createbin1(x, y, 4, 4, 4);
    startGrowth(trashbin1.mesh, 40, 10, 1);
    var x = 200;
    var y = -200;
    createbin2(x, y, 4, 4, 4);
    startGrowth(trashbin2.mesh, 40, 10, 1);
 
}
function endBin() {
    scale = trashbin.mesh.scale.x;
    startShrink(trashbin.mesh, 25, -10, scale);
}
