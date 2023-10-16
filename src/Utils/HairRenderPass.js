import { RenderPass } from "@seddi/three/examples/jsm/postprocessing/RenderPass.js";
import { Color,DoubleSide,FrontSide,BackSide } from "@seddi/three";
import { App } from "../app";
import { __hairMaterial } from "../modelManager";

class HairRenderPass extends RenderPass {
  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    super();

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
    this._oldClearColor = new Color();
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    let oldClearAlpha, oldOverrideMaterial;

    if (this.overrideMaterial !== undefined) {
      oldOverrideMaterial = this.scene.overrideMaterial;

      this.scene.overrideMaterial = this.overrideMaterial;
    }

    if (this.clearColor) {
      renderer.getClearColor(this._oldClearColor);
      oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    if (this.clearDepth) {
      renderer.clearDepth();
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

    // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
    if (this.clear)
      renderer.clear(
        renderer.autoClearColor,
        renderer.autoClearDepth,
        renderer.autoClearStencil
      );

    if (App.sceneProps.hair) {
      const auxVisibility = App.sceneProps.hair.visible;
      App.sceneProps.hair.visible = false;
      renderer.render(this.scene, this.camera);
      App.sceneProps.hair.visible = auxVisibility;
      // __hairMaterial.depthWrite = true;
      // __hairMaterial.side= DoubleSide;
      //   __hairMaterial.depthTest = false;
      renderer.render(App.sceneProps.hair, this.camera);
    //   __hairMaterial.depthWrite = false;
    //   //   __hairMaterial.depthTest = false;
    //   __hairMaterial.side= BackSide;
    //   //   App.sceneProps.hair.geometry.index.array.reverse();
    //   //   App.sceneProps.hair.geometry.index.needsUpdate = true;
    //   renderer.render(App.sceneProps.hair, this.camera);
      
    //   __hairMaterial.depthWrite = true;
      
    //   __hairMaterial.side= FrontSide;
      
    //   renderer.render(App.sceneProps.hair, this.camera);
    } else {
      renderer.render(this.scene, this.camera);
    }

    if (this.clearColor) {
      renderer.setClearColor(this._oldClearColor, oldClearAlpha);
    }

    if (this.overrideMaterial !== undefined) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }

    renderer.autoClear = oldAutoClear;
  }
}

export { HairRenderPass };
