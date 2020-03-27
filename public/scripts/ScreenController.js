//@ts-check
export class ScreenController {
    view = null;
    viewHTML = null;

    constructor(screenView) {
        this.viewHTML = screenView.innerHTML;
        //Initialize/cache view elements
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