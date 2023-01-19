let gl;
let phongShader ;
let meshes = []
let canvas ;

const WALK_STOP		= 0x0 ;
const WALK_FORWARD	= 0x1 ;
const WALK_BACKWARD	= 0x2 ;
const WALK_LEFT		= 0x4 ;
const WALK_RIGHT	= 0x8 ;

let walkingState = WALK_STOP ;

// We track the X/Y Rotation of the camera
let dragging = false ;
let dragStartScreenX ;
let dragStartScreenY ;
let dragStartCamRotationX ;
let dragStartCamRotationY ;

// Führe globale Variablen ein für Werte, die in verschiedenen Funktionen benötigt werden
let lastTimestamp = 0.0;
let viewMatrix ;
let projectionMatrix ;

// Locations of both the view and the model matrix
let modelMatrixLoc ;
let viewMatrixLoc ;
let fragmentViewMatrixLoc ;
let projectionMatrixLoc ;

let lightPositionLoc ;

let iaLoc ;
let idLoc ;
let isLoc ;

let kaLoc ;
let kdLoc ;
let ksLoc ;
let cLoc ;
let specExpLoc ;

let lightPosition = glMatrix.vec3.fromValues ( 4.0, 5.0, 3.0 ) ;

let ia = glMatrix.vec3.fromValues ( 0.5, 0.5, 0.5 ) ;
let id = glMatrix.vec3.fromValues ( 1.0, 1.0, 1.0 ) ;
let is = glMatrix.vec3.fromValues ( 0.8, 0.8, 0.8 ) ;

let ka = glMatrix.vec3.fromValues ( 0.1, 0.1, 0.1 ) ;
let kd = glMatrix.vec3.fromValues ( 0.8, 0.8, 0.8 ) ;
let ks = glMatrix.vec3.fromValues ( 0.8, 0.8, 0.8 ) ;
let specExp = 8.0 ;
let c = glMatrix.vec3.fromValues ( 1.0, 0.00001, 0.0000001 ) ; 

// This is the initial position of the camera
// We only track 3 camera properties : position, x rotation angle,
// y rotation angle

let camPosition = glMatrix.vec3.fromValues ( 0.0, 1.0, 5.0 ) ;
let camRotationX = 0.0 ;
let camRotationY = 0.0 ;

class Mesh {
	constructor (positions, colors, indices, normals, uvs = null, tangents = null, bitangents = null ) {
		this.positions = positions;
		this.colors = colors;
		this.indices = indices;
		this.normals = normals;
		this.uvs = uvs ;
		this.tangents = tangents ;
		this.bitangents = bitangents ;
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

		if ( this.uvs )
		{
			// Create VBO for texture coordinates and activate it
			this.texCoordVBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVBO);
			
			// Fill VBO with texture coordinates
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
		}


		if ( this.normals )
		{
			// Create VBO for normals and activate it
			this.normalVBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVBO);
			
			// Fill VBO with normals
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		}

		if ( this.tangents )
		{
			// Create VBO for tangents and activate it
			this.tangentVBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentVBO);
			
			// Fill VBO with tangents
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tangents), gl.STATIC_DRAW);
		}

		if ( this.bitangents )
		{
			// Create VBO for bitangents and activate it
			this.bitangentVBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentVBO);
			
			// Fill VBO with bitangents
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bitangents), gl.STATIC_DRAW);
		}


		if ( this.colors )
		{
			// Create VBO for colors and activate it
			this.colorVBO = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVBO);
			
			// Fill VBO with colors
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
		}
		
		// Create VBO for indices and activate it
		this.indexVBO = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Fill VBO with indices
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);
	}
	

	// ToDo 1.7
	// Die Update Funktion muss nun auch die lokalen Uniform-Locations benutzen

	// Ab diesen Punkt sollte ein roter Baumstumpf sichtbar sein, weil dieser
	// einen eigenen Shader hat, der den Rotkanal auf 1 setzt

	update()
	{
		// gl.useProgram ( this.shader ) ;
		// // Aktualisiere die Variablen der Vertex und Fragment Shader hier.
		gl.uniformMatrix4fv ( modelMatrixLoc, false, this.modelMatrix ) ;
		gl.uniformMatrix4fv ( viewMatrixLoc, false, viewMatrix ) ;
		gl.uniformMatrix4fv ( fragmentViewMatrixLoc, false, viewMatrix ) ;
	}

	setModelMatrix(mat)
	{
		this.modelMatrix = mat ;
	}

	render()
	{
		if (!this.initalized)
		{
			this.intialize();
		}

		//gl.useProgram ( this.shader ) ;

		// Link data in VBO to shader variables
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posVBO);
		const posLoc = gl.getAttribLocation( this.shader, "vPosition");
		gl.enableVertexAttribArray(posLoc);
		// 2. Change number of components per position to 3
		gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

		// Link data in VBO to shader variables
		if ( this.colors )
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVBO);
			const colorLoc = gl.getAttribLocation( this.shader, "vColor");
			gl.enableVertexAttribArray(colorLoc);
			gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

		}

		if ( this.uvs )
		{
			const texCoordLoc = gl.getAttribLocation( this.shader, "vTexCoord");
			if ( texCoordLoc != -1 )
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVBO);
				gl.enableVertexAttribArray(texCoordLoc);
				gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
			}
		}
		
		// Sample solution : Add VBO for the normal vectors
		if ( this.normals )
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVBO);
			const normalLoc = gl.getAttribLocation( this.shader, "vNormal");
			gl.enableVertexAttribArray(normalLoc);
			gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

		}

		if ( this.tangents )
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentVBO);
			const tangentLoc = gl.getAttribLocation( this.shader, "vTangent");
			gl.enableVertexAttribArray(tangentLoc);
			gl.vertexAttribPointer(tangentLoc, 3, gl.FLOAT, false, 0, 0);

		}

		if ( this.bitangents )
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentVBO);
			const bitangentLoc = gl.getAttribLocation( this.shader, "vBitangent");
			gl.enableVertexAttribArray(bitangentLoc);
			gl.vertexAttribPointer(bitangentLoc, 3, gl.FLOAT, false, 0, 0);

		}

		// Bind data in index VBO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);

		// 4. Match number of vertices to size of new positions array
		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
	}

	// siehe ToDo 1.3
	getUniformLocations ()
	{
		gl.useProgram ( this.shader ) ;
		// insert code here
	}

	// siehe ToDo 1.4
	setUniforms ()
	{
		gl.useProgram ( this.shader ) ;
		// insert code here
	}

}

class PlaneMesh extends Mesh
{
	constructor ( columns, rows, width, height )
	{
		let positions = [] ;
		let normals = [] ;
		let indices = [] ;
		let tangents = [] ;
		let bitangents = [] ;
		let colors = [] ;
		let uvs = [] ;
		let numXVertices = columns + 1 ;		// 3 horizontal segments -> 4 vertices
		let numYVertices = rows + 1 ;			// same as above

		for ( let y=0 ; y < numYVertices ; y++ )
		{
			for ( let x=0 ; x < numXVertices ; x++ )
			{
				let tx = x * ( 1.0 / columns ) ;		// tx is in the range [0..1] now
				let ty = y * ( 1.0 / rows ) ;			// ty is in the range [0..1] now
				let posX = ( tx - 0.5 ) * width ;		// posX is in the range -0.5*width to 0.5*width
				let posY = ( ty - 0.5 ) * height ;		// see posX
				let posZ = 0.0 ;						// posZ is always zero for this is a XY plane
				
				positions.push ( posX, posY, posZ ) ;
				uvs.push ( tx, - ty ) ;
				normals.push ( 0.0, 0.0, 1.0 ) ;

				// Hier gehoeren noch Tangenten und Bitangenten hin


				colors.push ( 0.2, 0.2, 0.7 + 0.3 * Math.random (), 1.0 ) ;
 				// console.log ( "tx = " + tx + ", ty = " + ty + ", u = " + u + ", v = " + v ) ;
				// console.log ( "posX = " + posX + ", posY = " + posY ) ;
			}
		}

		// Indices :			  	i0 -- i2
		//							|   /  |
		//							|  /   |
		//							i1 -- i3

		for ( let y=0 ; y < rows ; y++ )
		{
			for ( let x=0 ; x < columns ; x++ )
			{
				let i0 = numXVertices * y + x ;
				let i1 = numXVertices * ( y + 1 ) + x ;
				let i2 = numXVertices * y + ( x + 1 ) ;
				let i3 = numXVertices * ( y + 1 ) + ( x + 1 ) ;
				
				indices.push ( i0, i1, i2, i1, i3, i2 ) ;
			}
		}

		// console.log ( positions ) ;
		// console.log ( indices ) ;
		// constructor (positions, colors, indices, normals ) {

		super ( positions, colors, indices, normals, uvs, tangents, bitangents ) ;

	}
}


function meshConverter(model)
{
	// Get positions from the cube
	let positions = model.meshes[0].vertices;

	// Generate colors for the cube
	let colors;
	if (model.meshes[0].colors) {
		// if the mesh supports colors
		colors = model.meshes[0].colors.flat()
	} else {
		// if not we set one
		// Sample solution : Put some random color values here so you can at least
		// get a grasp of the model's shape
		colors = model.meshes[0].vertices.map ( x => [ Math.random(), 0.2, 0.5, 1.0 ] ).flat() ;
	}

	// Example solution : Copy the normals
	let normals = model.meshes[0].normals ;

	// Get indices from the cube and flatten them
	let indices = model.meshes[0].faces.flat();
	return new Mesh(positions, colors, indices, normals );
}

// this is called whenever a key is being pressed

function move(e) 
{
	switch ( e.code )
	{
		case	"KeyW"	:	walkingState = walkingState | WALK_FORWARD ; break ;
		case	"KeyS"	:	walkingState = walkingState | WALK_BACKWARD ; break ;
		case	"KeyD"	:	walkingState = walkingState | WALK_RIGHT ; break ;
		case	"KeyA"	:	walkingState = walkingState | WALK_LEFT ; break ;
	}
}

// this is called once the key is not pressed any more

function stop(e) 
{
	switch ( e.code )
	{
		case	"KeyW"	:	walkingState = walkingState & !WALK_FORWARD ; break ;
		case	"KeyS"	:	walkingState = walkingState & !WALK_BACKWARD ; break ;
		case	"KeyD"	:	walkingState = walkingState & !WALK_RIGHT ; break ;
		case	"KeyA"	:	walkingState = walkingState & !WALK_LEFT ; break ;
	}
}

// this function calculates the javascript view matrix
// note that this function does not transfer the view matrix
// to the shader yet

function setViewMatrix ()
{
	let vectorForward = glMatrix.vec3.fromValues ( 0.0, 0.0, -0.1 ) ;
	let vectorUp = glMatrix.vec3.fromValues ( 0.0, 1.0, 0.0 ) ;

	let currentViewDirection = glMatrix.vec3.create () ;
	let currentLookAtPosition = glMatrix.vec3.create () ;

	glMatrix.vec3.rotateX ( currentViewDirection, vectorForward, 
							glMatrix.vec3.fromValues ( 0.0, 0.0, 0.0 ), camRotationX ) ;
	
	glMatrix.vec3.rotateY ( currentViewDirection, currentViewDirection,
							glMatrix.vec3.fromValues ( 0.0, 0.0, 0.0 ), camRotationY ) ;

	glMatrix.vec3.add ( currentLookAtPosition, camPosition, currentViewDirection ) ;

	glMatrix.mat4.lookAt ( viewMatrix, camPosition, currentLookAtPosition, vectorUp ) ;
}

function changeView(e) 
{
	if ( dragging )
	{
		let deltaScreenX = e.screenX - dragStartScreenX  ;
		let deltaScreenY = e.screenY - dragStartScreenY  ;

		// up/down rotates around the x axis
		camRotationY =  dragStartCamRotationY - deltaScreenX * 0.002 ;
		// left/right rotates around the y axis
		camRotationX =  dragStartCamRotationX - deltaScreenY * 0.002 ;

		setViewMatrix () ;
	}
}

function mouseDownListener ( e )
{
	if ( e.button == 0 )
	{
		dragging = true ;
		dragStartScreenX = e.screenX ;
		dragStartScreenY = e.screenY ;
		dragStartCamRotationX = camRotationX ;
		dragStartCamRotationY = camRotationY ;
	}
}

function mouseUpListener ( e )
{
	if ( e.button == 0 )
	{
		dragging = false ;
	}
}

function processCameraMotion ()
{
	// look straight along the z axis
	let vectorForward = glMatrix.vec3.fromValues ( 0.0, 0.0, -0.1 ) ;
	
	// this is the direction in which we're finally gonna walk
	let currentWalkDirection = glMatrix.vec3.create () ;

	// take the vector straight along the z axis and rotate it around the Y axis to
	// match the current camera rotation. note that the vector is not gonna be rotated
	// around the x axis on purpose so we cannot change the cam elevation / y level.
	glMatrix.vec3.rotateY ( currentWalkDirection, vectorForward, 
							glMatrix.vec3.fromValues ( 0.0, 0.0, 0.0 ), camRotationY ) ;	

	// walking to the right is now relative to the rotated forward vector
	let currentWalkRightDirection = glMatrix.vec3.create () ;

	glMatrix.vec3.rotateY ( currentWalkRightDirection, currentWalkDirection, 
							glMatrix.vec3.fromValues ( 0.0, 0.0, 0.0 ), - 90.0 * ( Math.PI / 180.0 ) ) ;	

	// we change the cam position only and not the direction for we only walk
	// straight ahead/back/left/right without any rotation

	if ( walkingState & WALK_FORWARD )
		glMatrix.vec3.add ( camPosition, camPosition, currentWalkDirection ) ;
	if ( walkingState & WALK_BACKWARD )
		glMatrix.vec3.sub ( camPosition, camPosition, currentWalkDirection ) ;
	if ( walkingState & WALK_RIGHT )
		glMatrix.vec3.add ( camPosition, camPosition, currentWalkRightDirection ) ;
	if ( walkingState & WALK_LEFT )
		glMatrix.vec3.sub ( camPosition, camPosition, currentWalkRightDirection ) ;

	setViewMatrix () ;

}

function loadImage ( path )
{
	return new Promise ( (resolve, reject) =>
	{
	  const img = new Image()
	  img.crossOrigin = 'Anonymous' // to avoid CORS if used with Canvas
	  img.src = path
	  img.onload = () => {
		resolve(img)
	  }
	  img.onerror = e => {
		reject(e)
	  }
	} )
} ;

async function main()
{
	// ToDoS 1 :
	// Wir haben bislang nur ein globales Shaderprogramm genutzt, d.h. jedes Mesh
	// wurde mit dem selben Shader gerendert. Wir werden im Folgenden jedem Mesh
	// einen individuellen Shader zuweisen, um etwa Mesh A mit Phong-Shading,
	// Mesh B mit Phong-Shading + Texture-Mapping und Mesh C mit
	// Phong Shading + Texture-Mapping + Bump-Mapping rendern zu koennen.

	document.addEventListener ( "keydown", move ) ;
	document.addEventListener ( "keyup", stop ) ;

	// Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl2');

	canvas.addEventListener ( "mousedown", mouseDownListener ) ;
	document.addEventListener ( "mouseup",  mouseUpListener ) ;	
	document.addEventListener ( "mousemove", changeView ) ;
	// Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.5,0.5,0.7,1.0);

	// 5. Add depth test
	gl.enable(gl.DEPTH_TEST);

	// Init shader program via additional function and bind it

	// ToDo 1.1
	// Entferne die globale Variable phongShader und mache sie lokal, um sie einem
	// Mesh zuweisen zu koennen

	phongShader = await initShaders(gl, 	"shaders/perFragmentPhong.vert.glsl",
												"shaders/perFragmentPhong.frag.glsl");

	//let bumPhongShader = await initShaders(gl, 	"shaders/bumpPhong.vert.glsl",
	//												"shaders/bumpPhong.frag.glsl");

	let phongShaderRED = await initShaders(gl, 	"shaders/perFragmentPhongRED.vert.glsl",
												"shaders/perFragmentPhongRED.frag.glsl");

	let waterDiffuseBitmap = await loadImage ( "images/water_d.jpg" ) ;
	let waterNormalBitmap = await loadImage ( "images/water_n.jpg" ) ;



	let waterDiffuseTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, waterDiffuseTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, waterDiffuseBitmap);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	
	// ToDo 1.2
	// Verhindere die globale Benutzung des Programms phongShader
	gl.useProgram ( phongShader ) ;

	// ToDo 1.3
	// Die Locations beziehen sich stets auf das aktuelle
	// Shaderprogramm; da ein Shaderprogramm nun zu einem Meshobjekt
	// gehoeren soll, speichere die Uniform-Locations in diesem Meshobjekt
	// und loesche die globalen Variablen. Implementiere dafuer den
	// Aufruf getUniformLocations() der Mesh Klasse.
	
	// Bestimme Locations der Shadervariablen für Model und View Matrix
	modelMatrixLoc = gl.getUniformLocation ( phongShader, "modelMatrix" ) ;
	viewMatrixLoc = gl.getUniformLocation ( phongShader, "viewMatrix" ) ;
	fragmentViewMatrixLoc = gl.getUniformLocation ( phongShader, "fragmentViewMatrix" ) ;
	projectionMatrixLoc = gl.getUniformLocation ( phongShader, "projectionMatrix" ) ;

	lightPositionLoc = gl.getUniformLocation ( phongShader, "lightPosition" ) ;

	iaLoc = gl.getUniformLocation ( phongShader, "Ia" ) ;
	idLoc = gl.getUniformLocation ( phongShader, "Id" ) ;
	isLoc = gl.getUniformLocation ( phongShader, "Is" ) ;

	kaLoc = gl.getUniformLocation ( phongShader, "ka" ) ;
	kdLoc = gl.getUniformLocation ( phongShader, "kd" ) ;
	ksLoc = gl.getUniformLocation ( phongShader, "ks" ) ;

	specExpLoc = gl.getUniformLocation ( phongShader, "specExp" ) ;
	cLoc = gl.getUniformLocation ( phongShader, "c" ) ;



	// ToDo 1.4
	// Da es nun keine globalen Variablen fuer die Uniform-Locations mehr gibt,
	// muessen die Uniforms natuerlich auch entsprechend vom Objekt aus
	// gesetzt werden. Implementiere dafuer den Aufruf setUniforms()
	// der Mesh Klasse.

	gl.uniform3fv ( lightPositionLoc, lightPosition ) ;

	gl.uniform3fv ( iaLoc, ia ) ;
	gl.uniform3fv ( idLoc, id ) ;
	gl.uniform3fv ( isLoc, is ) ;

	gl.uniform3fv ( kaLoc, ka ) ;
	gl.uniform3fv ( kdLoc, kd ) ;
	gl.uniform3fv ( ksLoc, ks ) ;

	gl.uniform3fv ( cLoc, c ) ;
	gl.uniform1f ( specExpLoc, specExp ) ;
	
	// Erstelle mithilfe der Funktionen aus gl-matrix.js eine initiale View Matrix
	viewMatrix = glMatrix.mat4.create();
	projectionMatrix = glMatrix.mat4.create() ;
	
	// set the view matrix initially here
	setViewMatrix () ;

	// Übergebe die initiale View Matrix an den Shader

	// ToDo 1.5
	// Auch diese Uniforms muessen vom Meshobjekt aus gesetzt werden
	gl.uniformMatrix4fv ( viewMatrixLoc, false, viewMatrix ) ;
	gl.uniformMatrix4fv ( fragmentViewMatrixLoc, false, viewMatrix ) ;
	gl.uniformMatrix4fv ( projectionMatrixLoc, false, projectionMatrix ) ;


	let files = [
		// Add your trees and clouds here
		// Load the island as ply object
		"meshes/island.ply",
		"meshes/tree_bottom.ply",
		"meshes/tree_top.ply",
		"meshes/cloud.ply",
	];

	let matrices = [
		// create model matrices for each object
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
		glMatrix.mat4.create(),
	];

	// Place the models in the scene
	glMatrix.mat4.rotateX ( matrices[1], matrices[1], 90.0 * ( Math.PI / 180.0 ) ) ;
	glMatrix.mat4.scale ( matrices[1], matrices[1], glMatrix.vec3.fromValues ( 0.3, 0.3, 0.3 ) ) ;
	glMatrix.mat4.translate ( matrices[1], matrices[1], glMatrix.vec3.fromValues ( -2.0, 0.0, 0.0 ) ) ;

	glMatrix.mat4.scale ( matrices[2], matrices[2], glMatrix.vec3.fromValues ( 0.3, 0.3, 0.3 ) ) ;
	glMatrix.mat4.translate ( matrices[2], matrices[2], glMatrix.vec3.fromValues ( -2.0, 0.0, 0.0 ) ) ;

	glMatrix.mat4.rotateY ( matrices[3], matrices[3], 22.0 * ( Math.PI / 180.0 ) ) ;
	glMatrix.mat4.scale ( matrices[3], matrices[3], glMatrix.vec3.fromValues ( 0.5, 0.5, 0.5 ) ) ;
	glMatrix.mat4.translate ( matrices[3], matrices[3], glMatrix.vec3.fromValues ( 4.0, 4.0, 0.0 ) ) ;

	for (let i = 0; i < files.length; i++)
	{
		let mesh = await readMeshAsync ( files[i], meshConverter ) ;
		mesh.setModelMatrix(matrices[i]);
		meshes.push(mesh);
	}

	// ToDo 2 
	// Implementiere Texture-Mapping fuer das Meer. Es gibt hierfuer schon eine Klasse PlaneMesh,
	// die eine Flaeche aus vielen Segmenten inkl. uv-Koordinaten erstellt. Schau Dir die Klasse
	// genau an und benutze die oben schon erstellte Textur "waterDiffuseTexture", um diese auf
	// das Objekt pl zu legen.
	
	pl = new PlaneMesh ( 32, 32, 10, 10 ) ;
	glMatrix.mat4.translate (pl.modelMatrix, pl.modelMatrix, glMatrix.vec3.fromValues ( 0.0, -0.2, 0.0 ) ) ;
	glMatrix.mat4.rotateX ( pl.modelMatrix, pl.modelMatrix, -90.0 * ( Math.PI / 180.0 ) ) ;

	//pl.shader = bumPhongShader ;
	pl.shader = phongShader ;
	pl.getUniformLocations () ;
	pl.setUniforms() ;
	meshes.push ( pl ) ;

	// Add some nice colors to the meshes

	// island, somewhat yellow/brown
	meshes[0].colors = Array(meshes[0].colors.length/3).fill(0).map ( 
			x => [ 0.4+0.1*Math.random(), 0.2+0.1*Math.random(), 0.1, 1.0] ).flat () ;
	meshes[0].shader = phongShader ;
	meshes[0].getUniformLocations() ;
	meshes[0].setUniforms() ;

	// tree trunk, somewhat brown
	meshes[1].colors = Array(meshes[1].colors.length/3).fill(0).map ( 
			x => [ 0.3+0.1*Math.random(), 0.1+0.1*Math.random(), 0.1, 1.0] ).flat () ;
	meshes[1].shader = phongShaderRED ;
	meshes[1].getUniformLocations() ;
	meshes[1].setUniforms() ;

	// tree top, somewhat green
	meshes[2].colors = Array(meshes[2].colors.length/3).fill(0).map ( 
			x => [ 0.1+0.1*Math.random(), 0.2+0.2*Math.random(), 0.1, 1.0] ).flat () ;
	meshes[2].shader = phongShader ;
	meshes[2].getUniformLocations() ;
	meshes[2].setUniforms() ;

	// cloud, somewhat colorful blue
	meshes[3].colors = Array(meshes[3].colors.length/3).fill(0).map ( 
			x => [ 0.6+0.2*Math.random(), 0.6+0.2*Math.random(), 0.7+0.5*Math.random(), 1.0] ).flat () ;
	meshes[3].shader = phongShader ;	
	meshes[3].getUniformLocations() ;
	meshes[3].setUniforms() ;

	window.requestAnimationFrame ( render ) ;
};

function render ( timestamp )
{
	const elapsed = timestamp - lastTimestamp;

	// Sample solution : This terminology might be a bit confusing, the idea
	// behind all this is to make the matrices available in the shaders.
	// The multiplication can be done in shader as well.
	


	// ToDo 1.6 
	// Auch diese Uniforms muessen vom Meshobjekt gesetzt werden

	//	(static) perspective(out, fovy, aspect, near, far) → {mat4}
	glMatrix.mat4.perspective ( projectionMatrix, 45.0 * ( Math.PI / 180.0 ),
								parseFloat ( canvas.width ) / parseFloat ( canvas.height ),
								0.1, 100.0 ) ;
	gl.uniformMatrix4fv ( projectionMatrixLoc, false, projectionMatrix ) ;

	// Clear frame here
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	processCameraMotion () ;

	// Render objects here
	// Sample solution : This block comes from the main function
	for ( let i = 0; i < meshes.length; i++ )
	{
		// Call mesh update function here
		meshes[i].update();
		meshes[i].setUniforms();
		meshes[i].render();
	}

	// ...

	lastTimestamp = timestamp;
	window.requestAnimationFrame(render);
}

window.onload = async function () {
	main();
};

