//@ts-check
import { Utility } from "./Utility.js";

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