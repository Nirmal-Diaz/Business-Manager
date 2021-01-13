import { BasePopUpCardInterface } from "./BasePopUpCardInterface.js";
import { Form } from "./Form.js";

export class EntityPopUpCardInterface extends BasePopUpCardInterface {
    form = new Form(document.querySelector("form"));

    constructor(entityNameSingular, entityNamePlural) {
        super();

        this.entityNameSingular = entityNameSingular;
        this.entityNamePlural = entityNamePlural;

        document.getElementById("saveButton").addEventListener("click", () => {
            this.form.submit().then(submission => {
                if (submission.status) {
                    //Refresh (not reload) the parentCardInterface
                    this.popUpCardObject.parentCardInterface.searchItems("", "Showing all items");
                    this.popUpCardObject.close();
                } else {
                    window.parent.shellInterface.throwAlert(submission.error.title, submission.error.titleDescription, submission.error.message, null, "OK", null);
                }
            });
        });

        document.getElementById("resetButton").addEventListener("click", () => {
            this.form.resetInputs();
        });

        document.getElementById("printButton").addEventListener("click", () => {
            print();
        });
    }
}