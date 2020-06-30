export class BasePopUpCardInterface {
    popUpCardObject = null;
    title = document.querySelector("title").textContent;

    closeButtons = document.querySelectorAll(".closeButton");

    constructor() {
        //Get user's theme from the workspaceScreenController
        document.querySelector("link").href = window.parent.shellInterface.getCurrentScreenController().getThemeFileURL();

        //Add oncontextmenu to window for preventing context menu
        window.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }
}