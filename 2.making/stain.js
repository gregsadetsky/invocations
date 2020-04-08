class Stain{
  constructor(x, y){
    // variables for the position of the stain
    this.x = x;;
    this.y = y;
    // current diameter of stain
    this.diam = 0;
    // maximum diameter of stain
    this.max_diam = 50 + (Math.random() * 150)
    // how much the stain grows per frame
    this.diam_increment = 1;
    // control variable for sizes of different layers of stain, only apparent if using low opacity
    this.max_variance = .04;

    // how detailed is each "circle" that comprises a stain
    this.circle_detail = 100;
    // how many layers does a stain have, only apparent if using low opacity
    this.layers = 5;
    this.stain_opacity = 255;
    // two colors from which to choose random interpolations
    this.color_a = color(101, 133, 154, this.stain_opacity);
    this.color_b = color(253, 136, 107, this.stain_opacity);

    // set to 5 to see original form. I left it at 255 cause it looks great

    this.x_displace = random(-500, 500); // random displacement for picking noise from different areas for each layer
    this.y_displace = random(-500, 500);

    this.lerp_start_value = Math.random();
    // indicates the stain has stopped growing and is ready to be removed from array
    this.erase_flag = false;

    // inital state, falling as a droplet
    this.falling = true;
    this.initial_y = this.y;
    // determines how far the drop will fall before forming stain
    this.fall_height = random(60,100);
  }

  update(){
    // if the drop is still falling
    if(this.falling){
      // increase y position
      this.y ++;
      // if it has reached the end of fall, change state
      if(this.y > this.initial_y + this.fall_height){
        this.falling = false;
      }
    }else{
      this.diam += this.diam_increment;
      	if (this.diam > this.max_diam) { // make stain grow until limit, then reset
         		//background(0);
         		this.erase_flag = true;
        }
     }
  }

  readyToErase(){
    return this.erase_flag;
  }

  render(g){
    if(this.falling){ // if falling draw drop on canvas
      this.renderDrop();
    }else{ // if not draw stain on renderer
      this.renderStain(g);
    }
  }

  renderDrop(){
    // draw a small ellipse like a falling drop
    fill(lerpColor(this.color_a, this.color_b, this.lerp_start_value));
    noStroke();
    ellipse(this.x, this.y, random(8,10), random(8,10));
  }

  renderStain(g){
    g.fill(lerpColor(this.color_a, this.color_b, this.lerp_start_value));
    g.noStroke();
    let noise_scale = 0.01;
    for (let c = 0; c < this.layers; c++) {

      g.beginShape(); // begin each deformed circle
      for (let i = 0; i < this.circle_detail; i ++) {
        // calculation of each point in circumference
        let ang =  i * (TWO_PI/this.circle_detail);
        //  float radius = diam/2;
        // calculation of radius including diameter variance
        let radius = this.diam/2 - ((this.diam/2) * map(c, 0, this.layers, 0, this.max_variance));
        let point_x = this.x + cos(ang) * radius;
        let point_y = this.y + sin(ang) * radius;
        // calculation of new radius based on noise. this is messy
        radius = radius +  (noise((point_x + this.x_displace) * noise_scale, (point_y + this.y_displace)*noise_scale) * radius);
        // calculation of new coordinates incorporating displacement
        point_x = this.x + cos(ang) * radius;
        point_y = this.y + sin(ang) * radius;

        // add the point to the shape
        g.vertex(point_x, point_y);
      }
      //close the fucking shape. that's a layer done
      g.endShape(CLOSE);
    }
  }
}
