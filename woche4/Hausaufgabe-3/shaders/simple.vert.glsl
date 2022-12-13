#version 300 es
in vec4 vPosition;
in vec3 vNormal;
in vec4 vColor;
out vec4 vfColor;

// TODO 2.1: Erstelle Uniform-Variable für die Model Matrix
uniform mat4 modelMatrix;
// TODO 2.1: Erstelle Uniform-Variable für die View-Matrix
uniform mat4 viewMatrix;

uniform vec3 lightPosition;

uniform vec4 iA;
uniform vec4 iS;
uniform vec4 iD;

uniform vec4 kA;
uniform vec4 kS;
uniform vec4 kD;
const float c1 = 1.0;
const float c2 = 0.0005;
const float c3 = 0.000003;

uniform float specular;

void main()
{
    const mat4 projectionMatrix = mat4(
        1.2071068286895752, 0, 0, 0, 
        0, 2.4142136573791504, 0, 0, 
        0, 0, -1.0100502967834473, -1, 
        0, 0, -1.0050251483917236, 0);

    /*const mat4 viewMatrix = mat4(
        0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0, 
        0, 0.2357022613286972, -0.006667333655059338, 0, 
        -0.1767766922712326, -0.0589255653321743, -0.013334667310118675, 0, 
        0, 0, -0.8801880478858948, 1);*/


    vec4 vViewCords = viewMatrix * modelMatrix * vPosition;
    vec4 lightPos = viewMatrix * vec4(lightPosition, 1.0);
    vec4 normal = inverse(transpose(viewMatrix * modelMatrix)) * vec4(vNormal, 0.0);

    vec4 L = normalize(lightPos - vViewCords);
    vec4 V = normalize(-vViewCords);
    vec4 N = normalize(normal);
    vec4 R = reflect(-L, N);
        
    float d = distance(lightPos, vViewCords);
    float fAtt = min(1.0/(c1 + (c2 * d) + (c3 * pow(d, 2.0))), 1.0);

    vfColor = iA * kA + fAtt * (iD *kD * max(0.0, dot(N, L)) + iS * kS * pow(max(0.0, dot(R, V)), specular));

    // TODO 2.2: Transformiere Vertexposition mit Model und View Matrix
      gl_Position = projectionMatrix * vViewCords;
    
}