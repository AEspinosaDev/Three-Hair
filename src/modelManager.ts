import {
  ShaderMaterial,
  MeshStandardMaterial,
  Mesh,
  Scene,
  Color,
  DoubleSide,
  TextureLoader,
  Camera,
  Vector3,
  Matrix4,
} from "@seddi/three";
import { FBXLoader } from "@seddi/three/examples/jsm/loaders/FBXLoader.js";
import { hairStrandShader } from "./Shaders/HairStrandShader";
import { App } from "./app";
import { UILayer } from "./guiLayer";
import {
  wasm,
  isReady,
  ready,
  generateTangents,
} from "@seddi/three/examples/jsm/libs/mikktspace.module.js";
import {
  computeMikkTSpaceTangents,
  mergeVertices,
} from "@seddi/three/examples/jsm/utils/BufferGeometryUtils.js";
import { forEach } from "lodash";
import { Triangle } from "./Utils/Triangle";
import { Console } from "console";

export enum TextureType {
  ALPHA = 0,
  DIRECTION = 1,
  NORMAL = 2,
  HIGHLIGHT = 3,
  TILT = 4,
}

const MODEL_PATH = "./data/models/";
const TEX_PATH = "./data/textures/";

export class ModelManager {
  static uploadModel(
    meshFile: any,
    loader: FBXLoader,
    scene: Scene,
    isHair: boolean,
    gui: UILayer = null,
    customName: string = null
  ) {
    touchModel(scene, isHair);
    loader.load(
      typeof meshFile != "string"
        ? URL.createObjectURL(meshFile)
        : MODEL_PATH + meshFile,
      function (object: any) {
        object.traverse(function (child: any) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const model = new Mesh(
              child.geometry,
              isHair ? __hairMaterial : __skinMaterial
            );

            model.scale.set(0.1, 0.1, 0.1);
            isHair
              ? (App.sceneProps.hair = model)
              : (App.sceneProps.avatar = model);

            if (isHair) {
              model.renderOrder = 1;
              initMikkTSpace(() => {
                const mikk = {
                  wasm: wasm,
                  isReady: isReady,
                  generateTangents: generateTangents,
                };
                computeMikkTSpaceTangents(model.geometry, mikk);
                const indexedGeometry = mergeVertices(model.geometry);
                model.geometry = indexedGeometry;
                model.geometry.index.needsUpdate = true;
                console.log(model.geometry);
              });
            }

            scene.add(model);

            gui?.updateModelName(
              !customName ? meshFile.name : customName,
              isHair
            );
          }
        });
      }
    );
  }
  static uploadTexture(
    imgFile: any,
    loader: TextureLoader,
    type: TextureType,
    gui: UILayer = null,
    customName: string = null
  ) {
    const text = loader.load(
      typeof imgFile != "string"
        ? URL.createObjectURL(imgFile)
        : TEX_PATH + imgFile
    );
    // finAlphaText.wrapS = THREE.RepeatWrapping; //Only horizontal
    switch (type) {
      case 0:
        touchTexture(__hairMaterial.uniforms.uAlphaText.value);
        __hairMaterial.uniforms.uHasAlphaText.value = true;
        __hairMaterial.uniforms.uAlphaText.value = text;
        break;
      case 1:
        touchTexture(__hairMaterial.uniforms.uDirectionText.value);
        __hairMaterial.uniforms.uHasDirectionText.value = true;
        __hairMaterial.uniforms.uDirectionText.value = text;
        break;
      case 2:
        touchTexture(__hairMaterial.uniforms.uHasOccTexture.value);
        __hairMaterial.uniforms.uHasOccTexture.value = true;
        __hairMaterial.uniforms.uOccTexture.value = text;
        break;
      case 3:
        touchTexture(__hairMaterial.uniforms.uHighlightText.value);
        __hairMaterial.uniforms.uHasHighlightText.value = true;
        __hairMaterial.uniforms.uHighlightText.value = text;
        break;
      case 4:
        touchTexture(__hairMaterial.uniforms.uTiltText.value);
        __hairMaterial.uniforms.uHasTiltText.value = true;
        __hairMaterial.uniforms.uTiltText.value = text;
        break;
      default:
        break;
    }
    gui?.updateTextureName(!customName ? imgFile.name : customName, type);
    // gui?.updateOptionsUI();
  }
  static depthSortHairGeometry() {
    if (!App.sceneProps.hair) return;
    const hairGeometry = App.sceneProps.hair.geometry;
    let indices = hairGeometry.index.array;
    const positions = hairGeometry.getAttribute("position");
    const triangles = new Array(0);

    for (let i = 0; i < indices.length; i += 3) {
      const idx1 = indices[i];
      const idx2 = indices[i + 1];
      const idx3 = indices[i + 2];
      const tri = new Triangle(idx1, idx2, idx3);
      // @ts-ignore
      tri.depth = ModelManager.computeDepth(
        new Vector3().fromBufferAttribute(positions, idx1),
        new Vector3().fromBufferAttribute(positions, idx2),
        new Vector3().fromBufferAttribute(positions, idx3),
        App.sceneProps.camera,
        App.sceneProps.hair.matrixWorld
      );
      triangles.push(tri);
    }
    triangles.sort(function (a, b) {
      return b.depth - a.depth; //high to low
    });
    let t_i = 0;
    for (let i = 0; i < indices.length; i += 3) {
      indices[i] = triangles[t_i].a;
      indices[i + 1] = triangles[t_i].b;
      indices[i + 2] = triangles[t_i].c;
      t_i++;
    }

    hairGeometry.index.needsUpdate = true;
  }
  private static computeDepth(
    vertexA: Vector3,
    vertexB: Vector3,
    vertexC: Vector3,
    cam: Camera,
    transform: Matrix4
  ) {
    const SCALE_OFFSET = 10;
    const DIVIDE_BY_THREE = 0.333333;

    const modelCameraPosition = new Vector3(
      cam.position.x,
      cam.position.y,
      cam.position.z
    ).multiplyScalar(SCALE_OFFSET);

    const centroid = new Vector3(
      vertexA.x + vertexB.x + vertexC.x,
      vertexA.y + vertexB.y + vertexC.y,
      vertexA.z + vertexB.z + vertexC.z
    ).multiplyScalar(DIVIDE_BY_THREE);
    const depth = modelCameraPosition.distanceTo(centroid);

    // const depthA = modelCameraPosition.distanceTo(vertexA);
    // const depthB = modelCameraPosition.distanceTo(vertexB);
    // const depthC = modelCameraPosition.distanceTo(vertexC);

    return depth;
    // return (depthA + depthB + depthC) * 0.333333;
    //Hayar centroide
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

function touchModel(scene: Scene, isHair: boolean) {
  if (App.sceneProps.hair && isHair) scene.remove(App.sceneProps.hair);
  if (App.sceneProps.avatar && !isHair) scene.remove(App.sceneProps.avatar);
}
function touchTexture(text: any) {
  if (text) text.dispose();
}
async function initMikkTSpace(cb: any) {
  await ready;
  cb();
}

export const __hairMaterial = new ShaderMaterial(hairStrandShader);

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
