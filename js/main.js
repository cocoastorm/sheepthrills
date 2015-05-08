/*
* An object that holds all of our images, so images are only loaded once.
*/
var images = new function() {
    // define image
    this.sheep = new Image();
    //this.distraction = new Image();
    
    // Ensure all images have been loaded before starting.
    var numImages = 1;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded === numImages) {
            window.init();
        }
    };
    this.sheep.onload = function() {
        imageLoaded();
    };
    // set images src
    this.sheep.src = "img/sheep.png";
    //this.distraction.src = "img/distraction.png";
};

/*
* Base abstract class for all drawable objects in game. Sets up default values
* which all child objects will inherit, as well as any default functions.
*/
function Drawable() {
    // set up position on canvas
    this.init = function(x, y, width, height) {
        // Default variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    
    // Abstract draw method which must be implemented in child objects
    this.draw = function() {
    };
}

/*
* Creates the Background object. The background will be drawn on the canvas.
*/
function Background() {
    this.speed = 0; // speed set to zero since its not moving
    this.draw = function() {
        //disable for now, no background...
        //this.context.drawImage(images.background, this.x, this.y);
    };
}

// Set Background to inherit from Base.
Background.prototype = new Drawable();

/**
 * The Sheep object which is spawned in game. The sheeps are drawn
 * on the "main" canvas.
 */
function Sheep() {
    this.vx = 0;
    this.vy = 0;
    this.vx1 = Math.floor((Math.random() * 8) + 4);
    this.vy1 = Math.floor((Math.random() * 8) + 4);
    this.vx2 = Math.floor((Math.random() * -8) + 4);
    this.vy2 = Math.floor((Math.random() * -8) + 4);
    if(this.vx1 === 0)
        this.vx1 += 1;
    if(this.vx2 === 0)
        this.vx2 += 1;
    if(this.vy1 === 0)
        this.vy1 += 1;
    if(this.vy2 === 0)
        this.vy2 += 1;
    if(this.vy === 0)
        this.vy = 3;
    this.dirX = Math.floor((Math.random() * 2) + 1);
    this.dirY = Math.floor((Math.random() * 2) + 1);
    if(this.dirX === 1)
        this.vx = this.vx1;
    if(this.dirX === 2)
        this.vx = this.vx2;
    if(this.dirY === 1)
        this.vy = this.vy1;
    if(this.dirY === 1)
        this.vy = this.vy2;
    this.alive = false; // Is true if the sheep is currently in use
    /* Sets the sheep values */
    this.spawn = function(x, y) {
        this.x = x;
        this.y = y;
        this.alive = true;
    };
    /*
     * Draws the sheep by drawing the image taken from the images object.
     */
    this.draw = function() {
        this.context.drawImage(images.sheep, this.x, this.y, 100, 100);
        this.context.font = "30px Georgia";
        this.context.fillText("Bounce: " + game.bounces, 10, 30);
    };
    /*
    * Moves the sheep and bounces the sheep when it hits the walls.
    */
    this.move = function() {
    if(this.x + 100 < this.canvasWidth && this.y + 100 < this.canvasHeight && this.x > 0 && this.y > 0){
        this.x += this.vx;
        this.y += this.vy;
        this.erase();
        this.draw();
    }
        if(this.y + 105 > this.canvasHeight){
            this.y -= this.vy;
            this.vy *= -1;
            game.bounce();
        }
        if(this.x + 105 > this.canvasWidth){
            this.x -= this.vx;
            this.vx *= -1;
            game.bounce();
        }
        if(this.y  - 6 < 0){
            this.y += -this.vy;
            this.vy *= -1;
            game.bounce();
        }
        if(this.x - 6 < 0){
            this.x += -this.vx;
            this.vx *= -1;
            game.bounce();
        }
    };
    /*
    * Uses dirty rectangle to clear the sheep before redrawing.
    */
    this.erase = function() {
        this.context.clearRect(this.x - 6, this.y - 5, 106, 106);
        this.context.clearRect(0, 0, 160, 50);
    };
    /* Resets the sheep values */
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.alive = false;
    };
}
Sheep.prototype = new Drawable();

function Distraction() {
    this.alive = false;
    /* Sets up the distraction values */
    this.spawn = function(x, y) {
        this.x = x;
        this.y = y;
        this.alive = true;
    };
    /*
    * Draws the distraction by using the image from the images object.
    */
    this.draw = function() {
        //this.context.drawImage(images.distraction, this.x, this.y, 100, 100);
    };
    /*
    * Uses dirty rectangle to clear the distraction before redrawing.
    */
    this.erase = function() {
        this.context.clearRect(this.x, this.y, 101, 101);
    };
    /* Resets the sheep values */
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.alive = false;
    };
}
Distraction.prototype = new Drawable();


/*
* Main Game object which will hold everything for the game!
*/
function Game() {
    // keep track of bounces
    this.bounces = 0;
    this.bounce = function() {
        this.bounces++;
        if(this.bounces % 7 == 0)
            this.sheepSound.get();
    };
    
    this.init = function() {
        // these are our canvas
        this.mainCanvas = document.getElementById('main');
        // test for support
        if(this.mainCanvas.getContext) {
            // get context
            this.mainContext = this.mainCanvas.getContext('2d');
            // resize canvas!
            window.addEventListener('resize', resize, false);
            window.addEventListener('orientationchange', resize, false);
            resize();
            // initialize canvas
            Background.prototype.context = this.mainContext;
            Background.prototype.canvasWidth = this.mainCanvas.width;
            Background.prototype.canvasHeight = this.mainCanvas.height;
            Sheep.prototype.context = this.mainContext;
            Sheep.prototype.canvasWidth = this.mainCanvas.width;
            Sheep.prototype.canvasHeight = this.mainCanvas.height;
            Distraction.prototype.context = this.mainContext;
            Distraction.prototype.canvasWidth = this.mainCanvas.width;
            Distraction.prototype.canvasHeight = this.mainCanvas.height;
            // initialize background
            this.background = new Background();
            this.background.init(0,0);
            // initialise the sheep object
            this.sheep = new Sheep();
            this.shep = new Sheep();
            // set sheep to start in the middle
            var sheepStartX = Math.floor((Math.random() * (this.mainCanvas.width - 200)) + 1);
            var sheepStartY = Math.floor((Math.random() * (this.mainCanvas.height - 200)) + 1);
            this.sheep.spawn(sheepStartX, sheepStartY);
            this.sheep.draw();
            var shepStartX = Math.floor((Math.random() * (this.mainCanvas.width - 200)) + 1);
            var shepStartY = Math.floor((Math.random() * (this.mainCanvas.height - 200)) + 1);
            this.shep.spawn(shepStartX, shepStartY);
            this.shep.draw();
            // Audio files
            this.sheepSound = new SoundPool(10);
            this.sheepSound.init("sheep");
            this.bgm = new Audio("sounds/amok.mp3");
            this.bgm.loop = true;
            this.bgm.volume = .50;
            this.bgm.load();
            this.checkAudio = window.setInterval(function(){checkReadyState()}, 1000);            
            return true;
        } else {
            return false;
        }
    };

    // Start animation!
    this.start = function() {
        this.bgm.play();
        animate();
    };
}

/**
* Resizes the canvas according to the window.
*/
function resize() {
    var gameArea = document.getElementById('gameArea');
    var widthToHeight = 4/3;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
      // window width is too wide relative to desired game width
      newWidth = newHeight * widthToHeight;
      gameArea.style.height = newHeight + 'px';
      gameArea.style.width = newWidth + 'px';
    } else { // window height is too high relative to desired game height
      newHeight = newWidth / widthToHeight;
      gameArea.style.width = newWidth + 'px';
      gameArea.style.height = newHeight + 'px';
    }

    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';

    gameArea.style.fontSize = (newWidth / 400) + 'em';

    game.mainCanvas.width = newWidth;
    game.mainCanvas.height = newHeight;
}

/**
* Ensure the game sound has loaded before starting the game
*/
function checkReadyState() {
    if(game.bgm.readyState == 4) {
        window.clearInterval(game.checkAudio);
        game.start();
    }
}

/*
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
        game.sheep.move();
        game.shep.move();
}

/*
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/*
 * Initialize the Game and starts it.
 */
var game = new Game();
function init() {
	game.init();
}

/*
* Custom Pool object. Object Pool is a data structure which reuses old objects
* so as not to continually create or delete new ones.
* Holds our objects to prevent garbage collection, and decreases lag as no
* garbage collection should occur since this object holds our object
*/
function Pool(maxSize) {
    var size = maxSize; // Max number of objects allowed in the pool
    var pool = [];
    
    /* Populates the pool array with objects */
    this.init = function() {
        for(var i = 0; i < size; i++) {
            // Initialize sheep object (for now)
            var sheep = new Sheep();
            sheep.init(0, 0, images.sheep.width, images.sheep.height);
            pool[i] = sheep;
        }
    };
    
    /*
     * Grabs the last item in the list and initializes it and
     * pushes it to the front of the array.
     */
    this.get = function(x, y, speed) {
        if(!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };
    
    /*
     * Draws any in use objects. If a sheep dies, clears it
     * and pushes it to the front of the array.
     */
    this.animate = function() {
        for(var i = 0; i < size; i++) {
            // only draw until we find a sheep that is not alive
            if(pool[i].alive) {
                if(pool[i].draw()) {
                    pool[i].clear();
                    pool.push((pool.splice(i, 1))[0]);
                }
            }
            else
                break;
        }
    };
}

/*
* A sound pool to use for sound effects
*/
function SoundPool(maxSize) {
    var size = maxSize;
    var pool = {};
    this.pool = pool;
    var currSound = 0;
    /*
    * Populates the pool array with the given sound
    */
    this.init = function(object) {
      if(object == "sheep") {
        for(var i = 0; i < size; i++) {
            sheep = new Audio("sounds/sheep.wav");
            sheep.volume = .12;
            sheep.load();
            pool[i] = sheep;
        }
      }
    };
    /*
    * Plays the sound required.
    */
    this.get = function() {
        if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
            pool[currSound].play();
        }
        currSound = (currSound + 1) % size;
    };
}
