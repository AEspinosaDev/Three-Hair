//This class should control all models and assing them types
//It should control the mesh loading in real time and the assignation of types. Those types should be,
//Avatar,Clothes or Hair. If avatar or clothes, can be furry by painting it or chosing a texture
//If hair it uses a special shader
//If avatar it uses a skin shader
//If clothes it uses another material
//At first, user should define what type is the model, if this is implemented using mpl mmodels or something like that, it cou'd be automatized by code.
//This class should implement all calss to loading mesh funtions and furry meshes
//Brush tool should be reilemented to allow not only combing, but painting.

import {
  ShaderMaterial,
  MeshStandardMaterial,
  Mesh,
  Scene,
  Color,
  DoubleSide,
  BufferGeometry,
  BufferAttribute,
} from "@seddi/three";
import { FBXLoader } from "@seddi/three/examples/jsm/loaders/FBXLoader.js";
import { hairStrandShader } from "./Shaders/HairStrandShader";
import { App } from "./app";

export class ModelManager {
  static uploadModel(
    url: any,
    loader: FBXLoader,
    scene: Scene,
    isHair: boolean = true
  ) {
    if (App.sceneProps.hair && isHair) scene.remove(App.sceneProps.hair);
    if (App.sceneProps.avatar && !isHair) scene.remove(App.sceneProps.avatar);
    loader.load(
      url,

      function (object: any) {
        object.traverse(function (child: any) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const model = new Mesh(
              child.geometry,
              isHair ? __skinMaterial : __skinMaterial
            );
            model.scale.set(0.1, 0.1, 0.1);
            model.renderOrder = 0;
            isHair
              ? (App.sceneProps.hair = model)
              : (App.sceneProps.avatar = model);
            scene.add(model);

            // root.loaded = true;
          }
        });
      }
    );
  }

  // static uploadFurryMesh(fileName: string, baseMaterial: THREE.Material,
  //     // eslint-disable-next-line camelcase
  //     pos_x: number, pos_y: number, pos_z: number, scale: number, rot_x: number, rot_y: number, rot_z: number){

  //         let root = this;
  //         this.FBXLoader.load(
  //             // resource URL
  //             // "./data/models/" + fileName
  //             fileName,

  //             function (object: any) {
  //                 function transform(mesh: THREE.Mesh) {
  //                     mesh.position.set(pos_x, pos_y, pos_z);
  //                     mesh.scale.set(scale, scale, scale);
  //                     mesh.rotateX(rot_x);
  //                     mesh.rotateY(rot_y);
  //                     mesh.rotateZ(rot_z);
  //                 }

  //                 object.traverse(function (child: any) {

  //                     if (child.isMesh) {

  //                         const furryObject = new THREE.Object3D();

  //                         child.castShadow = true;
  //                         child.receiveShadow = true;
  //                         //Base mesh
  //                         const base = new THREE.Mesh(child.geometry, baseMaterial);
  //                         base.parent = furryObject;
  //                         transform(base);
  //                         base.renderOrder = 0;
  //                         root.scene.add(base);
  //                         //Fins
  //                         const finsGeometry = FurManager.computeFins(base);
  //                         const fins = new THREE.Mesh(finsGeometry, FurManager.finMaterial);
  //                         transform(fins);
  //                         fins.renderOrder = 1;
  //                         FurManager.fins.push(fins);
  //                         root.scene.add(fins);
  //                         fins.parent = furryObject;
  //                         FurManager.computePasses.push(new THREE.WebGLComputePass(FurManager.computeMaterial, fins, root.renderer));
  //                         //Shells
  //                         const instancedGeo = new THREE.InstancedBufferGeometry().copy(child.geometry);
  //                         instancedGeo.setAttribute('hairDir', new THREE.BufferAttribute(new Float32Array(instancedGeo.getAttribute('normal').array), 3));
  //                         instancedGeo.instanceCount = FurManager.MAX_INSTANCE_COUNT;
  //                         const shell = new THREE.Mesh(instancedGeo, FurManager.shellMaterial);
  //                         transform(shell);
  //                         shell.renderOrder = 2;
  //                         FurManager.shells.push(shell);
  //                         root.scene.add(shell);
  //                         shell.parent = furryObject;
  //                         FurManager.computePasses.push(new THREE.WebGLComputePass(FurManager.computeMaterial, shell, root.renderer));

  //                         App.sceneProps.furryObject3D = furryObject;
  //                         App.sceneProps.models.push(furryObject);

  //                         // root.initMikkTSpace(() => {
  //                         //     const mikk = {
  //                         //         wasm: wasm,
  //                         //         isReady: isReady
  //                         //         , generateTangents: generateTangents
  //                         //     }
  //                         //     computeMikkTSpaceTangents(instancedGeo, mikk);

  //                         // })

  //                         root.loaded = true;
  //                     }

  //                 });

  //             }

  //         );

  // }
}

const __hairMaterial = new ShaderMaterial(hairStrandShader);
const __skinMaterial = new MeshStandardMaterial({
  color: new Color(0.2, 0.2, 0.2),
  metalness: 0,
  roughness: 0.75,
  side: DoubleSide,
});
const __debugMaterial = new MeshStandardMaterial({
  color: new Color(0.2, 0.2, 0.2),
  metalness: 0,
  roughness: 0.75,
});
