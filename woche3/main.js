let gl;
let program;
let positions,
	colors;
let posVBO,
	colorVBO;

function main() {

	// Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl2');

	// Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// 5. Add depth test
	gl.enable(gl.DEPTH_TEST);

	// Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);


	/*
	// TODO set correct filename
	let files = [
		"meshes/cube.ply"
	];

	// TODO write mesh loader
	readMesh(files, function(model) { 
		console.log(model);
	});
	*/

	initTriangle();
	renderTriangle();
};

function initTriangle() {

	// Specify geometry
	// 1. Add z coordinate for each vertex
	positions = [
		//-1, -1,  1,    1,  1,  1,   -1,  1,  1, // Front
		//-1, -1,  1,    1, -1,  1,    1,  1,  1,
		// 1, -1,  1,    1,  1, -1,    1,  1,  1, // Right
		// 1, -1,  1,    1, -1, -1,    1,  1, -1, 
		// 1, -1, -1,   -1,  1, -1,   -1, -1, -1, // Back
		// 1, -1, -1,    1,  1, -1,   -1,  1, -1,
		//-1, -1, -1,   -1,  1,  1,   -1,  1, -1, // Left
		//-1, -1, -1,   -1, -1,  1,   -1,  1,  1,
		//-1, -1, -1,    1, -1,  1,   -1, -1,  1, // Bottom
		//-1, -1, -1,    1, -1, -1,    1, -1,  1,
		//-1,  1,  1,    1,  1, -1,   -1,  1, -1, // Top
		//-1,  1,  1,    1,  1,  1,    1,  1, -1
		-1, -1,  1,    1,  1,  1,   -1,  1,  1,  1, -1, 1,
		1,-1,1 , 1,-1,-1, 1,1,-1, 1,1,1
	];

	colors = [ 
			1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1, 1,0,0,1,  // Front
			0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1, // Right
			0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
			0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1, // Back
			0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
			1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1, // Left 
			1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1, 
			1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1, // Bottom
			1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
			0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1, // Top
			0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1
		];

	indices = [0,1,2,0,1,3,4,5,6,7,4,6];

	initTriangleBuffers();
}

function initTriangleBuffers() {

	// Create VBO for positions and activate it
	posVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);

    // Fill VBO with positions
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Create VBO for colors and activate it
	colorVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);


	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices), gl.STATIC_DRAW);

    // Fill VBO with colors
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

function renderTriangle() {

	// Link data in VBO to shader variables
	gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
	const posLoc = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(posLoc);
	// 2. Change number of components per position to 3
	gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Link data in VBO to shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
	const colorLoc = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(colorLoc);
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

	// Render
	// 3. Clear depth buffer before rendering
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// 4. Match number of vertices to size of new positions array
	//gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);

	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

window.onload = function () {
	main();
};

