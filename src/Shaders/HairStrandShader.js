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
    
    uSpecularPower1: { value: 124 },
    uSpecularPower2: { value: 104 },
    uTilt1: { value: -0.2 },
    uTilt2: { value: -0.4 },
    uLightPos: { value: { x: 5, y: 5, z: 5 } },
    uIntensity: { value: 1.0 },
    uAmbientIntensity: { value: 0.6 },
    
    uColorText: { value: 0 },
    uAlphaText: { value: 0 },
    uOccTexture: { value: 0 },
    uDirectionText: { value: 0 },
    uTiltText: { value: 0 },
    uHighlightText: { value: 0 },

    uHasColorText: { value: false },
    uHasAlphaText: { value: false },
    uHasOccTexture: { value: false },
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
  varying vec3 _bitangent;
  varying vec3 _strandDir;
  varying vec2 _uv;
  varying vec4 _vao;
  varying mat3 _TBN;
  
  uniform vec3 uLightPos;
  varying vec3 _LightPos;
  
  void main() {
    
    
    _pos = (modelViewMatrix * vec4(position,1.0)).xyz;
    _tangent = normalize(vec3(modelViewMatrix*vec4(tangent,0.0)));
    _normal = normalize(vec3(modelViewMatrix*vec4(normal,0.0)));
    _bitangent= cross(_normal,_tangent);
    _strandDir =  mat3(transpose(inverse(modelViewMatrix))) * normal;
    _uv = uv;
    
    _TBN = mat3(_tangent,_bitangent,_normal);

    _normal = mat3(transpose(inverse(modelViewMatrix))) * normal;
    
    _LightPos = (viewMatrix * vec4(uLightPos,1.0)).xyz;
    
   
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }`

  ,
  fragmentShader:  /* glsl */`
  varying vec3 _LightPos;


  varying vec3 _pos;
  varying vec3 _normal;
  varying vec3 _tangent;
  varying vec3 _bitangent;
  varying vec3 _strandDir;
  varying vec2 _uv;
  varying vec4 _vao;
  varying mat3 _TBN;

  uniform float uIntensity;
  uniform vec3 uLightColor;
  uniform float uAmbientIntensity;
  
  uniform vec3 uColor;
  uniform vec3 uSpecularColor;

  uniform bool uHasColorText;
  uniform sampler2D uColorText;
  uniform bool uHasAlphaText;
  uniform sampler2D uAlphaText;
  uniform bool uHasOccTexture;
  uniform sampler2D uOccTexture;
  uniform bool uHasDirectionText;
  uniform sampler2D uDirectionText;
  uniform bool uHasTiltText;
  uniform sampler2D uTiltText;
  uniform bool uHasHighlightText;
  uniform sampler2D uHighlightText;

  uniform float uAmbientStrength;
  uniform float uDiffusePower;
  uniform float uSpecularPower1;
  uniform float uSpecularPower2;
  uniform float uTilt1;
  uniform float uTilt2;

 
  


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
  vec3 T =uHasDirectionText ? normalize(_TBN * (texture(uDirectionText,_uv).rbg * 2.0) - 1.0): normalize(_bitangent);
  vec3 N = normalize(_normal);

  
  vec3 Ks = uSpecularColor;
  vec3 Ka = uHasColorText ? texture(uColorText,_uv).rgb : uColor;
  vec3 Kd = uHasColorText ? texture(uColorText,_uv).rgb : uColor;
  float shift = uHasTiltText ? texture(uTiltText,_uv).r : 0.0;

  vec3 t1 = shiftTangent(T, N, uTilt1 + shift);
  vec3 t2 = shiftTangent(T,  N, uTilt2 + shift);

  vec3 ambient = uAmbientIntensity*Ka;
  // vec3 diffuse = Kd*clamp(dot(N,L)*GeometrySmith(N,V,L,0.0),0.0,1.0);
  vec3 diffuse = Kd*clamp(dot(N,L),0.0,1.0);
  
  vec3 specular = clamp(Ks * strandSpecular(t1, V,L, uSpecularPower1),0.0,0.3);
  //vec3 specular = vec3(0.0);
    
  float highlight = uHasHighlightText ? texture(uHighlightText,_uv).r:1.0;
  specular += clamp(Ks*highlight* strandSpecular(t2,V,L,uSpecularPower2),0.0,1.0);
    
  return ambient+(diffuse+clamp(dot(N,L)*specular,0.0,1.0))*uIntensity;//Include lambertian with different 

}


void main() {

    float alpha = uHasAlphaText ? texture(uAlphaText,_uv).r: 1.0;
    float occ = uHasOccTexture ? texture(uOccTexture,_uv).r: 1.0;
     
    
    gl_FragColor = vec4(computeScheuermannLighting(),1.0);
    gl_FragColor*=occ;
    gl_FragColor.a=alpha;
}
`
  , depthWrite: true,
  alphaTest:true,
  // transparent: true,
  blending: CustomBlending,
  blendSrc: SrcAlphaFactor,
  blendDst: OneMinusSrcAlphaFactor,
  blendSrcAlpha: 0,
  blendDstAlpha: 1,
  // side: DoubleSide

}
