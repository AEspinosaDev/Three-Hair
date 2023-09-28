
import {
  Scene,
  OrthographicCamera,
  WebGLRenderTarget,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  RepeatWrapping,
} from '@seddi/three';
import {perlinNoiseShader} from '../Shaders/PerlinNoiseShader'

export class NoiseTextGenerationPass {
  constructor() {
    this.NOISE_TEXT_SIZE = 2060;

    this.noiseCamera = new OrthographicCamera(this.NOISE_TEXT_SIZE / - 2, this.NOISE_TEXT_SIZE / 2, this.NOISE_TEXT_SIZE / 2, this.NOISE_TEXT_SIZE / - 2, - 10000, 10000);
    this.noiseCamera.position.z = 100;

    this.noiseFrameBuffer = new WebGLRenderTarget(this.NOISE_TEXT_SIZE, this.NOISE_TEXT_SIZE);
    this.noiseFrameBuffer.texture.wrapS = RepeatWrapping;
    this.noiseFrameBuffer.texture.wrapT = RepeatWrapping;

    this.noiseScene = new Scene();
    this.perlinNoiseMaterial = new ShaderMaterial(perlinNoiseShader);

    const noiseTextPlane = new PlaneGeometry(this.NOISE_TEXT_SIZE, this.NOISE_TEXT_SIZE);
    const noiseQuad = new Mesh(noiseTextPlane, this.perlinNoiseMaterial);
    noiseQuad.position.z = - 100;
    this.noiseScene.add(noiseQuad);

  }
  get noiseTexture() {
    return this.noiseFrameBuffer.texture;
  }

  render(renderer) {

    renderer.setRenderTarget(this.noiseFrameBuffer);
    renderer.clear();
    renderer.render(this.noiseScene, this.noiseCamera);
    renderer.setRenderTarget(null);

  }

 





}