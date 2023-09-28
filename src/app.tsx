import * as THREE from '@seddi/three';
import { EffectComposer } from '@seddi/three/examples/jsm/postprocessing/EffectComposer.js';
import { OrbitControls } from '@seddi/three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '@seddi/three/examples/jsm/loaders/FBXLoader.js';
import { wasm, isReady, ready, generateTangents } from '@seddi/three/examples/jsm/libs/mikktspace.module.js';
import { computeMikkTSpaceTangents } from '@seddi/three/examples/jsm/utils/BufferGeometryUtils.js';
import { RenderPass } from '@seddi/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '@seddi/three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from '@seddi/three/examples/jsm/shaders/GammaCorrectionShader.js';
import Stats from '@seddi/three/examples/jsm/libs/stats.module.js';
import { brushShader } from './Shaders/BrushShader.js';
import { BrushTool } from './brushTool';
import { FurManager } from './furManager';
import { GUI } from "dat.gui";

interface ISceneProps {
    furryObject3D: THREE.Object3D,
    ambientLight: THREE.AmbientLight,
    pointLight: THREE.PointLight,
    camera: THREE.PerspectiveCamera,

}

//Check if THREE lets you create a lot of menus and place them in difffferent places.
//Create menu for basic thing like alias, background color and basic lightining
//Nother one for fur
//Another one for hair
//Another one for import options
//Maybe create UI layer

export class App {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    brushTool: BrushTool;
    boundTick: any;
    FBXLoader: FBXLoader;
    textureLoader: THREE.TextureLoader;
    renderComposer: EffectComposer;
    gui: GUI;
    loaded: Boolean;

    static sceneProps: ISceneProps;
    static controls: OrbitControls;
    static stats: Stats;

    constructor() {
        this.scene = new THREE.Scene();
        App.sceneProps = {
            furryObject3D: null,
            ambientLight: null,
            pointLight: null,
            camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        const renderTarget = new THREE.WebGLRenderTarget(0, 0, {
            format: THREE.RGBAFormat,
            encoding: THREE.sRGBEncoding,
            samples: 4,
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
        App.controls.target.set(0, 0, 0);
        App.controls.update();

        document.body.appendChild(App.stats.dom);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener("mousemove", (event) => { this.brushTool.onMouseMove(event) });
        window.addEventListener("mouseup", (event) => { this.brushTool.onMouseUp(event) });
        window.addEventListener("mousedown", (event) => { this.brushTool.onMouseDown(event) });
        window.addEventListener("wheel", (event) => { this.brushTool.onMouseWheel(event) });
        window.addEventListener("resize", () => {this.onWindowResize()});

       

        FurManager.init();
        const renderPass = new RenderPass(this.scene);
        renderPass.camera = App.sceneProps.camera;
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        this.renderComposer.addPass(renderPass);
        this.renderComposer.addPass(this.brushTool.brushPass);
        this.renderComposer.addPass(gammaCorrectionPass);
        FurManager.renderer = this.renderer;



    }

    /**
     * Function called in which the user can implement and setup the scene
     */
    private init() {
        const skinMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.02, .02, .02),
            metalness: 0,
            roughness: 0.75
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 10);
        this.scene.add(ambientLight);
        App.sceneProps.ambientLight = ambientLight;

        const pointLight = new THREE.PointLight(0xffffff, 75, 100);
        pointLight.position.set(5, 5, 5);

        this.scene.add(pointLight);
        App.sceneProps.pointLight = pointLight;

        this.loadFurryMesh("bunny.fbx", skinMat, 0, 0, 0, 0.1, -1.57, 0, 0);

        const finAlphaText = this.textureLoader.load('./data/textures/hairs-alpha.png');
        finAlphaText.wrapS = THREE.RepeatWrapping; //Only horizontal
        FurManager.finMaterial.uniforms.uAlphaTexture.value = finAlphaText;
        window.addEventListener("keydown", (event) => {
            if (event.altKey) {
              this.loadFurryMesh("sphere.fbx", skinMat, 0, 1, 0, 0.1, -1.57, 0, 0)
            }
          });
        App.sceneProps.camera.position.z = 5;

    }
    /**
     * Initiate some functionality that need objects and scene already set up
    */
    private lateInit() {
        this.gui = new GUI({ autoPlace: true, width: 310 });
        FurManager.setupGUI(this.gui);


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
        if (!this.loaded) return;


        FurManager.update(this.brushTool.brushParams.isCombing, App.sceneProps.camera);
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
     * Load a FBX model geometry given its situation in the world (position, scale and rotation) and a material
     * @param {*String} fileName 
     * @param {*material} baseMaterial THREE.Material
     * @param {*number} pos_x 
     * @param {*number} pos_y 
     * @param {*number} pos_z 
     * @param {*number} scale 3 axis scale
     * @param {*number} rot_x In radians
     * @param {*number} rot_y In radians
     * @param {*number} rot_z In radians
     */
    loadFurryMesh(fileName: string, baseMaterial: THREE.Material,
        // eslint-disable-next-line camelcase
        pos_x: number, pos_y: number, pos_z: number, scale: number, rot_x: number, rot_y: number, rot_z: number) {
        let root = this;
        this.FBXLoader.load(
            // resource URL
            "./data/models/" + fileName,

            function (object: any) {
                function transform(mesh: THREE.Mesh) {
                    mesh.position.set(pos_x, pos_y, pos_z);
                    mesh.scale.set(scale, scale, scale);
                    mesh.rotateX(rot_x);
                    mesh.rotateY(rot_y);
                    mesh.rotateZ(rot_z);
                }

                object.traverse(function (child: any) {

                    if (child.isMesh) {

                        const furryObject = new THREE.Object3D();

                        child.castShadow = true;
                        child.receiveShadow = true;
                        //Base mesh
                        const base = new THREE.Mesh(child.geometry, baseMaterial);
                        base.parent = furryObject;
                        transform(base);
                        base.renderOrder = 0;
                        root.scene.add(base);
                        //Fins
                        const finsGeometry = FurManager.computeFins(base);
                        const fins = new THREE.Mesh(finsGeometry, FurManager.finMaterial);
                        transform(fins);
                        fins.renderOrder = 1;
                        FurManager.fins.push(fins);
                        root.scene.add(fins);
                        fins.parent = furryObject;
                        FurManager.computePasses.push(new THREE.WebGLComputePass(FurManager.computeMaterial, fins, root.renderer));
                        //Shells
                        const instancedGeo = new THREE.InstancedBufferGeometry().copy(child.geometry);
                        instancedGeo.setAttribute('hairDir', new THREE.BufferAttribute(new Float32Array(instancedGeo.getAttribute('normal').array), 3));
                        instancedGeo.instanceCount = FurManager.MAX_INSTANCE_COUNT;
                        const shell = new THREE.Mesh(instancedGeo, FurManager.shellMaterial);
                        transform(shell);
                        shell.renderOrder = 2;
                        FurManager.shells.push(shell);
                        root.scene.add(shell);
                        shell.parent = furryObject;
                        FurManager.computePasses.push(new THREE.WebGLComputePass(FurManager.computeMaterial, shell, root.renderer));

                        App.sceneProps.furryObject3D = furryObject;

                        root.initMikkTSpace(() => {
                            const mikk = {
                                wasm: wasm,
                                isReady: isReady
                                , generateTangents: generateTangents
                            }
                            computeMikkTSpaceTangents(instancedGeo, mikk);

                        })

                        root.loaded = true;
                    }

                });

            }

        );

    }

    /**
     * Callback method that can be called to maintain render aspect ratio
     */
    onWindowResize() {
        App.sceneProps.camera.aspect = window.innerWidth / window.innerHeight;
        App.sceneProps.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async initMikkTSpace(cb: any) {
        await ready
        cb()
    }
}



