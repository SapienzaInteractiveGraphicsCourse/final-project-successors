

function createLevel() {

    createFuels();
    createRoads();
    createParkings();
    createBuildings();
    createPoles();
    createTrafficLights();
    createBins();
    createCarV2();
    createTrees();
    startTimer();
}

function endLevel() {
    endFuels();
    endBin();
    endPoles();
    endTrafficLights();
    endBuildings();
    endTrees();
    updateStatus();
    stopTimer();
    setTimeout(createLevel, 100);
}

function pauseMenu() {
    console.log("This is for testing.");

    car.stopForward();
    car.stopBackward();
    car.stopLeft();
    car.stopRight();
    var paused = "Pause Menu";

    //add car movable or not 

    $("#pausemenu").html(paused);
    $("#pausemenu").css({"padding":"20px"});

    $("#pausemenu").append("<div class='btn-group-vertical'>")
    $("#pausemenu").append("<button id='btn'>"+ "Resume" + "</button>");
    $("#pausemenu").append("<button id='btn'>"+ "Instructions" + "</button>");

    $("#btn").click(function(){
        $("#pausemenu").html("Resumed!");
    });

    setTimeout(function () {
        $("#pausemenu").fadeOut(1000);
    }, 2000);

    car.moveForward();
    car.moveBackward();
    car.turnLeft();
    car.turnRight();
}


function resetGame() {
    car.reset();

    // added in step 1
    resetTimer();

    // added in step 2
    fuelLeft = 100;

    // added in step 3
    if (score > record) {
        record = score;
        window.localStorage.setItem('record', record);
    }
    score = 0;

    updateScoreDisplay();
    updateRecordDisplay();
}

var time = 15;
var timer;

function startTimer() {
    time += 10;
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    time -= 1;
    updateTimeDisplay();

    // Added in step 2
    fuelLeft -= 5;
    updateFuelDisplay();

    if (time <= 0 || fuelLeft <= 0) {
        $("#gameover").html("Game over! Restarting");
        $("#gameover").css({"padding":"20px"});
        //$("#gameover").append("<button>Want to start again?</button>")

        setTimeout(function () {
            $("#gameover").fadeOut(1000);
        }, 2000);
        resetGame();
    }
}

function resetTimer() {
    stopTimer();
    startTimer();
}

function stopTimer() {
    clearInterval(timer);
}

var fuelLeft;

function updateStatus() {
    fuelLeft = Math.min(100, fuelLeft + 25);
    updateFuelDisplay();

    // added in step 3
    score += 1;
    updateScoreDisplay();
}


var score;
var record = window.localStorage.getItem('record', 0);


function updateTimeDisplay() {
    document.getElementById('time').innerHTML = time;
}

function updateFuelDisplay() {
    document.getElementById('fuel').style.width = fuelLeft.toString() + '%';
}

function updateScoreDisplay() {
    document.getElementById('score').innerHTML = score;
}

function updateRecordDisplay() {
    document.getElementById('record').innerHTML = record;
}