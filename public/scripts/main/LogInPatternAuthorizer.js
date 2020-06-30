//@ts-check
import { PatternAuthorizer } from "./PatternAuthorizer.js";
import { WorkspaceScreenController } from "./WorkspaceScreenController.js";

export class LogInPatternAuthorizer extends PatternAuthorizer {
    constructor(patternView) {
        super(patternView);
    }

    attemptAuthorization() {
        //Create a session
        fetch("/sessions", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.username,
                cellCombination: this.cellCombination,
            })
        }).then(response => response.json())
            .then(response => {
                if (response.status) {
                    window.shellInterface.transitScreen(new WorkspaceScreenController(window.shellInterface.getView().querySelector("#workspaceScreen")));
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            }).catch(error => {
                window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });

        //Reset pattern
        this.resetPattern();
    }
}