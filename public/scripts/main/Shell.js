//@ts-check
import { Card } from "./Card.js";
import { PatternAuthorizer } from "./PatternAuthorizer.js";
import { PlatformComponent, PlatformUtil } from "./Utility.js";
import { ScreenController } from "./ScreenController.js"

export class ShellInterface {
    currentScreenController = null;

    alertOverlayView = null;
    alertTitleContainer = null;
    alertMessage = null;
    alertTextInput = null;
    alertBackground = null;
    alertTrueButton = null;
    alertFalseButton = null;

    constructor() {
        //Initialize/cache view elements
        this.alertOverlayView = document.getElementById("alertOverlay");
        this.alertTitleContainer = this.alertOverlayView.querySelector(".titleContainer");
        this.alertMessage = this.alertOverlayView.querySelector("#alertBoxMessage");
        this.alertTextInput = this.alertOverlayView.querySelector(".textInput");
        this.alertBackground = this.alertOverlayView.querySelector(".overlayBackground");
        this.alertTrueButton = this.alertOverlayView.querySelector("#alertBoxTrueButton");
        this.alertFalseButton = this.alertOverlayView.querySelector("#alertBoxFalseButton");

        //Update greeting on the splashScreen according to the time
        const currentHours = new Date().getHours();
        if (currentHours >= 20) {
            document.querySelector("#splashScreen .title").textContent = "Hey there! Good night";
        } else if (currentHours >= 12) {
            document.querySelector("#splashScreen .title").textContent = "Hey there! Good evening";
        } else {
            document.querySelector("#splashScreen .title").textContent = "Hey there! Good morning";
        }

        //Add onclick to splashScreenView for initializing currentScreen
        document.getElementById("splashScreen").addEventListener("click", (event) => {
            //Fetch workspace
            fetch(`${location.protocol}//${location.host}/sessions`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.currentScreenController = new WorkspaceScreenController(document.getElementById("workspaceScreen"));
                    } else {
                        this.currentScreenController = new LogInScreenController(document.getElementById("logInScreen"));
                    }
                    //Animate out splashSCreen
                    event.target.classList.replace("popIn", "popOut");
                    //Animate in new screen
                    this.currentScreenController.getView().classList.replace("popOut", "popIn");
                })
                .catch(error => {
                    this.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't ask the internal server if you are logged in. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        });
    }

    getCurrentScreenController() {
        return this.currentScreenController;
    }

    getView() {
        return document.body;
    }

    getAllFrames() {
        return document.querySelectorAll("iframe");
    }

    transitScreen(newScreenController) {
        //Reset and animate out old screen
        this.currentScreenController.getView().classList.replace("popIn", "popOut");
        this.currentScreenController.resetView();
        //Animate in new screen
        this.currentScreenController = newScreenController;
        this.currentScreenController.getView().classList.replace("popOut", "popIn");
    }

    //NOTE: This method is asynchronous
    throwAlert(title, titleDescription, message, placeholder, trueButtonText, falseButtonText) {
        //Animate out alertOverlayView and set its title, titleDescription and message
        this.alertOverlayView.classList.replace("popOut", "popIn");
        this.alertTitleContainer.children[0].innerText = title;
        this.alertTitleContainer.children[1].innerText = titleDescription;
        this.alertMessage.innerText = message;
        //NOTE: If there is a placeholder that means alertBoxInput is needed
        if (placeholder === null) {
            this.alertTextInput.style.display = "none";
        } else {
            this.alertTextInput.removeAttribute("style");
            this.alertTextInput.placeholder = placeholder;
        }
        this.alertBackground.classList.replace("popOut", "popIn");
        //Return alert promise
        return new Promise(
            (resolve, reject) => {
                //NOTE: trueButton is always included no matter the type of alertOverlay
                this.alertTrueButton.innerText = trueButtonText;
                this.alertTrueButton.addEventListener("click", () => {
                    this.alertBackground.classList.replace("popIn", "popOut");
                    setTimeout(() => {
                        //NOTE: If there is a placeholder there is a textInput
                        //NOTE: Then the trueButton returns textInput's value, otherwise simply "true"
                        if (placeholder === null) {
                            resolve(true);
                        } else {
                            resolve(this.alertTextInput.value);
                        }
                        this.alertOverlayView.classList.replace("popIn", "popOut");
                    }, 250);
                });
                //NOTE: If there is a falseButton it always returns "false"
                if (falseButtonText === null) {
                    this.alertFalseButton.style.display = "none";
                } else {
                    this.alertFalseButton.style.display = "initial";
                    this.alertFalseButton.innerText = falseButtonText;
                    this.alertFalseButton.addEventListener("click", () => {
                        this.alertBackground.classList.replace("popIn", "popOut");
                        setTimeout(() => {
                            reject(false);
                            this.alertOverlayView.classList.replace("popIn", "popOut");
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
        fetch(`${location.protocol}//${location.host}/sessions`, {
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
                window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });

        //Reset pattern
        this.resetPattern();
    }
}

export class LogInScreenController extends ScreenController {
    patternAuthorizer = null;

    logInBox = null;
    logInAvatar = null;

    constructor(logInScreenView) {
        super(logInScreenView);
        this.patternAuthorizer = new LogInPatternAuthorizer(logInScreenView.querySelector(".patternInput"));
        //Initialize/Cache elements
        this.logInBox = this.view.querySelector("#logInBox");
        this.logInAvatar = this.view.querySelector("#logInAvatar");
        //Add onkeypress to logInBoxInputElement for loading relevant profileImage
        this.logInBox.children[1].addEventListener("keypress", (event) => {
            //Check if the pressed key is "Enter"
            if (event.key === "Enter") {
                fetch(`${location.protocol}//${location.host}/users/${encodeURIComponent(this.logInBox.children[1].value)}/avatar`)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.patternAuthorizer.setUsername(this.logInBox.children[1].value);
                            this.patternAuthorizer.getView().style.visibility = "visible";
                            this.logInAvatar.style.opacity = "1";
                            this.logInAvatar.style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.data.data)]))})`;
                            this.view.querySelector("#logInBoxBackground").style.transform = "translateX(-55vw) rotate(45deg)";
                            this.logInBox.children[0].children[0].innerText = "Let's see if it is really you";
                            this.logInBox.children[0].children[1].innerText = "Please mark your pattern";
                        } else {
                            this.patternAuthorizer.getView().style.visibility = "hidden";
                            this.logInAvatar.removeAttribute("style");
                            this.view.querySelector("#logInBoxBackground").removeAttribute("style");
                            this.logInBox.children[0].children[0].innerText = response.error.title;
                            this.logInBox.children[0].children[1].innerText = response.error.titleDescription;
                        }
                    })
                    .catch(error => {
                        window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't validate your username. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                    });
            }
        });
        //Focus logInBoxInputElement in the beginning
        this.logInBox.children[1].focus();
    }
}

export class WorkspaceScreenController extends ScreenController {
    //NOTE: Following declarations are aligned with the z-indexes of the cards where last of the pastCards have the highest z-index
    //NOTE: In the beginning there are no pastCards
    //NOTE: In the beginning last 3 cards are considered presentCards
    //NOTE: In the beginning all other cards are considered upcomingCards
    //NOTE: popUpCards[last] have the highest z-index
    upcomingCards = [];
    presentCards = [];
    pastCards = [];
    permittedModuleOperations = {};

    headerArea = null;
    navigationControl = null;
    timeDisplay = null;
    viewportArea = null;
    quickAccessArea = null;
    actionOverlayView = null;

    constructor(workspaceScreenView) {
        super(workspaceScreenView);
        //Initialize/cache elements
        this.headerArea = this.view.querySelector("#headerArea");
        this.navigationControl = this.headerArea.querySelector("#navigationControl")
        this.timeDisplay = this.headerArea.querySelector("#timeDisplay");
        this.viewportArea = this.view.querySelector("#viewportArea");
        this.quickAccessArea = this.view.querySelector("#quickAccessArea");
        this.actionOverlayView = document.getElementById("actionOverlay");
        this.actionOverlayBackground = this.actionOverlayView.querySelector(".overlayBackground");
        //Fetch username, roleName and profileImage and apply user preferences
        fetch(`${location.protocol}//${location.host}/users/@me`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Update sessionData displays
                    this.headerArea.querySelector("#usernameDisplay").innerText = response.data.userPreference.preferredName;
                    this.headerArea.querySelector("#roleNameDisplay").innerText = response.data.role.name;
                    this.headerArea.querySelector("#workspaceAvatar").style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.data.userPreference.avatar.data)]))})`;
                    //Apply user preferences to the UI
                    document.getElementsByTagName("link")[0].href = response.data.userPreference.theme.cssPath;
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch your session data from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
        //Fetch all permittedModules
        fetch(`${location.protocol}//${location.host}/users/@me/modules`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Create a card for the first actionOverlayChip
                    this.addCard(new Card(response.data[0].layoutFilePath, response.data[0].id));
                    //Create actionOverlayChips for each permission if its value[1] === "1"
                    const actionOverlayChipPaneFragment = new DocumentFragment();
                    for (let i = 0; i < response.data.length; i++) {
                        const actionOverlayChip = PlatformComponent.createActionOverlayChip(response.data[i], this);
                        actionOverlayChipPaneFragment.appendChild(actionOverlayChip);
                    }
                    document.getElementById("actionOverlayChipPane").appendChild(actionOverlayChipPaneFragment);
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "LOGOUT", null).then(() => this.logoutSession());
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch your permitted modules list from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
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
        //Add onwheel and onpointerdown to workspaceScreen for scrolling cards
        this.view.addEventListener("wheel", (event) => {
            this.scrollViewport(event.deltaY);
        });
        this.viewportArea.addEventListener("pointerdown", (event) => {
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
            window.addEventListener("pointermove", doScrollViewPort);
            window.addEventListener("pointerup", endScrollViewport);
            //Declare and initialize variables
            let previousTouchPositionY = event.screenY;

            //INNER EVENT HANDLER FUNCTIONS
            function doScrollViewPort(event) {
                //Calculate the travelled distance of the finger as a vector
                const differenceY = previousTouchPositionY - event.screenY;
                if (differenceY < -100) {
                    workspaceScreenController.scrollViewport(125);
                    previousTouchPositionY = event.screenY;
                } else if (differenceY > 100) {
                    workspaceScreenController.scrollViewport(-125);
                    previousTouchPositionY = event.screenY;
                }
            }

            function endScrollViewport() {
                //Turn back on all pointer events for all iFrames
                for (let i = 0; i < iFrames.length; i++) {
                    iFrames[i].removeAttribute("style");
                }
                //Remove all previously added eventListeners
                window.removeEventListener("pointermove", doScrollViewPort);
                window.removeEventListener("pointerup", endScrollViewport);
            }
        });
        //Add onpointerdown to navigationControl for start navigation
        this.navigationControl.addEventListener("pointerdown", (event) => {
            //Get a reference of "this" for inner event handlers
            const workspaceScreenController = this;
            //Turn off pointer events for all iFrames
            const iFrames = window.shellInterface.getAllFrames();
            for (let i = 0; i < iFrames.length; i++) {
                iFrames[i].style.pointerEvents = "none";
            }
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
            let procedureToExecute = () => { };

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
                        //Logout session
                        workspaceScreenController.navigationControl.style.borderColor = "transparent var(--headerAreaColor) transparent transparent";
                        navigatorControlOptionDisplay.innerText = "Logout";
                        procedureToExecute = () => {
                            window.shellInterface.throwAlert("You're about to logout", "Confirm your action", "You are about to logout from the system. Make sure if all of your work is saved as all of the unsaved work will be lost. After a successful logout you can login as another user or as the current one", null, "PROCEED", "CANCEL").then(() => {
                                workspaceScreenController.logoutSession();
                            }).catch(() => {
                                //NOTE: No need to do anything here
                            });
                        };
                    } else if (differenceX < 0) {
                        //Show actionOverlay
                        workspaceScreenController.navigationControl.style.borderColor = "transparent transparent transparent var(--headerAreaColor)";
                        navigatorControlOptionDisplay.innerText = "View action overlay";
                        procedureToExecute = () => {
                            workspaceScreenController.actionOverlayView.classList.replace("popOut", "popIn");
                            workspaceScreenController.actionOverlayBackground.classList.replace("popOut", "popIn");
                        }
                    }
                } else {
                    //Case: y axis must be prioritized
                    if (differenceY > 0) {
                        //Remove presentCard[2]
                        workspaceScreenController.navigationControl.style.borderColor = "transparent transparent var(--headerAreaColor) transparent";
                        navigatorControlOptionDisplay.innerText = "Close current card";
                        procedureToExecute = workspaceScreenController.removeCurrentCard.bind(workspaceScreenController);
                    } else if (differenceY < 0) {
                        //WARNING: Not implemented
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
                //Turn back on all pointer events for all iFrames
                for (let i = 0; i < iFrames.length; i++) {
                    iFrames[i].removeAttribute("style");
                }
                //Restore navigatorControlOptionDisplay's inner text
                navigatorControlOptionDisplay.innerText = navigatorControlOptionDisplayInnerText;
                //Remove all previously added eventListeners
                window.removeEventListener("pointermove", determineOption);
                window.removeEventListener("pointerup", executeOption);
            }
        });
        //Add onclick to the close button in actionOverlay for closing actionOverlay
        this.actionOverlayView.firstElementChild.children[2].firstElementChild.addEventListener("click", () => {
            this.actionOverlayBackground.classList.replace("popIn", "popOut");
            setTimeout(() => {
                this.actionOverlayView.classList.replace("popIn", "popOut");
            }, 250);
        });
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
            //NOTE: Closing one popUpCard will alter the openPopUpCards[]. Therefore we must copy that array to a temporary array
            const tempOpenPopUpCards = [];
            for (let i = 0; i < currentCard.getOpenPopUpCards().length; i++) {
                tempOpenPopUpCards[i] = currentCard.getOpenPopUpCards()[i];
            }
            for (const openPopUpCard of tempOpenPopUpCards) {
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
            fetch(`${location.protocol}//${location.host}/users/@me/modules/${moduleId}`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.permittedModuleOperations[moduleId] = response.data.value;
                        addQuickAccessControls.bind(this)();
                    } else {
                        window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                    }
                })
                .catch(error => {
                    window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch your permitted operations for the current module from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        }

        function addQuickAccessControls() {
            //Add createControls to the quickAccessArea if the user has "create" permissions
            if (this.permittedModuleOperations[moduleId][0] === "1") {
                const createControls = presentCard2.getControls("create");
                for (const createControl of createControls) {
                    this.quickAccessArea.appendChild(createControl);
                }
            }
            //Add retrieveControls to the quickAccessArea if the user has "retrieve" permissions
            if (this.permittedModuleOperations[moduleId][1] === "1") {
                const retrieveControls = presentCard2.getControls("retrieve");
                for (const retrieveControl of retrieveControls) {
                    this.quickAccessArea.appendChild(retrieveControl);
                }
            }
            //Add updateControls to the quickAccessArea if the user has "update" permissions
            if (this.permittedModuleOperations[moduleId][2] === "1") {
                const updateControls = presentCard2.getControls("update");
                for (const updateControl of updateControls) {
                    this.quickAccessArea.appendChild(updateControl);
                }
            }
            //Add deleteControls to the quickAccessArea if the user has "delete" permissions
            if (this.permittedModuleOperations[moduleId][3] === "1") {
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
            this.quickAccessArea.parentElement.classList.add("popOut");
            //UpdateQuickAccessArea and animate in statusArea
            setTimeout(() => {
                this.updateQuickAccessArea();
                this.quickAccessArea.parentElement.classList.remove("popOut");
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
        fetch(`${location.protocol}//${location.host}/sessions/@me`, {
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
                window.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't logout you from your session. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}