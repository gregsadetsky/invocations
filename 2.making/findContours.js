// accepts canvas element as arg
function findContourPath(c, pointX, pointY) {
  var ctx = c.getContext("2d");
  var imgData = ctx.getImageData(0, 0, c.width, c.height);
  var pxData = imgData.data;
  points = geom.contour(function(x,y){
    var a = pxData[(y*c.width+x)*4];
    return a != 255;
  });

  var dp_eps = 1.5;
  return simplifyPath(points, dp_eps)
}