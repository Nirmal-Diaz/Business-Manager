export class ScreenController {
    view = null;
    viewHTML = null;

    constructor(screenView) {
        this.view = screenView;
    }

    getView() {
        return this.view;
    }

    resetView() {
        //Restore HTML inside logInScreen
        this.view.innerHTML = this.viewHTML;
    }
}