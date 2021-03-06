/*
  example based on
  https://p5js.org/examples/motion-non-orthogonal-reflection.html
*/

// GRISHA: 
// this sketch uses sound. it requires you to click the canvas in order to start, sorry
// didn't have time to fix it
// the sounds you hear playing are just some random samples I had. I wanted to record other
// ones but didn't have enough time in my 30 minuts. Feel free to replace them!

// what am I saying? ACTUALLY, FEEL FREE TO CHANGE EVERYTHING


document.addEventListener("DOMContentLoaded", function() {
  var resizeTimeout = null;
  window.onresize = function() {
    if(resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }

    resizeTimeout = setTimeout(function() {
      setup();
    }, 300);
  }
});


//Position of left hand side of floor
let base1;

//Position of right hand side of floor
let base2;

// Variables related to moving ball
let positions = [];
let velocities = [];
// Added these two arrays for detecting when balls enter the circle and controlling color
let has_entered = [];
let color_lerps = [];
let r = 6;
let speed = 1.5;

// Variables for large circle position and size
let area_position;
let area_diam;
// positon incremente for each frame
let area_increment = 2;

let NMB_BALLS = 500;


// Base colors for balls

let color_a;
let color_b;

var started = false;

var button = null;

var audioCtx = null;
var oscillator = null;
var volume = null;

var bigCircleAlpha = 40;
var oscillatorFreq = 0;

// parameterized the general background alpha
let bg_alpha = 4;

function preload(){
  button = createButton('INVOKE');
  button.position(300, 300);
  button.mousePressed(buttonHandler);
}

function buttonHandler() {
  started = true
  button.remove()

  audioStart()
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  //base colors for balls

  color_a = color(130, 3, 51);
  color_b = color(201, 40, 62);

  fill(128);
  base1 = createVector(0, height - 150);
  base2 = createVector(width, height);

  //randomize base top
  base1.y = random(height - 100, height);
  base2.y = random(height - 100, height);

  //large circle parameters
  area_position = createVector(0, height/2);
  area_diam = windowWidth/4;

  //start ellipse at middle top of screen
  for(var i = 0; i < NMB_BALLS; i++) {
    positions.push(createVector(random(windowWidth), 0))

    //calculate initial random velocity
    let velocity = p5.Vector.random2D();
    velocity.mult(speed);

    velocities.push(velocity)

    // populate colision and color arrays
    has_entered.push(false);
    // chose random value for interpolating between base colors
    color_lerps.push(random(1));
  }

}

function draw() {
  if(!started) {
    return
  }

  // move big cirlce, make it wrap around
  area_position.x += area_increment;
  if(area_position.x >width){
    area_position.x = 0;
  }

  //draw background
  fill(0,bg_alpha);
  noStroke();
  rect(0, 0, width, height);

  //draw base
  fill( 46, 17, 45);
  quad(base1.x, base1.y, base2.x, base2.y, base2.x, height, 0, height);

  //calculate base top normal
  let baseDelta = p5.Vector.sub(base2, base1);
  baseDelta.normalize();
  let normal = createVector(-baseDelta.y, baseDelta.x);
  let intercept = p5.Vector.dot(base1, normal);
  

  for(var i = 0; i < NMB_BALLS; i++) {
    let position = positions[i];
    let velocity = velocities[i];

    //draw ellipse
    noStroke();
    fill(lerpColor(color_a, color_b, color_lerps[i]));
    ellipse(position.x, position.y, r * 2, r * 2);

    //move ellipse
    position.add(velocity);

    //normalized incidence vector
    incidence = p5.Vector.mult(velocity, -1);
    incidence.normalize();

    // detect and handle collision with base
    if (p5.Vector.dot(normal, position) > intercept) {
      //calculate dot product of incident vector and base top
      let dot = incidence.dot(normal);

      //calculate reflection vector
      //assign reflection vector to direction vector
      velocity.set(
        2 * normal.x * dot - incidence.x,
        2 * normal.y * dot - incidence.y,
        0
      );
      velocity.mult(speed);

      // draw base top normal at collision point
      stroke(255, 128, 0);
      line(
        position.x,
        position.y,
        position.x - normal.x * 100,
        position.y - normal.y * 100
      );
    }
    //}

    // detect boundary collision
    // right
    if (position.x > width - r) {
      position.x = width - r;
      velocity.x *= -1;
    }
    // left
    if (position.x < r) {
      position.x = r;
      velocity.x *= -1;
    }
    // top
    if (position.y < r) {
      position.y = r;
      velocity.y *= -1;

    }

  }

  // draw large circle

  noStroke();
  fill(240, 67, 58, bigCircleAlpha);
  ellipse(area_position.x, area_position.y, area_diam, area_diam);
  fill(255,240,0,20);
  ellipse(area_position.x, area_position.y, 20, 20);


  // I do this on another for() cycle because of the order in which things get drawn
  // (first balls, then large circle, then collisions)

  var ballIndicesToRemove = [];

  for(var i = 0; i < NMB_BALLS; i++) {
    let position = positions[i];

      // if a ball is inside the large circle
      if(dist(position.x, position.y, area_position.x, area_position.y) < area_diam/2){
          // if it wasn't already inside
        if(!has_entered[i]){
          // draw a small circle indicating the collision
          fill(128, 39, 67, 128);
          noStroke();
          ellipse(position.x, position.y, 50, 50);
          // change state to already inside
          has_entered[i] = true;

          // draw faint line to center of large circle
          stroke(  240, 67, 58, 90);
          line(position.x, position.y, area_position.x, area_position.y);

          ballIndicesToRemove.push(i)

          area_position.x += random(-1, 1)
          area_position.y += random(-1, 1)

          bigCircleAlpha = max(0, bigCircleAlpha - 1)
          area_diam = area_diam - 0.6 < 3 ? 3 : area_diam - 0.6
        }
    } else {  // if the ball isn't inside the large circle
      // change state to not inside
      has_entered[i] = false;
    }
  }

  // console.log('ballIndicesToRemove', ballIndicesToRemove);

  var newPositions = [];
  // var newVelocities = []

  for(var i = 0; i < NMB_BALLS; i++) {
    if(ballIndicesToRemove.indexOf(i) == -1) {
      newPositions.push(positions[i])
  //     newVelocities.push(velocities[i])
    }
  }

  positions = newPositions;
  // velocities = newVelocities;

  // console.log('ballIndicesToRemove.length', ballIndicesToRemove.length);
  NMB_BALLS -= ballIndicesToRemove.length;
  // console.log('NMB_BALLS', NMB_BALLS);

  // if there are no more balls
  if(NMB_BALLS == 0){
    // freeze large ball
    // incremente background alpha (fade it to black)
    area_increment = 0;
    bg_alpha += 2;

    // fill(50);
    textSize(50);
    text('Hope', 100, 100, 500, 500); // Text wraps within text box
    // fill(50);
    textSize(30);
    text('by Ariel Uzal & Greg Sadetsky', 100, 155, 500, 500); // Text wraps within text box
  }

  /// slightly modified this value

  bigCircleAlpha += 0.01

  area_diam = min(windowWidth/4, area_diam + 0.01)

  audioAdjustBandpassHz(40 + Math.log(max(1, NMB_BALLS)) * 200)
}


