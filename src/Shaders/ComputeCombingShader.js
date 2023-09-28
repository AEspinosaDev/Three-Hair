import {
    Uniform,
    Matrix4,
  } from '@seddi/three';
/**
 * Data needed for instancing a shader for computing hair new direction when combing
 */
export const computeCombingShader = {
    uniforms: {
        uViewProj: new Uniform(new Matrix4()),
        uModelView: new Uniform(new Matrix4()),
        uCombNDCDir: { value: { x: 0.0, y: 0.0, z: 0.0 } },
        uCombAngle: { value: 0 },
        uMouseNDCPos: { value: { x: 0.0, y: 0.0, z: 0.0 } },
        uMouseNDCRadio: { value: 0 },
    },
    transformFeedbackVaryings: {
        outHairDir: 'hairDir',
    
      },
    vertexShader: /* glsl */`#version 300 es

    in vec3 position;
    in vec3 normal;
    in vec3 hairDir;
    
    uniform mat4 uViewProj;
    uniform mat4 uModelView;
    uniform vec3 uCombNDCDir;
    uniform float uCombAngle;
    uniform vec3 uMouseNDCPos;
    uniform float uMouseNDCRadio;
  
    out vec3 outHairDir;
  
    mat4 rotationMatrix(vec3 axis, float angle) {
       axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
         float oc = 1.0 - c;
  
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                     oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
     }
  
     vec3 rotate(vec3 v, vec3 axis, float angle) {
         mat4 m = rotationMatrix(axis, angle);
         return (m * vec4(v, 1.0)).xyz;
     }
  
    
    void main() {
  
   
  
    //Vertex pos to NDC coord to match mouse coordinates
        vec4 vertexNDCpos = uViewProj*vec4(position.xyz,1.0);
        vertexNDCpos /= vertexNDCpos.w;
        float distanceToVertex = distance(uMouseNDCPos.xy,vertexNDCpos.xy);
    
    
    //If inside brush area
        if(distanceToVertex<=uMouseNDCRadio){
    
        outHairDir = hairDir;
        vec3 viewNormal = normalize(mat3(transpose(inverse(uModelView))) * normal);
        vec3 viewVertex =  normalize((uModelView * vec4(position.xyz,1.0)).xyz);
        float normalViewAngle =  dot(-viewVertex,viewNormal);
    
    
        if(normalViewAngle>0.6 && uCombAngle !=0.0){ //If there is input movement and hair is more or less facing the camera
    
    //        vec4 combWorldDir3D = inverse(uViewProj)*vec4(normalize(uCombNDCDir.xyz),1.0);
           vec3 combWorldDir3D =  normalize(mat3(transpose(uModelView))*normalize(uCombNDCDir));
    //        combWorldDir3D.xyz /= combWorldDir3D.w;
    
           float currentAngle = dot(hairDir,normal);
           float newAngle;
  
    //Attenuation calculations
           float distanceToBorder = uMouseNDCRadio-distanceToVertex;
           float att;
           float brushEdge = uMouseNDCRadio*0.25;
           distanceToBorder<=brushEdge ? att= distanceToBorder/brushEdge : att=1.0;
           float normalAtt;
           normalViewAngle<0.9 ? normalAtt= (normalViewAngle-0.6)/0.3 : normalAtt=1.0;
    //
    
           vec3 auxoutHairDir = rotate(normalize(hairDir),cross(combWorldDir3D,normal),uCombAngle*att*normalAtt);
    
           if(currentAngle<0.5) { //If angle is higher than 45, stop rotating unless is to the opposite side
               newAngle = dot(auxoutHairDir,normal);
               if(newAngle<currentAngle) return;
           } 
    
          outHairDir = auxoutHairDir;
           }
    
        }else {outHairDir = hairDir;}
    
    }
  
    
    `,

    fragmentShader:/* glsl */`#version 300 es

    void main() {
        discard;
    }
  `




}
