
var  trees = [], poles = [], trafficLight = [], collidableTrees = [], collidablePoles = [], collidableTrafficLight = [], numTrees = 1000, numPoles = 3,
    collidableFuels = [], collidableBuildings = [], collidableBins=[], collidableCars=[], car, fuel, ground;

/*
*
* GEOMTERIES
*
*/

function BoxGeom(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: notFlatShading != true, transparent: true });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

function CylinderGeom(topRad, BottomRad, height, Segments, color,
    x, y, z) {
    var geom = new THREE.CylinderGeometry(topRad, BottomRad, height, Segments);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}

function CylindermeshRoofGeom(topRad, BottomRad, height, Segments, color,
    x, y, z) {
    var geom = new THREE.CylinderGeometry(topRad, BottomRad, height, Segments);
    var mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    cylinder.rotation.y = 18;
    return cylinder;
}

function TireGeom(topRad, BottomRad, height, Segments, color, x, y, z) {
    var cylinder = CylinderGeom(topRad, BottomRad, height, Segments, color, x, y, z);
    cylinder.rotation.x = Math.PI / 2;  // hardcoded for tires in the car below
    return cylinder;
}

var headLightLeftLight, headLightRightLight;
var redlight, bluelight;
function MainCar() {

    var direction = new THREE.Vector3(1., 0., 0.);
    var maxSpeed = 10.;
    var maxAcceleration = 0.25;
    var currentCarSpeed = 0;
    var carSteeringAngle = Math.PI / 24;

    var movement = {
        'forward': false,
        'left': false,
        'right': false,
        'backward': false
    }

    this.mesh = new THREE.Object3D();
    this.distance = 100; // distance for new collidables (e.g., if distance is 100, no
    // tree will be initialized with 100 units)

    var meshBody = BoxGeom(120, 30, 60, Colors.green, 0, 5, 0);
    var meshRoof = BoxGeom(60, 30, 45, Colors.green, 0, 30, 0);
    var meshBumper = BoxGeom(90, 10, 45, Colors.brown, 20, -10, 0);
    var headLightLeft = BoxGeom(7, 7, 7, Colors.white, 60, 5, 15);
    var headLightRight = BoxGeom(7, 7, 7, Colors.white, 60, 5, -15);
    var tailLightLeft = BoxGeom(5, 5, 10, Colors.red, -60, 5, 26)
    var tailLightRight = BoxGeom(5, 5, 10, Colors.red, -60, 5, -26)
    var meshGrate = BoxGeom(5, 5, 15, Colors.brownDark, 40, 5, 0);
    var meshfrontWindow = BoxGeom(3, 20, 35, Colors.white, 30, 25, 0, true);
    var meshbackWindow = BoxGeom(3, 20, 35, Colors.white, -30, 25, 0, true);
    var meshleftWindow = BoxGeom(40, 20, 3, Colors.white, 0, 25, 22, true);
    var meshrightWindow = BoxGeom(40, 20, 3, Colors.white, 0, 25, -22, true);
    var meshleftDoor = BoxGeom(30, 30, 3, Colors.green, 10, 8, 29);
    var meshrightDoor = BoxGeom(30, 30, 3, Colors.green, 10, 8, -29);
    var meshleftHandleDoor = BoxGeom(10, 3, 3, Colors.brownDark, 5, 8, 31);
    var meshrightHandleDoor = BoxGeom(10, 3, 3, Colors.brownDark, 5, 8, -31);
    var meshfrontLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 30, -12, 23);
    var meshfrontRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 30, -12, -23);
    var meshbackLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -30, -12, 23);
    var meshbackRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -30, -12, -23);

    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
    this.mesh.add(meshBumper);
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(meshGrate);
    this.mesh.add(meshfrontWindow);
    this.mesh.add(meshbackWindow);
    this.mesh.add(meshleftWindow);
    this.mesh.add(meshrightWindow);
    this.mesh.add(meshleftDoor);
    this.mesh.add(meshrightDoor);
    this.mesh.add(meshleftHandleDoor);
    this.mesh.add(meshrightHandleDoor);
    this.mesh.add(meshfrontLeftTires);
    this.mesh.add(meshfrontRightTires);
    this.mesh.add(meshbackLeftTires);
    this.mesh.add(meshbackRightTires);

    headLightLeftLight = new THREE.PointLight(Colors.white, 1, 200);
    headLightLeftLight.position.set(70, 5, 15);
    //headLightLeftLight.visible=false;
    this.mesh.add(headLightLeftLight);

    headLightRightLight = new THREE.PointLight(Colors.white, 1, 200);
    headLightRightLight.position.set(70, 5, -15);
    //headLightRightLight.visible=false;
    this.mesh.add(headLightRightLight);


    function checkforRadians(radians) {
        var M = new THREE.Matrix3();
        M.set(Math.cos(radians), 0, -Math.sin(radians),
            0, 1, 0,
            Math.sin(radians), 0, Math.cos(radians));
        return M;
    }

    this.update = function () {
        var sign, R, currentCarAngle;
        var isCarMoving = currentCarSpeed != 0;
        var isCarTurningAround = movement.left || movement.right;
        this.mesh.position.addScaledVector(direction, currentCarSpeed);
        this.mesh.updateMatrixWorld();

        // disallow travel through trees
        if (objTouchedtoAnother(this.collidable, collidableTrees) || objTouchedtoAnother(this.collidable, collidableBuildings) || objTouchedtoAnother(this.collidable, collidableCars) && isCarMoving) {
            while (objTouchedtoAnother(this.collidable, collidableTrees) || objTouchedtoAnother(this.collidable, collidableBuildings) || objTouchedtoAnother(this.collidable, collidableCars)) {
                this.mesh.position.addScaledVector(direction, -currentCarSpeed);
                this.mesh.updateMatrixWorld();
            }
            currentCarSpeed = 0;
            isCarMoving = false;
        }

        // update speed according to maxAcceleration
        if (movement.forward) {
            currentCarSpeed = Math.min(maxSpeed, currentCarSpeed + maxAcceleration);
        } else if (movement.backward) {
            currentCarSpeed = Math.max(-maxSpeed, currentCarSpeed - maxAcceleration);
        }

        // update current position based on speed
        if (isCarMoving) {
            sign = currentCarSpeed / Math.abs(currentCarSpeed);
            currentCarSpeed = Math.abs(currentCarSpeed) - maxAcceleration / 1.5;
            currentCarSpeed *= sign;

            // update and apply rotation based on speed
            if (isCarTurningAround) {
                currentCarAngle = movement.left ? -carSteeringAngle : carSteeringAngle;
                currentCarAngle *= currentCarSpeed / maxSpeed;
                R = checkforRadians(currentCarAngle);
                direction = direction.applyMatrix3(R);
                this.mesh.rotation.y -= currentCarAngle;
            }
        }
    }

    this.moveCarForward = function () { movement.forward = true; }
    this.stopCarForward = function () { movement.forward = false; }

    this.TurnCarLeft = function () { movement.left = true; }
    this.StopCarLeft = function () { movement.left = false; }

    this.TurnCarRight = function () { movement.right = true; }
    this.StopCarRight = function () { movement.right = false; }

    this.moveCarBackward = function () { movement.backward = true; }
    this.stopCarBackward = function () { movement.backward = false; }

    this.collidable = meshBody;

    this.reset = function () {
        car.mesh.position.set(-300, 25, -150);
        direction = new THREE.Vector3(1., 0., 0.);
        currentCarSpeed = 0;
        movement['forward'] = movement['backward'] = false
        movement['left'] = movement['right'] = false
        car.mesh.rotation.y = 0;
    }
}

function CarVersion2() {
    this.mesh = new THREE.Object3D();
    this.distance = 100; 

    var meshBody = BoxGeom(160, 30, 50, Colors.blue, -20, 30, 0);
    var meshRoof = BoxGeom(60, 30, 45, Colors.blue, 0, 60, 0);
    var meshBumper = BoxGeom(90, 10, 45, Colors.brownDark, 0, 30, 0);

    var kuza1 = BoxGeom(60, 3, 40, Colors.white, -65, 50, 1);
    var kuza2 = BoxGeom(65, 15, 10, Colors.white, -65, 50, 18);
    var kuza3 = BoxGeom(65, 15, 10, Colors.white, -65, 50, -18);
    var kuza4 = BoxGeom(5, 10, 40, Colors.white, -95, 50, 0);
    var headLightLeft = BoxGeom(5, 5, 5, Colors.white, 60, 35, 15);
    var headLightRight = BoxGeom(5, 5, 5, Colors.white, 60, 35, -15);
    var tailLightLeft = BoxGeom(5, 5, 10, Colors.red, -100, 35, 21)
    var tailLightRight = BoxGeom(5, 5, 10, Colors.red, -100, 35, -21)
    var meshGrate = BoxGeom(5, 5, 15, Colors.brownDark, 40, 35, 0);
    var meshfrontWindow = BoxGeom(3, 20, 35, Colors.blue, 30, 55, 0, true);
    var meshbackWindow = BoxGeom(3, 20, 35, Colors.blue, -30, 55, 0, true);
    var meshleftWindow = BoxGeom(40, 20, 3, Colors.white, 0, 55, 22, true);
    var meshrightWindow = BoxGeom(40, 20, 3, Colors.white, 0, 55, -22, true);
    var meshleftDoor = BoxGeom(30, 30, 3, Colors.blue, 0, 30, 25);
    var meshrightDoor = BoxGeom(30, 30, 3, Colors.blue, 0, 20, -25);
    var meshleftHandleDoor = BoxGeom(10, 3, 3, Colors.brown, -5, 28, 27);
    var meshrightHandleDoor = BoxGeom(10, 3, 3, Colors.brown, -5, 28, -27);
    var meshfrontLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, 15);
    var meshfrontRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, -15);
    var meshbackLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -60, 8, 15);
    var meshbackRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -60, 8, -15);

    var taxi = BoxGeom(15, 7, 5, Colors.yellow, 0, 79, 5);

    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
    this.mesh.add(meshBumper);
    this.mesh.add(kuza1);
    this.mesh.add(kuza2);
    this.mesh.add(kuza3);
    this.mesh.add(kuza4);
    this.mesh.add(taxi);
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(meshGrate);
    this.mesh.add(meshfrontWindow);
    this.mesh.add(meshbackWindow);
    this.mesh.add(meshleftWindow);
    this.mesh.add(meshrightWindow);
    this.mesh.add(meshleftDoor);
    this.mesh.add(meshrightDoor);
    this.mesh.add(meshleftHandleDoor);
    this.mesh.add(meshrightHandleDoor);
    this.mesh.add(meshfrontLeftTires);
    this.mesh.add(meshfrontRightTires);
    this.mesh.add(meshbackLeftTires);
    this.mesh.add(meshbackRightTires);
    
    this.collidable = meshBody;
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
    this.distance = 100; 

    var meshBody = BoxGeom(160, 30, 50, Colors.police, -20, 30, 0);
    var meshRoof = BoxGeom(120, 30, 45, Colors.police2, 0, 60, 0);
    var headLightLeft = BoxGeom(5, 5, 5, Colors.white, 60, 35, 15);
    var headLightRight = BoxGeom(5, 5, 5, Colors.white, 60, 35, -15);
    var tailLightLeft = BoxGeom(5, 5, 10, Colors.red, -100, 35, 21);
    var tailLightRight = BoxGeom(5, 5, 10, Colors.red, -100, 35, -21);
    var meshleftWindow = BoxGeom(40, 20, 3, Colors.black, 0, 55, 22, true);
    var meshrightWindow = BoxGeom(40, 20, 3, Colors.black, 0, 55, -22, true);
    var meshleftDoor = BoxGeom(30, 30, 3, Colors.blue, 0, 30, 25);
    var meshrightDoor = BoxGeom(30, 30, 3, Colors.blue, 0, 20, -25);
    var meshleftHandleDoor = BoxGeom(10, 3, 3, Colors.brown, -5, 28, 27);
    var meshrightHandleDoor = BoxGeom(10, 3, 3, Colors.brown, -5, 28, -27);
    var meshfrontLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, 15);
    var meshfrontRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, -15);
    var meshbackLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -60, 8, 15);
    var meshbackRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, -60, 8, -15);

    var signal1 = BoxGeom(15, 7, 15, Colors.red, 40, 79, 20);
    var signal2 = BoxGeom(15, 7, 15, Colors.police, 40, 79, -10);

    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);

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
    this.mesh.add(meshleftWindow);
    this.mesh.add(meshrightWindow);
    this.mesh.add(meshleftDoor);
    this.mesh.add(meshrightDoor);
    this.mesh.add(meshleftHandleDoor);
    this.mesh.add(meshrightHandleDoor);
    this.mesh.add(meshfrontLeftTires);
    this.mesh.add(meshfrontRightTires);
    this.mesh.add(meshbackLeftTires);
    this.mesh.add(meshbackRightTires);
    
    this.collidable = meshBody;
}

function CarVersion3() {
    this.mesh = new THREE.Object3D();
    this.distance = 100; 

    var meshBody = BoxGeom(130, 30, 50, Colors.carv3, 60, 30, 100);
    var meshRoof = BoxGeom(60, 30, 45, Colors.carv3, 70, 60, 100);
    var meshBumper = BoxGeom(90, 10, 45, Colors.brownDark, 70, 30, 100);

    var headLightLeft = BoxGeom(5, 5, 5, Colors.white, 126, 35, 15+100);
    var headLightRight = BoxGeom(5, 5, 5, Colors.white, 126, 35, -15+100);
    var tailLightLeft = BoxGeom(5, 5, 10, Colors.black, -5, 35, 21+100);
    var tailLightRight = BoxGeom(5, 5, 10, Colors.black, -5, 35, -21+100);
    var meshGrate = BoxGeom(5, 5, 15, Colors.brownDark, 110, 35, 0+100);
    var meshfrontWindow = BoxGeom(3, 20, 35, Colors.white, 100, 55, 0+100, true);
    var meshbackWindow = BoxGeom(3, 20, 35, Colors.white, 40, 55, 0+100, true);
    var meshleftWindow = BoxGeom(40, 20, 3, Colors.white, 70, 55, 22+100, true);
    var meshrightWindow = BoxGeom(40, 20, 3, Colors.white, 70, 55, -22+100, true);
    var meshleftDoor = BoxGeom(30, 30, 3, Colors.carv3, 70, 30, 25+100);
    var meshrightDoor = BoxGeom(30, 30, 3, Colors.carv3, 70, 20, -25+100);
    var meshleftHandleDoor = BoxGeom(10, 3, 3, Colors.brown, 65, 28, 27+100);
    var meshrightHandleDoor = BoxGeom(10, 3, 3, Colors.brown, 65, 28, -27+100);
    var meshfrontLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 100, 8, 15+100);
    var meshfrontRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 100, 8, -15+100);
    var meshbackLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, 15+100);
    var meshbackRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, -15+100);

    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
    this.mesh.add(meshBumper);  
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(meshGrate);
    this.mesh.add(meshfrontWindow);
    this.mesh.add(meshbackWindow);
    this.mesh.add(meshleftWindow);
    this.mesh.add(meshrightWindow);
    this.mesh.add(meshleftDoor);
    this.mesh.add(meshrightDoor);
    this.mesh.add(meshleftHandleDoor);
    this.mesh.add(meshrightHandleDoor);
    this.mesh.add(meshfrontLeftTires);
    this.mesh.add(meshfrontRightTires);
    this.mesh.add(meshbackLeftTires);
    this.mesh.add(meshbackRightTires);

    this.collidable = meshBody;

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
    this.distance = 100; 

    var meshBody = BoxGeom(130, 20, 50, Colors.jeep, 60, 30, 100);
    var meshBody1 = BoxGeom(50, 15, 50, Colors.jeep, 100, 46, 100);
    var meshBody2 = BoxGeom(50, 15, 50, Colors.jeep, 10, 46, 100);
    var meshBody2 = BoxGeom(50, 15, 50, Colors.jeep, 10, 46, 100);
    //var rail1 = CylinderGeom(1, 30, 30, 4, Colors.green, 0, 90, 0);
    var rail1 = BoxGeom(2, 40, 1, Colors.jeep, 75, 65, 75);
    var rail2 = BoxGeom(2, 40, 1, Colors.jeep, 75, 65, 125);
    var rail3 = BoxGeom(2, 2, 50, Colors.jeep, 95, 105, 125);

    var rail4 = BoxGeom(2, 40, 1, Colors.jeep, 35, 65, 75);
    var rail5 = BoxGeom(2, 40, 1, Colors.jeep, 35, 65, 125);
    var rail6 = BoxGeom(2, 2, 50, Colors.jeep, 56, 105, 125);

    var sit1 = BoxGeom(5, 30, 15, Colors.black, 60, 70, 200+5-80);
    var sit2 = BoxGeom(20, 4, 20, Colors.black, 60, 50, 200-80);

    var sit3 = BoxGeom(5, 30, 15, Colors.black, 60, 70, 200+5-105);
    var sit4 = BoxGeom(20, 4, 20, Colors.black, 60, 50, 200-105);

    var meshBumper = BoxGeom(90, 10, 45, Colors.brownDark, 70, 30, 100);

    var headLightLeft = BoxGeom(5, 5, 5, Colors.white, 126, 35, 15+100);
    var headLightRight = BoxGeom(5, 5, 5, Colors.white, 126, 35, -15+100);
    var tailLightLeft = BoxGeom(5, 5, 10, Colors.black, -5, 35, 21+100);
    var tailLightRight = BoxGeom(5, 5, 10, Colors.black, -5, 35, -21+100);
    var meshGrate = BoxGeom(5, 5, 15, Colors.brownDark, 110, 35, 0+100);
    var meshleftDoor = BoxGeom(30, 30, 3, Colors.jeep, 70, 30, 25+100);
    var meshrightDoor = BoxGeom(30, 30, 3, Colors.jeep, 70, 20, -25+100);
    var meshleftHandleDoor = BoxGeom(10, 3, 3, Colors.brown, 65, 28, 27+100);
    var meshrightHandleDoor = BoxGeom(10, 3, 3, Colors.brown, 65, 28, -27+100);
    var meshfrontLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 100, 8, 15+100);
    var meshfrontRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 100, 8, -15+100);
    var meshbackLeftTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, 15+100);
    var meshbackRightTires = TireGeom(10, 10, 10, 32, Colors.brownDark, 20, 8, -15+100);

    this.mesh.add(meshBody);
    this.mesh.add(meshBody1);
    this.mesh.add(meshBody2);
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
    this.mesh.add(meshBumper);  
    this.mesh.add(headLightLeft);
    this.mesh.add(headLightRight);
    this.mesh.add(tailLightLeft);
    this.mesh.add(tailLightRight);
    this.mesh.add(meshGrate);
    this.mesh.add(meshleftDoor);
    this.mesh.add(meshrightDoor);
    this.mesh.add(meshleftHandleDoor);
    this.mesh.add(meshrightHandleDoor);
    this.mesh.add(meshfrontLeftTires);
    this.mesh.add(meshfrontRightTires);
    this.mesh.add(meshbackLeftTires);
    this.mesh.add(meshbackRightTires);

    this.collidable = meshBody;

}

function createJeep(x, z, rotation) {
    carjeep = new Jeep();
    carjeep.mesh.position.set(x, 0, z);
    carjeep.mesh.rotation.y = (Math.PI/2) * rotation;
    scene.add(carjeep.mesh);
    collidableCars.push(carjeep.collidable);

}

function createCar() {
    car = new MainCar();
    scene.add(car.mesh);
}

function Tree() {

    this.mesh = new THREE.Object3D();
    var top = CylinderGeom(1, 30, 30, 4, Colors.green, 0, 90, 0);
    var mid = CylinderGeom(1, 40, 40, 4, Colors.green, 0, 70, 0);
    var bottom = CylinderGeom(1, 50, 50, 4, Colors.green, 0, 40, 0);
    var trunk = CylinderGeom(10, 10, 30, 32, Colors.brownDark, 0, 0, 0);

    this.mesh.add(top);
    this.mesh.add(mid);
    this.mesh.add(bottom);
    this.mesh.add(trunk);

    this.collidable = bottom;
}


function addTree(x, z, scale, rotation) {
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
    this.distance = 100; 
    
    var roadMesh = BoxGeom(200, 2, 600, Colors.white, 126, 0, 10);
    var roadBlackcenter = BoxGeom(10, 2, 600, Colors.black, 126, 0.5, 10);
    var roadBlackleft = BoxGeom(10, 2, 600, Colors.black, 30, 0.5, 10);
    var roadBlackright = BoxGeom(10, 2, 600, Colors.black, 220, 0.5, 10);

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
    //console.log("road distance is ", road.distance);
}


// Parking

function Parking() {
    this.mesh = new THREE.Object3D();
    this.distance = 200; 
    var parkMesh = BoxGeom(1800, 0, 750, Colors.red, 1500, 0, 0);
    var p1 = BoxGeom(20, 60, 0, Colors.yellow, 650, 0, 0);
    var p2 = BoxGeom(20, 60, 0, Colors.yellow, 750, 0, 0);
    var p3 = BoxGeom(20, 60, 0, Colors.yellow, 850, 0, 0);
    var p4 = BoxGeom(20, 60, 0, Colors.yellow, 950, 0, 0);
    var p5 = BoxGeom(20, 60, 0, Colors.yellow, 1050, 0, 0);
    var p6 = BoxGeom(20, 60, 0, Colors.yellow, 1150, 0, 0);
    var p7 = BoxGeom(20, 60, 0, Colors.yellow, 1250, 0, 0);
    var p8 = BoxGeom(20, 60, 0, Colors.yellow, 1350, 0, 0);
    var p9 = BoxGeom(20, 60, 0, Colors.yellow, 1450, 0, 0);
    var p10 = BoxGeom(20, 60, 0, Colors.yellow, 1550,0, 0);

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
    this.distance = 100;

    var meshBody = BoxGeom(7, 200, 7, Colors.cement, 0, 0, -40);
    var pole = BoxGeom(30, 5, 5, Colors.cement, 20, 90, -40);
    var pole1 = BoxGeom(30, 5, 5, Colors.cement, 10, 80, -40);
    var lightpole = BoxGeom(10, 5, 5, Colors.red, 30, 86, -40);


    pole1.rotation.z = (Math.PI/2) - 45;

    var pointligghtPole = new THREE.PointLight(Colors.red, 100, 100);
    pointligghtPole.position.set(30, 86, -40);
    //headLightLeftLight.visible=false;
    this.mesh.add(pointligghtPole);

    this.mesh.add(meshBody);
    this.mesh.add(pole);
    this.mesh.add(pole1);
    this.mesh.add(lightpole);
    this.collidable = meshBody;
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
    this.distance = 100;


    var meshBody0 = BoxGeom(5, 150, 5, Colors.black, 0, 0, 0);
    var meshBody = BoxGeom(15, 30, 10, Colors.black, 0, 80, 0);
    var red = BoxGeom(5, 5, 2, Colors.red, 0, 95, 10);
    var yellow = BoxGeom(5, 5, 2, Colors.yellow, 0, 85, 10);
    var green = BoxGeom(5, 5, 2, Colors.green, 0, 75, 10);

    var light = new THREE.PointLight(Colors.red, 1, 100);
    light.position.set(4, 95, 10);

    this.mesh.add(meshBody0);
    this.mesh.add(meshBody);
    this.mesh.add(red);
    this.mesh.add(yellow);
    this.mesh.add(green);
    this.mesh.add(light);

    this.collidable = meshBody0;

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
    ground = BoxGeom(5000, 20, 5000, Colors.greenDark, 0, -10, 0);
    scene.add(ground);
}


/**
 * Template for fuel container
 */
function Fuel() {
    this.mesh = new THREE.Object3D();
    this.distance = 100;

    var slab = BoxGeom(50, 5, 50, Colors.brown, 0, 0, 0);
    var meshBody = BoxGeom(20, 100, 15, Colors.red, 0, 0, 0);
    var leftArm = BoxGeom(3, 80, 10, Colors.red, 12.5, 0, 0);
    var rightArm = BoxGeom(3, 80, 10, Colors.red, -12.5, 0, 0);
    var frontWindow = BoxGeom(10, 10, 2, Colors.blue, 0, 35, 10);
    var backWindow = BoxGeom(10, 10, 2, Colors.blue, 0, 35, -10);
    var frontBox = BoxGeom(8, 8, 3, Colors.red, 0, 15, 10);
    var backBox = BoxGeom(8, 8, 3, Colors.red, 0, 15, -10);
    var head = TireGeom(10, 10, 5, 32, Colors.red, 0, 60, 0);
    var headHighlight = TireGeom(6, 6, 8, 32, Colors.golden, 0, 60, 0);

    var light = new THREE.PointLight(0xffcc00, 1, 100);
    light.position.set(0, 60, 0);

    this.mesh.add(slab);
    this.mesh.add(meshBody);
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

function addFuel(x, z) {
    fuel = new Fuel();
    fuel.mesh.position.set(x, 0, z);
    scene.add(fuel.mesh);

    collidableFuels.push(fuel.collidable);
}

/*** BUILDINGS  ***/

function Building() {
    this.mesh = new THREE.Object3D();
    this.distance = 100;

    var meshBody = BoxGeom(100, 550, 150, Colors.cement, 0, 0, -40);
    var meshRoof = BoxGeom(90, 50, 140, Colors.brick, 0, 260, -40);

    var windows1 = BoxGeom(0, 40, 20, Colors.red, -50, 0, 0);
    var windows2 = BoxGeom(0, 40, 20, Colors.red, -50, 60, 0);
    var windows3 = BoxGeom(0, 40, 20, Colors.red, -50, 120, 0);
    var windows4 = BoxGeom(0, 40, 20, Colors.red, -50, 180, 0);
    var windows5 = BoxGeom(0, 40, 20, Colors.red, -50, 240, 0);

    var windows6 = BoxGeom(0, 40, 20, Colors.red, -50, 0, -90);
    var windows7 = BoxGeom(0, 40, 20, Colors.red, -50, 60, -90);
    var windows8 = BoxGeom(0, 40, 20, Colors.red, -50, 120, -90);
    var windows9 = BoxGeom(0, 40, 20, Colors.red, -50, 180, -90);
    var windows10 = BoxGeom(0, 40, 20, Colors.red, -50, 240, -90);

    var windows11 = BoxGeom(0, 40, 20, Colors.red, 50, 0, 0);
    var windows12 = BoxGeom(0, 40, 20, Colors.red, 50, 60, 0);
    var windows13 = BoxGeom(0, 40, 20, Colors.red, 50, 120, 0);
    var windows14 = BoxGeom(0, 40, 20, Colors.red, 50, 180, 0);
    var windows15 = BoxGeom(0, 40, 20, Colors.red, 50, 240, 0);


    var windows16 = BoxGeom(0, 40, 20, Colors.red, 50, 0, -90);
    var windows17 = BoxGeom(0, 40, 20, Colors.red, 50, 60, -90);
    var windows18 = BoxGeom(0, 40, 20, Colors.red, 50, 120, -90);
    var windows19 = BoxGeom(0, 40, 20, Colors.red, 50, 180, -90);
    var windows20 = BoxGeom(0, 40, 20, Colors.red, 50, 240, -90);


    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
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

    this.collidable = meshBody;    //car wont pass inside of object
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
    this.distance = 100;

    var meshBody = BoxGeom(100, 350, 150, Colors.brick, 0, 0, -40);
    var meshRoof = BoxGeom(90, 50, 140, Colors.cement, 0, 160, -40);

    var windows1 = BoxGeom(0, 40, 20, Colors.red, -50, 0, 0);
    var windows2 = BoxGeom(0, 40, 20, Colors.red, -50, 60, 0);
    var windows3 = BoxGeom(0, 40, 20, Colors.red, -50, 120, 0);

    var windows6 = BoxGeom(0, 40, 20, Colors.red, -50, 0, -90);
    var windows7 = BoxGeom(0, 40, 20, Colors.red, -50, 60, -90);
    var windows8 = BoxGeom(0, 40, 20, Colors.red, -50, 120, -90);

    var windows11 = BoxGeom(0, 40, 20, Colors.red, 50, 0, 0);
    var windows12 = BoxGeom(0, 40, 20, Colors.red, 50, 60, 0);
    var windows13 = BoxGeom(0, 40, 20, Colors.red, 50, 120, 0);

    var windows16 = BoxGeom(0, 40, 20, Colors.red, 50, 0, -90);
    var windows17 = BoxGeom(0, 40, 20, Colors.red, 50, 60, -90);
    var windows18 = BoxGeom(0, 40, 20, Colors.red, 50, 120, -90);

    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
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

    this.collidable = meshBody;    //car wont pass inside of object
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
    this.distance = 100;

    var meshBody = BoxGeom(100, 350, 150, Colors.white, 0, 0, -40);
    var meshRoof = BoxGeom(90, 50, 140, Colors.brick, 0, 160, -40);

    var windows1 = BoxGeom(0, 40, 20, Colors.blue, -50, 0, 0);
    var windows2 = BoxGeom(0, 40, 20, Colors.blue, -50, 60, 0);
    var windows6 = BoxGeom(0, 40, 20, Colors.blue, -50, 0, -90);
    var windows7 = BoxGeom(0, 40, 20, Colors.blue, -50, 60, -90);

    var windows3 = BoxGeom(10, 40, 0, Colors.red, -50, 120, -30);
    var windows8 = BoxGeom(10, 40, 0, Colors.red, -50, 120, -50);
    var windows9 = BoxGeom(10, 0, 20, Colors.red, -50, 120, -40);
    
    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(windows6);
    this.mesh.add(windows7);

    this.mesh.add(windows3);
    this.mesh.add(windows8);
    this.mesh.add(windows9);

    this.collidable = meshBody;    //car wont pass inside of object
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
    this.distance = 100;

    var meshBody = BoxGeom(50, 60, 60, Colors.white, 0, 0, -40);
    var meshRoof = CylindermeshRoofGeom(5, 50, 60, 4, Colors.brick, 0, 59, -40);
    
    var windows1 = BoxGeom(0, 20, 5, Colors.blue, -30, 0, -20);
    var windows2 = BoxGeom(0, 20, 5, Colors.blue, -30, 0, -50);

    var door = BoxGeom(8, 30, 10, Colors.brick, -22, -10, -37);
    
    this.mesh.add(meshBody);
    this.mesh.add(meshRoof);
    this.mesh.add(windows1);
    this.mesh.add(windows2);
    this.mesh.add(door);

    this.collidable = meshBody;    //car wont pass inside of object
}

/**
 * Template for fuel container
 */
function Bin() {
    this.mesh = new THREE.Object3D();
    this.distance = 100;

    var layer = BoxGeom(50, 5, 50, Colors.grey, 0, 5, 0);
    var wall1 = BoxGeom(2, 100, 50, Colors.grey, -25, 5, 0);
    var wall2 = BoxGeom(52, 100, 2, Colors.grey, 0, 5, 25);
    var wall3 = BoxGeom(52, 100, 2, Colors.grey, 0, 5, -25);
    var wall4 = BoxGeom(2, 100, 50, Colors.grey, 25, 5, 0);
    var handle1 = BoxGeom(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = BoxGeom(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = BoxGeom(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = BoxGeom(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = TireGeom(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = TireGeom(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = TireGeom(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = TireGeom(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

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
    this.distance = 100;

    var layer = BoxGeom(50, 5, 50, Colors.yellow, 0, 5, 0);
    var wall1 = BoxGeom(2, 100, 50, Colors.yellow, -25, 5, 0);
    var wall2 = BoxGeom(52, 100, 2, Colors.yellow, 0, 5, 25);
    var wall3 = BoxGeom(52, 100, 2, Colors.yellow, 0, 5, -25);
    var wall4 = BoxGeom(2, 100, 50, Colors.yellow, 25, 5, 0);
    var handle1 = BoxGeom(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = BoxGeom(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = BoxGeom(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = BoxGeom(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = TireGeom(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = TireGeom(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = TireGeom(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = TireGeom(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

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
    this.distance = 100;

    var layer = BoxGeom(50, 5, 50, Colors.green, 0, 5, 0);
    var wall1 = BoxGeom(2, 100, 50, Colors.green, -25, 5, 0);
    var wall2 = BoxGeom(52, 100, 2, Colors.green, 0, 5, 25);
    var wall3 = BoxGeom(52, 100, 2, Colors.green, 0, 5, -25);
    var wall4 = BoxGeom(2, 100, 50, Colors.green, 25, 5, 0);
    var handle1 = BoxGeom(2, 5, 40, Colors.black, -26, 40, 0);
    var handle2 = BoxGeom(2, 5, 40, Colors.black, 26, 40, 0);
    var handle3 = BoxGeom(40, 5, 2, Colors.black, 0, 40, -30);
    var handle4 = BoxGeom(40, 5, 2, Colors.black, 0, 40, 30);
    var tire1 = TireGeom(5, 5, 0, 30, Colors.black, -25, 5, -27);
    var tire2 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, -27);
    var tire3 = TireGeom(5, 5, 0, 30, Colors.black, -26, 5, 27);
    var tire4 = TireGeom(5, 5, 0, 30, Colors.black, 26, 5, 27);
    var pin1 = TireGeom(1, 5, 0, 30, Colors.lightgray, -25, 5, -27);
    var pin2 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, -27);
    var pin3 = TireGeom(1, 5, 0, 30, Colors.lightgray, -26, 5, 27);
    var pin4 = TireGeom(1, 5, 0, 30, Colors.lightgray, 26, 5, 27);

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


function addTreestoScene() { 
    var x, z, scale, rotate, delay;
    for (var i = 0; i < 150; i++) {
        x = Math.random() * -5500 + 3000;
        z = Math.random() * -5000 + 2300;
        scale = Math.random() * 1 + 0.5;
        rotate = Math.random() * Math.PI * 2;
        delay = 2000 * Math.random();

        var treePosinScene = new THREE.Vector3(x, 0, z);
        // if (treePosinScene.distanceTo(car.mesh.position) < car.distance || treePosinScene.distanceTo(road.mesh.position) < road.distance * 20 || 
        //     treePosinScene.distanceTo(fuel.mesh.position) < fuel.distance || treePosinScene.distanceTo(building.mesh.position) < building.distance || treePosinScene.distanceTo(carjeep.mesh.position) < carjeep.distance 
        //     || treePosinScene.distanceTo(carv2.mesh.position) < carv2.distance || treePosinScene.distanceTo(carv3.mesh.position) < carv3.distance) {
        //     continue;
        // }


        if (treePosinScene.distanceTo(car.mesh.position) < car.distance || 
            treePosinScene.distanceTo(fuel.mesh.position) < fuel.distance || treePosinScene.distanceTo(building.mesh.position) < building.distance || treePosinScene.distanceTo(carjeep.mesh.position) < carjeep.distance 
            || treePosinScene.distanceTo(carv2.mesh.position) < carv2.distance || treePosinScene.distanceTo(carv3.mesh.position) < carv3.distance || treePosinScene.distanceTo(road.mesh.position) < road.distance  ) {
            continue;
        }
        var tree = addTree(x, z, 0.01, rotate);

        setTimeout(function (object, scale) {
            increaseHeight(object, 50, 10, scale);
        }.bind(this, tree.mesh, scale), delay);

        collidableTrees.push(tree.collidable);
    }
}

function removeTreesfromScene() {
    for (let tree of trees) {
        scale = tree.mesh.scale.x;
        delay = delay = 2000 * Math.random();
        setTimeout(function (object, scale) {
            decreaseHeight(object, 25, -10, scale);
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
increaseHeight(pole.mesh, 50, 10, 1);

// Overloads fragment shader
// // Pole 2
// var x = -70;
// var y = -550;
// createPole(x, y, 2);
// increaseHeight(pole.mesh, 50, 10, 1);
}

function endPoles() {
    scale = pole.mesh.scale.x;
    decreaseHeight(pole.mesh, 25, -10, scale);
}

// Traffic Lights

function createTrafficLights() {
// Traffic Light 1
var x = -70;
var y = -210;
createTrafficLight(x, y, 0);
increaseHeight(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 2
// var x = -70;
// var y = -710;
// createTrafficLight(x, y, 0);
// increaseHeight(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 3
// var x = 520;
// var y = -710;
// createTrafficLight(x, y, 0);
// increaseHeight(trafficLight.mesh, 50, 10, 1);

// // Traffic Light 4
// var x = 520;
// var y = -210;
// createTrafficLight(x, y, 0);
// increaseHeight(trafficLight.mesh, 50, 10, 1);   

}

function endTrafficLights() {
    scale = trafficLight.mesh.scale.x;
    decreaseHeight(trafficLight.mesh, 25, -10, scale);
}

function addFuelstoScene() {
    var x = Math.random() * 600 - 300;
    var y = Math.random() * 400 - 200;
    addFuel(x, y);
    increaseHeight(fuel.mesh, 50, 10, 1);
}

function removeFuelsfromScene() {
    scale = fuel.mesh.scale.x;
    decreaseHeight(fuel.mesh, 25, -10, scale);
}

function createBuildings() {
    var x = -1500;
    var y = -1800;
    createBuilding(x, y, 0);
    increaseHeight(building.mesh, 50, 10, 1);

    var x = -1200;
    var y = -580;
    createBuilding(x, y, 2);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -1460;
    var y = 550;
    createBuilding(x, y, 0);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -1500;
    var y = -1800;
    createBuilding(x, y, 0);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -800;
    var y = -500;
    createBuilding4(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -600;
    var y = -500;
    createBuilding4(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -400;
    var y = -500;
    createBuilding(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 200;
    var y = -480;
    createBuildingHospital(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 563;
    var y = 640;
    createBuildingHospital(x, y, 0);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 100;
    var y = 200;
    createHouse(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 180;
    var y = 200;
    createHouse(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 260;
    var y = 200;
    createHouse(x, y, 1);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 550;
    var y = -550;
    createHouse(x, y, 0);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = 550;
    var y = -450;
    createHouse(x, y, 0);
    increaseHeight(building.mesh, 40, 10, 1);

    var x = -300;
    var y = 120;
    createHouse(x, y, 2);
    increaseHeight(building.mesh, 40, 10, 1);
}

function endBuildings() {
    scale = building.mesh.scale.x;
    decreaseHeight(building.mesh, 25, -10, scale);
}

function createCarV2() {
    var x = -400;
    var y = 400;
    createCarVersion2(x, y);
    increaseHeight(carv2.mesh, 50, 10, 1);

    var x = -600;
    var y = -300;
    createCarVersion2(x, y);
    increaseHeight(carv2.mesh, 50, 10, 1);

    var x = -220;
    var y = -500;
    createCarVersion3(x, y, 1);
    increaseHeight(carv2.mesh, 50, 10, 1);

    // Police Car create
    var x = 316;
    var y = -277;
    createPoliceCar(x, y);
    increaseHeight(carv2.mesh, 50, 10, 1);


    var x = -100;
    var y = -350;
    createJeep(x, y, 0);
    increaseHeight(carjeep.mesh, 50, 10, 1);
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
    increaseHeight(trashbin.mesh, 40, 10, 1);
    var x = 250;
    var y = -200;
    createbin1(x, y, 4, 4, 4);
    increaseHeight(trashbin1.mesh, 40, 10, 1);
    var x = 200;
    var y = -200;
    createbin2(x, y, 4, 4, 4);
    increaseHeight(trashbin2.mesh, 40, 10, 1);
 
}
function endBin() {
    scale = trashbin.mesh.scale.x;
    decreaseHeight(trashbin.mesh, 25, -10, scale);
}
