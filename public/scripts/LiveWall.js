//@ts-check
export class CarouselController {
    cardInterface = null;

    view = null
    carouselImageCurrent = null;
    carouselImageNew = null;

    constructor(cardInterface, viewport) {
        this.cardInterface = cardInterface;
        this.view = viewport;

        //Add ontouchstart to carouselViewport for scrolling preview images
        this.view.addEventListener("touchstart", (event) => {
            const carouselController = this;
            //Add eventListeners
            window.addEventListener("touchmove", doSwipeViewPort);
            window.addEventListener("touchend", endSwipeViewport);
            //Declare and initialize variables
            const initialTouchPositionX = event.touches[0].screenX;

            //INNER EVENT HANDLER FUNCTIONS
            function doSwipeViewPort(event) {
                //Calculate the travelled distance of the finger as a vector
                const differenceX = initialTouchPositionX - event.touches[0].screenX;
                if (differenceX < -50) {
                    endSwipeViewport();
                    carouselController.scrollCarouselImage("previous");
                } else if (differenceX > 50) {
                    endSwipeViewport();
                    carouselController.scrollCarouselImage("next");
                }
            }

            function endSwipeViewport() {
                //Remove all previously added eventListeners
                window.removeEventListener("touchmove", doSwipeViewPort);
                window.removeEventListener("touchend", endSwipeViewport);
            }
        });
    }

    scrollCarouselImage(direction) {
        this.carouselImageCurrent = this.view.querySelector("#carouselImageCurrent");
        this.carouselImageNew = this.view.querySelector("#carouselImageNew");
        const carouselImageCurrentIndex = parseInt(this.carouselImageCurrent.dataset.imageIndex);

        let newImageIndex = -1;
        if (direction === "next") {
            newImageIndex = carouselImageCurrentIndex + 1;
        } else if (direction === "previous") {
            newImageIndex = carouselImageCurrentIndex - 1;
        }

        if ((direction === "next" && carouselImageCurrentIndex <= this.cardInterface.getImageMetadata().length - 2) || (direction === "previous" && carouselImageCurrentIndex >= 1)) {
            
            this.carouselImageCurrent.id = "carouselImageNew";
            this.carouselImageNew.id = "carouselImageCurrent";
            
            this.loadImageAtIndex(newImageIndex);
            
            //NOTE: By now references of carouselImages are changed
            this.carouselImageNew.style.animationName = `popOutCarouselImage-${direction}`;
            this.carouselImageCurrent.style.animationName = "popUpCarouselImage";
        }
    }

    loadImageAtIndex(imageIndex) {
        this.carouselImageCurrent = this.view.querySelector("#carouselImageCurrent");
        this.carouselImageNew = this.view.querySelector("#carouselImageNew");
        //NOTE: static directory is merged under liveWallRouter. So static file requests must start with "liveWall/"
        this.carouselImageCurrent.src = `${location.protocol}//${location.host}/liveWall/${this.cardInterface.getImageMetadata()[imageIndex].path}`;
        this.carouselImageCurrent.dataset.imageIndex = (imageIndex).toString();
    }
}

export class DirectoryExplorerController {
    cardInterface = null;

    view = null;

    constructor(cardInterface, panelView) {
        this.cardInterface = cardInterface;
        this.view = panelView;

        this.view.querySelector(".buttonContainer>.button").addEventListener("click", () => {
            this.exploreDirectory(this.view.dataset.currentSubdirectoryPath, true);
        });
    }

    exploreDirectory(subdirectoryPath, backwards = false) {
        if (backwards) {
            subdirectoryPath = subdirectoryPath.slice(0, subdirectoryPath.slice(0, -1).lastIndexOf("/") + 1);
        }
        //Request directory data for the given directory
        fetch(`${location.protocol}//${location.host}/liveWall/directories?rootDirectoryPath=${this.cardInterface.getRootDirectoryPath()}&subdirectoryPath=${subdirectoryPath}`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    this.view.dataset.currentSubdirectoryPath = subdirectoryPath;
                    this.view.firstElementChild.innerHTML = "";

                    //NOTE: A DocumentFragment is used to improve performance
                    const panelSectorContainerFragment = new DocumentFragment();
                    const panelDivisionSectorTemplate = this.cardInterface.getTemplate(".panelDivisionSector");
                    for (const directoryPath of response.data) {
                        const panelDivisionSector = panelDivisionSectorTemplate.cloneNode(true);
                        panelDivisionSector.textContent = directoryPath.slice(directoryPath.slice(0, -1).lastIndexOf("/") + 1, -1);
                        panelDivisionSector.dataset.subdirectoryPath = directoryPath.replace(this.cardInterface.getRootDirectoryPath(), "");
                        panelDivisionSector.addEventListener("contextmenu", (event) => {
                            event.preventDefault();
                            this.navigateDirectory(panelDivisionSector.dataset.subdirectoryPath);
                        });
                        panelDivisionSector.addEventListener("click", (event) => {
                            this.exploreDirectory(panelDivisionSector.dataset.subdirectoryPath);
                        });
                        panelSectorContainerFragment.appendChild(panelDivisionSector);
                    }

                    this.view.firstElementChild.appendChild(panelSectorContainerFragment);
                } else {
                    alert(response.error);
                }
            });
    }

    navigateDirectory(subdirectoryPath) {
        //Request image data in the given directory
        fetch(`${location.protocol}//${location.host}/liveWall/files/imageMetadata?rootDirectoryPath=${this.cardInterface.getRootDirectoryPath()}&subdirectoryPath=${subdirectoryPath}`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    this.cardInterface.setImageMetadata(response.data);
                    //NOTE: LiveWall functionality will be initiated when the user switches to the relevant viewport
                    this.cardInterface.getCarouselController().loadImageAtIndex(0);
                } else {
                    alert(response.error);
                }
            })
    }
}

export class LiveWallController {
    cardInterface = null;
    setIntervalId = null;
    portraitCounter = 1;
    squareCounter = 1;
    landscapeCounter = 1;

    view = null;

    constructor(cardInterface, viewport) {
        this.cardInterface = cardInterface;
        this.view = viewport;

        //Add onclick to every child of areaContainer for viewing infoArea
        const areas = Array.from(this.view.querySelector(".areasContainer").children);
        for (let i = 0; i < areas.length; i++) {
            areas[i].addEventListener("dblclick", () => {
                const imageMetaDatum = this.cardInterface.getImageMetadata()[Number.parseInt(areas[i].dataset.imageIndex)];
                if (window.frameElement) {
                    //Case: App is inside an iFrame
                    const imagePreviewPopUp = this.cardInterface.cardObject.createPopUpCard("layouts/popUpCards/files_r_image.html");
                    //Allow more width than other popUpCards
                    imagePreviewPopUp.getView().style.maxWidth = "90vw";
                    imagePreviewPopUp.getView().querySelector("iframe").addEventListener("load", () => {
                        imagePreviewPopUp.popUpCardInterface.preview(`${location.protocol}//${location.host}/liveWall/${imageMetaDatum.path}`);
                    });
                } else {
                    //Case: App is not inside an iFrame
                    const orientation = areas[i].id.slice(0, -1);
                    const color = areas[i].style.backgroundColor;
                    const zoomImage = new ZoomImage(imageMetaDatum, orientation, color);
                    this.cardInterface.addZoomImage(zoomImage);
                }
            });
        }
    }

    validateAndViewRandomImage() {
        //Get a random imageIndex
        const imageIndex = Math.floor(Math.random() * (this.cardInterface.getImageMetadata().length));
        //Check if the hwRatio is calculated
        if (this.cardInterface.getImageMetadata()[imageIndex].hwRatio) {
            //View the image appropriately
            this.viewImage(imageIndex);
        } else {
            const image = new Image();
            image.onload = () => {
                //Calculate hwRatio
                this.cardInterface.getImageMetadata()[imageIndex].hwRatio = image.naturalHeight / image.naturalWidth;
                //View the image appropriately
                this.viewImage(imageIndex);
            };
            image.src = `${location.protocol}//${location.host}/liveWall/${this.cardInterface.getImageMetadata()[imageIndex].path}`;
        }
    }

    viewImage(imageIndex) {
        const imageMetaDatum = this.cardInterface.getImageMetadata()[imageIndex];
        let randomAreaQuery = "";
        if (imageMetaDatum.hwRatio > 1.2) {
            //Case: portrait
            randomAreaQuery = "#portrait" + this.portraitCounter;
            if (this.portraitCounter === 6) { this.portraitCounter = 1; } else { this.portraitCounter++; }
        } else if (imageMetaDatum.hwRatio < 3 / 4) {
            //Case: landscape
            randomAreaQuery = "#landscape" + this.landscapeCounter;
            if (this.landscapeCounter === 3) { this.landscapeCounter = 1; } else { this.landscapeCounter++; }
        } else {
            //Case: square
            randomAreaQuery = "#square" + this.squareCounter;
            if (this.squareCounter === 3) { this.squareCounter = 1; } else { this.squareCounter++; }
        }

        //Change the backgroundImage of the randomArea and store its data inside the element
        const randomArea = this.view.querySelector(randomAreaQuery);
        //NOTE: static directory is merged under liveWallRouter. So static file requests must start with "liveWall/"
        randomArea.src = `${location.protocol}//${location.host}/liveWall/${imageMetaDatum.path}`;
        randomArea.dataset.imageIndex = imageIndex;
    }

    animateWall() {
        this.setIntervalId = window.setInterval(() => {
            this.validateAndViewRandomImage();
        }, 1500);
    }

    freezeWall() {
        clearInterval(this.setIntervalId);
        this.setIntervalId = null;
    }
}

export class ZoomImage {
    view = null;

    constructor(imageMetaDatum, orientation, color) {
        this.view = window.cardInterface.getTemplate(".zoomImage").cloneNode(true);

        this.view.classList.add(`zoomImage-${orientation}`);
        this.view.style.zIndex = document.querySelectorAll(".zoomImage").length.toString();
        this.view.style.backgroundImage = `url("${location.protocol}//${location.host}/liveWall/${imageMetaDatum.path}")`;
        this.view.style.borderColor = color;
        if (window.innerHeight >= window.innerWidth) {
            this.view.style.height = ((window.innerWidth * 90 / 100) * imageMetaDatum.hwRatio) + "px";
        } else if (window.innerHeight < window.innerWidth) {
            this.view.style.width = ((window.innerHeight * 90 / 100) / imageMetaDatum.hwRatio) + "px";
        }

        this.view.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1) {
                this.focus();
                this.startDrag(event);
            } else if (event.touches.length === 2) {
                this.startPinch(event);
            }
        });

        this.view.addEventListener("mousedown", (event) => {
            this.focus();
            this.startDrag(event);
        });

        const closeButton = this.view.querySelector(".button");
        closeButton.style.backgroundColor = color;
        closeButton.addEventListener("click", (event) => {
            this.view.style.animationName = "removeZoomImage";
            setTimeout(() => {
                this.view.remove();
            }, 250);
        });
    }

    getView() {
        return this.view;
    }

    focus() {
        const zoomImageViews = document.querySelectorAll(".zoomImage");
        for (let i = 0; i < zoomImageViews.length; i++) {
            zoomImageViews[i].style.zIndex = i.toString();
        }
        this.view.style.zIndex = zoomImageViews.length.toString();
    }

    startDrag(event) {
        //Get a reference of "this" for inner functions
        const zoomImage = this;
        event.preventDefault();
        //Get the originalMousePositions
        const originalMousePositionX = event.screenX || event.touches[0].screenX;
        const originalMousePositionY = event.screenY || event.touches[0].screenY;
        //Add eventListeners
        window.addEventListener("mousemove", dragMove);
        window.addEventListener("touchmove", dragMove);
        window.addEventListener("mouseup", endDrag);
        window.addEventListener("touchend", endDrag);
        //Declare and initialize variables to store difference
        let differenceX = 0;
        let differenceY = 0;
        //Define the handler for mouseMove event
        function dragMove(event) {
            //Check if a multi finger gesture started
            if (event.touches && (event.touches.length > 1)) {
                //If there is a multi finger gesture, endDragZoomImage
                endDrag();
            }
            //Calculate the travelledDistance of the mouse as a vector
            differenceX = (event.screenX || event.touches[0].screenX) - originalMousePositionX;
            differenceY = (event.screenY || event.touches[0].screenY) - originalMousePositionY;
            //Translate zoomImage accordingly
            zoomImage.view.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
        }
        //Define the handler for mouseup event
        function endDrag() {
            //Apply translation into permanent position
            const zoomImageStyles = getComputedStyle(zoomImage.view);
            zoomImage.view.style.left = (parseFloat(zoomImageStyles.left) + differenceX) + "px";
            zoomImage.view.style.top = (parseFloat(zoomImageStyles.top) + differenceY) + "px";
            //Remove translation
            zoomImage.view.style.transform = "none";
            //Remove all previously added eventListeners
            window.removeEventListener("mousemove", dragMove);
            window.removeEventListener("touchmove", dragMove);
            window.removeEventListener("mouseup", endDrag);
            window.removeEventListener("touchend", endDrag);
        }
    }

    startPinch(event) {
        //Get a reference of "this" for inner functions
        const zoomImage = this;
        event.preventDefault();
        //Get the originalFingerDistance
        const originalFingerDistance = Math.sqrt(Math.pow(event.touches[1].clientY - event.touches[0].clientY, 2) + Math.pow(event.touches[1].clientX - event.touches[0].clientX, 2));
        //Add eventListeners
        window.addEventListener("touchmove", pinchMove);
        window.addEventListener("touchend", endPinch);
        //Declare and initiate variables to store difference
        let scale = 1;
        //Define the handler for touchmove event
        function pinchMove(event) {
            //Calculate the newFingerDistance
            const newFingerDistance = Math.sqrt(Math.pow(event.touches[1].clientY - event.touches[0].clientY, 2) + Math.pow(event.touches[1].clientX - event.touches[0].clientX, 2));
            //Scale zoomImage accordingly
            scale = newFingerDistance / originalFingerDistance;
            zoomImage.view.style.transform = `scale(${scale})`;
        }
        //Define the handler for mouseup event
        function endPinch() {
            //Apply translation into permanent position
            const zoomImageBoundingRect = zoomImage.view.getBoundingClientRect();
            zoomImage.view.style.top = zoomImageBoundingRect.top + "px";
            zoomImage.view.style.left = zoomImageBoundingRect.left + "px";
            zoomImage.view.style.width = zoomImageBoundingRect.width + "px";
            zoomImage.view.style.height = zoomImageBoundingRect.height + "px";
            //Remove translation
            zoomImage.view.style.transform = "none";
            //Remove all previously added eventListeners
            window.removeEventListener("touchmove", pinchMove);
            window.removeEventListener("touchend", endPinch);
        }
    }
}