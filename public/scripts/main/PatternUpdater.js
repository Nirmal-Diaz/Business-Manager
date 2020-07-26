//@ts-check
import { PatternAuthorizer } from "./PatternAuthorizer.js";

export class PatternUpdater extends PatternAuthorizer {
    step = 1;
    newPattern = "";

    constructor(patternView) {
        super(patternView);
    }

    setStep(step) {
        this.step = step;

        if (step === 1) {
            document.querySelector(".formsContainer .title").textContent = "Wanna try again?";
            document.querySelector(".formsContainer .titleDescription").textContent = "Mark your current pattern";
        } else if (step === 2) {
            document.querySelector(".formsContainer .title").textContent = "Step 2";
            document.querySelector(".formsContainer .titleDescription").textContent = "Mark a new pattern";
        } else if (step === 3) {
            document.querySelector(".formsContainer .title").textContent = "Step 3";
            document.querySelector(".formsContainer .titleDescription").textContent = "Confirm your new pattern";
        }
    }

    attemptAuthorization() {
        if (this.step === 1) {
            //Case: PatternUpdater has asked to recall the current pattern from the user and we have the recalled pattern
            fetch(`/users/@me/pattern?cellCombination=${this.cellCombination}`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.setStep(2);
                    } else {
                        window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                    }
                }).catch(error => {
                    window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        } else if (this.step === 2) {
            //Case: PatternUpdater has asked to mark the new pattern from the user and we have the new pattern
            this.setStep(3);
            this.newPattern = this.cellCombination;

        } else if (this.step === 3) {
            //Case: PatternUpdater has asked to confirm the new pattern from the user and we have the confirmed pattern
            if (this.newPattern === this.cellCombination) {
                //Case: Both the new and confirmed patterns are equivalent
                fetch("/users/@me/pattern", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cellCombination: this.cellCombination,
                    })
                }).then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.setStep(1);
                        } else {
                            window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                        }
                    }).catch(error => {
                        window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                    });
            } else {
                this.setStep(2);

                window.parent.shellInterface.throwAlert("Oops! Pattern mismatch", "Start from the beginning", "Your newly created pattern didn't match with pattern you confirmed. You have to fallback into the 2nd step", null, "OK", null);
            }
        }

        //Reset pattern
        this.resetPattern();
    }
}