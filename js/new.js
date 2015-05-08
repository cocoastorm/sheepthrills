this.start = new Image();
this.start.src = "img/start.png";
this.how = new Image();
this.how.src = "img/how.png";
this.fence = new Image();
this.fence.src = "img/fence.png";
this.sheep = new Image();
this.sheep.src = "img/sheep.png";
this.title = new Image();
this.title.src = "img/title.png";

function testing() {
    var c = document.getElementById("gameCanvas");
    var ctx = c.getContext("2d");
    ctx.drawImage(start, 15, 275, 140,140 * start.height/ start.width);
	ctx.drawImage(how, 165, 275, 140,140 * how.height / how.width);
	ctx.drawImage(fence, 0.75,374);
	ctx.drawImage(sheep, 30, 110, 250, 250 * sheep.height / sheep.width);
	ctx.drawImage(title, 20 , 30);
	start.onClick === alert("hello world");
}

function start(){
	context.clearRect ( 0 , 0 , canvas.width, canvas.height );
}

