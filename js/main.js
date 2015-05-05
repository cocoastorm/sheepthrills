/*
* An object that holds all of our images, so images are only loaded once.
*/
var images = new function() {
    // define image
    this.sheep = new Image();
    
    // Ensure all images have been loaded before starting.
    var numImages = 1;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        if (numLoaded == numImages) {
            window.init();
        }
    }
    this.sheep.onload = function() {
        imageLoaded();
    }
    // set images src
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
        //disable for now, no background...
        //this.context.drawImage(images.background, this.x, this.y);
    };
}

// Set Background to inherit from Base.
Background.prototype = new Drawable();


/*
* Main Game object which will hold everything for the game!
*/
function Game() {
    // set up initial values
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.bounces = 0;
    // set these up later in init
    this.ratio = null;
    this.currentWidth = null;
    this.currentHeight = null;
    
    this.bounce = function() {
        this.bounces++;
    }
    
    this.init = function() {
        // the proportion of width to height
        this.ratio = this.width / this.height;
        // these will change accordingly when screen is resized
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        // these are our canvas
        this.mainCanvas = document.getElementById('main');
        // test for support
        if(this.mainCanvas.getContext) {
            // setting this is important, else browser will default to 320 x 200
            this.mainCanvas.width = this.width;
            this.mainCanvas.height = this.height;
            // get context
            this.mainContext = this.mainCanvas.getContext('2d');
            // detect android or ios
            // so that we can hide the address bar in
            // our resize function
            this.ua = navigator.userAgent.toLowerCase();
            this.android = this.ua.indexOf('android') > -1 ? true : false;
            this.ios = ( this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1  ) ? 
                true : false;
            // resize canvas!
            this.resize();
            // initialize canvas
            Background.prototype.context = this.mainContext;
            Background.prototype.canvasWidth = this.mainCanvas.width;
            Background.prototype.canvasHeight = this.mainCanvas.height;
            Sheep.prototype.context = this.mainContext;
            Sheep.prototype.canvasWidth = this.mainCanvas.width;
            Sheep.prototype.canvasHeight = this.mainCanvas.height;
            // initialize background
            this.background = new Background();
            this.background.init(0,0); // <<---- Is this supposed to be an emoticon?
            // initialise the sheep object
            this.sheep = new Sheep();
            this.shep = new Sheep();
            // set sheep to start in the middle
            var sheepStartX = this.mainCanvas.width/2;
            var sheepStartY = this.mainCanvas.height/2;
            this.sheep.spawn(sheepStartX, sheepStartY);
            this.sheep.draw();
            return true;
        } else {
            return false;
        }
    };
    // resize canvas function
    this.resize = function() {
        this.currentHeight = window.innerHeight;
        // resize the width in proportion to the new height
        this.currentWidth = this.currentHeight * this.ratio;
        
        // this will create extra space on the page
        // allow us to scroll past the address bar, effectively hiding it
        if (this.android || this.ios) {
            document.body.height = (window.innerHeight + 50) + 'px';
        }
        // set the new canvas style width and height
        // canvas is still 320 x 480 but.. 
        this.mainCanvas.width = this.currentWidth - 20;
        this.mainCanvas.height = this.currentHeight - 15;
        // we use a timeout here because some mobile browsers
        // don't fire if there isn't a short delay
        window.setTimeout(function() {
            window.scrollTo(0, 1);
        }, 1);
    };
    // Start animation!
    this.start = function() {
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
    vx = 0;
    vy = 0;
    vx1 = Math.floor((Math.random() * 10) + 4);
    vy1 = Math.floor((Math.random() * 10) + 4);
    vx2 = Math.floor((Math.random() * -10) + 4);
    vy2 = Math.floor((Math.random() * -10) + 4);
    dirX = Math.floor((Math.random() * 2) + 1);
    dirY = Math.floor((Math.random() * 2) + 1);
    if(dirX == 1)
        vx = vx1;
    if(dirX == 2)
        vx = vx2;
    if(dirY == 1)
        vy = vy1;
    if(dirY == 1)
        vy = vy2;
    this.colCount = 0;
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
        this.context.fillText("X = " + this.x, 30, 30);
        this.context.fillText("Y = " + this.y, 30 , 60);
        this.context.fillText("Bounce: " + game.bounces, 30, 90);
    };
    /*
    * Moves the sheep and bounces the sheep when it hits the walls.
    */
    this.move = function() {
    if(this.x + 100 < this.canvasWidth && this.y + 100 < this.canvasHeight && this.x > 0 && this.y > 0){
        this.x += vx;
        this.y += vy;
        this.erase();
        this.draw();
    }
        if(this.y + 101 > this.canvasHeight){
            this.y -= vy;
            vy *= -1;
            game.bounce();
        }
        if(this.x + 101 > this.canvasWidth){
            this.x -= vx;
            vx *= -1;
            game.bounce();
        }
        if(this.y  - 1< 0){
            this.y += -vy;
            vy *= -1;
            game.bounce();
        }
        if(this.x - 1< 0){
            this.x += -vx;
            vx *= -1;
            game.bounce();
        }
    };
    /*
    * Uses dirty rectangle to clear the sheep before redrawing.
    */
    this.erase = function() {
        this.context.clearRect(this.x, this.y, 100, 100);
        this.context.clearRect(30, 0, 150, 100);
        this.context.clearRect(30, 60, 150, 100);
        this.context.clearRect(30, 90, 150, 100);
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