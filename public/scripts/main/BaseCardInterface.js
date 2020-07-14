//@ts-check
export class BaseCardInterface {
    cardObject = null;
    title = document.querySelector("title").textContent;
    selectedCardDivisionSectorItems = [];

    createControls = document.querySelectorAll("#createControlsContainer > button");
    retrieveControls = document.querySelectorAll("#retrieveControlsContainer > button");
    updateControls = document.querySelectorAll("#updateControlsContainer > button");
    deleteControls = document.querySelectorAll("#deleteControlsContainer > button");

    constructor() {
        //Get user's theme from the workspaceScreenController
        document.querySelector("link").href = window.parent.shellInterface.getStyleFileURL();

        //Add oncontextmenu to window for preventing context menu
        window.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }
}