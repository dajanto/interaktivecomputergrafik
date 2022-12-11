#version 300 es
in vec4 vPosition;
in vec4 vColor;
in vec3 vNormal;

// TODO statische lichtquelle
//in vec3 lightSource;
vec3 lightSource = vec3(0,5,3);

out vec4 vfColor;

// ambient
const vec3 iA = vec3(0.0,0.0,0.8);
const vec3 kA = vec3(0.2,0.2,0.2);

// TODO diffuse: id kd ins anwendungsprogramm
const vec3 iD = vec3(0.1,0.1,0.5);
const vec3 kD = vec3(0.8,0.0,0.8);

// TODO specular: is ks ins anwendungsprogramm
const vec3 iS = vec3(1.0,0.0,1.0);
const vec3 kS = vec3(0.1,0.0,0.7);

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

    // ambient light
    float ambientLightStrength = 1.0;
    vec4 ambientLight = vec4(iA * kA,0.0);

    // TODO diffuse light
    vec3 lightDir = normalize(lightSource - vPosition.xyz);
    float maxNL = max(0.0,dot(normalize(vNormal),lightDir));
    vec3 diffuse = iD * kD * maxNL;

    // TODO specular light

    // TODO kamera
    vec3 view = vec3(0,5,3);
    vec3 viewDir = normalize(view - vPosition.xyz);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float power = 32.0;
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), power);
    float specularStrength = 1.0;
    vec3 specular = specularStrength * spec * vColor.xyz;

    // all together
    vec3 phong = (ambientLightStrength * ambientLight.xyz) + diffuse + specular;
    vfColor = vec4(phong,1.0);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}