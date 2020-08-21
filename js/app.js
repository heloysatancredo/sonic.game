

//***************************************************
//******************** Variables ********************
//***************************************************

// Variables to get the context of the canvas
let myCanvas = document.getElementById('myCanvas');
const ctx = myCanvas.getContext("2d");

// Array to keep the items collected by the player
let itemsArr = [];

// Min and max speed for dropping the items
const minSpeed = 3;
const maxSpeed = 7;

// Global variables
let player1;
let ray;
let seconds;
let flag;
let playerImg = new Image(50, 50);


//***************************************************
//************** Building the Elements **************
//***************************************************

//********************** Players ********************

class Player {
    constructor(x, y) {
        this.xPos = x;
        this.yPos = y;
        this.size = 74; // player image size FIX
        this.stepSize = 30; // player step size
        this.lives = 2; // fixed value
        this.points = 0;
    }

    //Method to move the player to the left
    moveLeft() {
        if (this.xPos - this.stepSize < 0) {
            this.xPos = 0;
        } else {
            this.xPos -= this.stepSize;
        }
        clearScreen();
    }

    //Method to move the player to the right
    moveRight() {
        if (this.xPos + this.stepSize + this.size > myCanvas.width) {
            this.xPos = myCanvas.width - this.size;
        } else {
            this.xPos += this.stepSize;
        }
        clearScreen();
    }

    //Method to initialize the player
    init() {
        this.drawPlayer();
        window.addEventListener('keydown', (e) => {
            // Commom commands
            if (e.keyCode === 37) {
                this.moveLeft();
            } else if (e.keyCode === 39) {
                this.moveRight();
            }
            // Specific commands
            if (player1 instanceof Sonic) {
                if (e.keyCode === 38) {
                    this.moveUp();
                } else if (e.keyCode === 40) {
                    this.moveDown();
                }
            } else { // case Tails
                if (e.keyCode === 38) {
                    this.shoot();
                }
            }
        })
    }

}

class Sonic extends Player {
    constructor(x, y) {
        super(x, y);
    }

    //Method to draw Sonic
    drawPlayer() {
        playerImg.src = "./img/sonicFinal.png";
        ctx.drawImage(playerImg, this.xPos, this.yPos);
    }

    //Method to move the player up
    moveUp() {
        if (this.yPos - this.stepSize < 0) {
            this.yPos = 0;
        } else {
            this.yPos -= this.stepSize;
        }
        clearScreen();
    }

    //Method to move the player down
    moveDown() {
        if (this.yPos + this.size + this.stepSize > myCanvas.height) {
            this.yPos = myCanvas.height - this.size;
        } else {
            this.yPos += this.stepSize;
        }
        clearScreen();
    }
}

class Tails extends Player {
    constructor(x, y) {
        super(x, y);
    }

    //Method to draw Tails
    drawPlayer() {
        playerImg.src = "./img/tailsFinal.png";
        ctx.drawImage(playerImg, this.xPos, this.yPos);
    }

    //Method to shoot the ray
    shoot() {
        ray = new Ray;
        ray.drawItem();
        hitShoot();
    }
}



//********************** Items ********************

class Item {
    constructor() {
        this.size = 50;
        this.xPos = Math.floor(Math.random() * (myCanvas.width - this.size));
        this.yPos = 0;
        this.speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
    }

    //Method to move the items down
    moveDown() {
        this.yPos += this.speed;
    }
}

class YellowRing extends Item {
    constructor() {
        super();
    }

    //Method to draw Yellow Ring
    drawItem() {
        const yellowRingImg = new Image(30, 30);
        yellowRingImg.src = "./img/yellowRingFinal.png";
        ctx.drawImage(yellowRingImg, this.xPos, this.yPos);
    }
}

class SpecialRing extends Item {
    constructor() {
        super();
    }

    //Method to draw Special Ring
    drawItem() {
        const specialRingImg = new Image(30, 30);
        specialRingImg.src = "./img/specialRingFinal.png";
        ctx.drawImage(specialRingImg, this.xPos, this.yPos);
    }
}

class Enemy extends Item {
    constructor() {
        super();
    }

    //Method to draw Enemy
    drawItem() {
        const enemyImg = new Image(30, 30);
        enemyImg.src = "./img/enemyFinal.png";
        ctx.drawImage(enemyImg, this.xPos, this.yPos);
    }
}

//********************** Ray ********************

class Ray {
    constructor() {
        this.size = 10;
        this.extension = myCanvas.height - player1.size;
        this.xPos = player1.xPos + (player1.size/2 - this.size/2);
        this.yPos = 0;
    }

    //Method to draw Ray
    drawItem() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.xPos, this.yPos, this.size, this.extension);
    }
}

//***************************************************
//******************** Functions ********************
//***************************************************

// Function to start the game
let startGame = () => {

    $("#player").css("display", "none");
    $("#game").css("display", "flex");
    player1.init();
    countdown();
    flag = false;

    // Function to create the items and push them into the Array
    setInterval(() => {
        const prob = Math.floor(Math.random() * 10);
        if (prob < 2) {
            itemsArr.push(new SpecialRing);
        } else if (prob >= 2 && prob < 5) {
            itemsArr.push(new Enemy);
        } else {
            itemsArr.push(new YellowRing);
        }
    }, 900);


    // Function to make the items move down, clear the screen, redraw
    setInterval(() => {
        if (player1.lives > 0) {
            for (let i = 0; i < itemsArr.length; i++) {
                itemsArr[i].moveDown();
            }
            clearScreen();
        }
    }, 100);
}

// Function to clear the screen
const clearScreen = () => {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    redraw();
    $('#points').html(player1.points);
    $('#lives').html(player1.lives);
}

// Function to detect when a ray hits an enemy
const hitShoot = () => {
    const sX = ray.xPos;
    const sY = ray.yPos;
    const sSize = ray.size;
    const sExt = ray.extension;

    for (let i = 0; i < itemsArr.length; i++) {
        let iX = itemsArr[i].xPos;
        let iY = itemsArr[i].yPos;
        let iSize = itemsArr[i].size;

        // Detect Collision
        if ( // case there is collision
            sX < iX + iSize &&
            sX + sSize > iX &&
            sY < iY + iSize &&
            sY + sExt > iY
        ) {

            // Checking the item type to define which result it will bring to the player
            if (itemsArr[i] instanceof Enemy) {
                itemsArr.splice(i, 1);
            }
        }
    }
}

// Function to redraw
const redraw = () => {
    player1.drawPlayer();

    // Variables to get player position and size
    const pX = player1.xPos;
    const pY = player1.yPos;
    const pSize = player1.size;

    // Variables to get items position and size.
    for (let i = 0; i < itemsArr.length; i++) {
        let iX = itemsArr[i].xPos;
        let iY = itemsArr[i].yPos;
        let iSize = itemsArr[i].size;

        // Detect Collision 
        if ( // case there is collision
            pX < iX + iSize &&
            pX + pSize > iX &&
            pY < iY + iSize &&
            pY + pSize > iY
        ) {

            // Checking the item type to define which result it will bring to the player
            if (itemsArr[i] instanceof YellowRing) {
                player1.points += 2;
            } else if (itemsArr[i] instanceof SpecialRing) {
                player1.points += 10;
            } else { // case Enemy
                player1.lives -= 1;
            }

            itemsArr.splice(i, 1); // Removing the object from the array, to not detected multiple collisions

            if (player1.points >= 50 && flag === false) {
                flag = true;
                seconds += 30;
            }

            if (player1.points >= 100) {
                setTimeout(() => {
                    alert("WELL DONE, YOU WIN!");
                }, 200);
                setTimeout(() => {
                    location.reload();
                }, 500);
            }

            if (player1.lives === 0) {
                setTimeout(() => {
                    alert("GAME OVER!");
                }, 200);
                setTimeout(() => {
                    location.reload();
                }, 500);
            }

        } else { // Case if there's NO collision / Garbage clean up
            if (iY >= myCanvas.height) {
                itemsArr.splice(i, 1);
            }
            itemsArr[i].drawItem();
        }
    }
}

// Timer Function
let countdown = () => {
    seconds = 60;
    let tick = () => {
        let counter = document.getElementById("counter");
        seconds--;
        counter.innerHTML = (seconds < 10 ? "0" : "") + String(seconds);
        if (seconds > 0) {
            setTimeout(tick, 1000);
        } else {
            setTimeout(() => {
                alert("GAME OVER!");
            }, 200);
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }
    tick();
}


//***************************************************
//***************** Event Listeners *****************
//***************************************************

$("#playerBtn").click(() => {
    //alert('test');
    if (document.getElementById('sonic').checked) {
        player1 = new Sonic(340, 800);
        startGame();
    } else if (document.getElementById('tails').checked) {
        player1 = new Tails(340, 800);
        startGame();
    } else {
        alert("Please choose a player");
    }
})


//******************* References ********************
// Code
// Inspiration: Denis game example in class
// Timer function: adapted from https://gist.github.com/adhithyan15/4350689

// Images
// Sonic: https://i.dlpng.com/static/png/1375092-sonic-the-hedgehog-transparent-png-image-sonic-the-hedgehog-png-3123_3168_preview.png
// Tails: http://images5.fanpop.com/image/photos/31400000/more-challange-miles-tails-prower-31419094-488-500.png
// Enemy: https://p7.hiclipart.com/preview/552/267/594/sonic-forces-sonic-the-hedgehog-sonic-unleashed-sonic-mania-shadow-the-hedgehog-infinity.jpg
// Yellow Ring: https://pngimage.net/wp-content/uploads/2018/06/sonic-ring-png-6.png
// Special Ring: https://i.dlpng.com/static/png/6361685_preview.png
// Keyboard arrows: https://i.ya-webdesign.com/images/arrow-keys-png-15.png