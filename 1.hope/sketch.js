/*

  example based on
  https://p5js.org/examples/motion-non-orthogonal-reflection.html



*/



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
let r = 6;
let speed = 1.5;

let NMB_BALLS = 500;

function setup() {
  createCanvas(windowWidth, windowHeight);

  fill(128);
  base1 = createVector(0, height - 150);
  base2 = createVector(width, height);

  //randomize base top
  base1.y = random(height - 100, height);
  base2.y = random(height - 100, height);

  //start ellipse at middle top of screen
  for(var i = 0; i < NMB_BALLS; i++) {
    positions.push(createVector(random(windowWidth), 0))

    //calculate initial random velocity
    let velocity = p5.Vector.random2D();
    velocity.mult(speed);

    velocities.push(velocity)
  }
}

function draw() {
  //draw background
  fill(0, 12);
  noStroke();
  rect(0, 0, width, height);

  //draw base
  fill(200);
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
    fill(255);
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
}
