import { furParams } from '../furManager';
import {
  DoubleSide,
  CustomBlending,
  SrcAlphaFactor,
  OneMinusSrcAlphaFactor,
} from '@seddi/three';
/**
 * Shell shader class to store all data needed for the ThreeJs Shader and Raw Shader Material
 */
export const shellShader = {
  uniforms:
  {
    uColor: { value: { r: 0.49, g: 0.39, b: 0.31 } },
    uLightColor: { value: { r: 1, g: 1, b: 1 } },
    uSpecularColor: { value: { r: 0.49, g: 0.39, b: 0.31 } },
    uAOstartColor: { value: { r: 0.1, g: 0.1, b: 0.1 } },
    uAOendColor: { value: { r: 1.0, g: 1.0, b: 1.0 } },
    uFurLength: { value: 2 },
    uTextureSize: { value: 1 },
    uLayers: { value: 32 },
    uAlphaTexture: { value: 0 },
    uColorTexture: { value: 0 },
    uAmbientStrength: { value: 0.6 },
    uDiffusePower: { value: 8 },
    uSpecularPower: { value: 16 },
    uSpecularPower2: { value: 16 },
    uTangentTilt1: { value: 2 },
    uTangentTilt2: { value: -2 },
    uLightPos: { value: { x: 5, y: 5, z: 5 } },
    uIntensity: { value: 1.0 },
    uUseColorText: { value: false },
    uWaveFrequency: { value: 0.0 },

  }
  ,
  vertexShader:  /* glsl */`
  attribute vec3 hairDir;
  attribute vec3 tangent;

  uniform float uFurLength;
  uniform float uLayers;
  uniform vec3 uAOstartColor;
  uniform vec3 uAOendColor;
  uniform float uWaveFrequency;
  const float WAVE_AMPLITUDE = 0.00066;

  uniform vec3 uLightPos;
  varying vec3 viewLightPos;

  varying vec3 pos;
  varying vec3 hairTangent;
  varying vec3 hairNormal;
  varying vec3 surfaceNormal;
  varying vec2 textCoord;
  varying vec4 VAO;
  varying float textureOffset;
  
  void main() {
    
    float f = float(gl_InstanceID+1) * uFurLength/uLayers;
    float layerCoeff = float(gl_InstanceID) / uLayers;
    float slope = 0.0;
    vec3 modifiedHairDir = hairDir;
    if(uWaveFrequency > 0.0){
      textureOffset = sin(layerCoeff*uWaveFrequency)*WAVE_AMPLITUDE;
      slope = cos(layerCoeff*uWaveFrequency)*(WAVE_AMPLITUDE*uWaveFrequency);
      
    }else{
      textureOffset=0.0;
    }
    
    modifiedHairDir = normalize(hairDir)+((slope*10.0));

    vec3 offsetPosition =  position + hairDir * vec3(f,f,f);
    
    pos = (modelViewMatrix * vec4(offsetPosition,1.0)).xyz;
    hairTangent = mat3(transpose(inverse(modelViewMatrix))) * modifiedHairDir;
    surfaceNormal = mat3(transpose(inverse(modelViewMatrix))) * normal;
    hairNormal = mat3(transpose(inverse(modelViewMatrix))) * normal;
    textCoord = uv;
    
    VAO =  mix(vec4(uAOstartColor,1.0), vec4(uAOendColor,0.0), layerCoeff);
    
    viewLightPos = (viewMatrix * vec4(uLightPos,1.0)).xyz;
    //viewLightPos = (viewMatrix * vec4(-5.0,-5.0,-5.0,0.0)).xyz;
    
   
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(offsetPosition,1.0);
  }`

  ,
  fragmentShader:  /* glsl */`
  varying vec3 viewLightPos;

  varying vec3 pos;
  varying vec3 hairTangent;
  varying vec3 hairNormal;
  varying vec2 textCoord;
  varying vec4 VAO;
  varying float textureOffset;
  varying vec3 surfaceNormal;

  uniform float uIntensity;
  uniform vec3 uLightColor;
  uniform vec3 uColor;
  uniform vec3 uSpecularColor;
  uniform sampler2D uAlphaTexture;
  uniform sampler2D uColorTexture;
  uniform float uTextureSize;
  uniform float uAmbientStrength;
  uniform float uDiffusePower;
  uniform float uSpecularPower;
  uniform float uSpecularPower2;
  uniform float uTangentTilt1;
  uniform float uTangentTilt2;
  uniform bool uUseColorText;

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


vec3 computeKajiyaLighting(){

  vec3 L = normalize(viewLightPos - pos);
  // vec3 L = normalize(viewLightPos);
  vec3 V = normalize(-pos);
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
  
  // vec3 result = uAmbientStrength*Ka+clamp(((Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower)))*dot(T,L),0.0,1.0);
  // vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower));
  //vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower));
  //vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+clamp(Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower),0.0,1.0));
  //vec3 result =  uAmbientStrength*Ka+clamp(dot(normalize(hairNormal),L)*GeometrySmith(normalize(hairNormal),V,L,1.0),0.0,0.1)+clamp(dot(normalize(hairNormal),L)*Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower),0.0,1.0);
 vec3 result =  uAmbientStrength*Ka+clamp(Kd*dot(normalize(hairNormal),L)*mix(0.25,1.0,GeometrySmith(normalize(hairNormal),V,L,0.0)),0.0,1.0)+clamp(dot(normalize(hairNormal),L),0.0,1.0)*Ks*pow(sin(acos(v)),uSpecularPower);
 //vec3 result =  uAmbientStrength*Ka+clamp(Kd*mix(0.25,1.0,dot(normalize(hairNormal),L)),0.0,1.0)+clamp(dot(normalize(hairNormal),L),0.0,1.0)*Ks*pow(sin(acos(v)),uSpecularPower);
 
  return result*uIntensity;


} 
vec3 shiftTangent(vec3 T, vec3 N, float shift){

  vec3 shiftedT = T+shift*N;
  return normalize(shiftedT);
}
float strandSpecular(vec3 T, vec3 V, vec3 L, float exponent){
  vec3 H = normalize(L + V);
  float u =dot(T,L); //Lambertian
  float t =dot(T,V);
  float dotTH =dot(T,H); //Spec
  float sinTH = sin(acos(dotTH));

  float dirAtten = smoothstep(-1.0, 0.0,
    dotTH);
   
  //return pow(u*t+sin(acos(u))*sin(acos(t)),exponent);
  return dirAtten * pow(sinTH, exponent);
}

vec3 computeScheuermannLighting(){
  vec3 L = normalize(viewLightPos - pos);
  vec3 V = normalize(-pos);
  vec3 T = normalize(hairTangent);
  vec3 N = normalize(hairNormal);
  vec3 sN = normalize(surfaceNormal);

  vec3 Ka;
  vec3 Kd;
  vec3 Ks = uSpecularColor;
  uUseColorText ? Ka = texture(uColorTexture,textCoord).rgb : Ka = uColor;
  uUseColorText ? Kd = texture(uColorTexture,textCoord).rgb : Kd = uColor;

  vec3 t1 = shiftTangent(T, N, 0.0);
  vec3 t2 = shiftTangent(T, N, 0.0);

  vec3 ambient = uAmbientStrength*Ka;
  vec3 diffuse = Kd*clamp(dot(sN,L)*GeometrySmith(sN,V,L,0.0),0.0,1.0);
      
   vec3 specular = clamp(Ks * strandSpecular(t1, V,L, uSpecularPower),0.0,1.0);
    
  specular += clamp(Kd* strandSpecular(t2,V,L,uSpecularPower2),0.0,1.0);
    
  return ambient+diffuse+clamp(dot(sN,L)*specular,0.0,1.0);//Include lambertian with different 


}


void main() {
    vec2 modTextCoord = textCoord+textureOffset; 

    float alpha = texture(uAlphaTexture,modTextCoord*uTextureSize).r;
    // float alpha = 1.0;
    // gl_FragColor = vec4(computeScheuermannLighting(),1.0);
   gl_FragColor = vec4(computeKajiyaLighting(),1.0);

    gl_FragColor*=VAO;

    gl_FragColor.a*=alpha;
}
`
  , depthWrite: true,
  transparent: true,
  blending: CustomBlending,
  blendSrc: SrcAlphaFactor,
  blendDst: OneMinusSrcAlphaFactor,
  blendSrcAlpha: 0,
  blendDstAlpha: 1,
  side: DoubleSide

}
