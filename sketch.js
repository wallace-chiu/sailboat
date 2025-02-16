let sizes = [];
let cols = 50; rows = cols; let size = cols / 5;
let xOffset = 0; let yOffset = 0; let zOffset = 0; let offsetIncrement = 0.1;
let ballX = cols / 2; let ballY = rows / 2;
let futureBallX; let futureBallY;
let ballXOffset = 0; let ballYOffset = 0;
let previousAvgHeight;
let heightIncrement = 0;
let fallingDown = 0; let isFallingDown = false;
let startHeight;
let boatLeftRightIncrement = 0; let boatFrontBackIncrement = 0;; boatRotationIncrement = 0.1


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  rectMode(CENTER);
  angleMode(DEGREES);
  noStroke();
  //ortho();
  ortho(width / 6, -width / 6, -height / 6, height / 6, 0.00001, 10000);
  boat = loadModel('boat.obj');
  
}

function draw() {
  background(135, 206, 235);
  camera(0, 200, 800);
  orbitControl();
  ambientLight(150, 150, 150)
  directionalLight(255, 255, 255, 0, 500, 0);
  rotateX(-45);
  rotateY(45);

  push();
  ambientMaterial(0, 64, 128);
  translate(-size/2, 75, -size/2);
  box(cols * size, 125, rows * size);
  pop();

  xOffset = 0;
  
  for(let i = 0; i < cols; i++)
    {
      sizes[i] = [];
      yOffset = 0;
      for(let j = 0; j < rows; j++)
      {
        sizes[i][j] = map(noise(xOffset, yOffset, zOffset), 0, 1, 0, 50);
        yOffset += offsetIncrement;

        let r = noise(zOffset) * 255;
        let g = noise(zOffset + 10) * 255;
        let b = noise(zOffset + 20) * 255;
        push();
        ambientMaterial(0, 64, 128);
        translate(i * size - (size * rows/2), sizes[i][j], j * size - (size * cols/2));
        box(size, 100, size);
        pop();

        /*
        push();
        fill(255, 255, 255, 100)
        translate(i * size - (size * rows/2), sizes[i][j] - (50 + size),  j * size - (size * cols/2));
        sphere(size);
        pop();
        
        
        push(); 
        fill(255, 255, 255)
        rotateY(360);
        rotateX(0);
        translate(-size * rows / 2, sizes[i][j] - 100, -size * cols / 2);
        rotateX(90);
        //rect(size / 2 + i * size, size / 2 + j * size, sizes[i][j] * 1.3, sizes[i][j] * 1.3);
        rect(size / 2 + i * size, size / 2 + j * size, sizes[i][j] * 0.1, sizes[i][j] * 0.1);
        pop();
        */
        
      }
      xOffset += offsetIncrement;
      zOffset += 0.0001;
    }

    let avgHeight = isFallingDown ? previousAvgHeight: findLowerBlocks(sizes, floor(ballX), floor(ballY));
    startHeight = sizes[cols/2][rows/2]
    if(previousAvgHeight == null)
    {
      previousAvgHeight = avgHeight;
    }
    heightIncrement += ((avgHeight - previousAvgHeight)/3);
    //futureBallY = futureCoords[1];
    console.log("avgHeight: " + avgHeight);

    let frontBackDrift = calculateFrontBackDrift(sizes, floor(ballX), floor(ballY));
    let leftRightDrift = calculateLeftRightDrift(sizes, floor(ballX), floor(ballY));
    ballXOffset += 0.0001 * (frontBackDrift);
    ballYOffset += 0.0001 * (leftRightDrift);

    boatFrontBackIncrement += boatRotationIncrement * frontBackDrift;
    boatLeftRightIncrement += boatRotationIncrement * leftRightDrift;
    
    //console.log(ballX);
    //futureBallX = futureCoords[0];
    //futureBallX = floor(map(noise(ballOffset), 0, 1, 0, cols))
    //summon the ball
    push();
    //fill(255, 255, 255, 1)
    ambientMaterial(255, 153, 51);
    //translate(ballX * size - (size * rows/2), sizes[ballX][ballY] - cols - size, ballY * size - (size * cols/2));
    if(floor(ballX) >=0 && floor(ballY) >= 0 && floor(ballX) < cols && floor(ballY) < rows)
    {
      translate(ballX * size - (size * rows/2) + ballXOffset, startHeight - cols - size + heightIncrement, ballY * size - (size * cols/2) + ballYOffset);
    }
    else
    {
      isFallingDown = true;
      avgHeight += fallingDown;
      translate(ballX * size - (size * rows/2) + ballXOffset, avgHeight, ballY * size - (size * cols/2) + ballYOffset);
      fallingDown += 0.3;
      console.log("height: " + avgHeight);
      if(avgHeight >= 1000)
      {
        //reset the boat physics
        console.log("resetting");
        ballXOffset = 0;
        ballYOffset = 0;
        ballX = cols / 2;
        ballY = rows / 2;
        isFallingDown = false;
        fallingDown = 0;
        heightIncrement = 0;
        avgHeight = sizes[cols/2][rows/2];
        boatFrontBackIncrement = 0;
        boatLeftRightIncrement = 0;
      }
    }
    translate(0, -33, 0);
    rotateX(ballXOffset * 100);
    rotateY(ballYOffset * 100 + boatFrontBackIncrement + boatLeftRightIncrement);
    rotateY(180 + (isFallingDown ? fallingDown * leftRightDrift * 5 : 0));
    rotateX(180+ (isFallingDown ? fallingDown * frontBackDrift * 5 : 0));
    model(boat, true);
    pop();
    //do math to do physics to the ball
    
    //ballY = floor(map(noise(ballOffset), 0, 1, 0, rows));

    ballX += ballXOffset;
    ballY += ballYOffset;
    previousAvgHeight = avgHeight;

    //NEW IDEA: CALCULATE AVERAGE HEIGHT OF 9 BLOCKS --> HEIGHT OF BOAT
      //USE BALLOFFSET TO INFLUENCE MOVEMENT (MAY HAVE TO DO LEFT-RIGHT AND FORWARD/BACKWARD OFFSETS)
      //CALCULATE AVERAGES OF FRONT, BACK, LEFT, RIGHT --> THE LOWEST IS WHERE THE BOAT GOES NEXT (OFFSET CHANGES)
  /*
  for(let i = 0; i < cols; i++)
    {
      for(let j = 0; j < rows; j++)
      {
        fill(0);
        noStroke();
        rect(size / 2 + i * size, size / 2 + j * size, sizes[i][j], sizes[i][j]);
      }
    }
      */
}
function calculateFrontBackDrift(arr, col, row)
{
  //calculate average of the front and back 3
  //if front is greater, return 1, else return -1
  let backCount = 0;
  let backSum = 0;
  let frontCount = 0;
  let frontSum = 0;
  for(let i = -1; i <= 1; i++)
  {
    if(col - 1 < arr.length && col - 1 >= 0 && row + i < arr[0].length && row + i >= 0)
    {
      backSum += arr[col - 1][row + i];
      backCount++;
    }
    if(col + 1 < arr.length && col + 1 >= 0 && row + i < arr[0].length && row + i >= 0)
    {
      frontSum += arr[col + 1][row + i];
      frontCount++;
    }
  }
  let backAvg = (backCount == 0 ? 0 : (backSum / backCount));
  let frontAvg = (frontCount == 0 ? 0 : (frontSum / frontCount));
  console.log(backAvg + " " + frontAvg);
  return backAvg > frontAvg ? -1 : 1;
}
function calculateLeftRightDrift(arr, col, row)
{
  //calculate average of the front and back 3
  //if front is greater, return 1, else return -1
  let leftCount = 0;
  let leftSum = 0;
  let rightCount = 0;
  let rightSum = 0;
  for(let i = -1; i <= 1; i++)
  {
    if(row - 1 < arr[0].length && row - 1 >= 0 && col + i < arr.length && col + i >= 0)
    {
      leftSum += arr[col + i][row - 1];
      leftCount++;
    }
    if(row + 1 < arr[0].length && row + 1 >= 0 && col + i < arr.length && col + i >= 0)
    {
      rightSum += arr[col + i][row + 1];
      rightCount++;
    }
  }
  let leftAvg = (leftCount == 0 ? 0 : (leftSum / leftCount));
  let rightAvg = (rightCount == 0 ? 0 : (rightSum / rightCount));
  console.log(leftAvg + " " + rightAvg);
  return leftAvg > rightAvg ? -1 : 1;
}
function findLowerBlocks(arr, col, row) //find avg height
{
  let count = 0;
  let sum = 0;
  for(let i = -1; i <= 1; i++)
  {
    for(let j = -1; j <= 1; j++)
    {

      if(col< arr.length && col>= 0
        && row < arr[0].length && row >= 0
        /*&& arr[col + i][row + j] < arr[col][row]*/)
      {
        //console.log(col + " " + row + " " + i + " " + j);
        sum += arr[col][row];
        count++;
      }
    }
  }
  return count == 0 ? 0 : sum / count; //average
  /*
  if(lowerBlocksCol.length == 0)
  {
    return [col, row];
  }
  let randBlock = floor(random(0, lowerBlocksCol.length));
  console.log(randBlock + "lowerBlocksCol[randBlock]: " + lowerBlocksCol[randBlock] + " lowerBlocksRow[randBlock]: " + lowerBlocksRow[randBlock]);
  return [lowerBlocksCol[randBlock], lowerBlocksRow[randBlock]]
  */
}
{

}
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
}
