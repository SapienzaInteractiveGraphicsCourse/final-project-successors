
//creating levels 
function createLevel() {

    addFuelstoScene();
    createRoads();
    createParkings();
    createBuildings();
    createPoles();
    createTrafficLights();
    createBins();
    createCarV2();
    addTreestoScene();
    startTimer();
}

//ending levels 
function endLevel() {
    removeFuelsfromScene();
    //endBin();
    //endPoles();
    //endTrafficLights();
    //endBuildings();
    removeTreesfromScene();
    updateStatus();
    stopTimer();
    setTimeout(createLevel, 100);
}

function pauseMenu() {
    console.log("This is for testing.");
    var paused = "Pause Menu";

    $("#pausemenu").html(paused);
    $("#pausemenu").css({"padding":"20px"});

    $("#btn").click(function(){
        $("#pausemenu").html("Resumed!");
    });

    setTimeout(function () {
        $("#pausemenu").fadeOut(1000);
    }, 2000);
}


function resetGame() {
    car.reset();
    resetTimer();
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
    //add the jquery element here to reset timers
    startTimer();
}

function stopTimer() {
    //add jquery instead of function 
    clearInterval(timer);
}

var fuelLeft;

function updateStatus() {
    fuelLeft = Math.min(100, fuelLeft + 25);
    updateFuelDisplay();
    score += 1;
    updateScoreDisplay();
}


var score;
var record = window.localStorage.getItem('record', 0);


function updateTimeDisplay() {
    $("#time").html(time);
}


var isInstrShown = true; 
function getInstructions() {
    $("#instructionbutton").html("PRESS I OR HERE");
    $("#instructionbutton").click(function(){
        //alert("Wow, you clicked me");
        isInstrShown = !isInstrShown;
        instructionText();
    });
}

function instructionText() {

    if(isInstrShown) {
        $("#instructionText").append("<p>Press 'H' to enable car horn sound</p>");
        $("#instructionText").append("<p>Press 'E' to enable car engine start sound</p>");
        $("#instructionText").append("<p>Press 'R' to enable rain&snow.</p>");
        $("#instructionText").append("<p>Press 'N' to enable day&night.</p>");
        //$("#instructionText").append("<button id='close'>" + "Close" + "</button>");
        
        $("#close").click(function(){
            setTimeout(function () {
                $("#instructionText").fadeOut(1000);
            }, 500);
        });
    }    
    else if(!isInstrShown) {
        $("#instructionText").html("");
    }

}

getInstructions();

function updateFuelDisplay() {
    console.log(fuelLeft);
    //adding fuel to id
    document.getElementById('fuel').style.width = fuelLeft.toString() + '%';
}

function updateScoreDisplay() {
    $("#score").html(score);
}

function updateRecordDisplay() {
    $("#record").html(record);
}



