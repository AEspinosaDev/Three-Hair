import { GUI } from "dat.gui";
import { FurManager } from "./furManager";

export class UILayer{
    fileInputUI: GUI;
    optionsUI: GUI;
    brushUI: GUI;

    constructor()
    {

    }

    initGUI(){

        this.optionsUI = new GUI({ autoPlace: true, width: 350 });
        FurManager.setupGUI(this.optionsUI);


        this.fileInputUI = new GUI({ autoPlace: false});
        this.fileInputUI.domElement.style.position ="absolute";
        this.fileInputUI.domElement.style.top ="2px";
        this.fileInputUI.domElement.style.left ="2px";

        var inputFile = { addModel:function(){ console.log("clicked") }};

        this.fileInputUI.add(inputFile,'addModel');
        // this.fileInputUI.add(config, 'Vertex Cnt', 100, 5000).step(100);  // number range and step
        // this.fileInputUI.add(config, 'Edge Weight', 0, 1).step(0.05);  // number range and step

        document.getElementById("gui").append(this.fileInputUI.domElement);

    }


}