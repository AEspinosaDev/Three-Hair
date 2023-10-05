import { furParams } from '../furManager';
import {
  DoubleSide,
  CustomBlending,
  SrcAlphaFactor,
  OneMinusSrcAlphaFactor,
} from '@seddi/three';
/**
 * Hair Strands Shader (Scheuerman Method)
 */
export const hairStrandShader = {
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
    uAmbientStrength: { value: 0.6 },
    uDiffusePower: { value: 8 },
    
    
    uSpecularPower: { value: 16 },
    uSpecularPower2: { value: 16 },
    uTangentTilt1: { value: 2 },
    uTangentTilt2: { value: -2 },
    uLightPos: { value: { x: 5, y: 5, z: 5 } },
    uIntensity: { value: 1.0 },
    
    uColorText: { value: 0 },
    uAlphaText: { value: 0 },
    uNormalText: { value: 0 },
    uDirectionText: { value: 0 },
    uTiltText: { value: 0 },
    uHighlightText: { value: 0 },

    uHasColorText: { value: false },
    uHasAlphaText: { value: false },
    uHasNormalText: { value: false },
    uHasDirectionText: { value: false },
    uHasTiltText: { value: false },
    uHasHighlightText: { value: false },

  }
  ,
  vertexShader:  /* glsl */`
  attribute vec3 hairDir;
  attribute vec3 tangent;


  
  varying vec3 _pos;
  varying vec3 _normal;
  varying vec3 _tangent;
  varying vec3 _strandDir;
  varying vec2 _uv;
  varying vec4 _vao;
  
  uniform vec3 uLightPos;
  varying vec3 _LightPos;
  
  void main() {
    
    
    _pos = (modelViewMatrix * vec4(position,1.0)).xyz;
    _tangent = mat3(transpose(inverse(modelViewMatrix))) * tangent;
    _normal = mat3(transpose(inverse(modelViewMatrix))) * normal;
    _strandDir =  mat3(transpose(inverse(modelViewMatrix))) * normal;
    _uv = uv;
    
    
    _LightPos = (viewMatrix * vec4(uLightPos,1.0)).xyz;
    
   
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }`

  ,
  fragmentShader:  /* glsl */`
  varying vec3 _LightPos;


  varying vec3 _pos;
  varying vec3 _normal;
  varying vec3 _tangent;
  varying vec3 _strandDir;
  varying vec2 _uv;
  varying vec4 _vao;

  uniform float uIntensity;
  uniform vec3 uLightColor;
  
  uniform vec3 uColor;
  uniform vec3 uSpecularColor;

  uniform bool uHasColorText;
  uniform sampler2D uColorText;
  uniform bool uHasAlphaText;
  uniform sampler2D uAlphaText;
  uniform bool uHasNormalText;
  uniform sampler2D uNormalText;
  uniform bool uHasDirectionText;
  uniform sampler2D uDirectionText;
  uniform bool uHasTiltText;
  uniform sampler2D uTiltText;
  uniform bool uHasHightlightText;
  uniform sampler2D uHightlightText;

  uniform float uTextureSize;
  uniform float uAmbientStrength;
  uniform float uDiffusePower;
  uniform float uSpecularPower;
  uniform float uSpecularPower2;
  uniform float uTangentTilt1;
  uniform float uTangentTilt2;

 
  


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

  vec3 L = normalize(_LightPos - _pos);
  // vec3 L = normalize(_LightPos);
  vec3 V = normalize(-_pos);
  vec3 H = normalize(L + V);
  vec3 T = normalize(_strandDir);

  vec3 Ka;
  vec3 Kd;
  uHasColorText ? Ka = texture(uColorText,_uv).rgb : Ka = uColor;
  uHasColorText ? Kd = texture(uColorText,_uv).rgb : Kd = uColor;
  vec3 Ks = uSpecularColor;
  
  float u =dot(T,L); //Lambertian
  float v =dot(T,H); //Spec
  float t =dot(T,V);
  
  // vec3 result = uAmbientStrength*Ka+clamp(((Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower)))*dot(T,L),0.0,1.0);
   vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(sin(acos(v)),uSpecularPower));
  //vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower));
  //vec3 result = uAmbientStrength*Ka+(Kd*pow(sin(acos(u)),uDiffusePower)+clamp(Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower),0.0,1.0));
  //vec3 result =  uAmbientStrength*Ka+clamp(dot(normalize(_normal),L)*GeometrySmith(normalize(_normal),V,L,1.0),0.0,0.1)+clamp(dot(normalize(_normal),L)*Ks*pow(u*t+sin(acos(u))*sin(acos(t)),uSpecularPower),0.0,1.0);
 //vec3 result =  uAmbientStrength*Ka+clamp(Kd*dot(normalize(_normal),L)*mix(0.25,1.0,GeometrySmith(normalize(_normal),V,L,0.0)),0.0,1.0)+clamp(dot(normalize(_normal),L),0.0,1.0)*Ks*pow(sin(acos(v)),uSpecularPower);
 //vec3 result =  uAmbientStrength*Ka+clamp(Kd*mix(0.25,1.0,dot(normalize(_normal),L)),0.0,1.0)+clamp(dot(normalize(_normal),L),0.0,1.0)*Ks*pow(sin(acos(v)),uSpecularPower);
 
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
  vec3 L = normalize(_LightPos - _pos);
  vec3 V = normalize(-_pos);
  vec3 T = normalize(_strandDir);
  vec3 N = normalize(_normal);
  vec3 sN = normalize(_normal);

  vec3 Ka;
  vec3 Kd;
  vec3 Ks = uSpecularColor;
  uHasColorText ? Ka = texture(uColorText,_uv).rgb : Ka = uColor;
  uHasColorText ? Kd = texture(uColorText,_uv).rgb : Kd = uColor;

  vec3 t1 = shiftTangent(T, N, 0.0);
  vec3 t2 = shiftTangent(T, N, 0.0);

  vec3 ambient = uAmbientStrength*Ka;
  vec3 diffuse = Kd*clamp(dot(sN,L)*GeometrySmith(sN,V,L,0.0),0.0,1.0);
      
   vec3 specular = clamp(Ks * strandSpecular(t1, V,L, uSpecularPower),0.0,1.0);
    
  specular += clamp(Kd* strandSpecular(t2,V,L,uSpecularPower2),0.0,1.0);
    
  return ambient+diffuse+clamp(dot(sN,L)*specular,0.0,1.0);//Include lambertian with different 


}


void main() {

    float alpha = uHasAlphaText ? texture(uAlphaText,_uv).r: 1.0;
   
    // float alpha = 1.0;
    // gl_FragColor = vec4(computeScheuermannLighting(),1.0);
   gl_FragColor = vec4(computeKajiyaLighting(),1.0);
   //gl_FragColor =  uHasColorText ? vec4(texture(uColorText,_uv).rgb,1.0) : vec4(uColor,1.0);
  gl_FragColor.a=alpha;
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
