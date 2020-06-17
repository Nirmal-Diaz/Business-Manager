//@ts-check
import { PopUpCard } from "./PopUpCard.js";

export class Card {
    cardInterface = null;
    layoutFilePath = null;
    openPopUpCards = [];
    moduleId = null;

    view = null;

    constructor(layoutFilePath, moduleId) {
        this.moduleId = moduleId;
        this.layoutFilePath = layoutFilePath;
        //Initialize/cache view elements
        this.view = document.createElement("div");
        //NOTE: A cardView's styling will be handled by the WorkspaceScreen
        //Create the iFrame to load the module
        const iFrame = document.createElement("iframe");
        iFrame.src = `${location.protocol}//${location.host}/${layoutFilePath}`;
        //Add onload to iFrame for connecting cardObject with cardInterface
        iFrame.addEventListener("load", () => {
            this.cardInterface = iFrame.contentWindow.cardInterface;
            this.cardInterface.cardObject = this;
        });
        //Set the cardView's id to match its iFrame's src
        this.view.id = layoutFilePath.slice(layoutFilePath.lastIndexOf("/") + 1, -5).toLowerCase();
        //Append elements into HTML
        this.view.appendChild(iFrame);
    }

    getView() {
        return this.view;
    }

    getTitle() {
        return this.cardInterface.title;
    }

    getInterface() {
        return this.cardInterface;
    }

    getLayoutFilePath() {
        return this.layoutFilePath;
    }

    getModuleId() {
        return this.moduleId;
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

    isPopUpCardExists(popUpCardLayoutFilePath) {
        let foundPopUpCard = false;
        for (const openPopUpCard of this.openPopUpCards) {
            if (openPopUpCard.getLayoutFilePath() === popUpCardLayoutFilePath) {
                foundPopUpCard = openPopUpCard;
                break;
            }
        }
        return foundPopUpCard;
    }

    createPopUpCard(popUpCardLayoutFilePath) {
        if (this.isPopUpCardExists(popUpCardLayoutFilePath)) {
            window.parent.shellInterface.throwAlert("Pop-up card already open", "Look in the workspace to find it", "An instance of the pop-up card that you are trying to open already exists. You aren't allowed to open more than one instance of a pop-up card", null, "OK", null);
            return null;
        } else {
            const popUpCard = new PopUpCard(popUpCardLayoutFilePath, this.cardInterface);
            this.openPopUpCards.push(popUpCard);
            return popUpCard;
        }
    }
}