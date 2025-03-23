// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec4 u_lightColor;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);   // Use normal debug color
    }
    else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;    // Use color
    }
    else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);    // Use UV debug color
    }
    else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);    // Use texture0 - sky
    }
    else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);    // Use texture1 - floor
    }
    else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);    // Use texture2 - brick
    }
    else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1);    // Error, put reddish
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E, R), 0.0), 75.0) * 0.8;
    
    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if (u_lightOn) {
        if (u_whichTexture == 0) {
            gl_FragColor = u_lightColor * vec4(specular + diffuse + ambient, 1.0);
        }
        else {
            gl_FragColor = u_lightColor * vec4(diffuse + ambient, 1.0);
        }
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_NormalMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    // Get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    // Get the storage location of u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return false;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return false;
    }

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return false;
    }

    // Get the storage location of u_lightColor
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get the storage location of u_lightColor');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Globals related to UI elements

// Camera variables
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_globalX = 0;
let g_globalY = 0;
var g_camera;

// Angle variables
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;
let g_leftLegAngle = 0;
let g_rightLegAngle = 0;
let g_leftHandAngle = 0;
let g_rightHandAngle = 0;
let g_orangeAngle = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;
let g_leftEyeAngle = 0;
let g_rightEyeAngle = 0;
let g_innerLeftEyeAngle = 0;
let g_innerRightEyeAngle = 0;

// Animation variables
let g_walkAnimation = false;
let g_shiftClickAnimation = false;
let g_armAnimation = false;
let g_legAnimation = false;

// ASG4 variables
let g_normalOn = false;
let g_lightPos = [-2, 0, -2];
let g_lightAnimation = true;
let g_lightOn = true;
let g_lightColor = [1.0, 1.0, 1.0, 1.0];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // ASG4 Events
    document.getElementById('normalOn').onclick = function () { g_normalOn = true; };
    document.getElementById('normalOff').onclick = function () { g_normalOn = false; };
    document.getElementById('lightOn').onclick = function () { g_lightOn = true; };
    document.getElementById('lightOff').onclick = function () { g_lightOn = false; };
    document.getElementById('lightSlideX').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[0] = this.value / 100; renderScene(); } });
    document.getElementById('lightSlideY').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[1] = this.value / 100; renderScene(); } });
    document.getElementById('lightSlideZ').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[2] = this.value / 100; renderScene(); } });
    document.getElementById('redLightSlide').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightColor[0] = this.value / 100; renderScene(); } });
    document.getElementById('greenLightSlide').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightColor[1] = this.value / 100; renderScene(); } });
    document.getElementById('blueLightSlide').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightColor[2] = this.value / 100; renderScene(); } });
    document.getElementById('lightAnimationOnButton').onclick = function () { g_lightAnimation = true; };
    document.getElementById('lightAnimationOffButton').onclick = function () { g_lightAnimation = false; };
    document.getElementById('lightAnimationResetButton').onclick = function () { g_lightAnimation = false; g_lightPos = [0, 1, -2]; };

    // Animation Button Events
    document.getElementById('walkAnimationOnButton').onclick = function () { g_walkAnimation = true; };
    document.getElementById('walkAnimationOffButton').onclick = function () { g_walkAnimation = false; };
    document.getElementById('walkAnimationResetButton').onclick = function () { g_walkAnimation = false; g_leftArmAngle = 0; g_rightArmAngle = 0; g_leftLegAngle = 0; g_rightLegAngle = 0; g_leftHandAngle = 0; g_rightHandAngle = 0; g_orangeAngle = 0; g_leftFootAngle = 0; g_rightFootAngle = 0; };
    document.getElementById('shiftClickAnimationResetButton').onclick = function () { g_shiftClickAnimation = false; g_leftEyeAngle = 0; g_rightEyeAngle = 0; g_innerLeftEyeAngle = 0; g_innerRightEyeAngle = 0; };
    document.getElementById('armAnimationOnButton').onclick = function () { g_armAnimation = true; };
    document.getElementById('armAnimationOffButton').onclick = function () { g_armAnimation = false; };
    document.getElementById('legAnimationOnButton').onclick = function () { g_legAnimation = true; };
    document.getElementById('legAnimationOffButton').onclick = function () { g_legAnimation = false; };

    // Animation Slider Events
    document.getElementById('leftArmSlide').addEventListener('mousemove', function () { g_leftArmAngle = -this.value; renderScene(); });
    document.getElementById('rightArmSlide').addEventListener('mousemove', function () { g_rightArmAngle = this.value; renderScene(); });
    document.getElementById('leftLegSlide').addEventListener('mousemove', function () { g_leftLegAngle = this.value; renderScene(); });
    document.getElementById('rightLegSlide').addEventListener('mousemove', function () { g_rightLegAngle = -this.value; renderScene(); });
    document.getElementById('leftHandSlide').addEventListener('mousemove', function () { g_leftHandAngle = -this.value; renderScene(); });
    document.getElementById('rightHandSlide').addEventListener('mousemove', function () { g_rightHandAngle = this.value; renderScene(); });
    document.getElementById('leftFootSlide').addEventListener('mousemove', function () { g_leftFootAngle = this.value; renderScene(); });
    document.getElementById('rightFootSlide').addEventListener('mousemove', function () { g_rightFootAngle = -this.value; renderScene(); });

    // Rotate Slider Events
    document.getElementById('angleXSlide').addEventListener('mousemove', function () { g_globalX = this.value; });
    document.getElementById('angleYSlide').addEventListener('mousemove', function () { g_globalY = this.value; });
}

function initTextures() {
    // Create the image object
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to create the image0 object');
        return false;
    }
    var image1 = new Image();
    if (!image1) {
        console.log('Failed to create the image1 object');
        return false;
    }
    var image2 = new Image();
    if (!image2) {
        console.log('Failed to create the image2 object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image0.onload = function () { sendImageToTEXTURE0(image0); };
    // Tell the browser to load an image
    image0.src = './resources/sky.jpg';

    image1.onload = function () { sendImageToTEXTURE1(image1); };
    image1.src = './resources/floor.jpg';

    image2.onload = function () { sendImageToTEXTURE2(image2); };
    image2.src = './resources/brick.jpg';

    return true;
}

function sendImageToTEXTURE0(image0) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture0 object');
        return false;
    }
    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    console.log('finished sendImageToTEXTURE0()');
}

function sendImageToTEXTURE1(image1) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture1 object');
        return false;
    }
    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);

    console.log('finished sendImageToTEXTURE1()');
}

function sendImageToTEXTURE2(image2) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture2 object');
        return false;
    }
    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);

    console.log('finished sendImageToTEXTURE2()');
}

function main() {
    // Set up the canvas and gl variables
    setupWebGL();

    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { g_globalAngleX -= ev.movementX; g_globalAngleY -= ev.movementY; } };
    canvas.onmousedown = function (ev) { if (ev.shiftKey) { g_shiftClickAnimation = true; } };

    g_camera = new Camera();

    document.onkeydown = keydown;

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.2, 0.0, 1.0);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_shapesList = [];

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;;

// Called by browser repeatedly whenever its time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000.0 - g_startTime;
    console.log(performance.now());

    // Update Animation Angles
    updateAnimationAngles();

    // Draw Everything
    renderScene();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_walkAnimation) {
        g_leftArmAngle = (45 * Math.sin(5 * g_seconds));
        g_rightArmAngle = (45 * Math.sin(5 * g_seconds));
        g_leftLegAngle = (45 * Math.sin(5 * g_seconds));
        g_rightLegAngle = (45 * Math.sin(5 * g_seconds));
        g_leftHandAngle = (15 * Math.sin(5 * g_seconds));
        g_rightHandAngle = (15 * Math.sin(5 * g_seconds));
        g_orangeAngle = (25 * Math.sin(5 * g_seconds));
        g_leftFootAngle = (45 * Math.sin(5 * g_seconds));
        g_rightFootAngle = (45 * Math.sin(5 * g_seconds));
    }
    if (g_shiftClickAnimation) {
        g_leftEyeAngle = 0.5;
        g_rightEyeAngle = 0.5;
        g_innerLeftEyeAngle = 0.5;
        g_innerRightEyeAngle = 0.5;
        g_leftEyeAngle = 0.5 + (0.05 * Math.sin(3 * g_seconds));
        g_rightEyeAngle = 0.5 + (0.05 * Math.sin(3 * g_seconds));
        g_innerLeftEyeAngle = 0.5 + (0.05 * Math.sin(3 * g_seconds));
        g_innerRightEyeAngle = 0.5 + (0.05 * Math.sin(3 * g_seconds));
    }
    if (g_armAnimation) {
        g_leftArmAngle = (45 * Math.sin(5 * g_seconds));
        g_rightArmAngle = (45 * Math.sin(5 * g_seconds));
        g_leftHandAngle = (45 * Math.sin(5 * g_seconds));
        g_rightHandAngle = (45 * Math.sin(5 * g_seconds));
    }
    if (g_legAnimation) {
        g_leftLegAngle = (45 * Math.sin(5 * g_seconds));
        g_rightLegAngle = (45 * Math.sin(5 * g_seconds));
        g_leftFootAngle = (45 * Math.sin(5 * g_seconds));
        g_rightFootAngle = (45 * Math.sin(5 * g_seconds));
    }
    if (g_lightAnimation) {
        g_lightPos[0] = 2 * Math.cos(g_seconds);
        g_lightPos[1] = Math.cos(g_seconds) + 1;
        g_lightPos[2] = 2 * Math.cos(g_seconds);
    }
}

function keydown(ev) {
    switch (ev.keyCode) {
        case 87: // w
            g_camera.moveForward();
            break;
        case 83: // s
            g_camera.moveBackwards();
            break;
        case 65: // a
            g_camera.moveLeft();
            break;
        case 68: // d
            g_camera.moveRight();
            break;
        case 16: // shift
            g_camera.moveUp();
            break;
        case 17: // ctrl
            g_camera.moveDown();
            break;
        case 81: // q
            g_camera.panLeft();
            break;
        case 69: // e
            g_camera.panRight();
            break;
        default:
            break;
    }

    renderScene();
    console.log(ev.keyCode);
}

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMap() {
    for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
            if (g_map[x][y] == 1) {
                var block = new Cube();
                block.color = [0.8, 1.0, 1.0, 1.0];
                block.textureNum = 2;
                block.matrix.translate(0, -0.25, 0);
                block.matrix.scale(0.5, 0.5, 0.5);
                block.matrix.translate(x - 16, 0, y - 16);
                block.drawCubeFaster();
            }
        }
    }
}

function renderScene() {
    // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, 1 * canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
    globalRotMat.rotate(g_globalX, 0, 1, 0);
    globalRotMat.rotate(g_globalY, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // drawMap();

    // Pass the light position to GLSL
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    // Pass the camera position to GLSL
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    // Pass the light status
    gl.uniform1i(u_lightOn, g_lightOn);

    gl.uniform4f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2], g_lightColor[3]);

    // Draw the room
    var room = new Cube();
    room.color = [0.8, 0.8, 0.8, 1.0];
    room.textureNum = -2;
    if (g_normalOn) room.textureNum = -3;
    room.matrix.scale(-5, -5, -5);
    room.matrix.translate(-0.5, -0.5, -0.5);
    room.drawCube();

    // Draw the light
    var light = new Cube();
    light.color = [2.0, 2.0, 0.0, 1.0];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.drawCube();

    // Draw the sphere
    var sphere = new Sphere();
    sphere.color = [0, 0, 0, 1.0];
    sphere.textureNum = 0;
    if (g_normalOn) sphere.textureNum = -3;
    sphere.matrix.translate(-0.6, 1.5, 0);
    sphere.matrix.scale(0.5, 0.5, 0.5);
    sphere.matrix.translate(-0.5, -0.5, -0.5);
    sphere.drawSphere();

    // Draw the floor
    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 1;
    floor.matrix.translate(0.0, -0.25, 0.0);
    floor.matrix.scale(25, 0, 25);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.drawCube();

    // Draw the sky
    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0];
    sky.textureNum = 0;
    sky.matrix.translate(0, -10, 0);
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, 0, -0.5);
    sky.drawCube();

    // Draw the head
    var head = new Cube();
    head.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) head.textureNum = -3;
    head.matrix.translate(-0.275, 0.25, -0.025);
    head.matrix.scale(0.35, 0.25, 0.25);
    head.drawCube();

    // Draw the left ear
    var leftEar = new Cube();
    leftEar.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) leftEar.textureNum = -3;
    leftEar.matrix.translate(-0.37, 0.45, 0.03);
    leftEar.matrix.scale(0.15, 0.125, 0.125);
    leftEar.drawCube();

    // Draw the right ear
    var rightEar = new Cube();
    rightEar.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) rightEar.textureNum = -3;
    rightEar.matrix.translate(0.02, 0.45, 0.03);
    rightEar.matrix.scale(0.15, 0.125, 0.125);
    rightEar.drawCube();

    // Draw the left ear
    var innerLeftEar = new Cube();
    innerLeftEar.color = [0.1, 0.0, 0.0, 1.0];
    if (g_normalOn) innerLeftEar.textureNum = -3;
    innerLeftEar.matrix.translate(-0.355, 0.4625, 0.02);
    innerLeftEar.matrix.scale(0.12, 0.1, 0.125);
    innerLeftEar.drawCube();

    // Draw the right ear
    var innerRightEar = new Cube();
    innerRightEar.color = [0.1, 0.0, 0.0, 1.0];
    if (g_normalOn) innerRightEar.textureNum = -3;
    innerRightEar.matrix.translate(0.0355, 0.4625, 0.02);
    innerRightEar.matrix.scale(0.12, 0.1, 0.125);
    innerRightEar.drawCube();

    // Draw the mouth
    var mouth = new Cube();
    mouth.color = [0.15, 0.05, 0.0, 1.0];
    if (g_normalOn) mouth.textureNum = -3;
    mouth.matrix.translate(-0.15, 0.27, -0.07);
    mouth.matrix.scale(0.1, 0.0575, 0.05);
    mouth.drawCube();

    // Draw the lip
    var lip = new Cube();
    lip.color = [0.0, 0.0, 0.0, 1.0];
    if (g_normalOn) lip.textureNum = -3;
    lip.matrix.translate(-0.099, 0.2701, -0.075);
    lip.matrix.scale(0.005, 0.05, 0.025);
    lip.drawCube();

    // Draw the nose
    var nose = new Cube();
    nose.color = [0.0, 0.0, 0.0, 1.0];
    if (g_normalOn) nose.textureNum = -3;
    nose.matrix.translate(-0.125, 0.3, -0.08);
    nose.matrix.scale(0.05, 0.02875, 0.025);
    nose.drawCube();

    // Draw the body
    var body = new Cube();
    body.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) body.textureNum = -3;
    body.matrix.setTranslate(-0.25, 0.0, 0.0);
    body.matrix.scale(0.3, 0.25, 0.2);
    body.drawCube();

    // Draw the stomach
    var stomach = new Cube();
    stomach.color = [0.24, 0.1, 0.0, 0.5];
    if (g_normalOn) stomach.textureNum = -3;
    stomach.matrix.translate(-0.2, 0.05, -0.02);
    stomach.matrix.scale(0.2, 0.167, 0.065);
    stomach.drawCube();

    // Draw the left arm
    var leftArm = new Cube();
    leftArm.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) leftArm.textureNum = -3;
    leftArm.matrix.translate(-0.3, 0.195, 0.1);
    leftArm.matrix.rotate(g_leftArmAngle, 1.0, 0.0, 0.0);
    var leftArmCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.1, 0.225, 0.1);
    leftArm.matrix.translate(-0.5, -1.0, -0.5);
    leftArm.normalMatrix.setInverseOf(leftArm.matrix).transpose();
    leftArm.drawCube();

    // Draw the right arm
    var rightArm = new Cube();
    rightArm.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) rightArm.textureNum = -3;
    rightArm.matrix.translate(0.1, 0.195, 0.1);
    rightArm.matrix.rotate(-g_rightArmAngle, 1.0, 0.0, 0.0);
    var rightArmCoordinatesMat = new Matrix4(rightArm.matrix);
    rightArm.matrix.scale(0.1, 0.225, 0.1);
    rightArm.matrix.translate(-0.5, -1.0, -0.5);
    rightArm.normalMatrix.setInverseOf(rightArm.matrix).transpose();
    rightArm.drawCube();

    // Draw the left hand
    var leftHand = new Cube();
    leftHand.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) leftHand.textureNum = -3;
    leftHand.matrix = leftArmCoordinatesMat;
    leftHand.matrix.translate(-0.05, -0.25, -0.075);
    leftHand.matrix.rotate(-g_leftHandAngle, 1.0, 0.0, 1.0);
    leftHand.matrix.scale(0.1, 0.0835, 0.125);
    leftHand.matrix.translate(0.0, 0.0, 0.0);
    leftHand.normalMatrix.setInverseOf(leftHand.matrix).transpose();
    leftHand.drawCube();

    // Draw the right hand
    var rightHand = new Cube();
    rightHand.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) rightHand.textureNum = -3;
    rightHand.matrix = rightArmCoordinatesMat;
    rightHand.matrix.translate(-0.0495, -0.25, -0.075);
    rightHand.matrix.rotate(g_rightHandAngle, 1.0, 0.0, -1.0);
    var rightHandCoordinatesMat = new Matrix4(rightHand.matrix);
    rightHand.matrix.scale(0.1, 0.0835, 0.125);
    rightHand.matrix.translate(0.0, 0.0, 0.0);
    rightHand.normalMatrix.setInverseOf(rightHand.matrix).transpose();
    rightHand.drawCube();

    // Draw the orange
    var orange = new Cube();
    orange.color = [0.8, 0.2, 0.0, 1.0];
    if (g_normalOn) orange.textureNum = -3;
    orange.matrix = rightHandCoordinatesMat;
    orange.matrix.translate(0.01, -0.05, -0.075);
    orange.matrix.rotate(g_orangeAngle, 1.0, 0.0, 0.0);
    orange.matrix.scale(0.1, 0.1, 0.1);
    orange.matrix.translate(0.0, 0.0, 0.0);
    orange.normalMatrix.setInverseOf(orange.matrix).transpose();
    orange.drawCube();

    // Draw the left leg
    var leftLeg = new Cube();
    leftLeg.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) leftLeg.textureNum = -3;
    leftLeg.matrix.translate(-0.175, 0.025, 0.1);
    leftLeg.matrix.rotate(-g_leftLegAngle, 1.0, 0.0, 0.0);
    var leftLegCoordinatesMat = new Matrix4(leftLeg.matrix);
    leftLeg.matrix.scale(0.1, 0.25, 0.1);
    leftLeg.matrix.translate(-0.5, -1.0, -0.5);
    leftLeg.normalMatrix.setInverseOf(leftLeg.matrix).transpose();
    leftLeg.drawCube();

    // Draw the right leg
    var rightLeg = new Cube();
    rightLeg.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) rightLeg.textureNum = -3;
    rightLeg.matrix.translate(-0.025, 0.025, 0.1);
    rightLeg.matrix.rotate(g_rightLegAngle, 1.0, 0.0, 0.0);
    var rightLegCoordinatesMat = new Matrix4(rightLeg.matrix);
    rightLeg.matrix.scale(0.1, 0.25, 0.1);
    rightLeg.matrix.translate(-0.5, -1.0, -0.5);
    rightLeg.normalMatrix.setInverseOf(rightLeg.matrix).transpose();
    rightLeg.drawCube();

    // Draw the left foot
    var leftFoot = new Cube();
    leftFoot.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) leftFoot.textureNum = -3;
    leftFoot.matrix = leftLegCoordinatesMat;
    leftFoot.matrix.translate(0.0, -0.2125, -0.025);
    leftFoot.matrix.rotate(-g_leftFootAngle, 1.0, 0.0, 0.0);
    leftFoot.matrix.scale(0.1, 0.0835, 0.15);
    leftFoot.matrix.translate(-0.5, -0.5, -0.5);
    leftFoot.normalMatrix.setInverseOf(leftFoot.matrix).transpose();
    leftFoot.drawCube();

    // Draw the right foot
    var rightFoot = new Cube();
    rightFoot.color = [0.4, 0.2, 0.0, 1.0];
    if (g_normalOn) rightFoot.textureNum = -3;
    rightFoot.matrix = rightLegCoordinatesMat;
    rightFoot.matrix.translate(0.0, -0.2125, -0.025);
    rightFoot.matrix.rotate(g_rightFootAngle, 1.0, 0.0, 0.0);
    rightFoot.matrix.scale(0.1, 0.0835, 0.15);
    rightFoot.matrix.translate(-0.5, -0.5, -0.5);
    rightFoot.normalMatrix.setInverseOf(rightFoot.matrix).transpose();
    rightFoot.drawCube();

    // Draw the left eye
    var leftEye = new Cylinder();
    leftEye.color = [1.0, 1.0, 1.0, 1.0];
    if (g_normalOn) leftEye.textureNum = -3;
    leftEye.matrix.translate(-0.185, 0.37, 0.0);
    leftEye.matrix.rotate(-90.0, 1.0, 0.0, 0.0);
    leftEye.matrix.scale(0.04, g_leftEyeAngle + 0.04, 0.04);
    leftEye.normalMatrix.setInverseOf(leftEye.matrix).transpose();
    leftEye.drawCylinder();

    // Draw the right eye
    var rightEye = new Cylinder();
    rightEye.color = [1.0, 1.0, 1.0, 1.0];
    if (g_normalOn) rightEye.textureNum = -3;
    rightEye.matrix.translate(-0.015, 0.37, 0.0);
    rightEye.matrix.rotate(-90.0, 1.0, 0.0, 0.0);
    rightEye.matrix.scale(0.04, g_rightEyeAngle + 0.04, 0.04);
    rightEye.normalMatrix.setInverseOf(rightEye.matrix).transpose();
    rightEye.drawCylinder();

    // Draw the inner left eye
    var innerLeftEye = new Cylinder();
    innerLeftEye.color = [0.0, 0.0, 0.0, 1.0];
    if (g_normalOn) innerLeftEye.textureNum = -3;
    innerLeftEye.matrix.translate(-0.185, 0.37, -0.025);
    innerLeftEye.matrix.rotate(-90.0, 1.0, 0.0, 0.0);
    innerLeftEye.matrix.scale(0.02, g_innerLeftEyeAngle + 0.02, 0.02);
    innerLeftEye.normalMatrix.setInverseOf(innerLeftEye.matrix).transpose();
    innerLeftEye.drawCylinder();

    // Draw the inner right eye
    var innerRightEye = new Cylinder();
    innerRightEye.color = [0.0, 0.0, 0.0, 1.0];
    if (g_normalOn) innerRightEye.textureNum = -3;
    innerRightEye.matrix.translate(-0.015, 0.37, -0.025);
    innerRightEye.matrix.rotate(-90.0, 1.0, 0.0, 0.0);
    innerRightEye.matrix.scale(0.02, g_innerRightEyeAngle + 0.02, 0.02);
    innerRightEye.normalMatrix.setInverseOf(innerRightEye.matrix).transpose();
    innerRightEye.drawCylinder();

    // Draw the left eyebrow
    var leftEyebrow = new Cube();
    leftEyebrow.color = [0.24, 0.1, 0.0, 1.0];
    if (g_normalOn) leftEyebrow.textureNum = -3;
    leftEyebrow.matrix.translate(-0.225, 0.37, -0.055);
    leftEyebrow.matrix.scale(0.09, 0.05, 0.05);
    leftEyebrow.drawCube();

    // Draw the right eyebrow
    var rightEyebrow = new Cube();
    rightEyebrow.color = [0.24, 0.1, 0.0, 1.0];
    if (g_normalOn) rightEyebrow.textureNum = -3;
    rightEyebrow.matrix.translate(-0.065, 0.37, -0.055);
    rightEyebrow.matrix.scale(0.09, 0.05, 0.05);
    rightEyebrow.drawCube();

    // Check the time at the end of the function and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}