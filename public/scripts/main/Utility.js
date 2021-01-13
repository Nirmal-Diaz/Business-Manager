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

    static capitalizedToPascal(capitalizedSentence) {
        return capitalizedSentence[0].toLowerCase() + capitalizedSentence.replace(/\s/g, "").slice(1);
    }
}

export class ShellComponent {
    static createActionOverlayChip(module, workspaceScreenController) {
        const actionOverlayChip = document.createElement("div");
        actionOverlayChip.setAttribute("class", "actionOverlayChip");
        actionOverlayChip.addEventListener("click", (event) => {
            let scroll = workspaceScreenController.isCardExist(module.layoutFilePath);
            if (scroll !== null) {
                if (scroll < 0) {
                    scroll = -scroll;
                    for (let i = 0; i < scroll; i++) {
                        workspaceScreenController.scrollViewport(-1);
                    }
                } else if (scroll > 0) {
                    for (let i = 0; i < scroll; i++) {
                        workspaceScreenController.scrollViewport(1);
                    }
                }
            } else {
                workspaceScreenController.addCard(new Card(module.layoutFilePath, module.id));
            }
            //NOTE: Since we don't care about the closing animation of action overlay when a chip is clicked (We care about the card insertion animation), actionOverlayView must be popped out first
            workspaceScreenController.actionOverlayView.classList.replace("popIn", "popOut");
            workspaceScreenController.actionOverlayBackground.classList.replace("popIn", "popOut");
        });

        const title = document.createElement("div");
        title.setAttribute("class", "title");
        title.textContent = module.name;
        actionOverlayChip.appendChild(title);
        return actionOverlayChip;
    }
}

export class ShellUtil {
    static toggleButtonGlyph(buttonGlyph) {
        if (buttonGlyph.classList.toggle("revealed")) {
            buttonGlyph.children[1].style.display = "block";
            buttonGlyph.children[1].focus();
        } else {
            buttonGlyph.children[1].style.display = "none";
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
    static createCardDivisionSectorItem(selectedCardDivisionSectorItems, iconURL, title, informationContents) {
        const cardDivisionSectorItem = document.createElement("div");
        cardDivisionSectorItem.setAttribute("class", "cardDivisionSectorItem");
        //Add onclick to cardDivisionSectorItem for selecting it
        cardDivisionSectorItem.addEventListener("click", (event) => {
            //Check if the ctrlKey is pressed
            if (event.ctrlKey) {
                //Try to retrieve already existing of cardDivisionSectorItem form selectedCardDivisionSectorItems (returns -1 if not)
                const existingLocation = selectedCardDivisionSectorItems.indexOf(cardDivisionSectorItem);
                if (existingLocation === -1) {
                    //Just add the cardDivisionSectorItem to selected cardDivisionSectorItems
                    selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                    //Add styles tho the selectedCardDivisionSectorItem
                    cardDivisionSectorItem.classList.add("active");
                } else {
                    //Remove cardDivisionSectorItem from selectedCardDivisionSectorItems along with its styles
                    selectedCardDivisionSectorItems.splice(existingLocation, 1)
                    cardDivisionSectorItem.classList.remove("active");
                }
            } else {
                //Remove styles of each selectedCardDivisionSectorItems
                for (const selectedCardDivisionSectorItem of selectedCardDivisionSectorItems) {
                    selectedCardDivisionSectorItem.classList.remove("active");
                }
                //Empty the selectedCardDivisionSectorItems
                selectedCardDivisionSectorItems.length = 0;
                //Finally add the cardDivisionSectorItem to selected cardDivisionSectorItems
                selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
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

    static createTable(fields) {
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headRow = document.createElement("tr");
        for (const field of fields) {
            const th = document.createElement("th");
            th.textContent = field;
            headRow.appendChild(th);
        }

        thead.appendChild(headRow);
        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    static createTableRow(selectedCardDivisionSectorItems, informationContents) {
        //NOTE: A table row is considered as a cardDivisionSectorItem
        const cardDivisionSectorItem = document.createElement("tr");
        cardDivisionSectorItem.setAttribute("class", "cardDivisionSectorItem");

        //Add onclick to cardDivisionSectorItem for selecting it
        cardDivisionSectorItem.addEventListener("click", (event) => {
            //Check if the ctrlKey is pressed
            if (event.ctrlKey) {
                //Try to retrieve already existing of cardDivisionSectorItem form selectedCardDivisionSectorItems (returns -1 if not)
                const existingLocation = selectedCardDivisionSectorItems.indexOf(cardDivisionSectorItem);
                if (existingLocation === -1) {
                    //Just add the cardDivisionSectorItem to selected cardDivisionSectorItems
                    selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                    //Add styles tho the selectedCardDivisionSectorItem
                    cardDivisionSectorItem.classList.add("active");
                } else {
                    //Remove cardDivisionSectorItem from selectedCardDivisionSectorItems along with its styles
                    selectedCardDivisionSectorItems.splice(existingLocation, 1)
                    cardDivisionSectorItem.classList.remove("active");
                }
            } else {
                //Remove styles of each selectedCardDivisionSectorItems
                for (const selectedCardDivisionSectorItem of selectedCardDivisionSectorItems) {
                    selectedCardDivisionSectorItem.classList.remove("active");
                }
                //Empty the selectedCardDivisionSectorItems
                selectedCardDivisionSectorItems.length = 0;
                //Finally add the cardDivisionSectorItem to selected cardDivisionSectorItems
                selectedCardDivisionSectorItems.push(cardDivisionSectorItem);
                //Add styles tho the selectedCardDivisionSectorItem
                cardDivisionSectorItem.classList.add("active");
            }

        });

        for (let i = 0; i < informationContents.length; i++) {
            const td = document.createElement("td");
            td.textContent = informationContents[i];
            cardDivisionSectorItem.appendChild(td);
        }

        return cardDivisionSectorItem;
    }
}

export class FormComponent {
    static refreshDropDownInput(dropDownInput) {
        dropDownInput.innerHTML = "";

        return FormComponent.createDropDownInputFragment(dropDownInput.dataset.requestUrl, dropDownInput.dataset.textContentField, dropDownInput.dataset.valueField).then(dropDownInputFragment => dropDownInput.appendChild(dropDownInputFragment));
    }

    static createDropDownInputFragment(requestURL, textContentField, valueField) {
        //Fetch items
        return fetch(requestURL)
            .then(response => response.json())
            .then(response => {
                const dropDownInputFragment = new DocumentFragment();
                if (response.status) {
                    //Create a dropDownInputOption for every item
                    for (const item of response.data) {
                        const dropDownInputOption = document.createElement("option");
                        dropDownInputOption.textContent = item[textContentField];
                        dropDownInputOption.value = item[valueField];

                        dropDownInputFragment.appendChild(dropDownInputOption);
                    }
                } else {
                    //Create an empty dropDownInputOption
                    const dropDownInputOption = document.createElement("option");
                    dropDownInputOption.textContent = "No suitable items";
                    dropDownInputOption.value = "(Nothing selected)";

                    dropDownInputFragment.appendChild(dropDownInputOption);
                }
                return dropDownInputFragment;
            })
            .catch(error => {
                window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch roles list from our database. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}

export class FormUtil {
    static mapPlainFieldToFormField(plainFieldValue, formField) {
        if (formField.inputClass === "image") {
            //NOTE: Any kind of blob sent by the server has the following structure
            // const sampleBlob = {
            //     type: "Buffer",
            //     data: []
            // }

            //formField.value must contain the stringified sampleBlob.data
            formField.value = JSON.stringify(plainFieldValue.data);
            formField.size = plainFieldValue.data.length;
        } else {
            formField.value = plainFieldValue;
        }
    }

    static updateInputFromValue(formView, formField, overrideValue = null) {
        const input = formView.querySelector(formField.inputQuery);
        let value = null;
        //Override the formField.value if there is an overrideValue provided
        if (overrideValue) {
            value = overrideValue;
        } else {
            value = formField.value;
        }

        //Handle synchronization according to the inputClass
        if (formField.inputClass === "image") {
            input.dataset.stringifiedBlob = value;
            input.dataset.size = formField.size;
            input.dataset.type = formField.type;
            
            //NOTE: There is a sibling img tag to preview images
            const imageBlob = new Blob([new Uint8Array(JSON.parse(value))]);
            input.previousElementSibling.src = URL.createObjectURL(imageBlob);
        } else {
            input.value = value;
        }
    }

    static updateValueFromInput(formView, formField, overrideValue = null) {
        const input = formView.querySelector(formField.inputQuery);
        let value = null;
        //Override the formField.value if there is an overrideValue provided
        if (overrideValue) {
            value = overrideValue;
        } else {
            value = input.value;
        }

        //Handle synchronization according to the inputClass
        if (formField.inputClass === "image") {
            formField.value = input.dataset.stringifiedBlob;
            formField.size = parseInt(input.dataset.size);
            formField.type = input.dataset.type;
        } else {
            formField.value = input.value;
        }
    }

    static resetInput(formView, formField) {
        if (formField.inputClass === "dropDown") {
            formView.querySelector(formField.inputQuery).value = "1";
        } else if (formField.inputClass === "image") {
            const imageInput = formView.querySelector(formField.inputQuery);
            
            imageInput.value = "";
            imageInput.dataset.stringifiedBlob = "";
            imageInput.dataset.size = "0";
            imageInput.dataset.type = "";
            imageInput.previousElementSibling.src = "";
        } else {
            formView.querySelector(formField.inputQuery).value = "";
        }
    }

    static validateAndVisualizeField(formView, formField, prioritizeInputValue = false) {
        let isInvalidFiled = false;

        let value;
        if (prioritizeInputValue && formField.inputQuery !== null) {
            //WARNING: input.value doesn't work for file inputs
            value = formView.querySelector(formField.inputQuery).value;
        } else {
            value = formField.value;
        }

        //Handle visualization according to the inputClass
        if (formField.inputClass === "text" || formField.inputClass === "dropDown") {
            const regexp = new RegExp(formField.pattern);
            if (!regexp.test(value) || value === "null") {
                isInvalidFiled = true;
            } else {
                isInvalidFiled = false;
            }
        } else if (formField.inputClass === "image") {
            const parts = formField.pattern.split(";");
            const maxSize = parseInt(parts[0]);
            const acceptedTypes = parts[1].split(",");

            if (formField.size > maxSize || !acceptedTypes.includes(formField.type)) {
                isInvalidFiled = true;
            } else {
                isInvalidFiled = false;
            }
        }

        if (formField.inputQuery !== null) {
            if (isInvalidFiled) {
                formView.querySelector(formField.inputQuery).parentElement.classList.add("invalid");
            } else {
                formView.querySelector(formField.inputQuery).parentElement.classList.remove("invalid");
            }
        }

        return isInvalidFiled;
    }
}