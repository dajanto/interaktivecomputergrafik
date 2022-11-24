let gl;
let program;
let meshes = []

// TODO: 1.0:
// Führe globale Variablen ein für Werte, die in verschiedenen Funktionen benötigt werden
let lastTimestamp = 0.0;
let viewMatrix = glMatrix.mat4.create();
let projectionMatrix = glMatrix.mat4.create();
let modelViewProjection = glMatrix.mat4.create();

class Mesh {
	constructor (positions, colors, indices) {
		this.positions = positions;
		this.colors = colors;
		this.indices = indices;
		this.initalized = false;
		this.modelMatrix = glMatrix.mat4.create();
	}
	
	intialize() {
		this.initalized = true;
		
		// Create VBO for positions and activate it
		this.posVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posVBO);
		
		// Fill VBO with positions
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		
		// Create VBO for colors and activate it
		this.colorVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVBO);
		
		// Fill VBO with colors
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
		
		// Create VBO for indices and activate it
		this.indexVBO = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Fill VBO with indices
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
	}
	
	update() {
		// TODO 2.6
		// Aktualisiere die Variablen der Vertex und Fragment Shader hier.
	}

	// TODO 1.3
	// Erweitere die Klasse, so dass diese eine setModelMatrix Funktion bereitstellt.
	setModelMatrix(mat) {
		// TODO
	}

	render() {
		if (!this.initalized) {
			this.intialize();
		}

		// Link data in VBO to shader variables
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posVBO);
		const posLoc = gl.getAttribLocation(program, "vPosition");
		gl.enableVertexAttribArray(posLoc);
		// 2. Change number of components per position to 3
		gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

		// Link data in VBO to shader variables
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVBO);
		const colorLoc = gl.getAttribLocation(program, "vColor");
		gl.enableVertexAttribArray(colorLoc);
		gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

		// Bind data in index VBO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);

		// 4. Match number of vertices to size of new positions array
		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
	}
}

function meshConverter(model) {
	// 1. Get positions from the cube
	let positions = model.meshes[0].vertices;

	// 2. Generate colors for the cube
	let colors;
	if (model.meshes[0].colors) {
		// if the mesh supports colors
		colors = model.meshes[0].colors.flat()
	} else {
		// if not we set one
		colors = model.meshes[0].vertices.map(x => [1, 0.2, 0.5, 1]).flat()
	}

	// 3. Get indices from the cube and flatten them
	let indices = model.meshes[0].faces.flat();
	return new Mesh(positions, colors, indices);
}

// TODO 2.8: Erstelle einen Event-Handler, der anhand von WASD-Tastatureingaben
// die View Matrix anpasst
function move(e) 
{
}

function changeView(e) 
{
}

async function main() {

	// Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl2');

	// Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// 5. Add depth test
	gl.enable(gl.DEPTH_TEST);

	// Init shader program via additional function and bind it
	program = await initShaders(gl, "shaders/simple.vert.glsl", "shaders/simple.frag.glsl");
	gl.useProgram(program);

	// TODO 2.3: Bestimme Locations der Shadervariablen für Model und View Matrix
	// TODO 2.4: Erstelle mithilfe der Funktionen aus gl-matrix.js eine initiale View Matrix
	viewMatrix = glMatrix.mat4.create();
	
	// TODO 2.5: Übergebe die initiale View Matrix an den Shader

	// TODO 2.9: Füge einen Event Listener für Tastatureingaben hinzu

	let files = [
		// TODO 1.1
		// Add your trees and clouds here
		// Load the island as ply object
		"meshes/island.ply",
	];

	let matrices = [
		// TODO 1.2
		// create model matrices for each object
		glMatrix.mat4.create(),
	];

	// Render
	// TODO 1.4
	// Lösche den Frame vor dem zeichnen.
	// Denke daran, die Funktion in die render Funktion zu verschieben.

	// 1. Clear depth buffer before rendering
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for (let i = 0; i < files.length; i++) {
		let mesh = await readMeshAsync(files[i], meshConverter);

		// TODO 1.3 Implementiere die Funktion setModelMatrix,
		// welche die Model Matrix des jeweiligen Meshes setzt. 
		// mesh.setModelMatrix(matrices[i]);

		meshes.push(mesh);
	}

	// TODO 1.5
	// Rendere die Meshes innerhalb der render Funktion.
	for (let i = 0; i < meshes.length; ++i) {
		// TODO 2.7
		// Call mesh update function here
		meshes[i].render();
	}

	window.requestAnimationFrame(render);
};

function render(timestamp) {
	const elapsed = timestamp - lastTimestamp;

	// TODO 2.x
	// Setze Camera View Matrix 
	// glMatrix.mat4.multiply(modelViewProjection, projectionMatrix, viewMatrix);
	// let viewLoc = gl.getUniformLocation(program, "viewMatrix");
	// gl.uniformMatrix4fv(viewLoc, false, modelViewProjection);

	// TODO 1.4
	// Clear frame here

	// TODO 1.5
	// Render objects here

	// ...

	lastTimestamp = timestamp;
	window.requestAnimationFrame(render);
}

window.onload = async function () {
	main();
};

