import { ShaderPass } from '@seddi/three/examples/jsm/postprocessing/ShaderPass.js';
import { App } from './app';
import { FurManager } from './furManager';

export interface IBrush {
  isCombing: boolean,
  isResizingBrush: boolean,
  combRadius: number,
  mouseLastPositionInPixels: number[],
  mousePositionNDC: number[],
  combNDCRadius: number,
  combAngle: number,
  combViewDirectiot2D: number[],

}

export class BrushTool {
  renderer: any;
  brushParams: IBrush;
  brushPass: ShaderPass;

  constructor(pass: ShaderPass, renderer: any) {
    this.renderer = renderer;
    this.brushPass = pass;
    this.brushParams = {
      isCombing: false,
      isResizingBrush: false,
      combRadius: 50,
      mouseLastPositionInPixels: [0, 0],
      mousePositionNDC: [0, 0],
      combNDCRadius: 0,
      combAngle: 0.1,
      combViewDirectiot2D: [0, 0],
    };

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);



  }

  onMouseDown(event: MouseEvent) {
    const x = event.offsetX;
    const y = event.offsetY;
    this.brushPass.uniforms['uCursorPos'].value.x = x;
    this.brushPass.uniforms['uCursorPos'].value.y = window.innerHeight - y;
    this.brushParams.mouseLastPositionInPixels = [x, y]

    if (event.which == 1) {
      App.controls.enableZoom = false;

      this.brushParams.isCombing = true;
      this.brushPass.uniforms['uCombing'].value = this.brushParams.isCombing;
      document.body.style.cursor = 'none';

    }


  }

  onMouseUp(event: MouseEvent) {

    if (this.brushParams.isCombing == true) {
      App.controls.enableZoom = true;

      this.brushParams.isCombing = false;
      this.brushPass.uniforms['uCombing'].value = this.brushParams.isCombing;

    }
    document.body.style.cursor = 'context-menu';
  }
  onMouseMove(event: MouseEvent) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (this.brushParams.isCombing) {
      this.brushPass.uniforms['uCursorPos'].value.x = x;
      this.brushPass.uniforms['uCursorPos'].value.y = window.innerHeight - y;


      //Convert to NDC coordinates for compute shader
      //...
      const canvas = this.renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const newX = x / rect.width * 2 - 1;
      const newY = y / rect.height * -2 + 1;

      const dx = 10 * (newX - this.brushParams.mousePositionNDC[0]);
      const dy = 10 * (newY - this.brushParams.mousePositionNDC[1]);

      this.brushParams.mousePositionNDC[0] = newX;
      this.brushParams.mousePositionNDC[1] = newY;
      
      FurManager.computeMaterial.uniforms.uMouseNDCPos.value.x = newX;
      FurManager.computeMaterial.uniforms.uMouseNDCPos.value.y = newY;
      FurManager.computeMaterial.uniforms.uCombAngle.value = this.brushParams.combAngle;
      FurManager.computeMaterial.uniforms.uCombNDCDir.value.x = dx;
      FurManager.computeMaterial.uniforms.uCombNDCDir.value.y = dy;
      FurManager.computeMaterial.uniforms.uMouseNDCRadio.value = this.brushParams.combRadius / (rect.width * 0.5);

    }

    this.brushParams.mouseLastPositionInPixels = [x, y]
  }
  onMouseWheel(event: WheelEvent) {
    if (this.brushParams.isCombing) {
      this.brushParams.combRadius -= event.deltaY * 0.2;
      this.brushPass.uniforms['uRadius'].value = this.brushParams.combRadius;
    }

  }

}