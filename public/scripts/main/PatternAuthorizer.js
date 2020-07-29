//@ts-check
//WARNING: This class must be extended with an implementation of attemptAuthorization() before use
export class PatternAuthorizer {
    username = "";
    cellCombination = "";
    activatedCellPositions = [];

    view = null;
    patternCanvas = null;
    context2D = null;
    cellPoints = null;
    
    constructor(patternInput) {
        //Initialize/cache view elements
        this.view = patternInput;
        this.patternCanvas = this.view.querySelector("canvas");
        this.context2D = this.patternCanvas.getContext("2d");
        this.cellPoints = this.view.querySelectorAll(".cellPoint");
        //Add onpointerdown to cellPoints for initializing activatedCellPositions and cellCombination
        for (const cellPoint of this.cellPoints) {
            cellPoint.addEventListener("pointerdown", this.pointerDownCellPoint.bind(this));
        }
    }

    setUsername(username) {
        this.username = username;
    }

    resetPattern() {
        //Clear the activatedCellPositions and the patternCanvas
        this.cellCombination = "";
        this.activatedCellPositions.length = 0;
        this.context2D.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        //Revert the appearance of all cellPoints
        for (const cellPointElement of this.cellPoints) {
            cellPointElement.setAttribute("class", "cellPoint");
        }
    }

    getView() {
        return this.view;
    }

    //EVENT HANDLER METHODS
    pointerDownCellPoint(event) {
        //Get a reference to "this" for inner functions
        const patternAuthorizer = this;
        //Setup canvas's dimensions with HTML in case of the screen was resized
        this.patternCanvas.width = this.patternCanvas.getBoundingClientRect().width;
        this.patternCanvas.height = this.patternCanvas.getBoundingClientRect().height;
        //Get patternViewBoundingRect
        const patternViewRect = this.view.getBoundingClientRect();
        //Setup context2D for drawing
        this.context2D.strokeStyle = "white";
        this.context2D.lineWidth = 10;
        //Add onpointerup and onpointerleave to patternView for evaluating username and password or stop stroking path
        this.view.addEventListener("pointerup", pointerUpWindow);
        this.view.addEventListener("pointerleave", pointerUpWindow);
        //Add onpointerenter and onpointerleave to cellPoints for updating activatedCellPositions and cellCombination
        for (const cellPoint of this.cellPoints) {
            cellPoint.addEventListener("pointerenter", pointerEnterCellPoint);
            cellPoint.addEventListener("pointerleave", pointerLeaveCellPoint);
        }
        //Add onpointermove to patternView for drawing the pattern path on the patternCanvas
        this.view.addEventListener("pointermove", strokePath);
        //Change appearance of the initial cellPoint
        event.currentTarget.classList.add("active");
        //Initialize activatedCellPositions by adding the initial cell's position
        const cellPointRect = event.currentTarget.getBoundingClientRect();
        this.activatedCellPositions.push([cellPointRect.left + (cellPointRect.width / 2) - patternViewRect.left, cellPointRect.top + (cellPointRect.height / 2) - patternViewRect.top]);
        //Initialize cellCombination by adding the initial cell's data-cell-keyword
        this.cellCombination += event.currentTarget.dataset.cellKeyword;

        //INNER EVENT HANDLER FUNCTIONS
        function pointerEnterCellPoint(event) {
            //Change appearance of the current cellPoint
            event.currentTarget.classList.add("active");
            //Append the current cell's position to activatedCellPositions
            const cellPointRect = event.currentTarget.getBoundingClientRect();
            patternAuthorizer.activatedCellPositions.push([cellPointRect.left + (cellPointRect.width / 2) - patternViewRect.left, cellPointRect.top + (cellPointRect.height / 2) - patternViewRect.top]);
            //Append the current cell's id to cellCombination
            patternAuthorizer.cellCombination += event.currentTarget.dataset.cellKeyword;
        }

        function pointerLeaveCellPoint(event) {
            event.currentTarget.classList.remove("active");
        }
    
        function strokePath(event, includeMousePosition = true) {
            //Draw the pattern considering activatedCellPositions and the current mouse position
            patternAuthorizer.context2D.clearRect(0, 0, patternAuthorizer.patternCanvas.width, patternAuthorizer.patternCanvas.height);
            patternAuthorizer.context2D.beginPath();
            patternAuthorizer.context2D.moveTo(patternAuthorizer.activatedCellPositions[0][0], patternAuthorizer.activatedCellPositions[0][1]);
            for (let i = 1; i < patternAuthorizer.activatedCellPositions.length; i++) {
                patternAuthorizer.context2D.lineTo(patternAuthorizer.activatedCellPositions[i][0], patternAuthorizer.activatedCellPositions[i][1]);
            }
            if (includeMousePosition) {
                patternAuthorizer.context2D.lineTo(event.clientX - patternViewRect.left, event.clientY - patternViewRect.top);
            }
            patternAuthorizer.context2D.stroke();
        }
    
        function pointerUpWindow() {
            //Remove onpointerup and onpointerleave from patternView for eliminating unnecessary errors
            patternAuthorizer.view.removeEventListener("pointerup", pointerUpWindow);
            patternAuthorizer.view.removeEventListener("pointerleave", pointerUpWindow);
            //Remove onpointermove from blindPad for stop drawing the pattern path on the patternCanvas
            patternAuthorizer.view.removeEventListener("pointermove", strokePath);
            //Remove onpointerenter from cellPoints for eliminate unnecessary updates to activatedCellPositions and cellCombination
            for (const cellPoint of patternAuthorizer.cellPoints) {
                cellPoint.removeEventListener("pointerenter", pointerEnterCellPoint);
                cellPoint.removeEventListener("pointerleave", pointerLeaveCellPoint);
            }
            //Draw the pattern again only considering activatedCellPositions and without considering the current mouse position
            strokePath(null, false);
            //Execute attemptAuthorization()
            patternAuthorizer.attemptAuthorization();
        }
    }
    
    //WARNING: This method must be overridden
    attemptAuthorization() {
        
    }
}