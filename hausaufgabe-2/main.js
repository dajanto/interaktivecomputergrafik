let gl;
let program;
let meshes = []

class Mesh {
	constructor (positions, colors, indices) {
		this.positions = positions;
		this.colors = colors;
		this.indices = indices;
		this.initalized = false
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

	let files = [
		//"meshes/coloredmesh.ply",
		//"meshes/cube.ply",
		"meshes/Baum.ply",
		"meshes/Insel.ply",
		"meshes/Wolke.ply"
	];

	// Render
	// 1. Clear depth buffer before rendering
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	readMesh(files, function(models) {

		console.log(models);

		for (let i = 0; i < models.length; ++i) {
			let model = models[i];

			// 2. Get positions from the cube
			let positions = model.meshes[0].vertices;

			// 3. Generate colors for the cube
			let colors;
			if (model.meshes[0].colors) {
				// if the mesh supports colors
				colors = model.meshes[0].colors.flat() // .map(x => [1, 0.2, 0.5, 1]).flat()
			} else {
				// if not we set one
				colors = model.meshes[0].vertices.map(x => [1, 0.2, 0.5, 1]).flat()
			}

			// 4. Get indices from the cube and flatten them
			let indices = model.meshes[0].faces.flat();
			meshes.push(new Mesh(positions, colors, indices));
		}

		// 5. render meshes
		for (let i = 0; i < meshes.length; ++i) {
			meshes[i].render()
		}
	});
};

window.onload = function () {
	main();
};

