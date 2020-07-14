//@ts-check
import { WorkspaceScreenController } from "./WorkspaceScreenController.js";
import { LogInScreenController } from "./LogInScreenController.js";

export class ShellInterface {
    currentScreenController = null;
    styleFileURL = null;

    alertOverlayView = null;
    alertTitleContainer = null;
    alertMessage = null;
    alertTextInput = null;
    alertBackground = null;
    alertTrueButton = null;
    alertFalseButton = null;

    constructor() {
        //Install service worker
        //NOTE: This must be done only on secure contexts. navigator.serviceWorker isn't available on insecure contexts
        if (window.isSecureContext) {
            navigator.serviceWorker.register("/main.serviceWorker.js");
        }

        //Initialize/cache view elements
        this.alertOverlayView = document.getElementById("alertOverlay");
        this.alertTitleContainer = this.alertOverlayView.querySelector(".titleContainer");
        this.alertMessage = this.alertOverlayView.querySelector("#alertBoxMessage");
        this.alertTextInput = this.alertOverlayView.querySelector(".textInput");
        this.alertBackground = this.alertOverlayView.querySelector(".overlayBackground");
        this.alertTrueButton = this.alertOverlayView.querySelector("#alertBoxTrueButton");
        this.alertFalseButton = this.alertOverlayView.querySelector("#alertBoxFalseButton");

        //Update greeting on the splashScreen according to the time
        const currentHours = new Date().getHours();
        if (currentHours >= 20) {
            document.querySelector("#splashScreen .title").textContent = "Working late? Let's do it";
        } else if (currentHours >= 12) {
            document.querySelector("#splashScreen .title").textContent = "Good evening! Nice to have you back";
        } else {
            document.querySelector("#splashScreen .title").textContent = "Hey there! Good morning";
        }

        //Add onclick to splashScreenView for initializing currentScreen
        document.getElementById("splashScreen").addEventListener("click", (event) => {
            //Fetch workspace
            fetch("/sessions")
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.currentScreenController = new WorkspaceScreenController(document.getElementById("workspaceScreen"));
                    } else {
                        this.currentScreenController = new LogInScreenController(document.getElementById("logInScreen"));
                    }
                    //Animate out splashSCreen
                    event.target.classList.replace("popIn", "popOut");
                    //Animate in new screen
                    this.currentScreenController.getView().classList.replace("popOut", "popIn");
                })
                .catch(error => {
                    this.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't ask the internal server if you are logged in. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        });
    }

    getCurrentScreenController() {
        return this.currentScreenController;
    }

    getView() {
        return document.body;
    }

    getStyleFileURL() {
        return this.styleFileURL;
    }

    setStyle(styleFileURL) {
        this.styleFileURL = styleFileURL;
        document.getElementsByTagName("link")[0].href = this.styleFileURL;
    }

    getAllFrames() {
        return document.querySelectorAll("iframe");
    }

    transitScreen(newScreenController) {
        //Reset and animate out old screen
        this.currentScreenController.getView().classList.replace("popIn", "popOut");
        this.currentScreenController.resetView();
        //Animate in new screen
        this.currentScreenController = newScreenController;
        this.currentScreenController.getView().classList.replace("popOut", "popIn");
    }

    //NOTE: This method is asynchronous
    throwAlert(title, titleDescription, message, placeholder, trueButtonText, falseButtonText) {
        //Animate out alertOverlayView and set its title, titleDescription and message
        this.alertOverlayView.classList.replace("popOut", "popIn");
        this.alertTitleContainer.children[0].innerText = title;
        this.alertTitleContainer.children[1].innerText = titleDescription;
        this.alertMessage.innerText = message;
        //NOTE: If there is a placeholder that means alertBoxInput is needed
        if (placeholder === null) {
            this.alertTextInput.style.display = "none";
        } else {
            this.alertTextInput.removeAttribute("style");
            this.alertTextInput.placeholder = placeholder;
        }
        this.alertBackground.classList.replace("popOut", "popIn");
        //Return alert promise
        return new Promise(
            (resolve, reject) => {
                //NOTE: trueButton is always included no matter the type of alertOverlay
                this.alertTrueButton.innerText = trueButtonText;
                this.alertTrueButton.addEventListener("click", () => {
                    this.alertBackground.classList.replace("popIn", "popOut");
                    setTimeout(() => {
                        //NOTE: If there is a placeholder there is a textInput
                        //NOTE: Then the trueButton returns textInput's value, otherwise simply "true"
                        if (placeholder === null) {
                            resolve(true);
                        } else {
                            resolve(this.alertTextInput.value);
                        }
                        this.alertOverlayView.classList.replace("popIn", "popOut");
                    }, 250);
                });
                //NOTE: If there is a falseButton it always returns "false"
                if (falseButtonText === null) {
                    this.alertFalseButton.style.display = "none";
                } else {
                    this.alertFalseButton.style.display = "initial";
                    this.alertFalseButton.innerText = falseButtonText;
                    this.alertFalseButton.addEventListener("click", () => {
                        this.alertBackground.classList.replace("popIn", "popOut");
                        setTimeout(() => {
                            reject(false);
                            this.alertOverlayView.classList.replace("popIn", "popOut");
                        }, 250);
                    });
                }
            }
        );
    }
}