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
        document.querySelector("link").href = window.parent.shellInterface.getCurrentScreenController().getThemeFileURL();
    }
}