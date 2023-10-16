import { __hairMaterial } from "./modelManager";
import { Color } from "@seddi/three";

export const INPUT_FILE_GUI_CONFIG = {
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
  "Upload Occ. Texture": function () {
    var input = document.getElementById("normal-tex-path");
    input.click();
  },
  "Occ. Texture": "--",
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
    var input = document.getElementById("highlight-tex-path");
    input.click();
  },
  "Highlight Texture": "--",
};
export const HAIR_MATERIAL_CONFIG = {
  "Base Color": new Color(0.49 * 255, 0.39 * 255, 0.31 * 255),
  "Highlight Color": new Color(0.49 * 255, 0.39 * 255, 0.31 * 255),
  "Specular 1 Power": 124,
  "Specular 2 Power": 104,
  "Use Alpha texture": true,
  "Use Tilt texture": true,
  "Tilt 1": -0.2,
  "Tilt 2": -0.4,
  "Use Occ. texture": false,
  "Use Highlight texture": true,
  "Use Tangent from texture": false,
};
export const ENVIROMENT_CONFIG = {
  Blur: 0.0,
  Intensity: 0.3,
};

export const DEBUG_CONFIG = {
  "Custom Alpha Test": true,
  "Alpha To Coverage": true,
  "Alpha Coverage Fix": true,
  "Discard Threshold": 0.5,
  "Alpha Test": false,
  "Blend": false,
  "Sort hair tris": false,

};
