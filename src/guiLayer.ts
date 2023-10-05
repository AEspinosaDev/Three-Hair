import { GUI } from "dat.gui";
import { FurManager } from "./furManager";
import { TextureType } from "./modelManager";
import { App } from "./app";

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
export class UILayer {
  fileInputUI: GUI;
  optionsUI: GUI;
  brushUI: GUI;

  constructor() {}

  initGUI() {
    this.optionsUI = new GUI({ autoPlace: true, width: 350 });
    FurManager.setupGUI(this.optionsUI);

    this.setupFileInputGUI();
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
    let img = document.createElement("IMG");
    img.src = "https://www.tutorialspoint.com/static/images/logo.png";
    hairTextureFolder
      .add(config, "Highlight Texture")
      .domElement.append(img);

    hairTextureFolder.open();
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
        break;
      case 1:
        INPUT_FILE_GUI_CONFIG["Normal Texture"] = newName;
        break;
      case 2:
        INPUT_FILE_GUI_CONFIG["Direction Texture"] = newName;
        break;
      case 3:
        INPUT_FILE_GUI_CONFIG["Tilt Texture"] = newName;
        break;
      case 4:
        INPUT_FILE_GUI_CONFIG["Hightlight Texture"] = newName;
        break;
      default:
        break;
    }

    this.updateFileInputUI();
  }
  updateFileInputUI() {
    for (var i in this.fileInputUI.__folders) {
      for (var j in this.fileInputUI.__folders[i].__controllers) {
        this.fileInputUI.__folders[i].__controllers[j].updateDisplay();
      }
    }
  }
}
