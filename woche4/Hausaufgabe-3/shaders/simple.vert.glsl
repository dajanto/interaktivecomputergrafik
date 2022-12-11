#version 300 es
in vec4 vPosition;
in vec4 vColor;
in vec3 vNormal;

// TODO statische lichtquelle
//in vec3 lightSource;
vec3 lightSource = vec3(0,5,3);

out vec4 vfColor;
const vec3 iA = vec3(0.0,0.0,0.8);
const vec3 kA = vec3(0.2,0.2,0.2);
// TODO id kd ins anwendungsprogramm
const vec3 iD = vec3(0.1,0.1,0.5);
const vec3 kD = vec3(0.8,0.0,0.8);
vec4 ambientLight = vec4(iA * kA,0.0);

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

void main()
{
    const mat4 projectionMatrix = mat4(
    1.2071068286895752, 0, 0, 0,
    0, 2.4142136573791504, 0, 0,
    0, 0, -1.0100502967834473, -1,
    0, 0, -1.0050251483917236, 0);

    //const mat4 viewMatrix = mat4(
    //    0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0,
    //    0, 0.2357022613286972, -0.006667333655059338, 0,
    //    -0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0,
    //    0, 0, -0.8801880478858948, 1);

    // TODO diffuses licht
    vec3 lightDir = normalize(lightSource - vPosition.xyz);
    float maxNL = max(0.0,dot(vNormal,-lightDir));
    vec3 diffuse = iD * kD * maxNL;
    float ambientLightStrength = 1.0;
    vec3 ambientDiffus = (ambientLightStrength * ambientLight.xyz) + diffuse;
    vfColor = vec4(ambientDiffus,1.0);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}