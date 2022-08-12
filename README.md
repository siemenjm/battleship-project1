# Battleship - Project 1 Browser-based Game
Battleship is a two-player game in which the goal is to sink all of your opponent's ships before they sink yours. You must search the ocean for their fleet and once found, call down cannon-strikes onto their positions until they are destroyed. Beware, they fire back!!!

My version of the game is pirate-themed instead of modern-navy-themed, and is single player vs the computer. Both player's gameboards are randomly generated, as well as which coordinates are attacked.

See official Hasbro rules: https://www.hasbro.com/common/instruct/battleship.pdf

## Link To Game
[Battleship - Project 1 Browser-based Game](https://siemenjm.github.io/battleship-project1/)

![Main Screen](https://github.com/siemenjm/battleship-project1/blob/main/screenshots/play_screen.png)

## MVP User Stories
As a player, I want to be able to:
* have my ships randomly placed on the gameboard
* randomly choose where to attack the enemy player without choosing already hit/missed coordinates
* see how many hits my ships have taken and how many ships I have left
* see where I have already attacked and denote hits and misses
* track how many enemy ships that I have sunk/how many are left
* see where the enemy has already attacked
* have the enemy ships hidden from my view until they are hit
* automatically switch views between my board and the enemy board depending on the turn
* be able to manually switch views between my board and the enemy board
* reset the game board
* be notified of win or loss

As the computer, I want to be able to:
* have my ships randomly placed on the gameboard
* randomly choose where to attack the enemy player without choosing already hit/missed coordinates

## MVP+ User Stories
As a player, I want to be able to:
* enter my pirate name into the game
* choose where my ships are placed on the gameboard
* choose where to attack the enemy player by clicking on an unchosen coordinate
* place markers on the gameboard where I think enemy ships might be
* choose from a list of weapons before the game starts and use them when I choose
* be able to see a game log tracking gameplay
* choose between color themes (light/dark, maybe choose ship colors...)

As the computer, I want to be able to:
* when I score a hit, prioritize nearby squares for attack unless ship was sunk
* add random time intervals between when the player fires and when I fire to make me seem more human (not immediately attack)

## Wireframe
Here is a wireframe of the start screen, showing inputs for player name and other stretch features, along with a button to start the game.

![Start Screen](https://github.com/siemenjm/battleship-project1/blob/main/wireframe/start_screen.png)

The player would then move on to the main play screen, which displays turn information, ship information, action buttons, and the gameboard itself.

![Main Screen](https://github.com/siemenjm/battleship-project1/blob/main/wireframe/player_screen_own_fleet.png)

## Getting Started
When the game first starts, you'll be prompted to enter your pirate name. My go-to is No-beard or Peach-fuzz. Have fun with it!

![Start Screen](https://github.com/siemenjm/battleship-project1/blob/main/screenshots/start_screen.png)

After choosing your name, you'll be shown your fleet that has been randomly placed across the sea. You'll also be able to see the health of both your ships and your opponents ships, in addition to seeing who's turn it is and which fleet is currently visible.

![Main Screen](https://github.com/siemenjm/battleship-project1/blob/main/screenshots/play_screen.png)

Take your turn by clicking on the "Fire Away!" button. This will switch your view to the enemy's fleet (which is hidden), and allows you to click on a square to attack. If your cannon shot hit an enemy ship, it will turn red! Otherwise, it will turn white...

The view will then automatically switch to your own fleet, and shortly after Blackbeard will send some cannon-fire your way. Luckily, Blackbeard doesn't have the best eyesight and just randomly shoots at your fleet.

![Mid-game Screen](https://github.com/siemenjm/battleship-project1/blob/main/screenshots/midgame_screen.png)

If you are unsure about what has happened, take a look at the Game Log in the lower right of the screen. It logs every cannon shot that is fired, with details of the attack.

Finally, once you've sunk (sank?) all of Blackbeard's ships, an end-game screen will pop up, congratulating you and offering a rematch.

![End-game Screen](https://github.com/siemenjm/battleship-project1/blob/main/screenshots/endgame_screen.png)

Note: You can always surrender and come back with a new fleet if Blackbeard is somehow getting the upper hand by clicking on the "Wave white flag..." button.

## Technologies Used
* HTML
* CSS
* JavaScript

## Favorite Chuck of Code
My favorite chunk of code involves using setTimeout in JavaScript to automate the computers attack after the player makes an attack. The sequence starts when a square on the computer's gameboard is clicked. It then checks to make sure that clicking that particular square was a successful attack (not an already-clicked square) and toggles the turn indicator immediately, switches to the player's gameboard after TOGGLE_DURATION, and finally attacks the player's fleet after COMPUTER_DURATION (which is longer than TOGGLE_DURATION). If the click attack is not successful, the player is still able to click on another square.

Note: The "Fire Away!" button is unable to be pressed during this phase. It is disabled in clickAttack() and not enabled until computerAttack().
```javascript
function pauseAttacks(e) {
    clearTimeout(toggleTimer);
    clearTimeout(computerTimer);

    let isSuccessfulAttack = clickAttack(e);

    if (isSuccessfulAttack) {
        toggleTurnIndicator('player');

        toggleTimer = setTimeout(toggleToPlayerBoard, TOGGLE_DURATION);
        computerTimer = setTimeout(computerAttack, COMPUTER_DURATION);
    }
    
}
```

## Next Steps
I would still eventually like to add the following features:
* Allow player to manually place their ships
* Make the computer smarter by prioritizing squares near previous hits
* Implement special weapons that have special effects (i.e. an attack that doesn't do any damage but reveals ships in a 4x4 area)
* Have different color themes
* Add CSS animations

This was an extremely challenging, yet rewarding project. I look forward to implementing what I learned here in future projects!