import { GUI } from "dat.gui";
import { TextureType, __hairMaterial, __skinMaterial } from "./modelManager";
import { App } from "./app";
import {
  INPUT_FILE_GUI_CONFIG,
  HAIR_MATERIAL_CONFIG,
  ENVIROMENT_CONFIG,
  DEBUG_CONFIG,
} from "./config";
import { FrontSide,DoubleSide } from "@seddi/three";

export class UILayer {
  fileInputUI: GUI;
  optionsUI: GUI;
  brushUI: GUI;

  constructor() {}

  initGUI() {
    this.setupFileInputGUI();
    this.setupOptionsGUI();
    this.setupDebugGUI();
  }
  private setupFileInputGUI() {
    this.fileInputUI = new GUI({ autoPlace: false, width: 350 });
    this.fileInputUI.domElement.style.position = "absolute";
    this.fileInputUI.domElement.style.top = "2px";
    this.fileInputUI.domElement.style.left = "2px";
    var config = INPUT_FILE_GUI_CONFIG;
    document
      .getElementById("input-file-gui")
      .append(this.fileInputUI.domElement);

    const meshInputFolder = this.fileInputUI.addFolder("Meshes");
    meshInputFolder.add(config, "Upload Hair Model");
    meshInputFolder.add(config, "Hair Model").domElement.style.pointerEvents =
      "none";
    meshInputFolder.add(config, "Show Hair").onChange(function (value) {
      App.sceneProps.hair.visible = value;
    });
    meshInputFolder.add(config, "Upload Avatar Model");
    meshInputFolder.add(config, "Avatar Model").domElement.style.pointerEvents =
      "none";
    meshInputFolder.add(config, "Show Avatar").onChange(function (value) {
      App.sceneProps.avatar.visible = value;
    });

    meshInputFolder.open();

    const hairTextureFolder = this.fileInputUI.addFolder("Hair Textures");
    hairTextureFolder.add(config, "Upload Alpha Texture");
    hairTextureFolder.add(
      config,
      "Alpha Texture"
    ).domElement.style.pointerEvents = "none";
    hairTextureFolder.add(config, "Upload Occ. Texture");
    hairTextureFolder.add(
      config,
      "Occ. Texture"
    ).domElement.style.pointerEvents = "none";
    hairTextureFolder.add(config, "Upload Direction Texture");
    hairTextureFolder.add(
      config,
      "Direction Texture"
    ).domElement.style.pointerEvents = "none";
    hairTextureFolder.add(config, "Upload Tilt Texture");
    hairTextureFolder.add(
      config,
      "Tilt Texture"
    ).domElement.style.pointerEvents = "none";
    hairTextureFolder.add(config, "Upload Highlight Texture");

    hairTextureFolder.add(
      config,
      "Highlight Texture"
    ).domElement.style.pointerEvents = "none";

    hairTextureFolder.open();
  }
  private setupOptionsGUI() {
    this.optionsUI = new GUI({ autoPlace: true, width: 350 });

    const ambientFolder = this.optionsUI.addFolder("Ambient");

    var env_config = ENVIROMENT_CONFIG;

    ambientFolder.add(env_config, "Blur", 0, 1, 0.05).onChange((value: any) => {
      App.sceneProps.scene.backgroundBlurriness = value;
    });
    ambientFolder
      .add(env_config, "Intensity", 0, 1, 0.1)
      .onChange((value: any) => {
        __hairMaterial.uniforms.uAmbientIntensity.value = value;
        __skinMaterial.envMapIntensity = value + 0.5;
        App.sceneProps.scene.backgroundIntensity = value;
      });
    ambientFolder.open();

    const pointFolder = this.optionsUI.addFolder("Point Light");

    pointFolder
      .add(App.sceneProps.pointLight, "intensity", 0, 100)
      .onChange(function (value) {
        __hairMaterial.uniforms.uIntensity.value = value * 0.01;
      });
    pointFolder
      .add(App.sceneProps.pointLight.position, "x", -25, 25)
      .onChange(function (value) {
        __hairMaterial.uniforms.uLightPos.value.x = value;
      });
    pointFolder
      .add(App.sceneProps.pointLight.position, "y", -25, 25)
      .onChange(function (value) {
        __hairMaterial.uniforms.uLightPos.value.y = value;
      });
    pointFolder
      .add(App.sceneProps.pointLight.position, "z", -25, 25)
      .onChange(function (value) {
        __hairMaterial.uniforms.uLightPos.value.z = value;
      });
    pointFolder.open();

    const hairFolder = this.optionsUI.addFolder("Hair Material");

    var config = HAIR_MATERIAL_CONFIG;
    hairFolder.addColor(config, "Base Color").onChange((value: any) => {
      __hairMaterial.uniforms.uColor.value.r = value.r / 255;
      __hairMaterial.uniforms.uColor.value.g = value.g / 255;
      __hairMaterial.uniforms.uColor.value.b = value.b / 255;
    });
    hairFolder.addColor(config, "Highlight Color").onChange((value: any) => {
      __hairMaterial.uniforms.uSpecularColor.value.g = value.g / 255;
      __hairMaterial.uniforms.uSpecularColor.value.b = value.b / 255;
      __hairMaterial.uniforms.uSpecularColor.value.r = value.r / 255;
    });
    hairFolder
      .add(config, "Specular 1 Power", 0, 124)
      .onChange((value: number) => {
        __hairMaterial.uniforms.uSpecularPower1.value = value;
      });
    hairFolder
      .add(config, "Specular 2 Power", 0, 124)
      .onChange((value: number) => {
        __hairMaterial.uniforms.uSpecularPower2.value = value;
      });
    hairFolder.add(config, "Use Alpha texture").onChange((value: Boolean) => {
      __hairMaterial.uniforms.uHasAlphaText.value = value;
    });
    hairFolder.add(config, "Use Tilt texture").onChange((value: Boolean) => {
      __hairMaterial.uniforms.uHasTiltText.value = value;
    });
    hairFolder.add(config, "Tilt 1", -5, 5, 0.1).onChange((value: number) => {
      __hairMaterial.uniforms.uTilt1.value = value;
    });
    hairFolder.add(config, "Tilt 2", -5, 5, 0.1).onChange((value: number) => {
      __hairMaterial.uniforms.uTilt2.value = value;
    });
    hairFolder.add(config, "Use Occ. texture").onChange((value: Boolean) => {
      __hairMaterial.uniforms.uHasOccTexture.value = value;
    });
    hairFolder
      .add(config, "Use Highlight texture")
      .onChange((value: Boolean) => {
        __hairMaterial.uniforms.uHasHighlightText.value = value;
      });
    hairFolder
      .add(config, "Use Tangent from texture")
      .onChange((value: Boolean) => {
        __hairMaterial.uniforms.uHasDirectionText.value = value;
        // __hairMaterial.uniforms.uHasAlphaText.value = value;
      });

    hairFolder.open();
  }
  private setupDebugGUI() {
    var config = DEBUG_CONFIG;
  

    const debugFolder = this.optionsUI.addFolder("Debug Transparency");

    debugFolder.add(config, "Custom Alpha Test").onChange(function (value) {
      __hairMaterial.uniforms.uCustomAlphaTest.value = value;
    });

    debugFolder.add(config, "Alpha To Coverage").onChange(function (value) {
      __hairMaterial.alphaToCoverage = value;
    });
    debugFolder.add(config, "Alpha Coverage Fix").onChange(function (value) {
      __hairMaterial.uniforms.uAlphaToCoverageFix.value = value;
    });
      debugFolder.add(config, "Discard Threshold",0,1,0.05).onChange(function (value) {
        __hairMaterial.uniforms.uDiscardThreshold.value = value;
    });
    debugFolder.add(config, "Alpha Test",0,1,0.05).onChange(function (value) {
      __hairMaterial.alphaTest = value;
    });
    debugFolder.add(config, "Sort hair tris").onChange(function (value) {
      config["Sort hair tris"]=value;
    });

      debugFolder.add(config, "Transparent").onChange(function (value) {
        __hairMaterial.transparent = value;
    });
    debugFolder.add(config, "Depth write").onChange(function (value) {
      __hairMaterial.depthWrite = value;
  });
  debugFolder.add(config, "BackFace Cull").onChange(function (value) {
    value? __hairMaterial.side = FrontSide:__hairMaterial.side = DoubleSide;
});

    debugFolder.open();



  }

  updateModelName(newName: any, op: boolean) {
    op
      ? (INPUT_FILE_GUI_CONFIG["Hair Model"] = newName)
      : (INPUT_FILE_GUI_CONFIG["Avatar Model"] = newName);
    this.updateFileInputUI();
  }
  updateTextureName(newName: any, type: TextureType) {
    switch (type) {
      case 0:
        INPUT_FILE_GUI_CONFIG["Alpha Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Alpha Texture"] = true;
        break;
      case 1:
        INPUT_FILE_GUI_CONFIG["Direction Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Tangent from texture"] = true;
        break;
      case 2:
        INPUT_FILE_GUI_CONFIG["Occ. Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Occ. texture"] = true;
        break;
      case 3:
        INPUT_FILE_GUI_CONFIG["Highlight Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Highlight Texture"] = true;
        break;
      case 4:
        INPUT_FILE_GUI_CONFIG["Tilt Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Tilt Texture"] = true;
        break;
      default:
        break;
    }

    this.updateFileInputUI();
    this.updateOptionsUI();
  }

  updateFileInputUI() {
    for (var i in this.fileInputUI.__folders) {
      for (var j in this.fileInputUI.__folders[i].__controllers) {
        this.fileInputUI.__folders[i].__controllers[j].updateDisplay();
      }
    }
  }
  updateOptionsUI() {
    for (var i in this.optionsUI.__folders) {
      for (var j in this.optionsUI.__folders[i].__controllers) {
        this.optionsUI.__folders[i].__controllers[j].updateDisplay();
      }
    }
  }
}
