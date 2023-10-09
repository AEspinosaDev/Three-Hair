import { GUI } from "dat.gui";
import { FurManager } from "./furManager";
import { TextureType, __hairMaterial } from "./modelManager";
import { App } from "./app";
import { Color } from "@seddi/three";

const INPUT_FILE_GUI_CONFIG = {
  "Upload Hair Model": function () {
    var input = document.getElementById("hair-path");
    input.click();
  },
  "Hair Model": "--",
  "Show Hair": true,
  "Upload Avatar Model": function () {
    var input = document.getElementById("avatar-path");
    input.click();
  },
  "Avatar Model": "--",
  "Show Avatar": true,

  "Upload Alpha Texture": function () {
    var input = document.getElementById("alpha-tex-path");
    input.click();
  },
  "Alpha Texture": "--",
  "Upload Normal Texture": function () {
    var input = document.getElementById("normal-tex-path");
    input.click();
  },
  "Normal Texture": "--",
  "Upload Direction Texture": function () {
    var input = document.getElementById("direction-tex-path");
    input.click();
  },
  "Direction Texture": "--",
  "Upload Tilt Texture": function () {
    var input = document.getElementById("tilt-tex-path");
    input.click();
  },
  "Tilt Texture": "--",
  "Upload Highlight Texture": function () {
    var input = document.getElementById("hightlight-tex-path");
    input.click();
  },
  "Highlight Texture": "--",
};
const HAIR_MATERIAL_CONFIG = {
  "Base Color": new Color(
    __hairMaterial.uniforms.uColor.value.r * 255,
    __hairMaterial.uniforms.uColor.value.g * 255,
    __hairMaterial.uniforms.uColor.value.b * 255
  ),
  "Highlight Color": new Color(
    __hairMaterial.uniforms.uSpecularColor.value.r * 255,
    __hairMaterial.uniforms.uSpecularColor.value.g * 255,
    __hairMaterial.uniforms.uSpecularColor.value.b * 255
  ),
  "Specular 1 Power": __hairMaterial.uniforms.uSpecularPower1.value,
  "Specular 2 Power": __hairMaterial.uniforms.uSpecularPower2.value,
  "Use Alpha Texture": true,
  "Use Tilt texture": true,
  "Tilt 1":__hairMaterial.uniforms.uTilt1.value,
  "Tilt 2":__hairMaterial.uniforms.uTilt2.value,
  "Use Highlight texture": false,
  "Use Tangent from texture": false,
};

export class UILayer {
  fileInputUI: GUI;
  optionsUI: GUI;
  brushUI: GUI;

  constructor() {}

  initGUI() {
    this.setupFileInputGUI();
    this.setupOptionsGUI();
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
    hairTextureFolder.add(config, "Upload Normal Texture");
    hairTextureFolder.add(
      config,
      "Normal Texture"
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
    // let img = document.createElement("IMG");
    // img.src = "https://www.tutorialspoint.com/static/images/logo.png";
    hairTextureFolder.add(
      config,
      "Highlight Texture"
    ).domElement.style.pointerEvents = "none";

    hairTextureFolder.open();
  }
  private setupOptionsGUI() {
    this.optionsUI = new GUI({ autoPlace: true, width: 350 });

    const ambientFolder = this.optionsUI.addFolder("Ambient Light");
    ambientFolder
      .add(App.sceneProps.ambientLight, "intensity", 0, 1,0.1)
      .onChange(function (value) {
        __hairMaterial.uniforms.uAmbientIntensity.value = value;
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
    hairFolder.add(config, "Use Alpha Texture").onChange((value: Boolean) => {
      __hairMaterial.uniforms.uHasAlphaText.value = value;
    });
    hairFolder.add(config, "Use Tilt texture").onChange((value: Boolean) => {
      __hairMaterial.uniforms.uHasTiltText.value = value;
    });
    hairFolder
    .add(config, "Tilt 1", -5, 5,0.1)
    .onChange((value: number) => {
      __hairMaterial.uniforms.uTilt1.value = value;
    });
    hairFolder
    .add(config, "Tilt 2", -5, 5,0.1)
    .onChange((value: number) => {
      __hairMaterial.uniforms.uTilt2.value = value;
    });
    hairFolder
      .add(config, "Use Highlight texture")
      .onChange((value: Boolean) => {
        __hairMaterial.uniforms.uHasHighlightText.value = value;
      });
    hairFolder
      .add(config, "Use Tangent from texture")
      .onChange((value: Boolean) => {
        // __hairMaterial.uniforms.uHasAlphaText.value = value;
      });

    hairFolder.open();
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
        INPUT_FILE_GUI_CONFIG["Normal Texture"] = newName;
        break;
      case 2:
        INPUT_FILE_GUI_CONFIG["Direction Texture"] = newName;
        break;
      case 3:
        INPUT_FILE_GUI_CONFIG["Hightlight Texture"] = newName;
        HAIR_MATERIAL_CONFIG["Use Hightlight Texture"] = true;
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
