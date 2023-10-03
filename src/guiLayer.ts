import { GUI } from "dat.gui";
import { FurManager } from "./furManager";

const INPUT_FILE_GUI_CONFIG = {
    'Upload Hair Model': function() {
        var input = document.getElementById('hair-path');
        input.click();
    },
    'Hair Model Name': "--",
    'Upload Avatar Model': function() {
        var input = document.getElementById('avatar-path');
        input.click();
    },
    'Avatar Model Name': "--",
}
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
        var config = INPUT_FILE_GUI_CONFIG;
        document.getElementById("input-file-gui").append(this.fileInputUI.domElement);
        this.fileInputUI.add(config, 'Upload Hair Model');
        var hairName = this.fileInputUI.add(config, 'Hair Model Name');
        this.fileInputUI.add(config, 'Upload Avatar Model');
        var avatarName = this.fileInputUI.add(config, 'Avatar Model Name');
        hairName.domElement.style.pointerEvents = "none" ;
        avatarName.domElement.style.pointerEvents = "none" ;
    }
    updateModelName(newName: any, op: boolean){
            op? INPUT_FILE_GUI_CONFIG["Hair Model Name"] = newName:  INPUT_FILE_GUI_CONFIG["Avatar Model Name"] = newName;
        this.updateFileInputUI();

    }
    updateFileInputUI(){
        for (var i in this.fileInputUI.__controllers) {
            this.fileInputUI.__controllers[i].updateDisplay();
        }
    }


}