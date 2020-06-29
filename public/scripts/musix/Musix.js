//@ts-check
export class NowPlayingController {
    cardInterface = null;
    remotePlay = false;
    playlist = {};
    boundedHandlers = {
        startSeek: this.startSeek.bind(this),
        handleTimeUpdate: this.handleTimeUpdate.bind(this)
    };

    view = null;
    mediaController = null;
    seekSlider = null;
    volumeSlider = null;

    constructor(cardInterface, viewport) {
        this.cardInterface = cardInterface;

        this.view = viewport;
        this.mediaController = this.view.querySelector("#mediaController");
        this.seekSlider = this.view.querySelector("#seekSlider");
        this.volumeSlider = this.view.querySelector("#volumeSlider");

        //Initiate localStorage if not exist
        if (!localStorage.getItem("hasPlaybackState")) {
            //Case: Doesn't have a playback state
            //Playback state parameters must be initialized
            localStorage.setItem("hasPlaybackState", "true");
            localStorage.setItem("currentPlaylistIndex", "0");
            localStorage.setItem("currentTrackIndex", "0");
            localStorage.setItem("currentTrackTime", "0");
            localStorage.setItem("currentVolume", "0.5");
        }
        if (parseInt(localStorage.getItem("currentPlaylistIndex")) >= this.cardInterface.getPlaylistController().getPlaylists().length) {
            //Case: User had a custom playlist in the previous session
            //Current playlistIndex, trackIndex and trackTime must be reset because there is no quickPlaylist in this session and we cannot continue it
            //Choose a random playlistIndex as currentPlaylistIndex
            localStorage.setItem("currentPlaylistIndex", Utility.getRandInt(0, this.cardInterface.getPlaylistController().getPlaylists().length).toString());
            localStorage.setItem("currentTrackIndex", "0");
            localStorage.setItem("currentTrackTime", "0");
        }
        //NOTE: quickPlaylistIndex must always be -1 in the beginning
        localStorage.setItem("quickPlaylistIndex", "-1");

        //Add eventListeners to the mediaController and seekSlider
        this.mediaController.addEventListener("loadstart", () => {
            //Remove ability to seek
            this.seekSlider.removeEventListener("pointerdown", this.boundedHandlers.startSeek);
            this.seekSlider.removeEventListener("touchstart", this.boundedHandlers.startSeek);
        });
        this.mediaController.addEventListener("canplay", () => {
            //Add ability to seek
            this.seekSlider.addEventListener("pointerdown", this.boundedHandlers.startSeek);
            this.seekSlider.addEventListener("touchstart", this.boundedHandlers.startSeek);
        });
        //Add onplay to mediaController for displaying current state on navigationControl
        this.mediaController.addEventListener("play", () => {
            this.cardInterface.getNavigationControl().style.boxShadow = "0 0 10px black, inset 0 0 10px white";
        });
        //Add ontimeupdate to mediaController for updating state and UI
        this.mediaController.addEventListener("timeupdate", this.boundedHandlers.handleTimeUpdate);
        //Add onwaiting to mediaController
        this.mediaController.addEventListener("waiting", () => {
            //Remove ability to seek
            this.seekSlider.removeEventListener("pointerdown", this.boundedHandlers.startSeek);
            this.seekSlider.removeEventListener("touchstart", this.boundedHandlers.startSeek);
        });
        //Add onplay to mediaController for displaying current state on navigationControl
        this.mediaController.addEventListener("pause", () => {
            this.cardInterface.getNavigationControl().style.boxShadow = "0 0 10px black";
        });
        //Add onended to mediaController for playing next track
        this.mediaController.addEventListener("ended", () => {
            this.skipTrack("next");
        });

        //Add onpointerdown to volumeSlider for changing volume
        //NOTE: Changing volume is done in realtime except in RemotePlay
        this.volumeSlider.addEventListener("pointerdown", (event) => {
            this.startSlide(event, null, () => {
                const volume = Utility.getCircularSliderValue(this.volumeSlider, 1);
                this.mediaController.volume = volume;
                localStorage.setItem("currentVolume", volume.toString());
            }, () => {
                //NOTE: Setting volume for RemotePlay doesn't require realtime volume update
                if (this.remotePlay) {
                    const volume = Utility.getCircularSliderValue(this.volumeSlider, 1);
                    this.setVolume(volume);
                }
            });
        });

        //Reinstate mediaController to last position
        this.setVolume(parseFloat(localStorage.getItem("currentVolume")));
        this.setPlaylist(this.cardInterface.getPlaylistController().getPlaylistAt(parseInt(localStorage.getItem("currentPlaylistIndex"))));
        this.loadTrackAt(parseInt(localStorage.getItem("currentTrackIndex")));
        this.seekTo(parseFloat(localStorage.getItem("currentTrackTime")));

    }

    toggleRemotePlay() {
        if (this.remotePlay) {
            this.remotePlay = false;
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-disable"
            });
            if (window.frameElement) {
                window.parent.shellInterface.throwAlert("RemotePlay is off", "You no longer control other instances", "From now on every action you take on Musix won't affect other instances. YOu can control your instance", null, "OK", null);
            } else {
                alert("RemotePlay is off");
            }
        } else {
            this.remotePlay = true;
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-enable"
            });
            if (window.frameElement) {
                window.parent.shellInterface.throwAlert("RemotePlay is on", "You are in control of other instances", "From now on every action you take on Musix won't affect the current instance. Instead they are reflected throughout all other instances which are connected to the web socket server\n\nAll other clients are expected to interact with the DOM before RemotePlay can work properly", null, "OK", null);
            } else {
                alert("RemotePlay is enabled. All other clients are expected to interact with the DOM before RemotePlay can work properly");
            }
        }
    }

    setVolume(volume) {
        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-set-volume",
                volume: volume
            });
        }
        this.mediaController.volume = volume;
        //Update playback state
        localStorage.setItem("currentVolume", volume.toString());
        //Update UI
        Utility.setCircularSliderView(this.volumeSlider, 1, volume);
    }

    setPlaylist(playlist) {
        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-set-playlist",
                playlist: playlist
            });
        }
        this.playlist = playlist;
        //Update playback state
        localStorage.setItem("currentPlaylistIndex", playlist.index.toString());
        //Update UI
        this.view.querySelector("#playlistDisplay").innerHTML = playlist.name;
        document.styleSheets[0].cssRules[1].style.setProperty("--themeColor", playlist.themeColor);
    }

    loadTrackAt(trackIndex) {
        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-load-track-at",
                trackIndex: trackIndex
            });
        }

        const track = this.playlist.tracks[trackIndex];

        //Request lyrics if a URI is present
        const lyricsDisplay = this.view.querySelector("#lyricsDisplay");
        lyricsDisplay.scrollTo(0, 0);
        if (track.lyricsURI) {
            fetch(`${window.location.protocol}//${window.location.host}/musix/${track.lyricsURI}`)
                .then(response => response.json())
                .then(data => {
                    for (let i = 0; i < data.blocks.length; i++) {
                        if (data.blocks[i][0].startsWith("Chorus") || data.blocks[i][0].startsWith("(x")) {
                            data.blocks[i][0] = `<span style="color: var(--themeColor)">${data.blocks[i][0]}</span>`;
                        }
                        data.blocks[i] = data.blocks[i].join("<br />");
                    }
                    lyricsDisplay.innerHTML = data.blocks.join("<br /><br />");
                })
                .catch(() => {
                    lyricsDisplay.innerHTML = '<span style="color: var(--themeColor)">Aw! Snap</span><br />Couldn\'t connect with the server';
                });
        } else {
            lyricsDisplay.innerHTML = "";
        }

        //Update mediaController
        this.mediaController.src = `${window.location.protocol}//${window.location.host}/musix/${track.path}`;
        this.mediaController.currentTime = 0;

        //Update playback state
        localStorage.setItem("currentTrackIndex", trackIndex.toString());

        //Update UI
        if (track.artist) {
            this.view.querySelector("#artistDisplay").textContent = track.artist;
        } else {
            this.view.querySelector("#artistDisplay").textContent = "Unknown Artist";
        }

        if (track.title) {
            this.view.querySelector("#titleDisplay").textContent = track.title;
        } else {
            this.view.querySelector("#titleDisplay").textContent = track.path.slice(track.path.lastIndexOf("/") + 1, track.path.lastIndexOf("."));
        }
    }

    seekTo(time) {
        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-seek-to",
                time: time
            });
        }

        this.mediaController.currentTime = time;
        //Update playback state
        localStorage.setItem("currentTrackTime", time.toString());
        //NOTE: UI Updating will be done by the ontimeupdate handler
    }

    togglePlay() {
        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-toggle-play"
            });
        } else {
            if (this.mediaController.paused) {
                this.mediaController.play();
            } else {
                this.mediaController.pause();
            }
        }
    }

    skipTrack(direction) {
        const upcomingTrackPosition = this.cardInterface.getPlaylistController().queryRelativeTrackPosition(direction);
        const playlist = this.cardInterface.getPlaylistController().getPlaylistAt(upcomingTrackPosition.playlistIndex);

        this.setPlaylist(playlist);
        this.loadTrackAt(upcomingTrackPosition.trackIndex);

        if (this.remotePlay) {
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-set-playlist",
                playlist: playlist
            });
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-load-track-at",
                trackIndex: upcomingTrackPosition.trackIndex
            });
            this.cardInterface.getWebSocket().emit("musix-broadcast", {
                eventName: "remote-toggle-play",
                trackIndex: upcomingTrackPosition.trackIndex
            });
        } else {
            //NOTE: Plying the song immediately must only be done only when not in a remote play session
            this.togglePlay();
        }
    }

    //EVENT HANDLER METHODS
    startSeek(event) {
        //NOTE: Seek isn't done in realtime. It is done as soon as the user leaves the seekSlider
        this.startSlide(event, () => {
            //Remove ontimeupdate from mediaController
            this.mediaController.removeEventListener("timeupdate", this.boundedHandlers.handleTimeUpdate);
        }, null, () => {
            //NOTE: We have to check is RemotePlay enabled
            if (this.remotePlay) {
                //NOTE: Only broadcasting the params is enough. No need to update our client
                //Get sliderValue
                const seekedTime = Utility.getCircularSliderValue(this.seekSlider, this.mediaController.duration);
                this.seekTo(seekedTime);
            } else {
                //Get sliderValue
                const seekedTime = Utility.getCircularSliderValue(this.seekSlider, this.mediaController.duration);
                //Set mediaController's currentTime to match seekedTime
                this.mediaController.currentTime = seekedTime;
                //Reinstate removed ontimeupdate of mediaController
                this.mediaController.addEventListener("timeupdate", this.boundedHandlers.handleTimeUpdate);
            }
        });
    }

    startSlide(event, executeBeforeDoSlide, executeWithDoSlide, executeAfterDoSlide) {
        //Get a reference of "event.currentTarget" for inner functions
        const slider = event.currentTarget;
        //Get the boundary of the slider
        const sliderRect = slider.getBoundingClientRect();
        //Calculate slider's center using sliderTrackPosition
        const sliderCenterX = (sliderRect.width / 2) + sliderRect.left;
        const sliderCenterY = (sliderRect.height / 2) + sliderRect.top;
        //Add eventListeners
        window.addEventListener("pointermove", doSlide);
        window.addEventListener("touchmove", doSlide);
        window.addEventListener("pointerup", endSlide);
        window.addEventListener("touchend", endSlide);
        //Execute additional functionality
        if (executeBeforeDoSlide) {
            executeBeforeDoSlide();
        }

        //INNER EVENT HANDLER FUNCTIONS
        function doSlide(event) {
            //Get mousePositions
            const pointerPositionY = event.clientY || event.touches[0].clientY;
            const pointerPositionX = event.clientX || event.touches[0].clientX;
            //Calculate lengths of the adjacentSide (distanceDifferenceY) and the oppositeSide (distanceDifferenceX) relative to sliderCenter;
            const distanceDifferenceX = sliderCenterX - pointerPositionX;
            const distanceDifferenceY = pointerPositionY - sliderCenterY;
            //Calculate theta(acute angle) after calculating tanTheta(absoluteValue)
            const tanTheta = Math.abs(distanceDifferenceX / distanceDifferenceY);
            let theta = Math.atan(tanTheta) * (180 / Math.PI);
            //Adjust theta considering circular sides
            if (distanceDifferenceX > 0 && distanceDifferenceY > 0) {
                theta = theta;
            } else if (distanceDifferenceX >= 0 && distanceDifferenceY < 0) {
                theta = 180 - theta;
            } else if (distanceDifferenceX < 0 && distanceDifferenceY < 0) {
                theta = 180 + theta;
            } else if (distanceDifferenceX <= 0 && distanceDifferenceY > 0) {
                theta = 360 - theta;
            } else if (distanceDifferenceX > 0 && distanceDifferenceY === 0) {
                theta = 90;
            } else if (distanceDifferenceX < 0 && distanceDifferenceY === 0) {
                theta = 270;
            }
            //Rotate slider theta degrees
            slider.style.transform = `rotate(${theta}deg)`;
            //Execute additional functionality
            if (executeWithDoSlide) {
                executeWithDoSlide();
            }
        }

        function endSlide() {
            //Remove added eventListeners
            window.removeEventListener("pointermove", doSlide);
            window.removeEventListener("touchmove", doSlide);
            window.removeEventListener("pointerup", endSlide);
            window.removeEventListener("touchend", endSlide);
            //Execute additional functionality
            if (executeAfterDoSlide) {
                executeAfterDoSlide();
            }
        }
    }

    handleTimeUpdate() {
        //Update playback state
        localStorage.setItem("currentTrackTime", this.mediaController.currentTime.toString());
        //Update UI
        Utility.setCircularSliderView(this.seekSlider, this.mediaController.duration, this.mediaController.currentTime);
    }
}

export class PlaylistController {
    cardInterface = null;
    playlists = [];

    constructor(cardInterface) {
        this.cardInterface = cardInterface;
    }

    init() {
        //Request playlist database and playlist metadata
        return fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/musix/playlists`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    this.playlists = response.data;
                    //Add each playlist's index as field in the playlist
                    for (let playlistIndex = 0; playlistIndex < this.playlists.length; playlistIndex++) {
                        this.playlists[playlistIndex].index = playlistIndex;
                    }
                } else if (response.serverError === "network") {
                    this.cardInterface.getNowPlayingController().view.querySelector("#lyricsDisplay").innerHTML = "Oops! Something's up with the network connection";
                } else {
                    alert(response.serverError);
                }
            });
    }

    getPlaylists() {
        return this.playlists;
    }

    getPlaylistAt(playlistIndex) {
        return this.playlists[playlistIndex];
    }

    getTrackAt(trackPosition) {
        return this.playlists[trackPosition.playlistIndex].tracks[trackPosition.trackIndex];
    }

    queryRelativePlaylistPosition(relativity) {
        const currentPlaylistIndex = parseInt(localStorage.getItem("currentPlaylistIndex"));
        if (relativity === "next") {
            const isFinalPlaylist = currentPlaylistIndex === this.playlists.length - 1;
            if (isFinalPlaylist) {
                return {
                    playlistIndex: 0
                };
            } else {
                return {
                    playlistIndex: currentPlaylistIndex + 1
                };
            }
        } else if (relativity === "previous") {
            const isFirstPlaylist = currentPlaylistIndex === 0;
            if (isFirstPlaylist) {
                return {
                    playlistIndex: this.playlists.length - 1
                };
            } else {
                return {
                    playlistIndex: currentPlaylistIndex - 1
                };
            }
        }
    }

    queryRelativeTrackPosition(relativity) {
        const currentPlaylistIndex = parseInt(localStorage.getItem("currentPlaylistIndex"));
        const currentTrackIndex = parseInt(localStorage.getItem("currentTrackIndex"));
        const currentPlaylist = this.playlists[currentPlaylistIndex];
        if (relativity === "next") {
            const isFinalPlaylist = currentPlaylistIndex === this.playlists.length - 1;
            const isFinalTrack = currentTrackIndex === currentPlaylist.tracks.length - 1;
            if (isFinalPlaylist && isFinalTrack) {
                //Case: Now playing is the final track of the final playlist
                //Return position of first track of the first playlist
                return {
                    playlistIndex: 0,
                    trackIndex: 0
                };
            } else if (isFinalTrack) {
                //Case: Now playing is the final track of the current playlist
                //Return position of first track of the next playlist
                return {
                    playlistIndex: currentPlaylistIndex + 1,
                    trackIndex: 0
                };
            } else {
                //Case: Now playing is not a final track or the final the playlist
                //Return position of next track of the current playlist
                return {
                    playlistIndex: currentPlaylistIndex,
                    trackIndex: currentTrackIndex + 1
                };
            }
        } else if (relativity === "previous") {
            const isFirstPlaylist = currentPlaylistIndex === 0;
            const isFirstTrack = currentTrackIndex === 0;
            if (isFirstPlaylist && isFirstTrack) {
                //Case: Now playing is the first track of the first playlist
                //Return position of final track of the final playlist
                return {
                    playlistIndex: this.playlists.length - 1,
                    trackIndex: this.playlists[this.playlists.length - 1].tracks.length - 1
                };
            } else if (isFirstTrack) {
                //Case: Now playing is the first track of the current playlist
                //Return position of final track of the previous playlist
                return {
                    playlistIndex: currentPlaylistIndex - 1,
                    trackIndex: this.playlists[currentPlaylistIndex - 1].tracks.length - 1
                };
            } else {
                //Case: Now playing is not a first track or the first the playlist
                //REturn position of previous track of the current playlist
                return {
                    playlistIndex: currentPlaylistIndex,
                    trackIndex: currentTrackIndex - 1
                };
            }
        }
    }

    appendPlaylist(playlist) {
        const assignedPlaylistIndex = this.playlists.push(playlist) - 1;
        playlist.index = assignedPlaylistIndex;
        //Randomize themeColor
        playlist.themeColor = Utility.getRandColor();

        this.cardInterface.getPlaylistExplorerController().appendNewPlaylistView(playlist);

        return assignedPlaylistIndex;
    }

    appendTrackToPlaylist(playlist, track) {
        const assignedTrackIndex = playlist.tracks.push(track) - 1;

        this.cardInterface.getPlaylistExplorerController().appendNewTrackView(playlist, {
            playlistIndex: playlist.index,
            trackIndex: assignedTrackIndex
        });

        return assignedTrackIndex;
    }

    addToQuickPlaylist(track) {
        if (localStorage.getItem("quickPlaylistIndex") === "-1") {
            //Case: There is no quick playlist created
            //Create the quick playlist in the playlists[]
            const quickPlaylist = PlaylistController.createNewPlaylist("Quick Playlist", track);
            const quickPlaylistIndex = this.appendPlaylist(quickPlaylist);
            localStorage.setItem("quickPlaylistIndex", quickPlaylistIndex.toString());
        } else {
            //Case: There is a quick playlist created
            const quickPlaylistIndex = parseInt(localStorage.getItem("quickPlaylistIndex"));
            const quickPlaylist = this.playlists[quickPlaylistIndex];
            //Add the specified track as the last track of the quick playlist
            this.appendTrackToPlaylist(quickPlaylist, track);
        }
    }

    /* 
    =====================================================================================
    Utility Methods
    =====================================================================================
    */
    static createNewPlaylist(playlistName, initialTrack) {
        //Initialize a new playlist
        const newPlaylist = {
            name: playlistName,
            themeColor: Utility.getRandColor(),
            index: null,
            tracks: [

            ]
        };
        newPlaylist.tracks.push(initialTrack);

        return newPlaylist;
    }
}

export class PlaylistExplorerController {
    cardInterface = null;

    view = null;
    playlistViewTemplate = null;
    trackViewTemplate = null;
    trackContextPopUp = document.getElementById("trackContextPopUp");

    constructor(cardInterface, panelView) {
        this.cardInterface = cardInterface;

        this.view = panelView;
        this.playlistViewTemplate = this.cardInterface.getTemplate(".panelDivisionSector");
        this.trackViewTemplate = this.cardInterface.getTemplate(".panelDivisionSectorItem");

        const playlists = this.cardInterface.getPlaylistController().getPlaylists();
        //Load playlistExplorer
        //NOTE: A DocumentFragment is used to improve performance
        const playlistViewContainerFragment = new DocumentFragment();
        for (let playlistIndex = 0; playlistIndex < playlists.length; playlistIndex++) {
            const playlistView = this.createPlaylistView(playlists[playlistIndex]);
            playlistViewContainerFragment.appendChild(playlistView);
        }
        this.view.firstElementChild.appendChild(playlistViewContainerFragment);

        this.view.querySelector("#addPlaylistButton").addEventListener("click", () => {
            const directoryPath = prompt("Specify an absolute directory path for your playlist");
            if (directoryPath) {
                //Fetch a playlist for the directoryPath
                fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/playlists?directoryPath=${directoryPath}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => response.json())
                    .then(response => {
                        if (response.status) {
                            this.cardInterface.getPlaylistController().appendPlaylist(response.data);
                        } else {
                            alert(response.serverError.message);
                        }
                    });
            }
        });
    }

    getView() {
        return this.view;
    }

    appendNewPlaylistView(playlist) {
        const playlistView = this.createPlaylistView(playlist);
        this.view.firstElementChild.appendChild(playlistView);
    }

    appendNewTrackView(playlist, trackPosition) {
        //NOTE: Playlist's index matches its playlistView index inside playlistViewController
        const playlistView = this.view.firstElementChild.children[playlist.index];
        const trackView = this.createTrackView(trackPosition);
        playlistView.appendChild(trackView);
    }

    createPlaylistView(playlist) {
        const playlistView = this.playlistViewTemplate.cloneNode(true);
        playlistView.firstElementChild.textContent = playlist.name;
        playlistView.firstElementChild.style.color = playlist.themeColor;

        for (let trackIndex = 0; trackIndex < playlist.tracks.length; trackIndex++) {
            const trackView = this.createTrackView({ playlistIndex: playlist.index, trackIndex: trackIndex });
            playlistView.appendChild(trackView);
        }

        return playlistView;
    }

    createTrackView(trackPosition) {
        const playlists = this.cardInterface.getPlaylistController().getPlaylists();
        const trackView = this.trackViewTemplate.cloneNode(true);
        if (playlists[trackPosition.playlistIndex].tracks[trackPosition.trackIndex].title) {
            trackView.textContent = playlists[trackPosition.playlistIndex].tracks[trackPosition.trackIndex].title;
        } else {
            const track = playlists[trackPosition.playlistIndex].tracks[trackPosition.trackIndex];
            trackView.textContent = track.path.slice(track.path.lastIndexOf("/") + 1, track.path.lastIndexOf("."))
        }
        trackView.dataset.playlistIndex = trackPosition.playlistIndex.toString();
        trackView.dataset.trackIndex = trackPosition.trackIndex.toString();

        trackView.addEventListener("click", (event) => {
            this.cardInterface.getNowPlayingController().setPlaylist(this.cardInterface.getPlaylistController().getPlaylistAt(trackPosition.playlistIndex))
            this.cardInterface.getNowPlayingController().loadTrackAt(trackPosition.trackIndex);
            this.cardInterface.getNowPlayingController().togglePlay();
        });

        trackView.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.cardInterface.getPlaylistController().addToQuickPlaylist(this.cardInterface.getPlaylistController().getTrackAt(trackPosition));
            trackView.classList.add("marked");
        });

        return trackView;
    }
}

export class Utility {
    static getCircularSliderValue(slider, rangeUpperLimit) {
        //Get sliderValue as theta
        const thetaString = slider.style.transform;
        const theta = thetaString.slice(7, thetaString.length - 4);
        //Calculate currentSeekedValue according to theta
        const unit = rangeUpperLimit / 360;
        const currentSeekedValue = theta * unit;
        //Output currentSeekedValue
        return currentSeekedValue;
    }

    static setCircularSliderView(slider, rangeUpperLimit, value) {
        //Calculate the size of a single unit (seconds per degree)
        const unit = rangeUpperLimit / 360;
        //Calculate theta using currentTime
        const theta = value / unit;
        //Rotate seekSlider theta degrees
        slider.style.transform = `rotate(${theta}deg)`;
    }

    static formatTime(totalSeconds) {
        //Calculate time to HH:MM:SS format
        const minutesAsFraction = totalSeconds / 60;
        let wholeMinutes = Math.floor(minutesAsFraction);
        let resultingSeconds = Math.round(60 * (minutesAsFraction - wholeMinutes));
        //Format integers for leading zeros
        if (wholeMinutes < 10) { wholeMinutes = "0" + wholeMinutes; }
        if (resultingSeconds < 10) { resultingSeconds = "0" + resultingSeconds; }
        //Output formatted time
        return (wholeMinutes + ":" + resultingSeconds);
    }

    static getRandInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandColor() {
        return `rgb(${Utility.getRandInt(100, 255)}, ${Utility.getRandInt(100, 255)}, ${Utility.getRandInt(100, 255)})`;
    }
}