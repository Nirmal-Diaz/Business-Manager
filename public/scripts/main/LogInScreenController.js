//@ts-check
import { ScreenController } from "./ScreenController.js";
import { LogInPatternAuthorizer } from "./LogInPatternAuthorizer.js";

export class LogInScreenController extends ScreenController {
    patternAuthorizer = null;

    logInBox = null;
    logInAvatar = null;

    constructor(logInScreenView) {
        super(logInScreenView);
        this.patternAuthorizer = new LogInPatternAuthorizer(logInScreenView.querySelector(".inputContainer.pattern"));
        //Initialize/Cache elements
        this.logInBox = this.view.querySelector("#logInBox");
        this.logInAvatar = this.view.querySelector("#logInAvatar");
        //Add onkeypress to logInBoxInputElement for loading relevant profileImage
        this.logInBox.children[1].addEventListener("keypress", (event) => {
            //Check if the pressed key is "Enter"
            if (event.key === "Enter") {
                fetch(`/users/${encodeURIComponent(this.logInBox.children[1].value)}/avatar`)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.patternAuthorizer.setUsername(this.logInBox.children[1].value);
                            this.patternAuthorizer.getView().style.visibility = "visible";
                            this.logInAvatar.style.opacity = "1";
                            this.logInAvatar.style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.data.data)]))})`;
                            this.view.querySelector("#logInBoxBackground").style.transform = "translateX(-55vw) rotate(45deg)";
                            this.logInBox.children[0].children[0].innerText = "Let's see if it is really you";
                            this.logInBox.children[0].children[1].innerText = "Please mark your pattern";
                        } else {
                            this.patternAuthorizer.getView().style.visibility = "hidden";
                            this.logInAvatar.removeAttribute("style");
                            this.view.querySelector("#logInBoxBackground").removeAttribute("style");
                            this.logInBox.children[0].children[0].innerText = response.error.title;
                            this.logInBox.children[0].children[1].innerText = response.error.titleDescription;
                        }
                    })
                    .catch(error => {
                        window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't validate your username. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                    });
            }
        });
        //Focus logInBoxInputElement in the beginning
        this.logInBox.children[1].focus();
    }
}