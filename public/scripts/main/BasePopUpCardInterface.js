export class BasePopUpCardInterface {
    popUpCardObject = null;
    title = document.querySelector("title").textContent;

    closeButtons = document.querySelectorAll(".closeButton");

    constructor() {
        document.querySelector("link").href = window.parent.shellInterface.getCurrentScreenController().getThemeFileURL();
    }
}