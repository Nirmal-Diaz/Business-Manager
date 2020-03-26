//@ts-check
export class PopUpCard {
    popUpCardInterface = null;
    layoutFilePath;
    parentCardInterface;
    
    view = document.createElement("div");

    constructor(layoutFilePath, parentCardInterface) {
        this.layoutFilePath = layoutFilePath;
        this.parentCardInterface = parentCardInterface;
        //Setup view
        this.view.setAttribute("class", "popUpCard popUpCard-popIn");
        this.view.addEventListener("mousedown", (event) => {
            this.startDrag(event);
            window.parent.shellInterface.getCurrentScreenController().focusPopUpCard(this);
        });
        this.view.addEventListener("touchstart", (event) => {
            this.startDrag(event);
            window.parent.shellInterface.getCurrentScreenController().focusPopUpCard(this);
        });
        //Resize handle creation
        const popUpCardResizeHandle = document.createElement("div");
        popUpCardResizeHandle.setAttribute("class", "popUpCardResizeHandle");
        popUpCardResizeHandle.addEventListener("mousedown", this.startResize);
        popUpCardResizeHandle.addEventListener("touchstart", this.startResize);
        //Create the iFrame to load the moduleComponent
        const iFrame = document.createElement("iframe");
        iFrame.setAttribute("class", "popUpCardIFrame");
        iFrame.src = `${location.protocol}//${location.host}/${layoutFilePath}`;
        //Add onload to iFrame for connecting popUpCardObject with popUpCardInterface
        iFrame.addEventListener("load", () => {
            this.popUpCardInterface = iFrame.contentWindow.popUpCardInterface;
            this.popUpCardInterface.popUpCardObject = this;
            //Add onclick to every close button of every popUpCardDivision for closing popUpCard
            for (const closeButton of this.popUpCardInterface.closeButtons) {
                closeButton.addEventListener("click", this.close.bind(this));
            }
        });
        //Set the popUpCardView's id to match its iFrame's src
        this.view.id = layoutFilePath.slice(layoutFilePath.lastIndexOf("/") + 1, -5);
        //Append into HTML
        this.view.appendChild(iFrame);
        this.view.appendChild(popUpCardResizeHandle);
        //Ask WorkspaceScreen to append popUpCardView
        window.parent.shellInterface.getCurrentScreenController().addPopUpCard(this);
    }

    getView() {
        return this.view;
    }

    getLayoutFilePath() {
        return this.layoutFilePath;
    }

    close() {
        this.parentCardInterface.cardObject.getOpenPopUpCards().splice(this.parentCardInterface.cardObject.getOpenPopUpCards().indexOf(this), 1);
        this.view.classList.replace("popUpCard-popIn", "popUpCard-popOut");
        setTimeout(() => {
            this.view.remove();
        }, 250);
    }

    //EVENT HANDLER METHODS
    startDrag(event) {
        //Prevent browser's default event handlers from executing
        event.preventDefault();
        //Get a reference of "this.popUpCardView" for inner event handlers
        const popUpCardView = event.currentTarget;
        //Turn off pointer events for all iFrames
        //NOTE: This code is called from within a card window, therefore the parent window must be accessed to get its iFrames
        const iFrames = window.parent.shellInterface.getAllFrames();
        for (let i = 0; i < iFrames.length; i++) {
            iFrames[i].style.pointerEvents = "none";
        }
        //Get the originalMousePositions
        const originalMousePositionX = event.screenX || event.touches[0].screenX;
        const originalMousePositionY = event.screenY || event.touches[0].screenY;
        //Add eventListeners
        //NOTE: This code is called from within a card window, therefore the parent window must be accessed to add eventListeners
        window.parent.addEventListener("mousemove", doDrag);
        window.parent.addEventListener("touchmove", doDrag);
        window.parent.addEventListener("mouseup", endDrag);
        window.parent.addEventListener("touchend", endDrag);
        //Declare and initialize variables to store difference
        let differenceX = 0;
        let differenceY = 0;

        //INNER EVENT HANDLER FUNCTIONS
        function doDrag(event) {
            //Calculate the travelledDistance of the mouse as a vector
            differenceX = (event.screenX || event.touches[0].screenX) - originalMousePositionX;
            differenceY = (event.screenY || event.touches[0].screenY) - originalMousePositionY;
            //Translate popUpCard accordingly
            popUpCardView.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
        }

        function endDrag() {
            //Turn back on all pointer events for all iFrames
            for (let i = 0; i < iFrames.length; i++) {
                iFrames[i].removeAttribute("style");
            }
            //Apply translation into permanent position
            const popUpCardStyles = getComputedStyle(popUpCardView);
            popUpCardView.style.left = (parseInt(popUpCardStyles.left) + differenceX) + "px";
            popUpCardView.style.top = (parseInt(popUpCardStyles.top) + differenceY) + "px";
            //Remove translation
            popUpCardView.style.transform = "none";
            //Remove all previously added eventListeners
            window.parent.removeEventListener("mousemove", doDrag);
            window.parent.removeEventListener("touchmove", doDrag);
            window.parent.removeEventListener("mouseup", endDrag);
            window.parent.removeEventListener("touchend", endDrag);
        }
    }

    startResize(event) {
        //Prevent browser's default event handlers from executing
        event.preventDefault();
        //Prevent eventBubbling and stop executing startDrag along with this
        event.stopPropagation();
        //Get a reference of "this.popUpCardView" for inner event handlers
        const popUpCardView = event.currentTarget.parentElement;
        //Turn off pointer events for all iFrames
        //NOTE: This code is called from within a card window, therefore the parent window must be accessed to get its iFrames
        const iFrames = window.parent.shellInterface.getAllFrames();
        for (let i = 0; i < iFrames.length; i++) {
            iFrames[i].style.pointerEvents = "none";
        }
        //Get the originalMousePositions
        const originalMousePositionX = event.screenX || event.touches[0].screenX;
        const originalMousePositionY = event.screenY || event.touches[0].screenY;
        //Get the originalPopUpCardDimensions
        const originalPopUpCardWidth = popUpCardView.getBoundingClientRect().width;
        const originalPopUpCardHeight = popUpCardView.getBoundingClientRect().height;
        //Add eventListeners
        //NOTE: This code is called from within a card window, therefore the parent window must be accessed to add eventListeners
        window.parent.addEventListener("mousemove", doResize);
        window.parent.addEventListener("touchmove", doResize);
        window.parent.addEventListener("mouseup", endResize);
        window.parent.addEventListener("touchend", endResize);
        //Declare and initialize variables to store difference
        let differenceX = 0;
        let differenceY = 0;
        
        //INNER EVENT HANDLER FUNCTIONS
        function doResize(event) {
            //Calculate the travelledDistance of the mouse as a vector
            differenceX = (event.screenX || event.touches[0].screenX) - originalMousePositionX;
            differenceY = (event.screenY || event.touches[0].screenY) - originalMousePositionY;
            //Adjust the dimensions of the popUpCard accordingly
            popUpCardView.style.width = (originalPopUpCardWidth + differenceX) + "px";
            popUpCardView.style.height = (originalPopUpCardHeight + differenceY) + "px";
        }
        
        function endResize() {
            //Turn back on pointer events for all iFrames
            for (let i = 0; i < iFrames.length; i++) {
                iFrames[i].removeAttribute("style");
            }
            //Remove all previously added eventListeners
            window.parent.removeEventListener("mousemove", doResize);
            window.parent.removeEventListener("touchmove", doResize);
            window.parent.removeEventListener("mouseup", endResize);
            window.parent.removeEventListener("touchend", endResize);
        }
    }
}