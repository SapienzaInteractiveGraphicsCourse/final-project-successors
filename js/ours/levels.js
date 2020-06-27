
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
    restartTimer();
}

//ending levels 
function endLevel() {
    removeFuelsfromScene();
    //endBin();
    //endPoles();
    //endTrafficLights();
    //endBuildings();
    removeTreesfromScene(); //still not sure if we need to respawn trees in different positions
    updateGameStatus();
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


function restartGame() {
    car.reset(); 
    resetTimer();
    fuelLeft = 100;

    // added in step 3
    if (currentScore > currentRecord) {
        currentRecord = currentScore;
        window.localStorage.setItem('record', currentRecord);
    }
    currentScore = 0;

    updatecurrentScoreDisplay();
    updatecurrentRecordDisplay();
}

var time = 15;
var timer;

function restartTimer() {
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
        restartGame();
    }
}

function resetTimer() {
    stopTimer();
    //add the jquery element here to reset timers
    restartTimer();
}

function stopTimer() {
    //add jquery instead of function 
    clearInterval(timer);//clears the timer 
}

function updateGameStatus() {
    fuelLeft = Math.min(100, fuelLeft + 25);
    updateFuelDisplay();
    currentScore += 1;
    updatecurrentScoreDisplay();
}


var currentScore;
var currentRecord = window.localStorage.getItem('record', 0);


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
        $("#instructionText").append("<p>Press 'L' to enable/disable car light.</p>");
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


/**
 * Fuel Display
 * 
 * NEXT FUNCTIONS ARE USED TO DISPLAY THE currentScore FUEL AND currentRecord FOR THE GAME
 * 
 */
function updateFuelDisplay() {
    console.log(fuelLeft);
    //adding fuel to id
    document.getElementById('fuel').style.width = fuelLeft.toString() + '%'; //apply jquery too
}

function updatecurrentScoreDisplay() {
    $("#score").html(currentScore);
}

function updatecurrentRecordDisplay() {
    $("#record").html(currentRecord);
}



