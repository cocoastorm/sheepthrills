/*
* An object that holds all of our images, so images are only created once.
*/
var images = new function() {
    // define image
    this.background = new Image();
    this.sheep = new Image();
    
    // Ensure all images have been loaded before starting.
    var numImages = 2;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded == numImages) {
            window.init();
        }
    }
    this.background.onload = function() {
        imageLoaded();
    }
    this.sheep.onload = function() {
        imageLoaded();
    }
    // set images src
    this.background.src = "img/background.png";
    this.sheep.src = "img/sheep.png";
}

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
    }
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
        this.context.drawImage(images.background, this.x, this.y);
    };
}

// Set Background to inherit from Base.
Background.prototype = new Drawable();

/*
* Main Game object which will hold everything for the game!
*/
function Game() {
    this.init = function() {
        this.bgCanvas = document.getElementById('background');
        this.mainCanvas = document.getElementById('main');
        // test for support
        if(this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');
            this.mainContext = this.mainCanvas.getContext('2d');
            // initialize canvas
            Background.prototype.context = this.bgContext;
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;
            Sheep.prototype.context = this.mainContext;
            Sheep.prototype.canvasWidth = this.mainCanvas.width;
            Sheep.prototype.canvasHeight = this.mainCanvas.height;
            // initialize background
            this.background = new Background();
            this.background.init(0,0);
            // initialise the sheep object
            this.sheep = new Sheep();
            // set sheep to start in the middle
            var sheepStartX = this.mainCanvas.width/2 - images.sheep.width;
            var sheepStartY = this.mainCanvas.height/2 + images.sheep.height;
            this.sheep.spawn(sheepStartX, sheepStartY, 1);
            return true;
        } else {
            return false;
        }
    };

    // Start animation!
    this.start = function() {
        this.sheep.draw();
        animate();
    };
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
	if(game.init())
		game.start();
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

/**
 * The Sheep object which is spawned in game. The sheeps are drawn
 * on the "main" canvas.
 */
function Sheep() {
    this.alive = false; // Is true if the sheep is currently in use
    /* Sets the sheep values */
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };
    /*
     * Uses a "dirty rectangle" to erase the sheep and move it.
     * Returns true if the sheep is ready to be removed, indicating that 
     * the sheep is ready to be cleared by the pool, otherwise draw
     * the sheep.
     */
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        if (!this.alive) {
            return true;
        }
        else {
            this.context.drawImage(images.sheep, this.x, this.y);
        }
    };
    this.move = function() {
        // implement movement
    };
    /* Resets the sheep values */
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
}
Sheep.prototype = new Drawable();