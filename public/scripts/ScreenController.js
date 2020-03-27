//@ts-check
export class ScreenController {
    view = null;
    viewHTML = null;

    constructor(screenView) {
        this.view = screenView;
        this.viewHTML = this.view.innerHTML;
    }

    getView() {
        return this.view;
    }

    resetView() {
        //Restore HTML inside logInScreen
        this.view.innerHTML = this.viewHTML;
    }
}