#Known Bugs
* Text box inside loginScreenView doesn't focus immediately
* Closing a card won't close its child popUpCards

#Solved
* Scrolling doesn't trigger updateCardStyles() on firefox (mostly a firefox bug)
    - Solved by Mozilla
* Keypress event on workspaceScreenView is not triggering
    - Added the keypress event to document body
