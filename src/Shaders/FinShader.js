
import {
  DoubleSide,
  NormalBlending,
} from '@seddi/three';
import { furParams } from '../furManager';
/**
 * Shell shader class to store all data needed for the ThreeJs Shader and Raw Shader Material
 */
export const finShader = {
  uniforms:
  {
    uColor: { value: { r: 0.49, g: 0.39, b: 0.31 } },
    uSpecularColor: { value: { r: 0.49, g: 0.39, b: 0.31 } },
    uAOstartColor: { value: { r: 0.1, g: 0.1, b: 0.1 } },
    uAOendColor: { value: { r: 0.9, g: 0.9, b: 0.9 } },
    uFurLength: { value: 2},
    uTextureSize: { value: 1 },
    uAlphaTexture: { value: 0 },
    uColorTexture: { value: 0 },
    uAmbientStrength: { value: 0.6 },
    uDiffusePower: { value:8 },
    uSpecularPower: { value:16 },
    uLightPos: { value: { x: 5, y: 5, z: 5 } },
    uIntensity: { value: 1.0 },
    uLightColor: { value: { r: 1, g: 1, b: 1 } },
    uUseColorText: { value: false },
    uWaveAmplitude: { value: 0.0 },
    uWaveFrequency: { value: 0.0 },
  }
  ,
  vertexShader: /* glsl */`
  attribute float extrudable;
  attribute float morph;
  attribute vec3 hairDir;
  // attribute vec3 finNormal;


  uniform float uFurLength;
  uniform vec3 uAOstartColor;
  uniform vec3 uAOendColor;

  uniform vec3 uLightPos;
  varying vec3 viewLightPos;

  varying vec3 hairTangent;
  varying vec2 textCoord;
  varying vec4 VAO;
  varying vec3 outFinNormal;
  varying vec3 fragPos;
  varying vec2 fragUV;
  varying float k_alpha;
  varying float outMorph;
  
  void main() {
    
    vec3 outPosition = position;    
    k_alpha = 4.0;
    if(extrudable==1.0){
      k_alpha = 0.0;
      outPosition =  position + hairDir * vec3(uFurLength+uFurLength*0.15,uFurLength+uFurLength*0.15,uFurLength+uFurLength*0.15);
    }
    
    textCoord = uv;
    VAO =  mix(vec4(uAOstartColor,1.0), vec4(uAOendColor,0.0), extrudable);
    
    outMorph = morph;
    outFinNormal =  mat3(transpose(inverse(modelViewMatrix))) * normal;
    hairTangent =  mat3(transpose(inverse(modelViewMatrix))) * hairDir;
    fragPos = (modelViewMatrix * vec4(outPosition,1.0)).xyz;
    fragUV = uv;
    
    viewLightPos = (viewMatrix * vec4(uLightPos,1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(outPosition,1.0);
  }`

  ,
  fragmentShader:/* glsl */`
    
  varying vec2 textCoord;
  varying vec4 VAO;
  varying vec3 outFinNormal;
  varying vec3 hairTangent;
  varying vec3 fragPos;
  varying vec2 fragUV;
  varying float k_alpha;
  varying vec3 viewLightPos;
  varying float outMorph;
  
  uniform vec3 uColor;
  uniform vec3 uSpecularColor;
  uniform sampler2D uAlphaTexture;
  uniform sampler2D uColorTexture;
  uniform float uTextureSize; 
  uniform bool uUseColorText; 
  uniform float uAmbientStrength;
  uniform float uDiffusePower;
  uniform float uSpecularPower;
  uniform float uIntensity;
  uniform vec3 uLightColor;
  uniform float uWaveFrequency;
  uniform float uWaveAmplitude;
  
  float GeometrySchlickGGX(float NdotV, float k)
  {
      float nom   = NdotV;
      float denom = NdotV * (1.0 - k) + k;
    
      return nom / denom;
  }
    
  float GeometrySmith(vec3 N, vec3 V, vec3 L, float k)
  {
      float NdotV = max(dot(N, V), 0.0);
      float NdotL = max(dot(N, L), 0.0);
      float ggx1 = GeometrySchlickGGX(NdotV, k);
      float ggx2 = GeometrySchlickGGX(NdotL, k);
    
      return ggx1 * ggx2;
  }

  vec3 computeLighting(){
    
    vec3 L = normalize(viewLightPos - fragPos);
    vec3 V = normalize(-fragPos);
    vec3 H = normalize(L + V);
    vec3 T = normalize(hairTangent);

    vec3 Ka;
    vec3 Kd;
    uUseColorText ? Ka = texture(uColorTexture,textCoord).rgb : Ka = uColor;
    uUseColorText ? Kd = texture(uColorTexture,textCoord).rgb : Kd = uColor;
    vec3 Ks = uSpecularColor;
    
    float u =dot(T,L); //Lambertian
    float v =dot(T,H); //Spec
    float t =dot(T,V);
    
    //vec3 result = uAmbientStrength*Ka+clamp(((Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower)))*dot(T,L),0.0,1.0);
    // vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower));
    //vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+clamp(Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower),0.0,1.0));
    vec3 result =  uAmbientStrength*Ka+clamp(Kd*dot(normalize(outFinNormal),L),0.0,1.0)+clamp(dot(normalize(outFinNormal),L),0.0,1.0)*Ks*pow(sin(acos(v)),uSpecularPower);

    return result*uIntensity;


  } 

  vec2 sineWave(vec2 uv0){
    vec2 uv = uv0.xy;
    uv.x += (sin((uv.y+outMorph*0.1)*uWaveFrequency)*uWaveAmplitude); //First param is frecuency, second one is wave length
    return uv;
  }


void main() {
  float alpha;
  float p = dot(normalize(-fragPos),normalize(outFinNormal));
  p = 1.0-p;
  alpha = max(0.0,2.0*abs(p)-1.0);
  if(alpha <= 0.0) return;

  vec2 modFragUV = sineWave(textCoord);

  modFragUV.x*=uTextureSize;
  alpha*= texture(uAlphaTexture,modFragUV).r;

  gl_FragColor = vec4(computeLighting(),1.0).rgba;

  gl_FragColor*=VAO;

  gl_FragColor.a=alpha*k_alpha;

  // gl_FragColor = vec4(1.0,0.0,0.0,1.0);

}
`,
  transparent: true,
  side: DoubleSide,
  depthWrite: false,
  blending: NormalBlending



}

