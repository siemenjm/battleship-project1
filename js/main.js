/**
 * Constants -----
 */
const ROWS = 10;
const COLUMNS = 10;
const DIRECTIONS = ['up', 'right', 'down', 'left'];
const DELAY_ATTACK_DURATION = 500;

/**
 * Game state variables -----
 */
let isGameActive
let currentTurn;
let isClickAttack;
let delayAttackTimer;
let competitors = {};
let gameboards = {};
let ships = {};

/**
 * DOM node references -----
 */

const startModal = document.querySelector('.start-modal');
const mainContainer = document.querySelector('main');
const boardIndicators = document.querySelectorAll('.board-indicator');
const gameboardContainer = document.querySelector('.gameboard-container');
const gameLogContainer = document.querySelector('.game-log-event-container');
const winnerModal = document.querySelector('.winner-modal');

const startBtn = document.querySelector('.start-btn');
const fireBtn = document.querySelector('.fire-btn');
const toggleGameboardsBtn = document.querySelector('.toggle-gameboards-btn');
const seeResultsBtn = document.querySelector('.show-main-btn');
const resetBtns = document.querySelectorAll('.reset-btn');

/**
 * Event listeners -----
 */

startBtn.addEventListener('click', function(e) {
    e.preventDefault();

    startModal.classList.add('hidden');
    mainContainer.classList.remove('hidden');

    let playerNameInput = document.querySelector('#player-name');
    competitors.player.name = playerNameInput.value;
    renderFleetNames();
});

fireBtn.addEventListener('click', attackHandler);

// autoFireBtn.addEventListener();

toggleGameboardsBtn.addEventListener('click', toggleGameboards);

seeResultsBtn.addEventListener('click', function() {
    winnerModal.classList.add('hidden');
    mainContainer.classList.remove('hidden');
});

resetBtns.forEach(function(button) {
    button.addEventListener('click', function() {
        competitors = {};
        gameboards = {};
        ships = {};
    
        while (gameboardContainer.firstChild) {
            gameboardContainer.removeChild(gameboardContainer.firstChild);
        }
    
        while (gameLogContainer.firstChild) {
            gameLogContainer.removeChild(gameLogContainer.firstChild);
        }

        mainContainer.classList.remove('hidden');
        winnerModal.classList.add('hidden');
        
        resetHealthBarAndText();
        resetTurnIdicators();
        resetBoardIndicators();
    
        init();
        render();      
    });
});

/**
 * Classes -----
 */
class Gameboard {
    constructor(columns, rows) {
        this.columns = columns;
        this.rows = rows;
        this.squares = [];
    }

    createGameboard() {
        for (let row = 1; row <= this.rows; row++) {
            for (let col = 1; col <= this.columns; col++) {
                let newSquare = new Square(col, row);
                this.squares.push(newSquare);
            }
        }
    }

    populateGameboard(competitorShips) {
        for (let ship in competitorShips) {
            let isShipPlaced = false;
            while (!isShipPlaced) {
                // need to choose random square from current gameboard
                let randomCoordinates = this._generateRandomCoordinates();
                
                // find random square in gameboard
                let randomSquare = this._findSquare(randomCoordinates);
    
                // ensure randomSquare is empty
                while(!randomSquare.isEmpty) {
                    randomCoordinates = this._generateRandomCoordinates();
                    randomSquare = this._findSquare(randomCoordinates);
                }
                
                // place ship once direction is found that is available
                let availableDirections = [...DIRECTIONS];
                isShipPlaced = this._checkAllDirections(competitorShips[ship], randomCoordinates, availableDirections);
    
                if (!isShipPlaced) {
                    console.log(competitorShips[ship].name, ': WASNT PLACED DUE TO DIRECTIONS');
                }
            }
        }
    }

    _generateRandomCoordinates() {
        let randomColumn = Math.ceil(Math.random() * COLUMNS);
        let randomRow = Math.ceil(Math.random() * ROWS);
        
        return [randomColumn, randomRow];
    }

    _findSquare(coordinates) {
        let squareArray = this.squares.filter(function(square) {
            return square.xCoordinate === coordinates[0] && square.yCoordinate === coordinates[1];
        });
        
        return squareArray[0];
    }

    _checkAllDirections(ship, coordinates, availableDirections) {
        while(availableDirections.length > 0) {
            // choose random direction to start checking for empty squares (up, down, left, right)
            let randomIndex = Math.floor(Math.random() * availableDirections.length);
            let randomDirection = availableDirections[randomIndex];
            
            // check if there are enough squares and that the squares are empty in the chosen direction
            let isThereRoom = this._checkDirection(ship, coordinates, randomDirection);

            
            // if isThereRoom === true, we can break out of the while-loop.
            if (isThereRoom) {
                //place ship
                this._placeShip(ship, coordinates, randomDirection);

                // console.log(ships[ship].name, ', coordinates: ', coordinates, ' randomDirection: ', randomDirection, ', isThereRoom: ', isThereRoom); 
                
                return true;
                // if isThereRoom === false, remove randomDirection from availableDirections and run loop again
            } else {
                availableDirections.splice(randomIndex, 1);
            }
            
            // console.log(ships[ship].name, ', coordinates: ', coordinates, ' randomDirection: ', randomDirection, ', isThereRoom: ', isThereRoom); 
        }
    }
    
    _checkDirection(ship, coordinates, direction) {
        let isThereRoom = true;
        for (let i = 1; i < ship.length; i++) {
            if (direction === 'up') {
                // need to see if there are enough squares for ship to fit
                if (coordinates[1] - (ship.length - 1) <= 0) {
                    isThereRoom = false;
                    break;
                }

                // get new coordinates in up direction
                let newCoordinates = [coordinates[0], coordinates[1] - i];
                
                // find that square in the squares array
                let currentSquare = this._findSquare(newCoordinates);
                
                // check if square is empty
                // TODO: HAS NOT BEEN TESTED YET
                if (!currentSquare.isEmpty) {
                    isThereRoom = false;

                    break; // leaves for-loop
                }
            } else if (direction === 'right') {
                if (coordinates[0] + (ship.length - 1) > 10) {
                    isThereRoom = false;

                    break;
                }
                
                let newCoordinates = [coordinates[0] + i, coordinates[1]];
                let currentSquare = this._findSquare(newCoordinates);
                
                if (!currentSquare.isEmpty) {
                    isThereRoom = false;
                    
                    break;
                }
            } else if (direction === 'down') {
                if (coordinates[1] + (ship.length - 1) > 10) {
                    isThereRoom = false;

                    break;
                }
                
                let newCoordinates = [coordinates[0], coordinates[1] + i];
                let currentSquare = this._findSquare(newCoordinates);
                
                if (!currentSquare.isEmpty) {
                    isThereRoom = false;
                    
                    break;
                }
            } else if (direction === 'left') {
                if (coordinates[0] - (ship.length - 1) <= 0) {
                    isThereRoom = false;

                    break;
                }

                let newCoordinates = [coordinates[0] - i, coordinates[1]];
                let currentSquare = this._findSquare(newCoordinates);

                if (!currentSquare.isEmpty) {
                    isThereRoom = false;

                    break;
                }
            }
        }

        return isThereRoom;
    }

    _placeShip(ship, startingCoordinates, direction) {
        let currentSquare = this._findSquare(startingCoordinates);
        this._placeSquare(ship, currentSquare);

        // go through all squares in direction up to ship length
        for (let i = 1; i < ship.length; i++) {
            if (direction === 'up') {
                // get new coordinates in up direction
                let newCoordinates = [startingCoordinates[0], startingCoordinates[1] - i];
                
                // find that square in the squares array
                let currentSquare = this._findSquare(newCoordinates);

                // place the square
                this._placeSquare(ship, currentSquare);

            } else if (direction === 'right') {                
                let newCoordinates = [startingCoordinates[0] + i, startingCoordinates[1]];
                let currentSquare = this._findSquare(newCoordinates);
                this._placeSquare(ship, currentSquare);

            } else if (direction === 'down') {
                let newCoordinates = [startingCoordinates[0], startingCoordinates[1] + i];
                let currentSquare = this._findSquare(newCoordinates);
                this._placeSquare(ship, currentSquare);

            } else if (direction === 'left') {
                let newCoordinates = [startingCoordinates[0] - i, startingCoordinates[1]];
                let currentSquare = this._findSquare(newCoordinates);
                this._placeSquare(ship, currentSquare);

            }
        }
    }

    _placeSquare(ship, square) {
        // change isEmpty to false for each square
        square.isEmpty = false;
        
        // add containedShip to each square
        square.containedShip = ship;

        // add square to ship.spacesOccupied
        ship.spacesOccupied.push(square);
    }
}

class Square {
    constructor(xCoordinate, yCoordinate) {
        this.xCoordinate = xCoordinate;
        this.yCoordinate = yCoordinate;
        this.isEmpty = true;
        this.isHit = false;
        this.isMiss = false;
        this.containedShip = {};
    }

    // add toggle method to booleans?
    // add addShip method?
}

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.health = length;
        this.spacesOccupied = [];
        this.spacesHit = [];
        this.isAfloat = true;
    }

    // add methods here
}

class Competitor {
    constructor(name, gameboard) {
        this.name = name;
        this.gameboard = gameboard;
    }
}

/**
 * Functions -----
 */

function init() {
    isGameActive = true;

    // build ships
    // TODO: MIGHT NEED TO ADD OWNER TO CLASS
    ships.player = {};
    ships.player.shipOfTheLine = new Ship('Ship of the Line', 5);
    ships.player.frigate = new Ship('Frigate', 4);
    ships.player.galley = new Ship('Galley', 3);
    ships.player.brigantine = new Ship('Brigantine', 3);
    ships.player.sloop = new Ship('Sloop', 2);
    
    ships.computer = {};
    ships.computer.shipOfTheLine = new Ship('Ship of the Line', 5);
    ships.computer.frigate = new Ship('Frigate', 4);
    ships.computer.galley = new Ship('Galley', 3);
    ships.computer.brigantine = new Ship('Brigantine', 3);
    ships.computer.sloop = new Ship('Sloop', 2);

    // // Win Condition Testing --------------------------
    // ships.player = {};
    // ships.player.shipOfTheLine = new Ship('Ship of the Line', 1);
    // ships.player.frigate = new Ship('Frigate', 1);
    // ships.player.galley = new Ship('Galley', 1);
    // ships.player.brigantine = new Ship('Brigantine', 1);
    // ships.player.sloop = new Ship('Sloop', 1);
    
    // ships.computer = {};
    // ships.computer.shipOfTheLine = new Ship('Ship of the Line', 1);
    // ships.computer.frigate = new Ship('Frigate', 1);
    // ships.computer.galley = new Ship('Galley', 1);
    // ships.computer.brigantine = new Ship('Brigantine', 1);
    // ships.computer.sloop = new Ship('Sloop', 1);
    // // Win Condition Testing --------------------------

    // build gameboard (one each for player and computer)
    gameboards.player = new Gameboard(COLUMNS, ROWS);
    gameboards.player.createGameboard();
    gameboards.player.populateGameboard(ships.player);
    gameboards.computer = new Gameboard(COLUMNS, ROWS);
    gameboards.computer.createGameboard();
    gameboards.computer.populateGameboard(ships.computer);
    
    // initialize competitors
    // TODO: might need to add ships to class
    // TODO: eventually remove hard-coded names
    competitors.player = new Competitor('No-beard', gameboards.player);
    competitors.computer = new Competitor('Blackbeard', gameboards.computer);

    // initialize currentTurn here, can i just put "player" and put at top of init?
    currentTurn = Object.keys(competitors)[0];
}

function render() {
    renderGameboard(); 
    renderShips();
    renderShipInfo();
    renderFleetNames();
}

/**
 * Gamestate helper functions -----
 */

// function addAttackListeners(gameboard) {
//     console.log("ADDING ATTACK LISTENERS TO COMPUTER GAMEBOARD");
    
//     //add event listener to squares
//     let squares = gameboard.querySelectorAll('.computer-square');
//     squares.forEach(function(square) {
//         square.addEventListener('click', doubleAttack);
//     });
// }

function attackHandler(e) {
    if (isGameActive) {
        clearTimeout(delayAttackTimer);
        fireBtn.disabled = true;
        
        // get attacker
        let attacker = currentTurn;
    
        // get defender
        let defender;
        if (currentTurn === 'player') {
            defender = 'computer';
        } else {
            defender = 'player';
        }
    
        // toggle to defenders gameboard
        toggleToDefendingGameboard(defender);
        
        let isAttacked;
        if (isClickAttack) {
            isAttacked = clickAttack(e, attacker, defender);
            fireBtn.disabled = false;
            
            if (!isAttacked) {
                return isAttacked;
            }
        } else {
            // delay attack after pressing fire briefly to see it happen on correct gameboard
            delayAttackTimer = setTimeout(function() {
                isAttacked = randomlyAttack(attacker, defender);
                while (!isAttacked) {
                    isAttacked = randomlyAttack(attacker, defender);
                }
        
                fireBtn.disabled = false;
            }, DELAY_ATTACK_DURATION);
        }

        // toggle to attackers turn indicator
        toggleTurnIndicator(attacker);

        //change who's turn it is
        if (currentTurn === 'player') {
            currentTurn = 'computer';
        } else {
            currentTurn = 'player';
        }

        return isAttacked;
    }
}

function checkWinCondition(competitor) {
    console.log('CHECKING FOR WIN CONDITION');

    // if competitors ships are all sunk, return true
    let competitorShips = ships[competitor];
    for (let ship in competitorShips) {
        if (competitorShips[ship].isAfloat) {
            return
        }
    }

    // declare winner
    console.log('WE HAVE A WINNER');

    mainContainer.classList.add('hidden');

    let winnerHeader = winnerModal.querySelector('h2');
    let winnerMessage = winnerModal.querySelector('.winner-message');
    
    if (competitor === 'player') {
        winnerHeader.innerText = 'Sorry...';
        winnerMessage.innerText = 'Blackbeard sank all your ships and stole your treasure. Try Again?';
    } else {
        winnerHeader.innerText = 'Success!';
        winnerMessage.innerText = 'You sank all of Blackbeard\'s ships and took his treasure for yourself! But at what cost?...';
    }

    winnerModal.classList.remove('hidden');

    isGameActive = false;
}

// function clickAttack(e, attacker, defender) {
//     let currentGameboard = competitors[defender].gameboard;
//     // get coordinates from event
//     squareCoordinates = [parseInt(e.target.dataset.column), parseInt(e.target.dataset.row)];
//     let clickedSquare = findSquare(currentGameboard, squareCoordinates);

//     // check to see if square is already hit/miss. do nothing if it is
//     if (!clickedSquare.isHit && !clickedSquare.isMiss) {
//         console.log(`${competitors[attacker].name} FIRED!!!`);

//         // check to see if there is a ship there
//         if (!clickedSquare.isEmpty) {
//             // mark square as hit
//             clickedSquare.isHit = true;
    
//             // check which ship was hit
//             let hitShip = clickedSquare.containedShip;
    
//             // adjust ships health
//             hitShip.health -= 1;

//             // check if ship still has health
//             if (hitShip.health === 0) {
//                 // set isAfloat to false
//                 hitShip.isAfloat = false;
                
//                 console.log(`HIT!!! There is a ${hitShip.name} here at coords ${clickedSquare.xCoordinate}, ${clickedSquare.yCoordinate}! It now has ${hitShip.health}/${hitShip.length}HP. The ship has sunk!`);

//                 // check for win here
//                 if (checkWinCondition(defender)) {
//                     declareWinner();
//                 }
                
//             } else {
//                 console.log(`HIT!!! There is a ${hitShip.name} here at coords ${clickedSquare.xCoordinate}, ${clickedSquare.yCoordinate}! It now has ${hitShip.health}/${hitShip.length}HP.`);
//             }
            
//             renderShipInfo();
    
//         } else {
//             console.log(`MISS!!! There is no ship here at coords ${clickedSquare.xCoordinate}, ${clickedSquare.yCoordinate}...`)
    
//             // mark square as miss
//             clickedSquare.isMiss = true;
//         }

//         // renderAttack here, after there was either a hit or miss
//         renderAttacks(defender, currentGameboard);

//         // add last move to game log
//         addToGameLog(attacker, clickedSquare);

//         // return true, indicating attack was available on square
//         return true;

//     } else {
//         // return false, indicating attack was not available on square
//         return false;
//     }
// }

// function doubleAttack(e) {
//     isClickAttack = true;
//     let isAttacked = attackHandler(e);
//     isClickAttack = false;

    
//     if (isAttacked) {
//         pause(DELAY_ATTACK_DURATION);

//         attackHandler(e);
//     } else {
//         console.log('CHOOSE DIFFERENT SQUARE');
//     }
// }

function findSquare(gameboard, coordinates) {
    let squareArray = gameboard.squares.filter(function(square) {
        return square.xCoordinate === coordinates[0] && square.yCoordinate === coordinates[1];
    });
    
    return squareArray[0];
}

function generateRandomCoordinates() {
    let randomColumn = Math.ceil(Math.random() * COLUMNS);
    let randomRow = Math.ceil(Math.random() * ROWS);
    
    return [randomColumn, randomRow];
}

function pause(duration) {
    let startTime = new Date();
    let currentTime = null;
    while (currentTime - startTime < duration) {
        currentTime = new Date();
    }
}

function randomlyAttack(attacker, defender) {
    // get who's gameboard we are attacking
    let currentGameboard = competitors[defender].gameboard;
    
    // get random square in that gameboard
    let randomCoordinates = generateRandomCoordinates();
    let randomSquare = findSquare(currentGameboard, randomCoordinates);
    
    // check to see if square is already hit/miss. do nothing if it is
    if (!randomSquare.isHit && !randomSquare.isMiss) {
        console.log(`${competitors[attacker].name} FIRED!!!`);

        // check to see if there is a ship there
        if (!randomSquare.isEmpty) {
            // mark square as hit
            randomSquare.isHit = true;
    
            // check which ship was hit
            let hitShip = randomSquare.containedShip;
    
            // adjust ships health
            hitShip.health -= 1;

            // check if ship still has health
            if (hitShip.health === 0) {
                // set isAfloat to false
                hitShip.isAfloat = false;
                
                console.log(`HIT!!! There is a ${hitShip.name} here at coords ${randomSquare.xCoordinate}, ${randomSquare.yCoordinate}! It now has ${hitShip.health}/${hitShip.length}HP. The ship has sunk!`);

                // check for win here
                if (checkWinCondition(defender)) {
                    declareWinner();
                }
                
            } else {
                console.log(`HIT!!! There is a ${hitShip.name} here at coords ${randomSquare.xCoordinate}, ${randomSquare.yCoordinate}! It now has ${hitShip.health}/${hitShip.length}HP.`);
            }
            
            renderShipInfo();
    
        } else {
            console.log(`MISS!!! There is no ship here at coords ${randomSquare.xCoordinate}, ${randomSquare.yCoordinate}...`)
    
            // mark square as miss
            randomSquare.isMiss = true;
        }

        // renderAttack here, after there was either a hit or miss
        renderAttacks(defender, currentGameboard);

        // add last move to game log
        addToGameLog(attacker, randomSquare);

        // return true, indicating attack was available on square
        return true;

    } else {
        console.log('CHOSEN SQUARE ALREADY ATTACKED!!!');

        // return false, indicating attack was not available on square
        return false;
    }
}

/** 
 * Rendering helper functions -----
*/

function addToGameLog(player, square) {
    logString = createLogString(player, square);

    let logStringElement = document.createElement('p');
    logStringElement.innerText = logString;
    logStringElement.classList.add('game-log-event');

    colorLogString(player, square, logStringElement);

    gameLogContainer.prepend(logStringElement);
}

function assignVisibility(competitor, gameboard) {
    if (competitor === 'player') {
        gameboard.classList.add('visible-gameboard');
    } else if (competitor ==='computer') {
        gameboard.classList.add('hidden-gameboard');
    } else {
        alert('Invalid competitor input');
    }
}

function changeHealthBar(ship, shipDOMNode) {
    let healthBar = shipDOMNode.querySelector('.ship-health-bar');

    if (ship.health === 0) {
        healthBar.style.width = '100%';
        healthBar.style.backgroundColor = 'red';
    } else {
        let healthBarWidth = (ship.health / ship.length) * 100;

        healthBar.style.width = `${healthBarWidth}%`;
    }
}

function changeHealthText(ship, shipDOMNode) {
    let healthText = shipDOMNode.querySelector('.ship-health');
    healthText.innerText = `${ship.health}/${ship.length} HP`;
}

function colorLogString(player, square, log) {
    if (player === 'player') {
        log.classList.add('player-log');
    } else {
        log.classList.add('computer-log');
    }

    if (square.isHit) {
        log.classList.add('hit-log');
    }
}

function convertCoordinates(coordinate) {
    switch (coordinate) {
        case 1:
            return 'A';
        case 2:
            return 'B';
        case 3:
            return 'C';
        case 4:
            return 'D';
        case 5:
            return 'E';
        case 6:
            return 'F';
        case 7:
            return 'G';
        case 8:
            return 'H';
        case 9:
            return 'I';
        case 10:
            return 'J';
    }
}

function createLogString(player, square) {
    // "Player Name attacks coordinates. hit/miss. ship."
        let logString;

        let yCoordinate = convertCoordinates(square.yCoordinate);
        let coordinates = [yCoordinate, square.xCoordinate];
        let attackResult;
        if (square.isHit) {
            attackResult = 'Hit';
            let ship = square.containedShip.name;
            logString = `${competitors[player].name} attacks ${coordinates[0]}-${coordinates[1]}. ${attackResult}. ${ship}.`;
        } else if (square.isMiss) {
            attackResult = 'Miss';
            logString = `${competitors[player].name} attacks ${coordinates[0]}-${coordinates[1]}. ${attackResult}.`;
        }
    
        return logString;
}

function findShipDOM(ship, competitor) {
    // format ship name to match CSS
    let shipName = ship.name.toLowerCase().replace(/ /g, '-');

    let shipDOMNodes = document.querySelectorAll(`.${shipName}`);

    let shipDOMNode;
    for (let i = 0; i < shipDOMNodes.length; i++) {
        if (shipDOMNodes[i].classList.contains(`${competitor}-ship`)) {
            shipDOMNode = shipDOMNodes[i];
        }
    }
    
    return shipDOMNode;
}

function findSquareDOM(square) {
    // get DOM squares with 'data-column' attribute equal to square.xCoordinate
    let xCoordinateColumnsNodeList = document.querySelectorAll(`[data-column='${square.xCoordinate}']`);
    let xCoordinateColumns = Array.prototype.slice.call(xCoordinateColumnsNodeList);

    // from the list of columns with xCoordinate, find yRows that match square.yCoordinate
    let yCoordinateRows = xCoordinateColumns.filter(function(element) {
        return element.dataset.row === square.yCoordinate.toString();
    });

    return yCoordinateRows;
}

function renderAttacks(turn, gameboard) {
    let squares = gameboard.squares;

    renderHits(turn, squares);
    renderMisses(turn, squares);
}

function renderFleetNames() {
    let playerFleetName = document.querySelector('.player-fleet-name');
    playerFleetName.innerText = `${competitors.player.name}'s Fleet`;
    
    let computerFleetName = document.querySelector('.computer-fleet-name');
    computerFleetName.innerText = `${competitors.computer.name}'s Fleet`;
}

function renderGameboard() {
    for (let competitor in competitors) {
        let competitorGameboard = document.createElement('div');
        competitorGameboard.classList.add(`${competitor}-gameboard-container`);
        
        assignVisibility(competitor, competitorGameboard);
        
        
        gameboardContainer.appendChild(competitorGameboard);
        
        for (let row = 1; row <= ROWS; row++) {
            for (let col = 1; col <= COLUMNS; col++) {
                let squareDiv = document.createElement('div');
                squareDiv.classList.add('square');
                squareDiv.classList.add(`${competitor}-square`);
                squareDiv.setAttribute('data-column', col);
                squareDiv.setAttribute('data-row', row);
                
                competitorGameboard.appendChild(squareDiv);
            }
        }

        // if (competitor === 'computer') {
        //     addAttackListeners(competitorGameboard);
        // }
    }
}

function renderHits(turn, squares) {
    // filter out hits
    let hitSquares = squares.filter(function(square) {
        return square.isHit;
    });

    // get hit squares DOM nodes
    hitSquares.forEach(function(square) {
        let xyMatchingSquareDOMNodes = findSquareDOM(square);

        let currentHit = xyMatchingSquareDOMNodes.filter(function(element) {
            return element.classList.contains(`${turn}-square`);
        });

        // change CSS to show hit
        currentHit[0].classList.add('hit-square');
    });
    console.log('These squares have been hit: ', hitSquares);
}

function renderMisses(turn, squares) {
    // filter out misses
    let missedSquares = squares.filter(function(square) {
        return square.isMiss;
    });

    // get miss squares DOM nodes
    missedSquares.forEach(function(square) {
        let xyMatchingSquareDOMNodes = findSquareDOM(square);

        let currentHit = xyMatchingSquareDOMNodes.filter(function(element) {
            return element.classList.contains(`${turn}-square`);
        });

        // change CSS to show hit
        currentHit[0].classList.add('missed-square');
    });
    console.log('These squares have been missed: ', missedSquares);
}

function renderShips() {
    for (let competitor in competitors) {
        // filter gameboard squares, looking for isEmpty = false;
        let competitorSquares = competitors[competitor].gameboard;
        let occupiedSquares = competitorSquares.squares.filter(function(square) {
            return !square.isEmpty;
        });
        
        // forEach square in occupiedSquares, change CSS class to reflect that they are occupied
        occupiedSquares.forEach(function(square) {
            let xyMatchingSquareDOMNodes = findSquareDOM(square); 

            // filter by player vs computer
            let occupiedSquareDiv = xyMatchingSquareDOMNodes.filter(function(element) {
                if (competitor === 'player') {
                    return element.classList.contains('player-square');
                } else if (competitor === 'computer') {
                    return element.classList.contains('computer-square');
                }
            });

            // add ship-square class to square to change color
            occupiedSquareDiv[0].classList.add('ship-square');
        });
    }

    // // get player, NOT COMPUTER (want computer squares hidden)
    // let competitor = 'player';
    // // filter gameboard squares, looking for isEmpty = false;
    // let competitorSquares = competitors[competitor].gameboard;
    // let occupiedSquares = competitorSquares.squares.filter(function(square) {
    //     return !square.isEmpty;
    // });
    
    // // forEach square in occupiedSquares, change CSS class to reflect that they are occupied
    // occupiedSquares.forEach(function(square) {
    //     let xyMatchingSquareDOMNodes = findSquareDOM(square);

    //     // filter by player vs computer
    //     let occupiedSquareDiv = xyMatchingSquareDOMNodes.filter(function(element) {
    //         return element.classList.contains('player-square');
    //     });

    //     // add ship-square class to square to change color
    //     occupiedSquareDiv[0].classList.add('ship-square');
    // });
}

function renderShipInfo() {
    for (let competitor in ships) {
        let competitorShips = ships[competitor];
        for (let ship in competitorShips) {
            // find ship dom node
            let currentShip = competitorShips[ship];
            let currentShipDOMNode = findShipDOM(currentShip, competitor);

            // adjust health bar CSS
            changeHealthBar(currentShip, currentShipDOMNode);

            // adjust health text
            changeHealthText(currentShip, currentShipDOMNode);
        }
    }
}

function resetBoardIndicators() {
    boardIndicators[0].classList.remove('hidden');
    boardIndicators[1].classList.add('hidden');
}

function resetHealthBarAndText() {
    let shipDOMNodes = document.querySelectorAll('.ship');
    
    shipDOMNodes.forEach(function(shipDOMNode) {
        let healthBar = shipDOMNode.querySelector('.ship-health-bar');
        healthBar.style.width = '';
        healthBar.style.backgroundColor = '';
    
        let healthText = shipDOMNode.querySelector('.ship-health');
        healthText.innerText = '';
    });  
}

function resetTurnIdicators() {
    let turnIndicators = document.querySelectorAll('.turn-indicator');
    turnIndicators[0].classList.remove('hidden');
    turnIndicators[1].classList.add('hidden');
}

function toggleGameboards() {
    let playerGameboard = document.querySelector('.player-gameboard-container');
    let computerGameboard = document.querySelector('.computer-gameboard-container');

    playerGameboard.classList.toggle('visible-gameboard');
    playerGameboard.classList.toggle('hidden-gameboard');
    
    computerGameboard.classList.toggle('visible-gameboard');
    computerGameboard.classList.toggle('hidden-gameboard');

    boardIndicators.forEach(function(element) {
        element.classList.toggle('hidden');
    });
}

function toggleToDefendingGameboard(defender) {
    let playerGameboard = document.querySelector('.player-gameboard-container');
    if (defender === 'computer') {
        if (playerGameboard.classList.contains('visible-gameboard')) {
            toggleGameboards();
        }
    } else  {
        if (playerGameboard.classList.contains('hidden-gameboard')) {
            toggleGameboards();
        }
    }
}

function toggleTurnIndicator(competitor) {
    let turnIndicators = document.querySelectorAll('.turn-indicator');

    if (competitor === 'computer') {
        turnIndicators[0].classList.remove('hidden');
        turnIndicators[1].classList.add('hidden');
    } else {
        turnIndicators[0].classList.add('hidden');
        turnIndicators[1].classList.remove('hidden');
    }
    
}

/**
 * Run game -----
 */
init();
render();