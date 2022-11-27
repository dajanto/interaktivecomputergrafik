#version 300 es
in vec4 vPosition;
in vec4 vColor;
out vec4 vfColor;

// TODO 2.1: Erstelle Uniform-Variable für die Model Matrix
uniform mat4 modelMatrix;

// TODO 2.1: Erstelle Uniform-Variable für die View-Matrix
uniform mat4 viewMatrix;

void main()
{
    const mat4 projectionMatrix = mat4(
        1.2071068286895752, 0, 0, 0, 
        0, 2.4142136573791504, 0, 0, 
        0, 0, -1.0100502967834473, -1, 
        0, 0, -1.0050251483917236, 0);

    const mat4 viewMatrix = mat4(
        0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0, 
        0, 0.2357022613286972, -0.006667333655059338, 0, 
        -0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0, 
        0, 0, -0.8801880478858948, 1);
        
    vfColor = vColor;

    // TODO 2.2: Transformiere Vertexposition mit Model und View Matrix
   // gl_Position = viewMatrix * vPosition;
   // gl_Position = viewMatrix* (modelMatrix *  vPosition);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}