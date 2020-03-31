// GRISHA: this sketch is based on a test on watercoloresque stains I did some time ago
// initially the stains have a lot of opacity variance but I just now accidentally stumbled upon
// having the stains be completely opaque and I love it! Change the variable stain_opacity 
// to see it in its original form


// variables for the position of the stain
let stain_x;
let stain_y;
// current diameter of stain
let diam = 0;
// maximum diameter of stain
let max_diam;
// how much the stain grows per frame
let diam_increment = 2;
// control variable for sizes of different layers of stain, only apparent if using low opacity
let max_variance = .4;

// how detailed is each "circle" that comprises a stain
let circle_detail = 200;
// how many layers does a stain have, only apparent if using low opacity
let layers = 5;

// two colors from which to choose random interpolations
let color_a;
let color_b;

// set to 5 to see original form. I left it at 255 cause it looks great
let stain_opacity = 255;


function setup() {
	createCanvas(windowWidth, windowHeight);
	noStroke();
	background(20,0,0);

	// create some colors
	color_a = color(101, 133, 154, stain_opacity);
	color_b = color(253, 136, 107, stain_opacity);

	// reset the stain variables
	resetStain();
	
}

function draw() {



	// fix random seed for noise displacement variables. could be avoided using an array but 
	// don't have enough time
	randomSeed(0);

	// make stain grow
	diam += diam_increment;

	// this let me control how much deformation goes into each stain
	//let noise_scale = map(mouseX, 0, width, 0, 0.1); // deformation amount

	// but decided to leave it at 0.01 which looks good
	let noise_scale = 0.01;


	if (diam > max_diam) { // make stain grow until limit, then reset
   		//background(0);
   		resetStain();
  	}

  	for (let c = 0; c < layers; c++) {

	    let x_displace = random(-500, 500); // random displacement for picking noise from different areas for each layer
	    let y_displace = random(-500, 500);

	    beginShape(); // begin each deformed circle
	    for (let i = 0; i < circle_detail; i ++) {
		    // calculation of each point in circumference
		    let ang =  i * (TWO_PI/circle_detail);
		    //  float radius = diam/2;
		    // calculation of radius including diameter variance
		    let radius = diam/2 - ((diam/2) * map(c, 0, layers, 0, max_variance));
		    let point_x = stain_x + cos(ang) * radius;
		    let point_y = stain_y + sin(ang) * radius;
		    // calculation of new radius based on noise. this is messy
		    radius = radius +  (noise((point_x + x_displace) * noise_scale, (point_y + y_displace)*noise_scale) * radius);
		    // calculation of new coordinates incorporating displacement
		    point_x = stain_x + cos(ang) * radius;
		    point_y = stain_y + sin(ang) * radius;

		    // add the point to the shape
		    vertex(point_x, point_y);
	    }
	    //close the fucking shape. that's a layer done
	    endShape(CLOSE);
	}
}	

function resetStain(){
	// return diameter to 0
	diam = 0;
	// choose new position for stain
	// I'm using the native js random function cause I've seeded the p5.js random function
	// I know it's terrible but it works
   	stain_x = Math.random() * width;
	stain_y = Math.random() * height;
	// choose a random value between 50 and 200 for the max size of new stain
	max_diam = 50 + ( Math.random() * 150)
	// choose a random color between the two base colors
	fill(lerpColor(color_a, color_b, Math.random()));
}

  
 


 
