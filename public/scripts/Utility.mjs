//@ts-check
import { Card } from "./Card.mjs";

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
                workspaceScreenController.actionOverlayView.classList.replace("overlay-popIn", "overlay-popOut");
            }
        });

        const title = document.createElement("div");
        title.setAttribute("class", "title");
        title.textContent = module.name;
        actionOverlayChip.appendChild(title);
        return actionOverlayChip;
    }

    static toggleButtonGlyph(event) {
        if (event.currentTarget.classList.toggle("buttonGlyph-revealed")) {
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
                    cardDivisionSectorItem.classList.add("cardDivisionSectorItem-active");
                } else {
                    //Remove cardDivisionSectorItem from selectedCardDivisionSectorItems along with its styles
                    this.selectedCardDivisionSectorItems.splice(existingLocation, 1)
                    cardDivisionSectorItem.classList.remove("cardDivisionSectorItem-active");
                }
            } else {
                //Remove styles of each selectedCardDivisionSectorItems
                for (const selectedCardDivisionSectorItem of this.selectedCardDivisionSectorItems) {
                    selectedCardDivisionSectorItem.classList.remove("cardDivisionSectorItem-active");
                }
                //Empty the selectedCardDivisionSectorItems
                this.selectedCardDivisionSectorItems.length = 0;
                //Finally add the cardDivisionSectorItem to selected cardDivisionSectorItems
                this.selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                //Add styles tho the selectedCardDivisionSectorItem
                cardDivisionSectorItem.classList.add("cardDivisionSectorItem-active");
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
            value = input.dataset.value;
        } else {
            value = formField.value;
        }
        const regexp = new RegExp(formField.pattern);
        if (!regexp.test(value) || value === "null") {
            input.parentElement.classList.add("inputContainer-invalid");
        } else {
            input.parentElement.classList.remove("inputContainer-invalid");
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
            input.dataset.value = value;
            input.value = formField.value;
        } else if (formField.inputClass === "dropDownInput") {
            //Query the dropDOwnInputOption with the value in the formField
            const dropDownInputOption = input.querySelector(`.dropDownInputOption[data-value="${value}"]`);
            //Click the dropDownInputOption to select it
            //WARNING: Only works when the dropDOwnInputOption is expanded
            dropDownInputOption.click();
        }
    }

    static createDropDownInputOption(textContent, value, hasCustomClickHandler = false) {
        const dropDownInputOption = document.createElement("div");
        dropDownInputOption.textContent = textContent;
        dropDownInputOption.setAttribute("class", "dropDownInputOption");
        dropDownInputOption.dataset.value = value;
        if (!hasCustomClickHandler) {
            dropDownInputOption.addEventListener("click", (event) => {
                FormUtil.toggleDropDownInput(dropDownInputOption);
            });
        }
        return dropDownInputOption;
    }

    static populateDropDownInput(requestPath, dropDownInput, textContentField, valueField) {
        //Fetch items
        return fetch(`${location.protocol}//${location.host}${requestPath}`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    dropDownInput.innerHTML = "";
                    //Create a dropDownInputOption for every item
                    for (const item of response.data) {
                        const dropDownInputOption = FormUtil.createDropDownInputOption(item[textContentField], item[valueField], false);
                        dropDownInput.appendChild(dropDownInputOption);
                    }
                } else {
                    window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            })
            .catch(error => {
                window.parent.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch roles list from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }

    //EVENT HANDLER METHODS
    static toggleDropDownInput(dropDownInputOption) {
        if (dropDownInputOption.parentElement.classList.toggle("dropDownInput-collapsed")) {
            dropDownInputOption.style.display = "flex";
            //Store the selectedOption's value in its parent's dataset
            dropDownInputOption.parentElement.dataset.value = dropDownInputOption.dataset.value;
            return true;
        } else {
            for (const dropDownOption of dropDownInputOption.parentElement.children) {
                dropDownOption.removeAttribute("style");
            }
            //Set the parent's value as "null"
            dropDownInputOption.parentElement.dataset.value = "null";
            return false;
        }
    }

    static toggleCheckInput(checkInput) {
        //Return if the checkInput is inactive
        return checkInput.children[0].classList.toggle("checkRadioInputControl-active");
    }
}