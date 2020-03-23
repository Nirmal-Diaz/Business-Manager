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
    static createDropDownInputOption(textContent) {
        const dropDownInputOption = document.createElement("div");
        dropDownInputOption.setAttribute("class", "dropDownInputOption");
        const dropDownOptionContent = document.createElement("span");
        dropDownOptionContent.textContent = textContent;
        //Append into HTML
        dropDownInputOption.appendChild(dropDownOptionContent);
        return dropDownInputOption;
    }

    static createActionOverlayChip(module, workspaceScreenController) {
        const actionOverlayChip = document.createElement("div");
        actionOverlayChip.setAttribute("class", "actionOverlayChip");
        actionOverlayChip.addEventListener("click", (event) => {
            if (workspaceScreenController.isCardExist(module.layoutFilePath)) {
                window.shellInterface.throwAlert("Card already exists", "Continue work with the existing card", "The card you are trying to open already exists on the workspace. Two instances of the same card isn't allowed by the system", null, "OK", null);
            } else {
                workspaceScreenController.addCard(new Card(module.layoutFilePath));
                workspaceScreenController.actionOverlayView.classList.replace("overlay-popIn", "overlay-popOut");
            }
        });

        const title = document.createElement("div");
        title.setAttribute("class", "title");
        title.textContent = module.name;
        actionOverlayChip.appendChild(title);
        return actionOverlayChip;
    }

    //EVENT HANDLER METHODS
    //NOTE: This method toggles the parent dropDownInput by using a child dropDownInputOption
    static toggleDropDownInput(dropDownInputOption) {
        if (dropDownInputOption.parentElement.classList.toggle("dropDownInput-collapsed")) {
            for (const dropDownOption of dropDownInputOption.parentElement.children) {
                dropDownOption.style.display = "none";
            }
            dropDownInputOption.removeAttribute("style");
            //Store the selectedOption's index in its parent's dataset
            dropDownInputOption.parentElement.dataset.selectedOptionIndex = Array.from(dropDownInputOption.parentElement.children).indexOf(dropDownInputOption);
            //Return the selected dropDownInputOption
            return dropDownInputOption;
        } else {
            for (const dropDownOption of dropDownInputOption.parentElement.children) {
                dropDownOption.removeAttribute("style");
            }
            //Store the selectedOption's index in its parent's dataset as "null"
            dropDownInputOption.parentElement.dataset.selectedOptionIndex = "null";
            //Return that no dropDownInputOption is selected
            return null;
        }
    }

    static toggleCheckInput(checkInput) {
        //Return if the checkInput is inactive
        return checkInput.children[0].classList.toggle("checkRadioInputControl-active");
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