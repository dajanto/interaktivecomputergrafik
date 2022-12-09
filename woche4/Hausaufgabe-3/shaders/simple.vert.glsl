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
vec4 ambientLight = vec4(iA * kA,0.0);

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

float max3 (vec3 v) {
    return max (max (v.x, v.y), v.z);
}

float max4 (vec4 v) {
    return max (max (v.x, v.y), max(v.z, v.w));
}

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

    //vfColor = vColor * myColor;
    //vfColor = ambientLight;
    //vfColor = vec4(vNormal.xyz,1.0);

    // TODO diffuses licht
    vec3 lightDir = lightSource + vPosition.xyz;
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * vColor.xyz;
    vec3 result = (ambientLight.xyz + diffuse) * vColor.xyz;
    vfColor = vec4(result,1.0);

    // gl_Position = viewMatrix * vPosition;
    // gl_Position = viewMatrix* (modelMatrix *  vPosition);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}
