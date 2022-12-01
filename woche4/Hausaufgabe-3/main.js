let gl;
let program;
let meshes = []

// TODO: 1.0:
// Führe globale Variablen ein für Werte, die in verschiedenen 
// Funktionen benötigt werden
let n = 0;
let modelMatrixLoc, viewMatrixLoc;
let eye = [0,0,1], target = [0,0,0], up = [0,1,0], strafe = [1,0,0], look = glMatrix.vec3.create();
glMatrix.vec3.subtract(look, target, eye);
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

		// TODO
		// Create VBO for normals and activate it
		this.normalsVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);

		// Fill VBO with normals
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
	}
	
	update() {
		// TODO 2.6
		// Aktualisiere die Variablen der Vertex und Fragment Shader hier.
		gl.uniformMatrix4fv(modelMatrixLoc, false, this.modelMatrix);
	}

	// TODO 1.3
	// Erweitere die Klasse, so dass diese eine setModelMatrix Funktion bereitstellt.
	
	setModelMatrix(mat) {
		this.modelMatrix = mat;
			
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
	let normals = model.meshes[0].normals;

	// 2. Generate colors for the cube
	let colors;
	if (model.meshes[0].colors) {
		// if the mesh supports colors
		colors = model.meshes[0].colors.flat()
	} else {
		
		switch(n){
			case 0: colors = model.meshes[0].vertices.map(x => [0.6, 0.3, 0, 1]).flat()
				break;
			case 1: colors = model.meshes[0].vertices.map(x => [0, 0, 0, 0.3]).flat()
				break;
			case 2: colors = model.meshes[0].vertices.map(x => [0, 0, 0, 0.2]).flat()
				break;
			case 3: colors = model.meshes[0].vertices.map(x => [0.1, 0.25, 0.05, 1]).flat()
				break;
			case 4: colors = model.meshes[0].vertices.map(x => [0.1, 0.25, 0.05, 1]).flat()
				break;
			default: colors = model.meshes[0].vertices.map(x => [1, 0.2, 0.5, 1]).flat()
				break;
				
		}
	}
	n++;
	// 3. Get indices from the cube and flatten them
	let indices = model.meshes[0].faces.flat();
	return new Mesh(positions, colors, indices);
}

// TODO 2.8: Erstelle einen Event-Handler, der anhand von WASD-Tastatureingaben
// die View Matrix anpasst
function move(e) 
{
	let normalized = glMatrix.vec3.create();
	switch(e.key){
		case "w" : 	glMatrix.vec3.negate(normalized, look);
					glMatrix.vec3.normalize(normalized, normalized);
			break;
		case "s" : 	glMatrix.vec3.normalize(normalized, look);
			break;
		case "a" : 	glMatrix.vec3.normalize(normalized, strafe);
			break;
		case "d" : 	glMatrix.vec3.negate(normalized, strafe);
					glMatrix.vec3.normalize(normalized, normalized);
			break;
		default : return;
			break;
	}
	glMatrix.vec3.scale(normalized, normalized, 0.1);
	glMatrix.mat4.translate(viewMatrix, viewMatrix, normalized);
		
}
/*
function rotate(e)
{
	mat4.rotate(modelMatrix, modelMatrix, degToRad(90), [0, 1, 0])
}
*/
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
	modelMatrixLoc = gl.getUniformLocation(program, 'modelMatrix');
	viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');

	// TODO 2.4: Erstelle mithilfe der Funktionen aus gl-matrix.js eine initiale View Matrix
	glMatrix.mat4.lookAt(viewMatrix, eye, target, up);
	
	// TODO 2.5: Übergebe die initiale View Matrix an den Shader
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

	// TODO 2.9: Füge einen Event Listener für Tastatureingaben hinzu
	document.addEventListener("keydown", move);

	let files = [
		// TODO 1.1
		// Add your trees and clouds here
		"meshes/island.ply",
		"meshes/Wolkesmall.ply",
		"meshes/Wolkesmall.ply",
		"meshes/Baummini.ply",
		"meshes/Baummini.ply"

	];

	let matrices = [
		// TODO 1.2
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
		glMatrix.mat4.create()
	];
	glMatrix.mat4.scale(matrices[0], matrices[0], [0.4,0.4,0.4]);
	glMatrix.mat4.scale(matrices[1], matrices[1], [0.2,0.2,0.2]);
	glMatrix.mat4.scale(matrices[2], matrices[2], [0.25,0.25,0.25]);
	glMatrix.mat4.scale(matrices[3], matrices[3], [0.1,0.1,0.1]);
	glMatrix.mat4.scale(matrices[4], matrices[4], [0.1,0.1,0.1]);
	
	glMatrix.mat4.translate(matrices[1], matrices[1], [2,1.75,3]);
	glMatrix.mat4.translate(matrices[2], matrices[2], [1,-1,-2]);
	glMatrix.mat4.translate(matrices[3], matrices[3], [-5,0.25,2]);
	glMatrix.mat4.translate(matrices[4], matrices[4], [0,3,0]);

	glMatrix.mat4.rotate(matrices[2], matrices[2], 15, [0,1,0]);

	// 1. Clear depth buffer before rendering
	
	for (let i = 0; i < files.length; i++) {
		let mesh = await readMeshAsync(files[i], meshConverter);

		// TODO 1.3 Implementiere die Funktion setModelMatrix,
		// welche die Model Matrix des jeweiligen Meshes setzt. 
		mesh.setModelMatrix(matrices[i]);
		
		meshes.push(mesh);
	}
	
	
	window.requestAnimationFrame(render);
};

function render(timestamp) {
	const elapsed = timestamp - lastTimestamp;
	
	// TODO 2.x
	// Setze Camera View Matrix
	glMatrix.mat4.multiply(modelViewProjection, projectionMatrix, viewMatrix);
	let viewLoc = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewLoc, false, modelViewProjection);
	
	// TODO 1.4
	// Clear frame here
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// TODO 1.5
	// Render objects here
	for (let i = 0; i < meshes.length; ++i) {
		// TODO 2.7
		// Call mesh update function here
		meshes[i].update();
		meshes[i].render();
	}

	// ...
	lastTimestamp = timestamp;
	window.requestAnimationFrame(render);
}

window.onload = async function () {
	main();
};

