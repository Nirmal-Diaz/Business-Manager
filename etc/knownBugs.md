#Known Bugs
* Text box inside loginScreenView doesn't focus immediately
* Most of the pointer-based events won't work with touch screens on Chrome (entirely a Chrome bug)
* Search UI won't collapse after pressing enter in firefox (mostly a firefox bug)

#Solved
* Closing a card won't close its child popUpCards
    - Added relevant functionality
* Scrolling doesn't trigger updateCardStyles() on firefox (mostly a firefox bug)
    - Solved by Mozilla
* Keypress event on workspaceScreenView is not triggering
    - Added the keypress event to document body
