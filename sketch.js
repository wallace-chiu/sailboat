let sizes = [];
let cols = 50; rows = cols; let size = cols / 5;
let xOffset = 0; let yOffset = 0; let zOffset = 0; let offsetIncrement = 0.1;
let ballX = cols / 2; let ballY = rows / 2;
let ballXOffset = 0; let ballYOffset = 0;
let previousAvgHeight;
let heightIncrement = 0;
let fallingDown = 0; let isFallingDown = false;
let startHeight;
let boatLeftRightIncrement = 0; let boatFrontBackIncrement = 0;; boatRotationIncrement = 0.1
let boatColorIncrementer = 0;
let sunsetChange = 0; let sunsetIncrement = 0.001; let sunGoingDown = true;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  rectMode(CENTER);
  angleMode(DEGREES);
  noStroke();
  ortho(width / 6, -width / 6, -height / 6, height / 6, 0.00001, 10000);
  boat = loadModel('boat.obj');
}

function draw() {
  //setup background
  background(135, 206 - sunsetChange, 235 - sunsetChange);
  camera(0, 200, 800);
  orbitControl();
  ambientLight(150, 150 - sunsetChange, 150 - sunsetChange)
  directionalLight(255, 255 - sunsetChange, 255 - sunsetChange, 0, 500, 0);

  //this equation changes the amount of green and blue
  //changes it slowly at first, then quicker as the scene gets redder
  //cause sunsets don't last as long as daytime
  //no night time because I don't like that
  sunsetChange += sunsetIncrement * (sunGoingDown ? 1 : -1) + (sunsetIncrement * (sunGoingDown ? 1 : -1) * sunsetChange);
  if(sunsetChange >= 150)
  {
    sunGoingDown = false;
  }
  if(sunsetChange <= 0)
  {
    sunGoingDown = true;
  }
  rotateX(-45);
  rotateY(45);

  //create giant box below the moving rectangles
  push();
  ambientMaterial(0, 64, 128);
  translate(-size/2, 75, -size/2);
  box(cols * size, 125, rows * size);
  pop();

  //creating moving waves
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

        //2d plane showing the perlin noise generation
        /* 
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

    
    //doing physics to figure out the movement of the water

    //finding the average height of a block and the surrounding 8 blocks
      //if the boat is falling down, then the height is dependent on something else
    let avgHeight = isFallingDown ? previousAvgHeight: findAvgHeight(sizes, floor(ballX), floor(ballY));

    //starting coordinates of the boat
    startHeight = sizes[cols/2][rows/2]

    //i look at this and throw up
    //for the first instance
    if(previousAvgHeight == null)
    {
      previousAvgHeight = avgHeight;
    }
    //finds the differences between avg heights in the past vs present
    //divide by 3 to smooth out the animation
      //NOTE: not an accurate representation, but good enough
    heightIncrement += ((avgHeight - previousAvgHeight)/3);

    //calculates which direction the boat should be going
    let frontBackDrift = calculateFrontBackDrift(sizes, floor(ballX), floor(ballY));
    let leftRightDrift = calculateLeftRightDrift(sizes, floor(ballX), floor(ballY));
    //increments the boat movement based on the direction it should go
    ballXOffset += 0.0001 * (frontBackDrift);
    ballYOffset += 0.0001 * (leftRightDrift);

    //calculates what direction the boat should go
    boatFrontBackIncrement += boatRotationIncrement * frontBackDrift;
    boatLeftRightIncrement += boatRotationIncrement * leftRightDrift;
    
    //creating ship
    push();

    //generates the color of the boat 
    //ambientMaterial(255, 153, 51); //nice orange if you prefer no disco
    let r = noise(boatColorIncrementer) * 255;
    let g = noise(boatColorIncrementer + 10) * 255;
    let b = noise(boatColorIncrementer + 20) * 255;
    boatColorIncrementer += 0.01;
    ambientMaterial(r, g, b);

    //latest change NOT PUSHED YET (!isFalling added to if statement)
    //if the boat isn't falling down and the boat is within the generated waters, do the normal animation
    if(!isFallingDown && floor(ballX) >=0 && floor(ballY) >= 0 && floor(ballX) < cols && floor(ballY) < rows)
    {
      //turns on a light for the boat when it gets darker
      if(sunsetChange >= 70)
      {
        pointLight(105 + sunsetChange, 105 + sunsetChange, 105 + sunsetChange, floor(ballX), sizes[floor(ballX)][floor(ballY)] - 10, floor(ballY));
      }
      translate(ballX * size - (size * rows/2) + ballXOffset, startHeight - cols - size + heightIncrement, ballY * size - (size * cols/2) + ballYOffset);
    }
    //if the boat is falling down, then we perform the falling animation
    else
    {
      //set falling down to be true so we always reach the else statement
      isFallingDown = true;
      //change average height with an increment (it's addition because that's just how this renderer works)
      avgHeight += fallingDown;

      //turns on a light for the boat when it gets darker
      if(sunsetChange >= 70)
      {
        pointLight(105 + sunsetChange, 105 + sunsetChange, 105 + sunsetChange, floor(ballX), avgHeight, floor(ballY));
      }

      //if you look closely, it's the same command as the if statement, except the 2nd parameter is adapted to just fall
      translate(ballX * size - (size * rows/2) + ballXOffset, avgHeight, ballY * size - (size * cols/2) + ballYOffset);
      //increase the gravity as time goes on
      fallingDown += 0.3;

      //once the boat falls down enough (arbitary amount), reset everything and put the boat back at the center
      //this way, we have an infinitely running boat
      if(avgHeight >= 1000)
      {
        //reset the boat physics
        //console.log("resetting");
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
    //micro adjustment for height of the boat (make sure it's not floating or under water)
    translate(0, -32, 0);

    //changes the rotation of the boat to the direction the boat is moving
    rotateX(ballXOffset * 100);
    rotateY(ballYOffset * 100 + boatFrontBackIncrement + boatLeftRightIncrement);

    //the 180 rotation for rotateX and rotateY is to make sure the model is correctly oriented
    //conditional: falling animation
    rotateY(180 + (isFallingDown ? fallingDown * leftRightDrift * 5 : 0));
    rotateX(180+ (isFallingDown ? fallingDown * frontBackDrift * 5 : 0));
    model(boat, true);
    pop();

    //updates the coordinates of the boat
    ballX += ballXOffset;
    ballY += ballYOffset;

    //updates what the previous height of the boat was
    previousAvgHeight = avgHeight;
}

//calculate average of the front and back 3 blocks of a given block (notated as arr[col][row])
  //if front is greater, return 1, else return -1
function calculateFrontBackDrift(arr, col, row)
{
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

  return backAvg > frontAvg ? -1 : 1;
}

//calculate average of the left and right 3 blocks of a given block (notated as arr[col][row])
  //if front is greater, return 1, else return -1
function calculateLeftRightDrift(arr, col, row)
{
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

  return leftAvg > rightAvg ? -1 : 1;
}

//finds the average height of the block arr[col][row] and the eight blocks surround the block
function findAvgHeight(arr, col, row) 
{
  let count = 0;
  let sum = 0;
  for(let i = -1; i <= 1; i++)
  {
    for(let j = -1; j <= 1; j++)
    {

      if(col< arr.length && col>= 0
        && row < arr[0].length && row >= 0)
      {
        sum += arr[col][row];
        count++;
      }
    }
  }
  //if there is no block to measure, then return 0 and avoid a divide by 0 error
  return count == 0 ? 0 : sum / count;
}

//resizes window if you adjust it
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
}