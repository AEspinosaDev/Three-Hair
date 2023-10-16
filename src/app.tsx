import * as THREE from '@seddi/three';
import { EffectComposer } from '@seddi/three/examples/jsm/postprocessing/EffectComposer.js';
import { OrbitControls } from '@seddi/three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '@seddi/three/examples/jsm/loaders/FBXLoader.js';
import { EXRLoader } from '@seddi/three/examples/jsm/loaders/EXRLoader.js';

import { HairRenderPass } from './Utils/HairRenderPass.js';
import { ShaderPass } from '@seddi/three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from '@seddi/three/examples/jsm/shaders/GammaCorrectionShader.js';
import Stats from '@seddi/three/examples/jsm/libs/stats.module.js';
import { brushShader } from './Shaders/BrushShader.js';
import { BrushTool } from './brushTool';
import { FurManager } from './furManager';
import { UILayer } from './guiLayer';
import { ENVIROMENT_CONFIG } from './config';
import { ModelManager, TextureType } from './modelManager';


interface ISceneProps {
    scene: THREE.Scene,
    hair: any,
    avatar: any,
    ambientLight: THREE.AmbientLight,
    pointLight: THREE.PointLight,
    camera: THREE.PerspectiveCamera,

}


export class App {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    brushTool: BrushTool;
    boundTick: any;
    FBXLoader: FBXLoader;
    textureLoader: THREE.TextureLoader;
    renderComposer: EffectComposer;
    guiLayer: UILayer;
    loaded: Boolean;

    static sceneProps: ISceneProps;
    static controls: OrbitControls;
    static stats: Stats;

    constructor() {
        this.scene = new THREE.Scene();
        App.sceneProps = {
            scene: this.scene,
            hair: null,
            avatar: null,
            ambientLight: null,
            pointLight: null,
            camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        const renderTarget = new THREE.WebGLRenderTarget(0, 0, {
            format: THREE.RGBAFormat,
            encoding: THREE.sRGBEncoding,
            samples: 16,
        });
        this.renderComposer = new EffectComposer(this.renderer, renderTarget);
        this.renderComposer.setSize(window.innerWidth, window.innerHeight);
        this.brushTool = new BrushTool(new ShaderPass(brushShader), this.renderer);
        this.FBXLoader = new FBXLoader();
        this.textureLoader = new THREE.TextureLoader();

        App.controls = new OrbitControls(App.sceneProps.camera, this.renderer.domElement);
        App.controls.mouseButtons = { MIDDLE: 1, RIGHT: 0 };
        App.stats = new Stats();

        this.boundTick = this.tick.bind(this);

        this.loaded = false;

    }

    /**
     * Run app
    */
    run() {
        this.awake();
        this.init();
        this.lateInit();

        this.tick();
    }
    //#region Core private functions
    /**
     * Function called before init. Setup core parameters in order for the app to function properly
    */
    private awake() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(0.1, 0.1, 0.1));
        this.renderer.autoClear = false;

        App.controls.target.set(0, 0, 0);
        App.controls.update();
        App.stats.dom.style.position = "absolute";
        App.stats.dom.style.top = "92%";
        document.body.appendChild(App.stats.dom);
        document.body.appendChild(this.renderer.domElement);


        //#region event_listeners
        window.addEventListener("mousemove", (event) => { this.brushTool.onMouseMove(event) });
        window.addEventListener("mouseup", (event) => { this.brushTool.onMouseUp(event) });
        window.addEventListener("mousedown", (event) => { this.brushTool.onMouseDown(event) });
        window.addEventListener("wheel", (event) => { this.brushTool.onMouseWheel(event) });
        window.addEventListener("resize", () => { this.onWindowResize() });
        var root = this;
        // @ts-ignore
        document.getElementById('hair-path').addEventListener('change', function () { ModelManager.uploadModel(document.getElementById('hair-path').files[0], root.FBXLoader, root.scene, true, root.guiLayer) });
        // @ts-ignore
        document.getElementById('avatar-path').addEventListener('change', function () { ModelManager.uploadModel(document.getElementById('avatar-path').files[0], root.FBXLoader, root.scene, false, root.guiLayer) });
        // @ts-ignore
        document.getElementById('alpha-tex-path').addEventListener('change', function () { ModelManager.uploadTexture(document.getElementById('alpha-tex-path').files[0], root.textureLoader, TextureType.ALPHA, root.guiLayer) })
        // @ts-ignore
        document.getElementById('normal-tex-path').addEventListener('change', function () { ModelManager.uploadTexture(document.getElementById('normal-tex-path').files[0], root.textureLoader, TextureType.NORMAL, root.guiLayer) })
        // @ts-ignore
        document.getElementById('direction-tex-path').addEventListener('change', function () { ModelManager.uploadTexture(document.getElementById('direction-tex-path').files[0], root.textureLoader, TextureType.DIRECTION, root.guiLayer) })
        // @ts-ignore
        document.getElementById('highlight-tex-path').addEventListener('change', function () { ModelManager.uploadTexture(document.getElementById('highlight-tex-path').files[0], root.textureLoader, TextureType.HIGHLIGHT, root.guiLayer) })
        // @ts-ignore
        document.getElementById('tilt-tex-path').addEventListener('change', function () { ModelManager.uploadTexture(document.getElementById('tilt-tex-path').files[0], root.textureLoader, TextureType.TILT, root.guiLayer) })

        //#endregion


        FurManager.init();
        // var scene2 = new THREE.Scene();
        // const geometry = new THREE.SphereGeometry(15, 32, 16);
        // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        // const sphere = new THREE.Mesh(geometry, material);
        // scene2.add(sphere);
        // const renderPass2 = new RenderPass(scene2);
        // renderPass2.camera = App.sceneProps.camera;

        const renderPass = new HairRenderPass(this.scene);
        renderPass.camera = App.sceneProps.camera;
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        this.renderComposer.addPass(renderPass);
        // this.renderComposer.addPass(renderPass2);
        this.renderComposer.addPass(this.brushTool.brushPass);
        this.renderComposer.addPass(gammaCorrectionPass);
        FurManager.renderer = this.renderer;



    }

    /**
     * Function called in which the user can implement and setup the scene
     */
    private init() {

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        App.sceneProps.ambientLight = ambientLight;
        // this.scene.enviroment = 
        const pointLight = new THREE.PointLight(0xffffff, 75, 100);
        pointLight.position.set(25, 7, -25);

        this.scene.add(pointLight);
        App.sceneProps.pointLight = pointLight;


        const finAlphaText = this.textureLoader.load('./data/textures/hairs-alpha.png');
        finAlphaText.wrapS = THREE.RepeatWrapping; //Only horizontal
        FurManager.finMaterial.uniforms.uAlphaTexture.value = finAlphaText;

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const exrLoader = new EXRLoader();
        const root = this;
        const envMap = exrLoader.load('./data/textures/envMap_2.exr',function(texture){

            var exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
            var exrBackground = exrCubeRenderTarget.texture;
            var newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;

            root.scene.environment =newEnvMap;

            root.scene.background = newEnvMap;
            root.scene.backgroundIntensity = ENVIROMENT_CONFIG.Intensity;
            root.scene.backgroundBlurriness = ENVIROMENT_CONFIG.Blur;
            

        });
       


        App.sceneProps.camera.position.z = 7;

    }
    /**
     * Initiate some functionality that need objects and scene already set up
    */
    private lateInit() {
        //Gui init
        this.guiLayer = new UILayer();
        this.guiLayer.initGUI();

        //Demo resources loading
        ModelManager.uploadModel('Loose_Hairstyle_High.fbx', this.FBXLoader, this.scene, true, this.guiLayer, "Demo Hair");
        ModelManager.uploadModel('Head_Basemesh.fbx', this.FBXLoader, this.scene, false, this.guiLayer, "Demo Head");
        ModelManager.uploadTexture('T_StandardWSet_Alpha.png', this.textureLoader, TextureType.ALPHA, this.guiLayer, "Demo Alpha Tex");
        ModelManager.uploadTexture('tilt_texture.png', this.textureLoader, TextureType.TILT, this.guiLayer, "Demo Tilt Tex");
        ModelManager.uploadTexture('highlight_texture.png', this.textureLoader, TextureType.HIGHLIGHT, this.guiLayer, "Demo Highlight Tex");


    }
    /**
        * Updates the state of the app
    */
    private update() {
        App.stats.update();


    }

    /**
     * Render the scene
     */
    private render() {

        //  ModelManager.depthSortHairGeometry();
        this.renderer.clear();
        this.renderComposer.render();

    }

    /**
     * Updates the state of the app
     */
    private tick() {
        requestAnimationFrame(this.boundTick);

        this.update();
        this.render();

    }

    //#endregion

    //#region Utilities



    /**
     * Callback method that can be called to maintain render aspect ratio
     */
    onWindowResize() {
        App.sceneProps.camera.aspect = window.innerWidth / window.innerHeight;
        App.sceneProps.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


}



