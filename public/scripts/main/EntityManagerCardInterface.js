import { BaseCardInterface } from "./BaseCardInterface.js";

//@ts-check
export class EntityManagerCardInterface extends BaseCardInterface {
    entityName = null;

    constructor(entityName) {
        super();

        this.entityName = entityName;

        this.createControls[0].addEventListener("click", () => {
            //Add onload to iframe for initializing create form
            const popUpCard = this.cardObject.createPopUpCard(`/layouts/main/popUpCards/${this.entityName}s_cu.html`);
            popUpCard.getView().style.width = "800px";
            popUpCard.getView().querySelector("iframe").addEventListener("load", () => {
                popUpCard.popUpCardInterface.extendInitForm(`/registries/${this.entityName}.json`, `/${this.entityName}s`, "PUT");
            });
        });

        this.retrieveControls[0].addEventListener("click", () => {
            ShellUtil.toggleButtonGlyph(this.retrieveControls[0]);
        });
        this.retrieveControls[0].children[1].addEventListener("keypress", (event) => {
            if (event.key === 'Enter') {
                if (event.currentTarget.value === "") {
                    this.searchItems("", "Showing all items");
                } else {
                    this.searchItems(event.currentTarget.value, `Filtered by ${event.currentTarget.value}`);
                }
            }
        });
        this.retrieveControls[1].addEventListener("click", () => {
            this.searchItems("", "Showing all items");
        });

        this.updateControls[0].addEventListener("click", () => {
            if (this.selectedCardDivisionSectorItems.length === 0) {
                window.parent.shellInterface.throwAlert("Update what?", "Select an item to update", null, null, "OK", null);
            } else if (this.selectedCardDivisionSectorItems.length > 1) {
                window.parent.shellInterface.throwAlert("Too many items", "Select only a single item", "You cannot update multiple items at the same time. Please select a single item and try again", null, "OK", null);
            } else {
                //Add onload to iframe for initializing update form
                const popUpCard = this.cardObject.createPopUpCard(`/layouts/main/popUpCards/${this.entityName}s_cu.html`);
                popUpCard.getView().style.width = "800px";
                popUpCard.getView().querySelector("iframe").addEventListener("load", () => {
                    popUpCard.popUpCardInterface.extendInitForm(`/registries/${this.entityName}.json`, `/${this.entityName}s/${this.selectedCardDivisionSectorItems[0].dataset.bindingObjectId}`, "POST");
                });
            }
        });

        this.deleteControls[0].addEventListener("click", () => {
            if (this.selectedCardDivisionSectorItems.length === 0) {
                window.parent.shellInterface.throwAlert("Delete what?", "Select an item to delete", null, null, "OK", null);
            } else if (this.selectedCardDivisionSectorItems.length > 1) {
                window.parent.shellInterface.throwAlert("Too many items", "Select only a single item", "You cannot delete multiple items at the same time. Please select a single item and try again", null, "OK", null);
            } else {
                window.parent.shellInterface.throwAlert("Are you sure?", "Proceed with caution", "The action of deleting an item isn't reversible. Think carefully and proceed", null, "YES", "NO")
                    .then((value) => {
                        if (value) {
                            fetch(`/${this.entityName}s/${this.selectedCardDivisionSectorItems[0].dataset.bindingObjectId}`, {
                                method: "DELETE"
                            })
                                .then(response => response.json())
                                .then(response => {
                                    if (response.status) {
                                        this.selectedCardDivisionSectorItems[0].remove();
                                    } else {
                                        window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                                    }
                                })
                                .catch(error => {
                                    window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", `We couldn't delete the specified ${this.entityName} from our database. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n` + error, null, "OK", null);
                                })
                        }
                    });
            }
        });

        this.searchItems("", "Showing all items");
    }

    //WARNING: This method must be extended inside a descendant class
    searchItems(keyword, titleDescriptionText) {
        
    }
}