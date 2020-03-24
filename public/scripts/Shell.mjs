//@ts-check
import { PlatformUtil } from "./Utility.mjs";
import { Card } from "./Card.mjs";
import { PatternAuthorizer } from "./PatternAuthorizer.mjs";
import { PlatformComponent } from "./Utility.mjs";

export class ShellInterface {
    currentScreenController = null;

    view = null;
    alertOverlayView = null;
    titleContainer = null;
    alertBoxMessage = null;
    textInput = null;
    alertBoxBackground = null;
    alertBoxTrueButton = null;
    alertBoxFalseButton = null;
    
    constructor(shellView) {
        //Initialize/cache view elements
        this.view = shellView;
        this.alertOverlayView = this.view.querySelector("#alertOverlay");
        this.titleContainer = this.alertOverlayView.querySelector(".titleContainer");
        this.alertBoxMessage = this.alertOverlayView.querySelector("#alertBoxMessage");
        this.textInput = this.alertOverlayView.querySelector(".textInput");
        this.alertBoxBackground = this.alertOverlayView.querySelector(".alertBoxBackground");
        this.alertBoxTrueButton = this.alertOverlayView.querySelector("#alertBoxTrueButton");
        this.alertBoxFalseButton = this.alertOverlayView.querySelector("#alertBoxFalseButton");
        //Add onclick to splashScreenView for initializing currentScreen
        this.view.querySelector("#splashScreen").addEventListener("click", () => {
            //Fetch workspace
            fetch(`${location.protocol}//${location.host}/workspace`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.currentScreenController = new WorkspaceScreenController(this.view.querySelector("#workspaceScreen"));
                    } else {
                        this.currentScreenController = new LogInScreenController(this.view.querySelector("#logInScreen"));
                    }
                    //Animate out splashSCreen
                    this.view.querySelector("#splashScreen").classList.replace("screen-popIn", "screen-popOut");
                    //Animate in new screen
                    this.currentScreenController.getView().classList.replace("screen-popOut", "screen-popIn");
                })
                .catch(error => {
                    this.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't ask the internal server if you are logged in. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        });
    }

    getCurrentScreenController() {
        return this.currentScreenController;
    }

    getAllFrames() {
        return this.view.querySelectorAll("iframe");
    }

    transitScreen(newScreenController) {
        //Reset and animate out old screen
        this.currentScreenController.getView().classList.replace("screen-popIn", "screen-popOut");
        this.currentScreenController.resetView();
        //Animate in new screen
        this.currentScreenController = newScreenController;
        this.currentScreenController.getView().classList.replace("screen-popOut", "screen-popIn");
    }

    getView() {
        return this.view;
    }

    //EVENT HANDLER METHODS
    //NOTE: This method returns a promise. So it is not synchronous
    throwAlert(title, titleDescription, message, placeholder, trueButtonText, falseButtonText) {
        //Animate out alertOverlayView and set its title, titleDescription and message
        this.alertOverlayView.classList.replace("overlay-popOut", "overlay-popIn");
        this.titleContainer.children[0].innerText = title;
        this.titleContainer.children[1].innerText = titleDescription;
        this.alertBoxMessage.innerText = message;
        //NOTE: If there is a placeholder that means alertBoxInput is needed
        if (placeholder === null) {
            this.textInput.style.display = "none";
        } else {
            this.textInput.removeAttribute("style");
            this.textInput.placeholder = placeholder;
        }
        this.alertBoxBackground.classList.replace("alertBoxBackground-popOut", "alertBoxBackground-popIn");
        //Return alert promise
        return new Promise(
            (resolve, reject) => {
                //NOTE: trueButton is always included no matter the type of alertOverlay
                this.alertBoxTrueButton.innerText = trueButtonText;
                this.alertBoxTrueButton.addEventListener("click", () => {
                    //NOTE: If there is a placeholder there is a textInput
                    //NOTE: Then the trueButton returns textInput's value, otherwise simply "true"
                    if (placeholder === null) {
                        resolve(true);
                    } else {
                        resolve(this.textInput.value);
                    }
                    this.alertBoxBackground.classList.replace("alertBoxBackground-popIn", "alertBoxBackground-popOut");
                    setTimeout(() => {
                        this.alertOverlayView.classList.replace("overlay-popIn", "overlay-popOut");
                    }, 250);
                });
                //NOTE: If there is a falseButton it always returns "false"
                if (falseButtonText === null) {
                    this.alertBoxFalseButton.style.display = "none";
                } else {
                    this.alertBoxFalseButton.style.display = "initial";
                    this.alertBoxFalseButton.innerText = falseButtonText;
                    this.alertBoxFalseButton.addEventListener("click", () => {
                        reject(false);
                        this.alertBoxBackground.classList.replace("alertBoxBackground-popIn", "alertBoxBackground-popOut");
                        setTimeout(() => {
                            this.alertOverlayView.classList.replace("overlay-popIn", "overlay-popOut");
                        }, 250);
                    });
                }
            }
        );
    }
}

export class LogInPatternAuthorizer extends PatternAuthorizer {
    constructor(patternView) {
        super(patternView);
    }

    attemptAuthorization() {
        //Create a session
        fetch(`${location.protocol}//${location.host}/session`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.username,
                cellCombination: this.cellCombination,
            })
        }).then(response => response.json())
            .then(response => {
                if (response.status) {
                    window.shellInterface.transitScreen(new WorkspaceScreenController(window.shellInterface.getView().querySelector("#workspaceScreen")));
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            }).catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}

export class LogInScreenController {
    patternAuthorizer = null;

    view = null;
    viewHTML = null;
    logInBox = null;
    logInAvatar = null;

    constructor(logInScreenView) {
        this.view = logInScreenView;
        this.viewHTML = this.view.innerHTML;
        this.patternAuthorizer = new LogInPatternAuthorizer(logInScreenView.querySelector(".patternContainer"));
        //Initialize/Cache elements
        this.logInBox = this.view.querySelector(".logInBox");
        this.logInAvatar = this.view.querySelector("#logInAvatar");
        //Add onkeypress to logInBoxInputElement for loading relevant profileImage
        this.logInBox.children[1].addEventListener("keypress", (event) => {
            //Check if the pressed key is "Enter"
            if (event.key === "Enter") {
                fetch(`${location.protocol}//${location.host}/user?username=${this.logInBox.children[1].value}`)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.patternAuthorizer.setUsername(this.logInBox.children[1].value);
                            this.patternAuthorizer.getView().style.visibility = "visible";
                            this.logInAvatar.style.opacity = "1";
                            this.logInAvatar.style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.data.avatar.data)]))})`;
                            this.view.querySelector(".logInBoxBackground").style.transform = "translateX(-55vw) rotate(45deg)";
                            this.logInBox.children[0].children[0].innerText = "Let's see if it is really you";
                            this.logInBox.children[0].children[1].innerText = "Please mark your pattern";
                        } else {
                            this.patternAuthorizer.getView().style.visibility = "hidden";
                            this.logInAvatar.removeAttribute("style");
                            this.view.querySelector(".logInBoxBackground").removeAttribute("style");
                            this.logInBox.children[0].children[0].innerText = response.error.title;
                            this.logInBox.children[0].children[1].innerText = response.error.titleDescription;
                        }
                    })
                    .catch(error => {
                        window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't validate your username. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                    });
            }
        });
        //Focus logInBoxInputElement in the beginning
        this.logInBox.children[1].focus();
    }

    getView() {
        return this.view;
    }

    resetView() {
        //Restore HTML inside logInScreen
        this.view.innerHTML = this.viewHTML;
    }
}

export class WorkspaceScreenController {
    //NOTE: Following declarations are aligned with the z-indexes of the cards where last of the pastCards have the highest z-index
    //NOTE: In the beginning there are no pastCards
    //NOTE: In the beginning last 3 cards are considered presentCards
    //NOTE: In the beginning all other cards are considered upcomingCards
    //NOTE: popUpCards[last] have the highest z-index
    upcomingCards = [];
    presentCards = [];
    pastCards = [];
    permittedModuleOperations = {};

    view = null;
    viewHTML = null;
    headerArea = null;
    navigationControl = null;
    timeDisplay = null;
    viewportArea = null;
    quickAccessArea = null;
    actionOverlayView = null;

    constructor(workspaceScreenView) {
        this.view = workspaceScreenView;
        this.viewHTML = this.view.innerHTML;
        //Initialize/cache elements
        this.headerArea = this.view.querySelector(".headerArea");
        this.navigationControl = this.headerArea.querySelector("#navigationControl")
        this.timeDisplay = this.headerArea.querySelector("#timeDisplay");
        this.viewportArea = this.view.querySelector(".viewportArea");
        this.quickAccessArea = this.view.querySelector(".quickAccessArea");
        this.actionOverlayView = document.getElementById("actionOverlay");
        //Fetch username, roleName and profileImage and apply user preferences
        fetch(`${location.protocol}//${location.host}/session/currentUser`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Update sessionData displays
                    this.headerArea.querySelector("#usernameDisplay").innerText = response.data.userPreference.preferredName;
                    this.headerArea.querySelector("#roleNameDisplay").innerText = response.data.role.name;
                    this.headerArea.querySelector("#workspaceAvatar").style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.data.avatar.data)]))})`;
                    //Apply user preferences to the UI
                    document.getElementsByTagName("link")[0].href = response.data.userPreference.theme.cssPath;
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch your session data from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
        //Fetch modules with "retrieve" permission
        fetch(`${location.protocol}//${location.host}/permission/permittedModules`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Create a card for the first permittedModule
                    this.addCard(new Card(response.data[0].layoutFilePath, response.data[0].id));
                    //Create actionOverlayChops for each permittedModule
                    const actionOverlayChipPaneFragment = new DocumentFragment();
                    for (let i = 0; i < response.data.length; i++) {
                        const actionOverlayChip = PlatformComponent.createActionOverlayChip(response.data[i], this);
                        actionOverlayChipPaneFragment.appendChild(actionOverlayChip);
                    }
                    document.getElementById("actionOverlayChipPane").appendChild(actionOverlayChipPaneFragment);
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch your permitted modules list from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
        //Add a timer for updating time in the headerArea
        this.timeDisplay.innerText = PlatformUtil.getCurrentTime();
        setInterval(() => {
            this.timeDisplay.innerText = PlatformUtil.getCurrentTime();
        }, 60000);
        //Add onkeypress to body for scrolling cards
        document.body.addEventListener("keypress", (event) => {
            if (event.keyCode === 50) {
                this.scrollViewport(100);
            } else if (event.keyCode === 56) {
                this.scrollViewport(-100);
            }
        });
        //Add onwheel and ontouchstart to workspaceScreen for scrolling cards
        this.view.addEventListener("wheel", (event) => {
            this.scrollViewport(event.deltaY);
        });
        this.viewportArea.addEventListener("touchstart", (event) => {
            //Prevent browser's default event handlers from executing
            event.preventDefault();
            //Get a reference of "this" for inner event handlers
            const workspaceScreenController = this;
            //Turn off pointer events for all iFrames
            const iFrames = window.shellInterface.getAllFrames();
            for (let i = 0; i < iFrames.length; i++) {
                iFrames[i].style.pointerEvents = "none";
            }
            //Add eventListeners
            window.addEventListener("touchmove", doScrollViewPort);
            window.addEventListener("touchend", endScrollViewport);
            //Declare and initialize variables
            let previousTouchPositionY = event.touches[0].screenY;

            //INNER EVENT HANDLER FUNCTIONS
            function doScrollViewPort(event) {
                //Calculate the travelled distance of the finger as a vector
                const differenceY = previousTouchPositionY - event.touches[0].screenY;
                if (differenceY < -100) {
                    workspaceScreenController.scrollViewport(125);
                    previousTouchPositionY = event.touches[0].screenY;
                } else if (differenceY > 100) {
                    workspaceScreenController.scrollViewport(-125);
                    previousTouchPositionY = event.touches[0].screenY;
                }
            }

            function endScrollViewport() {
                //Turn back on all pointer events for all iFrames
                for (let i = 0; i < iFrames.length; i++) {
                    iFrames[i].removeAttribute("style");
                }
                //Remove all previously added eventListeners
                window.removeEventListener("touchmove", doScrollViewPort);
                window.removeEventListener("touchend", endScrollViewport);
            }
        });
        //Add onpointerdown to navigationControl for start navigation
        this.navigationControl.addEventListener("pointerdown", (event) => {
            //Get a reference of "this" for inner event handlers
            const workspaceScreenController = this;
            //Remove presentCard.last pointer events
            this.presentCards[this.presentCards.length - 1].getView().style.pointerEvents = "none";
            const navigatorControlOptionDisplay = workspaceScreenController.view.querySelector("#navigatorControlOptionDisplay");
            //Cache the inner text of navigatorControlOptionDisplay
            const navigatorControlOptionDisplayInnerText = navigatorControlOptionDisplay.innerText;
            //Get the initial pointer position
            const originalMousePositionX = event.screenX || event.touches[0].screenX;
            const originalMousePositionY = event.screenY || event.touches[0].screenY;

            window.addEventListener("pointermove", determineOption);
            window.addEventListener("pointerup", executeOption);

            let differenceX = 0;
            let differenceY = 0;
            let procedureToExecute = null;
            let reEnablePointerEvents = true;

            //INNER EVENT HANDLER FUNCTIONS
            function determineOption(event) {
                //Calculate the travelledDistance of the mouse as a vector
                differenceX = (event.screenX || event.touches[0].screenX) - originalMousePositionX;
                differenceY = (event.screenY || event.touches[0].screenY) - originalMousePositionY;

                const absoluteDifferenceX = Math.abs(differenceX);
                const absoluteDifferenceY = Math.abs(differenceY);
                if (absoluteDifferenceX >= absoluteDifferenceY) {
                    //Case: x axis must be prioritized
                    if (differenceX > 0) {
                        workspaceScreenController.navigationControl.style.borderColor = "transparent var(--headerAreaColor) transparent transparent";
                        navigatorControlOptionDisplay.innerText = "Logout";
                        procedureToExecute = workspaceScreenController.logoutSession;
                    } else if (differenceX < 0) {
                        workspaceScreenController.navigationControl.style.borderColor = "transparent transparent transparent var(--headerAreaColor)";
                        navigatorControlOptionDisplay.innerText = "View action overlay";
                        procedureToExecute = () => {
                            workspaceScreenController.actionOverlayView.classList.replace("overlay-popOut", "overlay-popIn");
                        }
                    }
                } else {
                    //Case: y axis must be prioritized
                    if (differenceY > 0) {
                        workspaceScreenController.navigationControl.style.borderColor = "transparent transparent var(--headerAreaColor) transparent";
                        navigatorControlOptionDisplay.innerText = "Close current card";
                        procedureToExecute = workspaceScreenController.removeCurrentCard.bind(workspaceScreenController);
                        reEnablePointerEvents = false;
                    } else if (differenceY < 0) {
                        workspaceScreenController.navigationControl.style.borderColor = "var(--headerAreaColor) transparent transparent transparent";
                        navigatorControlOptionDisplay.innerText = "Settings and preferences";
                        procedureToExecute = () => {

                        }
                    }
                }
            }

            function executeOption() {
                //Execute determined procedure
                procedureToExecute();
                //Remove styling
                workspaceScreenController.navigationControl.removeAttribute("style");
                //Reinstate presentCard.last pointer events
                //WARNING: This becomes useless if the executed procedure is to removeCurrentCard
                if (reEnablePointerEvents) {
                    workspaceScreenController.presentCards[workspaceScreenController.presentCards.length - 1].getView().removeAttribute("style");
                }
                //Restore navigatorControlOptionDisplay's inner text
                navigatorControlOptionDisplay.innerText = navigatorControlOptionDisplayInnerText;
                //Remove all previously added eventListeners
                window.removeEventListener("pointermove", determineOption);
                window.removeEventListener("pointerup", executeOption);
            }
        });
        //Add onclick to the close button in actionOverlay for closing actionOverlay
        this.actionOverlayView.children[2].firstElementChild.addEventListener("click", () => {
            this.actionOverlayView.classList.replace("overlay-popIn", "overlay-popOut");
        });
    }

    getView() {
        return this.view;
    }

    resetView() {
        //Restore HTML inside workspaceScreen
        this.view.innerHTML = this.viewHTML;
    }

    addCard(card) {
        //Set cardView's style
        //NOTE: A user created card will always be treated as the pastCards[0]
        card.getView().setAttribute("class", "card pastCard");
        //Add onload to cardView's iFrame for scrolling viewport after creation
        card.getView().querySelector("iframe").addEventListener("load", () => {
            //NOTE: The viewport must be scrolled backwards
            this.scrollViewport(-125);
        });
        //Append elements into HTML
        //NOTE: A card's appearance in the HTML DOM corresponds its z-index
        if (this.pastCards.length > 0) {
            this.viewportArea.insertBefore(card.getView(), this.pastCards[0].getView());
        } else {
            this.viewportArea.appendChild(card.getView());
        }
        //Add the card to relevant array
        this.pastCards.unshift(card);
    }

    removeCurrentCard() {
        if ((this.pastCards.length + this.presentCards.length) > 1) {
            //Case: There are more then one card open
            const currentCard = this.presentCards[this.presentCards.length - 1];
            //Remove all popUpCards of currentCard
            for (const openPopUpCard of currentCard.getOpenPopUpCards()) {
                openPopUpCard.close();
            }
            const currentCardView = currentCard.getView();
            currentCardView.style.animation = "removePresentCard 0.5s forwards";
            setTimeout(() => {
                if (this.presentCards.length > 1) {
                    //Case: Positive scrolling is possible
                    this.scrollViewport(100);
                    this.pastCards.shift();
                    currentCardView.remove();
                } else {
                    //Case: Positive scrolling is not possible
                    currentCardView.style.animation = "removePresentCard 0.5s forwards";
                    this.scrollViewport(-100);
                    this.presentCards.shift();
                    currentCardView.remove();
                }
            }, 450);
        } else {
            //Case: There is only one card open
            window.shellInterface.throwAlert("Can't remove last card", "Open another card before closing this card", "The system expects you to work on at least one card at a given time. Therefore you cannot close the last card in your workspace. If you want to close the current card, another card must be open first. If you intend to finish your work, use the logout option", null, "OK", null);
        }
    }

    updateCardStyles() {
        //Set style for upcomingCards
        //NOTE: Only the upcomingCards[lastIndex] needs to be modified (if it exists)
        if (this.upcomingCards.length > 0) {
            this.upcomingCards[this.upcomingCards.length - 1].getView().setAttribute("class", `card upcomingCard`);
        }
        //Set style for presentCards
        for (let i = this.presentCards.length - 1, j = 2; i >= 0; i--) {
            this.presentCards[i].getView().setAttribute("class", `card presentCard presentCard${j}`);
            j--;
        }
        //Set style for pastCards
        //NOTE: Only the pastCards[0] needs to be modified (if it exists)
        if (this.pastCards.length > 0) {
            this.pastCards[0].getView().setAttribute("class", `card pastCard`);
        }
    }

    addPopUpCard(popUpCard) {
        //NOTE: PopUpCards are not a part of viewportArea
        this.view.appendChild(popUpCard.getView());
        //Set popUpCardView's z-index to be the highest among popUpCards
        //NOTE: The relevant z-index matches openPopUpCards array's length
        popUpCard.getView().style.zIndex = document.querySelectorAll(".popUpCard").length;
    }

    focusPopUpCard(popUpCard) {
        //Get all popUpCards
        const openPopUpCardViews = Array.from(document.querySelectorAll(".popUpCard"));
        //Move popUpCard's view to the last position of the openPopUpCards
        openPopUpCardViews.push(openPopUpCardViews.splice(openPopUpCardViews.indexOf(popUpCard.getView()), 1)[0]);
        //Update z-indices of openPopUpCards according to the arrayIndex
        for (let i = 0; i < openPopUpCardViews.length; i++) {
            openPopUpCardViews[i].style.zIndex = i;
        }
    }

    updateQuickAccessArea() {
        //Clear innerHTML of the quickAccessArea
        this.quickAccessArea.innerHTML = "";
        //Get the presentCard2
        const presentCard2 = this.presentCards[this.presentCards.length - 1];
        const moduleId = presentCard2.getModuleId();
        //Update moduleName display according to the presentCard2
        this.headerArea.querySelector("#moduleNameDisplay").innerText = presentCard2.getTitle();
        //Check if the permittedModuleOperations are cached
        if (this.permittedModuleOperations.hasOwnProperty(moduleId)) {
            addQuickAccessControls.bind(this)();
        } else {
            //Fetch permittedModuleOperations and cache them
            fetch(`${location.protocol}//${location.host}/permission/permittedOperations?moduleId=${moduleId}`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.permittedModuleOperations[moduleId] = response.data;
                        addQuickAccessControls.bind(this)();
                    } else {
                        window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                    }
                })
                .catch(error => {
                    window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch your permitted operations for the current module from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        }

        function addQuickAccessControls() {
            //Add createControls to the quickAccessArea if the user has "create" permissions
            if (this.permittedModuleOperations[moduleId].includes("create")) {
                const createControls = presentCard2.getControls("create");
                for (const createControl of createControls) {
                    this.quickAccessArea.appendChild(createControl);
                }
            }
            //Add retrieveControls to the quickAccessArea if the user has "retrieve" permissions
            if (this.permittedModuleOperations[moduleId].includes("retrieve")) {
                const retrieveControls = presentCard2.getControls("retrieve");
                for (const retrieveControl of retrieveControls) {
                    this.quickAccessArea.appendChild(retrieveControl);
                }
            }
            //Add updateControls to the quickAccessArea if the user has "update" permissions
            if (this.permittedModuleOperations[moduleId].includes("update")) {
                const updateControls = presentCard2.getControls("update");
                for (const updateControl of updateControls) {
                    this.quickAccessArea.appendChild(updateControl);
                }
            }
            //Add deleteControls to the quickAccessArea if the user has "delete" permissions
            if (this.permittedModuleOperations[moduleId].includes("delete")) {
                const deleteControls = presentCard2.getControls("delete");
                for (const deleteControl of deleteControls) {
                    this.quickAccessArea.appendChild(deleteControl);
                }
            }
        }
    }

    scrollViewport(delta) {
        //Get the current lengths of upcomingCards and pastCards
        const upcomingCardsLength = this.upcomingCards.length;
        const pastCardsLength = this.pastCards.length;
        //NOTE: When delta < 0, cards are scrolled backwards (ie. pastCards are scrolled towards presentCards)
        if (delta < 0) {
            if (this.pastCards.length > 0) {
                this.presentCards.push(this.pastCards.shift());
            }
            if (this.presentCards.length > 3) {
                this.upcomingCards.push(this.presentCards.shift());
            }
        } else if (delta > 0) {
            if (this.presentCards.length > 1) {
                this.pastCards.unshift(this.presentCards.pop());
            }
            if (this.upcomingCards.length > 0) {
                this.presentCards.unshift(this.upcomingCards.pop());
            }
        }
        //NOTE: updateCardStyles() and updateQuickAccessArea() should be executed only if there is a change in either of the lengths of upcomingCards or pastCards
        if ((this.upcomingCards.length !== upcomingCardsLength) || (this.pastCards.length !== pastCardsLength)) {
            this.updateCardStyles();
            //Animate out statusArea
            this.quickAccessArea.parentElement.classList.add("statusArea-popOut");
            //UpdateQuickAccessArea and animate in statusArea
            setTimeout(() => {
                this.updateQuickAccessArea();
                this.quickAccessArea.parentElement.classList.remove("statusArea-popOut");
            }, 300);
        }
    }

    isCardExist(cardLayoutFilePath) {
        let foundPopUpCard = false;
        for (const pastCard of this.pastCards) {
            if (pastCard.getLayoutFilePath() === cardLayoutFilePath) {
                foundPopUpCard = pastCard;
                break;
            }
        }
        for (const presentCard of this.presentCards) {
            if (presentCard.getLayoutFilePath() === cardLayoutFilePath) {
                foundPopUpCard = presentCard;
                break;
            }
        }
        for (const upcomingCard of this.upcomingCards) {
            if (upcomingCard.getLayoutFilePath() === cardLayoutFilePath) {
                foundPopUpCard = upcomingCard;
                break;
            }
        }
        return foundPopUpCard;
    }

    logoutSession() {
        fetch(`${location.protocol}//${location.host}/session`, {
            method: "DELETE"
        })
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Transit screen
                    window.shellInterface.transitScreen(new LogInScreenController(document.getElementById("logInScreen")));
                    //Remove actionOverlayChips
                    document.getElementById("actionOverlayChipPane").innerHTML = "";
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't logout you from your session. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}