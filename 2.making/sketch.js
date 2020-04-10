// GRISHA: this sketch is based on a test on watercoloresque stains I did some time ago
// initially the stains have a lot of opacity variance but I just now accidentally stumbled upon
// having the stains be completely opaque and I love it! Change the variable stain_opacity
// to see it in its original form

let stains = []; // I created a "stain" class and put all the stains in an array
let drop_frequency = 500; // how many mS between drops
let last_drop_time = 0; // time of last drop

let render;  // created a p5.Renderer to have the cumulative stains on
let canvasReference;

function setup() {
	canvasReference = createCanvas(windowWidth, windowHeight);
	// make renderer have same size as window
	render = createGraphics(windowWidth, windowHeight);
	background(255);
	render.background(255);
}

let contourPath = []

function draw() {
  let removedStains = false;

	// draw the stain acumullation as the background
	image(render,0,0);

	// go around the array, update and render everything
	for(let i = 0 ; i < stains.length ; i++){
		stains[i].update();
		stains[i].render(render);
	}

	// go around the array backwards, delete any stain that has stopped growing
	for(let i = stains.length-1 ; i >=0  ; i--){
		if(stains[i].readyToErase()){
			stains.splice(i,1);
      removedStains = true;
		}
	}

  if(removedStains) {
    contourPath = findContourPath(canvasReference.elt)
  }

  if(contourPath.length) {  
    fill(lerpColor(
      color(101, 133, 154, 0.5),
      color(253, 136, 107, 0.5),
      0.5)
    );
    strokeWeight(4);
    stroke(51);
    beginShape();
    contourPath.forEach(function(point) {
      vertex(point[0], point[1]);
    })
    endShape(CLOSE);
  }
}

function mouseHandler() {
	// create new stain, add to array
	let aux = new Stain(mouseX, mouseY);
	stains.push(aux);
	// record time of creation
	last_drop_time = millis();
}

function mouseDragged() {
	// only add a stain if enough time has gone by
	if(millis() - last_drop_time > drop_frequency){
  	mouseHandler()
	}
}

function mouseClicked() {
  mouseHandler()
}
