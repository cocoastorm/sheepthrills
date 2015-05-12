this.start = new Image();
this.start.src = "start.png";
this.how = new Image();
this.how.src = "how.png";
this.fence = new Image();
this.fence.src = "fence.png";
this.sheep = new Image();
this.sheep.src = "sheep.png";
this.title = new Image();
this.title.src = "title.png";

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

zebra.ready(function() {
	var canvas = new zebra.ui.zCanvas("can");
	canvas.root.setLayout(new zebra.ui.layout.BorderLayout(8));
	var btn = new zebra.ui.Button(new zebra.ui.ImagePan("./img/start.png"));
	canvas.root.add(BOTTOM, btn);
});