import {PopUpCard} from "./PopUpCard.mjs";

export class Card {
    constructor(modulePath) {
        //FIELD DECLARATIONS
        this.cardView = document.createElement("div");
        this.cardInterface = null;
        this.modulePath = modulePath;
        this.openPopUpCards = [];
        //INITIATION PROCEDURE
        //NOTE: A cardView's styling will be handled by the WorkspaceScreen
        //Create the iFrame to load the module
        const iFrame = document.createElement("iframe");
        iFrame.setAttribute("class", "cardIFrame");
        iFrame.src = `${location.protocol}//${location.host}/${modulePath}`;
        //Add onload to iFrame for connecting cardObject with cardInterface
        iFrame.addEventListener("load", () => {
            this.cardInterface = iFrame.contentWindow.cardInterface;
            this.cardInterface.cardObject = this;
        });
        //Set the cardView's id to match its iFrame's src
        this.cardView.id = modulePath.slice(modulePath.lastIndexOf("/") + 1, -5).toLowerCase() + "_Module";
        //Append elements into HTML
        this.cardView.appendChild(iFrame);
    }

    getCardView() {
        return this.cardView;
    }

    getTitle() {
        return this.cardInterface.title;
    }

    getModulePath() {
        return this.modulePath;
    }

    getModuleName() {
        return this.cardInterface.title;
    }

    getControls(controlsType) {
        switch (controlsType) {
            case "create": return this.cardInterface.createControls; break;
            case "retrieve": return this.cardInterface.retrieveControls; break;
            case "update": return this.cardInterface.updateControls; break;
            case "delete": return this.cardInterface.deleteControls; break;
        }
    }

    getOpenPopUpCards() {
        return this.openPopUpCards;
    }

    isPopUpCardExists(moduleComponentPath) {
        let foundPopUpCard = false;
        for (const openPopUpCard of this.openPopUpCards) {
            if (openPopUpCard.getModuleComponentPath() === moduleComponentPath) {
                foundPopUpCard = openPopUpCard;
                break;
            }
        }
        return foundPopUpCard;
    }

    createPopUpCard(moduleComponentPath) {
        if (this.isPopUpCardExists(moduleComponentPath)) {
            window.parent.shellInterface.throwAlert("Pop-up card already open", "Close it before opening another", "An instance of the pop-up card that you are trying to open already exists. You aren't allowed to open more than one instance of a pop-up card", null, "OK", null);
        } else {
            const popUpCard = new PopUpCard(moduleComponentPath, this.cardInterface);
            this.openPopUpCards.push(popUpCard);
        }
    }
}