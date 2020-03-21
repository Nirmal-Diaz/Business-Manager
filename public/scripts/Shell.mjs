//@ts-check
import { PlatformUtil } from "./Utility.mjs";
import { Card } from "./Card.mjs";
import { PatternAuthorizer } from "./PatternAuthorizer.mjs";

export class ShellInterface {
    constructor(shellView) {
        //FIELD DECLARATIONS
        this.shellView = shellView;
        this.currentScreenController = null;
        //Cache elements
        this.alertOverlayView = document.getElementById("alertOverlay");
        this.titleContainer = this.alertOverlayView.querySelector(".titleContainer");
        this.alertBoxMessage = this.alertOverlayView.querySelector("#alertBoxMessage");
        this.textInput = this.alertOverlayView.querySelector(".textInput");
        this.alertBoxBackground = this.alertOverlayView.querySelector(".alertBoxBackground");
        this.alertBoxTrueButton = this.alertOverlayView.querySelector("#alertBoxTrueButton");
        this.alertBoxFalseButton = this.alertOverlayView.querySelector("#alertBoxFalseButton");
        //INITIATION PROCEDURE
        //Add onclick to splashScreenView for initializing currentScreen
        this.shellView.querySelector("#splashScreen").addEventListener("click", () => {
            //Fetch workspace
            fetch(`${location.protocol}//${location.host}/workspace`)
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.currentScreenController = new WorkspaceScreenController(this.shellView.querySelector("#workspaceScreen"));
                    } else {
                        this.currentScreenController = new LogInScreenController(this.shellView.querySelector("#logInScreen"));
                    }
                    //Animate out splashSCreen
                    this.shellView.querySelector("#splashScreen").classList.replace("screen-popIn", "screen-popOut");
                    //Animate in new screen
                    this.currentScreenController.getScreenView().classList.replace("screen-popOut", "screen-popIn");
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
        return this.shellView.querySelectorAll("iframe");
    }

    transitScreen(newScreenController) {
        //Reset and animate out old screen
        this.currentScreenController.getScreenView().classList.replace("screen-popIn", "screen-popOut");
        this.currentScreenController.resetView();
        //Animate in new screen
        this.currentScreenController = newScreenController;
        this.currentScreenController.getScreenView().classList.replace("screen-popOut", "screen-popIn");
    }

    getShellView() {
        return this.shellView;
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
                    window.shellInterface.transitScreen(new WorkspaceScreenController(window.shellInterface.getShellView().querySelector("#workspaceScreen")));
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            }).catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't create a session for you the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }
}

export class LogInScreenController {
    constructor(logInScreenView) {
        //FIELD DECLARATIONS
        this.logInScreenView = logInScreenView;
        this.logInScreenHTML = this.logInScreenView.innerHTML;
        this.patternAuthorizer = new LogInPatternAuthorizer(logInScreenView.querySelector(".patternContainer"));
        //Cache elements
        this.logInBox = this.logInScreenView.querySelector(".logInBox");
        this.logInProfileImage = this.logInScreenView.querySelector(".logInProfileImage");
        //INITIATION PROCEDURE
        //Add onkeypress to logInBoxInputElement for loading relevant profileImage
        this.logInBox.children[1].addEventListener("keypress", (event) => {
            //Check if the pressed key is "Enter"
            if (event.key === "Enter") {
                fetch(`${location.protocol}//${location.host}/user?username=${this.logInBox.children[1].value}`)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.patternAuthorizer.setUsername(this.logInBox.children[1].value);
                            this.patternAuthorizer.getPatternView().style.visibility = "visible";
                            this.logInProfileImage.style.opacity = "1";
                            this.logInProfileImage.style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.user.profileImage.data)]))})`;
                            this.logInScreenView.querySelector(".logInBoxBackground").style.transform = "translateX(-55vw) rotate(45deg)";
                            this.logInBox.children[0].children[0].innerText = "Let's see if it is really you";
                            this.logInBox.children[0].children[1].innerText = "Please mark your pattern";
                        } else {
                            this.patternAuthorizer.getPatternView().style.visibility = "hidden";
                            this.logInProfileImage.removeAttribute("style");
                            this.logInScreenView.querySelector(".logInBoxBackground").removeAttribute("style");
                            this.logInBox.children[0].children[0].innerText = "Hmmm... we couldn't find you";
                            this.logInBox.children[0].children[1].innerText = "Please check again your credentials";
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

    getScreenView() {
        return this.logInScreenView;
    }

    resetView() {
        //Restore HTML inside logInScreen
        this.logInScreenView.innerHTML = this.logInScreenHTML;
    }
}

export class WorkspaceScreenController {
    constructor(workspaceScreenView) {
        //FIELD DECLARATIONS
        this.workspaceScreenView = workspaceScreenView;
        this.workspaceScreenHTML = this.workspaceScreenView.innerHTML;
        //NOTE: Following declarations are aligned with the z-indexes of the cards where last of the pastCards have the highest z-index
        //NOTE: In the beginning there are no pastCards
        //NOTE: In the beginning last 3 cards are considered presentCards
        //NOTE: In the beginning all other cards are considered upcomingCards
        //NOTE: popUpCards[last] have the highest z-index
        this.upcomingCards = [];
        this.presentCards = [];
        this.pastCards = [];
        this.permittedModuleOperations = {};
        //Cache elements
        this.headerArea = this.workspaceScreenView.querySelector(".headerArea");
        this.navigationControl = this.headerArea.querySelector("#navigationControl")
        this.timeDisplay = this.headerArea.querySelector("#timeDisplay");
        this.viewportArea = this.workspaceScreenView.querySelector(".viewportArea");
        this.quickAccessArea = this.workspaceScreenView.querySelector(".quickAccessArea");
        this.actionOverlayView = document.getElementById("actionOverlay");
        //INITIATION PROCEDURE
        //Fetch username, roleName and profileImage and apply user preferences
        fetch(`${location.protocol}//${location.host}/session/currentUser`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Update sessionData displays
                    this.headerArea.querySelector("#usernameDisplay").innerText = response.user.userPreference.name;
                    this.headerArea.querySelector("#roleNameDisplay").innerText = response.user.role.roleName;
                    this.headerArea.querySelector("#workspaceProfileImage").style.backgroundImage = `url(${URL.createObjectURL(new Blob([new Uint8Array(response.user.profileImage.data)]))})`;
                    //Apply user preferences to the UI
                    document.getElementsByTagName("link")[0].href = response.user.userPreference.theme.themePath;
                } else {
                    window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            })
            .catch(error => {
                window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch your session data from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
        //Fetch modules with "retrieve" permission
        fetch(`${location.protocol}//${location.host}/permission/retrievableModulePaths`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //Create a card for each permittedModulePath
                    for (let i = 0; i < response.retrievableModulePaths.length; i++) {
                        const card = new Card(response.retrievableModulePaths[i]);
                        //Set cardView's style
                        //NOTE: Auto generated cards will be appended linearly starting from presentCards[last] and towards upcomingCards[0]
                        if (this.presentCards.length < 3) {
                            const newPresentCardsLength = this.presentCards.unshift(card);
                            card.getCardView().setAttribute("class", `card presentCard${3 - newPresentCardsLength}`);
                        } else {
                            this.upcomingCards.unshift(card);
                            card.getCardView().setAttribute("class", `card upcomingCard`);
                        }
                        //Append elements into HTML
                        //NOTE: A cards appearance in the HTML DOM corresponds its z-index
                        this.viewportArea.insertBefore(card.getCardView(), this.viewportArea.firstElementChild);
                    }
                    //NOTE: Add onload to presentCard2's iFrame for updateQuickAccessArea
                    this.presentCards[this.presentCards.length - 1].getCardView().querySelector("iframe").addEventListener("load", this.updateQuickAccessArea.bind(this));
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
        this.workspaceScreenView.addEventListener("wheel", (event) => {
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
            this.presentCards[this.presentCards.length - 1].getCardView().style.pointerEvents = "none";
            const navigatorControlOptionDisplay = workspaceScreenController.workspaceScreenView.querySelector("#navigatorControlOptionDisplay");
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
                        event.target.style.borderColor = "transparent var(--headerAreaColor) transparent transparent";
                        navigatorControlOptionDisplay.innerText = "Logout";
                        procedureToExecute = workspaceScreenController.logoutSession;
                    } else if (differenceX < 0) {
                        event.target.style.borderColor = "transparent transparent transparent var(--headerAreaColor)";
                        navigatorControlOptionDisplay.innerText = "View action overlay";
                        procedureToExecute = () => {
                            workspaceScreenController.actionOverlayView.classList.replace("overlay-popOut", "overlay-popIn");
                        }
                    }
                } else {
                    //Case: y axis must be prioritized
                    if (differenceY > 0) {
                        event.target.style.borderColor = "transparent transparent var(--headerAreaColor) transparent";
                        navigatorControlOptionDisplay.innerText = "Close current card";
                        procedureToExecute = workspaceScreenController.removeCurrentCard.bind(workspaceScreenController);
                        reEnablePointerEvents = false;
                    } else if (differenceY < 0) {
                        event.target.style.borderColor = "var(--headerAreaColor) transparent transparent transparent";
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
                event.target.removeAttribute("style");
                //Reinstate presentCard.last pointer events
                //WARNING: This becomes useless if the executed procedure is to removeCurrentCard
                if (reEnablePointerEvents) {
                    workspaceScreenController.presentCards[workspaceScreenController.presentCards.length - 1].getCardView().removeAttribute("style");
                }
                //Restore navigatorControlOptionDisplay's inner text
                navigatorControlOptionDisplay.innerText = navigatorControlOptionDisplayInnerText;
                //Remove all previously added eventListeners
                window.removeEventListener("pointermove", determineOption);
                window.removeEventListener("pointerup", executeOption);
            }
        });
    }

    getScreenView() {
        return this.workspaceScreenView;
    }

    resetView() {
        //Restore HTML inside workspaceScreen
        this.workspaceScreenView.innerHTML = this.workspaceScreenHTML;
    }

    addCard(card) {
        //Set cardView's style
        //NOTE: A user created card will always be treated as the pastCards[0]
        card.getCardView().setAttribute("class", "card pastCard");
        //Add onload to cardView's iFrame for scrolling viewport after creation
        card.getCardView().querySelector("iframe").addEventListener("load", () => {
            //NOTE: The viewport must be scrolled backwards
            this.scrollViewport(-125);
        });
        //Append elements into HTML
        //NOTE: A card's appearance in the HTML DOM corresponds its z-index
        if (this.pastCards.length > 0) {
            this.viewportArea.insertBefore(card.getCardView(), this.pastCards[0].getCardView());
        } else {
            this.viewportArea.appendChild(card.getCardView());
        }
        //Add the card to relevant array
        this.pastCards.unshift(card);
    }

    removeCurrentCard() {
        if ((this.pastCards.length + this.presentCards.length) > 1) {
            //Case: There are more then one card open
            const currentCardView = this.presentCards[this.presentCards.length - 1].getCardView();
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
            this.upcomingCards[this.upcomingCards.length - 1].getCardView().setAttribute("class", `card upcomingCard`);
        }
        //Set style for presentCards
        for (let i = this.presentCards.length - 1, j = 2; i >= 0; i--) {
            this.presentCards[i].getCardView().setAttribute("class", `card presentCard presentCard${j}`);
            j--;
        }
        //Set style for pastCards
        //NOTE: Only the pastCards[0] needs to be modified (if it exists)
        if (this.pastCards.length > 0) {
            this.pastCards[0].getCardView().setAttribute("class", `card pastCard`);
        }
    }

    addPopUpCard(popUpCard) {
        //NOTE: PopUpCards are not a part of viewportArea
        this.workspaceScreenView.appendChild(popUpCard.getPopUpCardView());
        //Set popUpCardView's z-index to be the highest among popUpCards
        //NOTE: The relevant z-index matches openPopUpCards array's length
        popUpCard.getPopUpCardView().style.zIndex = document.querySelectorAll(".popUpCard").length;
    }

    focusPopUpCard(popUpCard) {
        //Get all popUpCards
        const openPopUpCardViews = Array.from(document.querySelectorAll(".popUpCard"));
        //Move popUpCard's view to the last position of the openPopUpCards
        openPopUpCardViews.push(openPopUpCardViews.splice(openPopUpCardViews.indexOf(popUpCard.getPopUpCardView()), 1)[0]);
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
        //Update moduleName display according to the presentCard2
        const moduleName = presentCard2.getModuleName();
        this.headerArea.querySelector("#moduleNameDisplay").innerText = presentCard2.getTitle();
        //Check if the permittedModuleOperations are cached
        if (!this.permittedModuleOperations.hasOwnProperty(moduleName)) {
            //Fetch permittedModuleOperations and cache them
            fetch(`${location.protocol}//${location.host}/permission/permittedModuleOperations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    moduleName: moduleName
                })
            })
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        this.permittedModuleOperations[moduleName] = response.permittedModuleOperations;
                        addQuickAccessControls.bind(this)();
                    } else {
                        window.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                    }
                })
                .catch(error => {
                    window.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch your permitted operations for the current module from the internal server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
                });
        } else {
            addQuickAccessControls.bind(this)();
        }

        function addQuickAccessControls() {
            //Add createControls to the quickAccessArea if the user has "create" permissions
            if (this.permittedModuleOperations[moduleName].includes("create")) {
                const createControls = presentCard2.getControls("create");
                for (const createControl of createControls) {
                    this.quickAccessArea.appendChild(createControl);
                }
            }
            //Add retrieveControls to the quickAccessArea if the user has "retrieve" permissions
            if (this.permittedModuleOperations[moduleName].includes("retrieve")) {
                const retrieveControls = presentCard2.getControls("retrieve");
                for (const retrieveControl of retrieveControls) {
                    this.quickAccessArea.appendChild(retrieveControl);
                }
            }
            //Add updateControls to the quickAccessArea if the user has "update" permissions
            if (this.permittedModuleOperations[moduleName].includes("update")) {
                const updateControls = presentCard2.getControls("update");
                for (const updateControl of updateControls) {
                    this.quickAccessArea.appendChild(updateControl);
                }
            }
            //Add deleteControls to the quickAccessArea if the user has "delete" permissions
            if (this.permittedModuleOperations[moduleName].includes("delete")) {
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

    logoutSession() {
        window.shellInterface.transitScreen(new LogInScreenController(document.getElementById("logInScreen")));
    }
}