import { GUI } from "dat.gui";
import {
  RawShaderMaterial,
  ShaderMaterial,
  Mesh,
  Matrix4,
  Camera,
  Color,
  Vector3,
  BufferGeometry,
  BufferAttribute
} from '@seddi/three';
import { mergeVertices } from '@seddi/three/examples/jsm/utils/BufferGeometryUtils.js';
import { NoiseTextGenerationPass } from './Utils/noiseTextGenerationPass';
import { shellShader } from "./Shaders/ShellShader";
import { finShader } from "./Shaders/FinShader";
import { computeCombingShader } from "./Shaders/ComputeCombingShader";
import { Edge } from "./Utils/Edge";
import { App } from "./app";

export const furParams = {
  //General parameters
  'Show Shells': true,
  'Show Fins': true,
  'Hair Length': 2,
  'Layers': 32,
  'Shell Texture Size': 1.0,
  'Fin Texture Size': 1.75,
  'Occlusion Color': new Color(25, 25, 25),
  'AO End Color': new Color(255, 255, 255),
  'Waviness': 0,

  //Noise Text for shells
  'Shell Procedural Text': true,
  'Noise Text Size': 2060,
  'Lacunarity': 0.55,
  'Persistence': 0.9,

  //Procedural text for fins?

  //Kayijas lighting model
  'Ambient Strength': 0.6,
  'Fur Diffuse Color': new Color(0.49 * 255, 0.39 * 255, 0.31 * 255),
  'Diffuse Power': 8,
  'Fur Specular Color': new Color(0.49 * 255, 0.39 * 255, 0.31 * 255),
  'Specular Power': 16,

}


export class FurManager {

  static shouldGenerateNoiseTexture: boolean;
  
  static renderer: any;
  static noiseGenerator: NoiseTextGenerationPass;

  static shells: any;
  static fins: any;
  static computePasses: any;
  static computeMaterial: RawShaderMaterial;
  static shellMaterial: ShaderMaterial;
  static finMaterial: ShaderMaterial;

  static readonly WAVE_FREQ_STEP = 15;
  static readonly WAVE_FREQ_OFFSET = 50;
  static readonly WAVE_AMP_STEP = 0.0006;
  static readonly WAVE_AMP_OFFSET = 0.008;
  static readonly MAX_INSTANCE_COUNT = 50;

  static init() {

    FurManager.noiseGenerator = new NoiseTextGenerationPass();

    FurManager.shouldGenerateNoiseTexture = true;

    FurManager.fins = new Array(0);
    FurManager.shells = new Array(0);
    FurManager.computePasses = new Array(0);

    FurManager.computeMaterial = new RawShaderMaterial(computeCombingShader);
    FurManager.shellMaterial = new ShaderMaterial(shellShader);
    FurManager.finMaterial = new ShaderMaterial(finShader);

    FurManager.shellMaterial.uniforms.uFurLength.value = furParams['Hair Length'];
    FurManager.shellMaterial.uniforms.uTextureSize.value = furParams['Shell Texture Size'];
    FurManager.shellMaterial.uniforms.uLayers.value = furParams['Layers'];
    FurManager.shells.forEach((element: { instanceCount: number; }) => element.instanceCount = furParams['Layers']);
    FurManager.shellMaterial.uniforms.uDiffusePower.value = furParams['Diffuse Power'];
    FurManager.shellMaterial.uniforms.uSpecularPower.value = furParams['Specular Power'];

    FurManager.finMaterial.uniforms.uFurLength.value = furParams['Hair Length'];
    FurManager.finMaterial.uniforms.uTextureSize.value = furParams['Shell Texture Size'];
    FurManager.finMaterial.uniforms.uDiffusePower.value = furParams['Diffuse Power'];
    FurManager.finMaterial.uniforms.uSpecularPower.value = furParams['Specular Power'];

  }

  static setupGUI(gui: GUI) {


    const furFolder = gui.addFolder('Fur')
    // furFolder.hide();
    furFolder.add(furParams, 'Show Fins').onChange((value: Boolean) => {
      FurManager.fins.forEach((element: { visible: Boolean; }) => element.visible = value);
    });
    furFolder.add(furParams, 'Show Shells').onChange((value: Boolean) => {
      FurManager.shells.forEach((element: { visible: Boolean; }) => element.visible = value);
    });

    furFolder.add(furParams, 'Hair Length', 0, 10, 1).onChange((value: number) => {
      FurManager.shellMaterial.uniforms.uFurLength.value = value;
      FurManager.finMaterial.uniforms.uFurLength.value = value;
    });
    furFolder.add(furParams, 'Layers', 0, 500, 1).onChange((value: number) => {
      
      FurManager.shells.forEach((element: { instanceCount: number; }) => element.instanceCount = value);
      FurManager.shellMaterial.uniforms.uLayers.value = value;
    });
    furFolder.add(furParams, 'Waviness', 0, 1, 0.1).onChange((value: number) => {

      FurManager.shellMaterial.uniforms.uWaveFrequency.value = value * 20;
      FurManager.finMaterial.uniforms.uWaveFrequency.value = value * 10 * this.WAVE_FREQ_STEP + this.WAVE_FREQ_OFFSET;
      FurManager.finMaterial.uniforms.uWaveAmplitude.value = value * 10 * this.WAVE_AMP_STEP + this.WAVE_AMP_OFFSET;

    });
    furFolder.addColor(furParams, 'Occlusion Color').onChange((value: any) => {
      //Shells
      FurManager.shellMaterial.uniforms.uAOstartColor.value.r = value.r / 255;
      FurManager.shellMaterial.uniforms.uAOstartColor.value.g = value.g / 255;
      FurManager.shellMaterial.uniforms.uAOstartColor.value.b = value.b / 255;
      //Fins
      FurManager.finMaterial.uniforms.uAOstartColor.value.r = value.r / 255;
      FurManager.finMaterial.uniforms.uAOstartColor.value.g = value.g / 255;
      FurManager.finMaterial.uniforms.uAOstartColor.value.b = value.b / 255;
    });

    furFolder.add(furParams, 'Fin Texture Size', 0, 5, 0.05).onChange((value: number) => {
      FurManager.finMaterial.uniforms.uTextureSize.value = value;
    });

    furFolder.add(furParams, 'Shell Texture Size', 0, 5, 0.05).onChange((value: number) => {
      FurManager.shellMaterial.uniforms.uTextureSize.value = value;

    });
    furFolder.add(furParams, 'Lacunarity', 0, 3, 0.05).onChange((value: number) => {

      FurManager.noiseGenerator.perlinNoiseMaterial.uniforms.uLacunarity.value = value;
      FurManager.shouldGenerateNoiseTexture = true;

    });
    furFolder.add(furParams, 'Persistence', 0, 10, 0.05).onChange((value: number) => {

      FurManager.noiseGenerator.perlinNoiseMaterial.uniforms.uPersistence.value = value;
      FurManager.shouldGenerateNoiseTexture = true;

    });

    const ambientFolder = gui.addFolder('Ambient Light')
    ambientFolder.add(App.sceneProps.ambientLight, 'intensity', 0, 2).onChange(function (value) {
      FurManager.shellMaterial.uniforms.uAmbientStrength.value = value;
      FurManager.finMaterial.uniforms.uAmbientStrength.value = value;
    });
    ambientFolder.open()

    const pointFolder = gui.addFolder('Point Light')
   
    pointFolder.add(App.sceneProps.pointLight, 'intensity', 0, 100).onChange(function (value) {
      FurManager.shellMaterial.uniforms.uIntensity.value = value * 0.01;
      FurManager.finMaterial.uniforms.uIntensity.value = value * 0.01;
    });
    pointFolder.add(App.sceneProps.pointLight.position, 'x', -10, 10).onChange(function (value) {
      FurManager.shellMaterial.uniforms.uLightPos.value.x = value;
      FurManager.finMaterial.uniforms.uLightPos.value.x = value;
    });
    pointFolder.add(App.sceneProps.pointLight.position, 'y', -10, 10).onChange(function (value) {
      FurManager.shellMaterial.uniforms.uLightPos.value.y = value;
      FurManager.finMaterial.uniforms.uLightPos.value.y = value;
    });
    pointFolder.add(App.sceneProps.pointLight.position, 'z', -10, 10).onChange(function (value) {
      FurManager.shellMaterial.uniforms.uLightPos.value.z = value;
      FurManager.finMaterial.uniforms.uLightPos.value.z = value;
    });
    pointFolder.open();



    const kajiyaFolder = gui.addFolder('Kajiya`s params');
    kajiyaFolder.addColor(furParams, 'Fur Diffuse Color').onChange((value: any) => {
      //Shells
      FurManager.shellMaterial.uniforms.uColor.value.r = value.r / 255;
      FurManager.shellMaterial.uniforms.uColor.value.g = value.g / 255;
      FurManager.shellMaterial.uniforms.uColor.value.b = value.b / 255;
      //Fins
      FurManager.finMaterial.uniforms.uColor.value.r = value.r / 255;
      FurManager.finMaterial.uniforms.uColor.value.g = value.g / 255;
      FurManager.finMaterial.uniforms.uColor.value.b = value.b / 255;
    });
    kajiyaFolder.addColor(furParams, 'Fur Specular Color').onChange((value: any) => {
      //Shells
      FurManager.shellMaterial.uniforms.uSpecularColor.value.r = value.r / 255;
      FurManager.shellMaterial.uniforms.uSpecularColor.value.g = value.g / 255;
      FurManager.shellMaterial.uniforms.uSpecularColor.value.b = value.b / 255;
      //Fins
      FurManager.finMaterial.uniforms.uSpecularColor.value.r = value.r / 255;
      FurManager.finMaterial.uniforms.uSpecularColor.value.g = value.g / 255;
      FurManager.finMaterial.uniforms.uSpecularColor.value.b = value.b / 255;
    });
    kajiyaFolder.add(furParams, 'Diffuse Power', 0, 124).onChange((value: number) => {
      FurManager.shellMaterial.uniforms.uDiffusePower.value = value;
      FurManager.finMaterial.uniforms.uDiffusePower.value = value;
    });
    kajiyaFolder.add(furParams, 'Specular Power', 0, 124).onChange((value: number) => {
      FurManager.shellMaterial.uniforms.uSpecularPower.value = value;
      FurManager.finMaterial.uniforms.uSpecularPower.value = value;
    });


    furFolder.open();
    kajiyaFolder.open();



  }
  static update(shouldCompute: boolean, camera: Camera) {
    //Generate noise texture
    if (FurManager.shouldGenerateNoiseTexture) {
      FurManager.noiseGenerator.render(FurManager.renderer);
      FurManager.shellMaterial.uniforms.uAlphaTexture.value = FurManager.noiseGenerator.noiseTexture;
      FurManager.shouldGenerateNoiseTexture = false;
    }

    if (!shouldCompute) { return; }
    //GPGPU
    for (let i = 0; i < FurManager.computePasses.length; i++) {
      //Update matrix
      const view = camera.matrixWorldInverse;
      const proj = camera.projectionMatrix;

      FurManager.computePasses[i].mesh.modelViewMatrix.multiplyMatrices(view, FurManager.computePasses[i].mesh.matrixWorld);
      const modelViewProj = new Matrix4();
      modelViewProj.multiplyMatrices(proj, FurManager.computePasses[i].mesh.modelViewMatrix);

      FurManager.computeMaterial.uniforms.uModelView.value = FurManager.computePasses[i].mesh.modelViewMatrix;
      FurManager.computeMaterial.uniforms.uViewProj.value = modelViewProj;

      FurManager.computePasses[i].tick();

    }


  }

  static computeFins(baseMesh: Mesh) {
    const fins = new BufferGeometry();
    //Convert to index geometry  
    const indexedGeometry = mergeVertices(baseMesh.geometry);
    const id_positions = indexedGeometry.getAttribute('position');
    const id_normals = indexedGeometry.getAttribute('normal');
    const indexList = indexedGeometry.getIndex();



    let finPositions = new Array();
    let finTangents = new Array();
    // let finNormals = new Array();
    let finRandomMorphs = new Array();
    let finExtrudables = new Array();
    let finUVs = new Array();

    //Upload data to auxiliary arrays
    let auxPositions = new Array();
    let auxNormals = new Array();
    // let auxTangents = new Array();
    for (let i = 0; i < id_positions.count; i++) {
      //Position
      let v = new Vector3();
      v.fromBufferAttribute(id_positions, i);
      auxPositions.push(v);
      //Normal
      let n = new Vector3();
      n.fromBufferAttribute(id_normals, i)
      auxNormals.push(n);

    }

    //DELETE REPEATED EDGES
    var edgeMap = new Map();
    var auxEdges = new Array();
    for (let i = 0; i < indexList.count; i += 3) {
      var edges = new Array();
      edges.push(new Edge(indexList.array[i], indexList.array[i + 1], indexList.array[i + 2]));
      edges.push(new Edge(indexList.array[i + 1], indexList.array[i + 2], indexList.array[i]));
      edges.push(new Edge(indexList.array[i], indexList.array[i + 2], indexList.array[i + 1]));
      edges.forEach(edge => {
        if (!edgeMap.has(edge.hash)) {
          //La arista no está en el diccionario
          auxEdges.push(edge);

          edgeMap.set(edge.hash, edge);
        }

      });
    }

    //Create a fin per edge
    for (let i = 0; i < auxEdges.length; i++) {

      let v1 = auxPositions[auxEdges[i].a];
      let v2 = auxPositions[auxEdges[i].b];
      //Fin tangents are mesh normals
      let t1 = auxNormals[auxEdges[i].a];
      let t2 = auxNormals[auxEdges[i].b];
      //Compute fin normal
      let n1 = new Vector3();
      n1.copy(v1);
      // auxN.add(v2);
      n1.subVectors(n1, v2);
      n1.cross(t1);

      //uv //For now hardcoded //OPEN TO CHANGE
      const uv_offset = Math.floor(Math.random() * (0.85 - 0.0 + 1) + 0.0);
      const u_lower_limit = uv_offset;
      const u_upper_limit = uv_offset - 0.15;
      const v_lower_limit = 0.47;
      const v_upper_limit = 0.56;
      //

      const data = [[v1, t1, 0, u_lower_limit, v_lower_limit], [v2, t2, 0, u_upper_limit, v_lower_limit], [v2, t2, 1, u_upper_limit, v_upper_limit],
      [v2, t2, 1, u_upper_limit, v_upper_limit], [v1, t1, 1, u_lower_limit, v_upper_limit], [v1, t1, 0, u_lower_limit, v_lower_limit]]; //Fins Quad data

      for (let j = 0; j < data.length; j++) {

        for (let k = 0; k < 3; k++) { //3 because 3D vector
          finPositions.push(data[j][0].getComponent(k));
          finTangents.push(data[j][1].getComponent(k));
          // finNormals.push(n1.getComponent(k));
        }
        finExtrudables.push(data[j][2]);
        finRandomMorphs.push(Math.random() * (1.0) + 0.0);
        finUVs.push(data[j][3]);
        finUVs.push(data[j][4]);

      }

    }
    console.log(auxEdges.length);
    // console.log(finRandomMorphs);

    fins.setAttribute('position', new BufferAttribute(new Float32Array(finPositions), 3));
    fins.setAttribute('normal', new BufferAttribute(new Float32Array(finTangents), 3));
    fins.setAttribute('hairDir', new BufferAttribute(new Float32Array(finTangents), 3));
    // fins.setAttribute('finNormal', new THREE.BufferAttribute(new Float32Array(finTangents), 3));
    fins.setAttribute('uv', new BufferAttribute(new Float32Array(finUVs), 2));
    fins.setAttribute('extrudable', new BufferAttribute(new Float32Array(finExtrudables), 1));
    fins.setAttribute('morph', new BufferAttribute(new Float32Array(finRandomMorphs), 1));


    return fins;

  }

}



