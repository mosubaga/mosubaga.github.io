function setup() {
    createCanvas(400, 350);
    m=2
    l=2.8
    g=9.814
    dt=0.02
    t=0
    theta = 3.14/5; // Pendulum initial angle theta
    omega = 0; // Initial angular velocity
    C = 2; // Center point
}

function draw() {
    background(204, 204, 255);
    // physics
    t = t + dt;
    F=-m*g*sin(theta)
    epsilon = (F/m)/l; //angular acceleration
    omega = omega + epsilon * dt;
    theta = theta + omega * dt;
    xp = C - l * sin(theta); // X coordinate of pendulum ball
    yp = l * cos(theta); // Y coordinate of pendulum ball
    //draw it
    ppm=100 //scale it to the canvas (from meters to pixels)
    line(C*ppm, 0, xp*ppm, yp*ppm);
    ellipse(xp*ppm, yp*ppm, 20, 20);
}
