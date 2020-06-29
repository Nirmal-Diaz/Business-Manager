//@ts-check
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