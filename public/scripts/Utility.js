//@ts-check
import { Card } from "./Card.js";

export class PlatformUtil {
    static getCurrentTime() {
        //Create a new dateObject with currentDate
        const currentDate = new Date();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        //Format hours and minutes for leading zero
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        //Output time
        return (hours + " : " + minutes);
    }
}

export class PlatformComponent {
    static createActionOverlayChip(module, workspaceScreenController) {
        const actionOverlayChip = document.createElement("div");
        actionOverlayChip.setAttribute("class", "actionOverlayChip");
        actionOverlayChip.addEventListener("click", (event) => {
            if (workspaceScreenController.isCardExist(module.layoutFilePath)) {
                window.shellInterface.throwAlert("Card already open", "Close it before opening another", "An instance of the card that you are trying to open already exists. You aren't allowed to open more than one instance of a card", null, "OK", null);
            } else {
                workspaceScreenController.addCard(new Card(module.layoutFilePath, module.id));
                //NOTE: Since we don't care about the closing animation of action overlay when a chip is clicked (We care about the card insertion animation), actionOverlayView must be popped out first
                workspaceScreenController.actionOverlayView.classList.replace("popIn", "popOut");
                workspaceScreenController.actionOverlayBackground.classList.replace("popIn", "popOut");
            }
        });

        const title = document.createElement("div");
        title.setAttribute("class", "title");
        title.textContent = module.name;
        actionOverlayChip.appendChild(title);
        return actionOverlayChip;
    }

    static toggleButtonGlyph(event) {
        if (event.currentTarget.classList.toggle("revealed")) {
            event.currentTarget.children[1].style.display = "block";
            event.currentTarget.children[1].focus();
        } else {
            event.currentTarget.children[1].style.display = "none";
        }
    }
}

export class CardComponent {
    static createCardDivisionSector(titleContent, titleDescriptionContent) {
        const cardDivisionSector = document.createElement("div");
        cardDivisionSector.setAttribute("class", "cardDivisionSector");
        const titleContainer = document.createElement("div");
        titleContainer.setAttribute("class", "titleContainer");
        const title = document.createElement("h1");
        title.setAttribute("class", "title");
        title.innerText = titleContent;
        const titleDescription = document.createElement("div");
        titleDescription.setAttribute("class", "titleDescription");
        titleDescription.innerText = titleDescriptionContent;
        //Append into HTML
        titleContainer.appendChild(title);
        titleContainer.appendChild(titleDescription);
        cardDivisionSector.appendChild(titleContainer);
        return cardDivisionSector;
    }

    //WARNING: This method must be bounded to a "CardInterface" instance before using
    static createCardDivisionSectorItem(iconURL, title, informationContents) {
        const cardDivisionSectorItem = document.createElement("div");
        cardDivisionSectorItem.setAttribute("class", "cardDivisionSectorItem");
        //Add onclick to cardDivisionSectorItem for selecting it
        cardDivisionSectorItem.addEventListener("click", (event) => {
            //Check if the ctrlKey is pressed
            if (event.ctrlKey) {
                //Try to retrieve already existing of cardDivisionSectorItem form selectedCardDivisionSectorItems (returns -1 if not)
                const existingLocation = this.selectedCardDivisionSectorItems.indexOf(cardDivisionSectorItem);
                if (existingLocation === -1) {
                    //Just add the cardDivisionSectorItem to selected cardDivisionSectorItems
                    this.selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                    //Add styles tho the selectedCardDivisionSectorItem
                    cardDivisionSectorItem.classList.add("active");
                } else {
                    //Remove cardDivisionSectorItem from selectedCardDivisionSectorItems along with its styles
                    this.selectedCardDivisionSectorItems.splice(existingLocation, 1)
                    cardDivisionSectorItem.classList.remove("active");
                }
            } else {
                //Remove styles of each selectedCardDivisionSectorItems
                for (const selectedCardDivisionSectorItem of this.selectedCardDivisionSectorItems) {
                    selectedCardDivisionSectorItem.classList.remove("active");
                }
                //Empty the selectedCardDivisionSectorItems
                this.selectedCardDivisionSectorItems.length = 0;
                //Finally add the cardDivisionSectorItem to selected cardDivisionSectorItems
                this.selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                //Add styles tho the selectedCardDivisionSectorItem
                cardDivisionSectorItem.classList.add("active");
            }

        });
        const itemPreview = document.createElement("div");
        itemPreview.setAttribute("class", "itemPreview");
        itemPreview.style.backgroundImage = `url('${iconURL}')`;
        const itemDetails = document.createElement("div");
        itemDetails.setAttribute("class", "itemDetails");
        const itemTitle = document.createElement("h1");
        itemTitle.setAttribute("class", "itemTitle");
        itemTitle.innerText = title;
        //Append into HTML
        itemDetails.appendChild(itemTitle);
        for (const informationContent of informationContents) {
            const itemInformation = document.createElement("span");
            itemInformation.setAttribute("class", "itemInformation");
            itemInformation.innerText = informationContent;
            //Append into HTML
            itemDetails.appendChild(itemInformation);
        }
        //Append into HTML
        cardDivisionSectorItem.appendChild(itemPreview);
        cardDivisionSectorItem.appendChild(itemDetails);
        return cardDivisionSectorItem;
    }
}

export class FormUtil {
    static visualizeValidation(formView, formField, prioritizeInputValue = false) {
        let input = formView.querySelector(formField.inputQuery);
        let value;
        if (prioritizeInputValue) {
            value = input.value;
        } else {
            value = formField.value;
        }
        const regexp = new RegExp(formField.pattern);
        if (!regexp.test(value) || value === "null") {
            input.parentElement.classList.add("invalid");
        } else {
            input.parentElement.classList.remove("invalid");
        }
    }

    static syncInputWithValue(formView, formField, overrideValue = null) {
        const input = formView.querySelector(formField.inputQuery);
        let value = formField.value;
        //Override the formField.value if there is an overrideValue provided
        if (overrideValue) {
            value = overrideValue;
        }

        //Handle synchronization according to the inputClass
        if (formField.inputClass === "textInput") {
            input.value = value;
        } else if (formField.inputClass === "dropDownInput") {
            input.value = value;
        }
    }

    static createDropDownInputFragment(requestPath, textContentField, valueField) {
        //Fetch items
        return fetch(`${location.protocol}//${location.host}${requestPath}`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    const dropDownInputFragment = new DocumentFragment();
                    //Create a dropDownInputOption for every item
                    for (const item of response.data) {
                        const dropDownInputOption = document.createElement("option");
                        dropDownInputOption.textContent = item[textContentField];
                        dropDownInputOption.value = item[valueField];

                        dropDownInputFragment.appendChild(dropDownInputOption);
                    }
                    return dropDownInputFragment;
                } else {
                    window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                    return null;
                }
            })
            .catch(error => {
                window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch roles list from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}