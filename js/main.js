/**
 * Constants -----
 */
const ROWS = 10;
const COLUMNS = 10;
const DIRECTIONS = ['up', 'right', 'down', 'left'];
const TOGGLE_DURATION = 1000;
const COMPUTER_DURATION = 1500;

/**
 * Game state variables -----
 */
let isGameActive;
let currentTurn;
let toggleTimer;
let computerTimer;

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

fireBtn.addEventListener('click', toggleToComputerBoard);

seeResultsBtn.addEventListener('click', function() {
    winnerModal.classList.add('hidden');
    mainContainer.classList.remove('hidden');
});

resetBtns.forEach(function(button) {
    button.addEventListener('click', function() {
        let inputName = competitors.player.name;

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

        competitors.player.name = inputName;
        renderFleetNames();
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
                let randomCoordinates = this._generateRandomCoordinates();
                let randomSquare = this._findSquare(randomCoordinates);
    
                while(!randomSquare.isEmpty) {
                    randomCoordinates = this._generateRandomCoordinates();
                    randomSquare = this._findSquare(randomCoordinates);
                }
                
                let availableDirections = [...DIRECTIONS];
                isShipPlaced = this._checkAllDirections(competitorShips[ship], randomCoordinates, availableDirections);
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
            let randomIndex = Math.floor(Math.random() * availableDirections.length);
            let randomDirection = availableDirections[randomIndex];
            
            let isThereRoom = this._checkDirection(ship, coordinates, randomDirection);
            if (isThereRoom) {
                this._placeShip(ship, coordinates, randomDirection);                
                return true;
            } else {
                availableDirections.splice(randomIndex, 1);
            }            
        }
    }
    
    _checkDirection(ship, coordinates, direction) {
        let isThereRoom = true;
        for (let i = 1; i < ship.length; i++) {
            if (direction === 'up') {
                if (coordinates[1] - (ship.length - 1) <= 0) {
                    isThereRoom = false;
                    break;
                }

                let newCoordinates = [coordinates[0], coordinates[1] - i];
                let currentSquare = this._findSquare(newCoordinates);
                
                if (!currentSquare.isEmpty) {
                    isThereRoom = false;

                    break;
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

        for (let i = 1; i < ship.length; i++) {
            if (direction === 'up') {
                let newCoordinates = [startingCoordinates[0], startingCoordinates[1] - i];
                let currentSquare = this._findSquare(newCoordinates);
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
        square.isEmpty = false;
        square.containedShip = ship;
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
}

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.health = length;
        this.spacesOccupied = [];
        this.isAfloat = true;
    }
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

    gameboards.player = new Gameboard(COLUMNS, ROWS);
    gameboards.player.createGameboard();
    gameboards.player.populateGameboard(ships.player);

    gameboards.computer = new Gameboard(COLUMNS, ROWS);
    gameboards.computer.createGameboard();
    gameboards.computer.populateGameboard(ships.computer);
    
    competitors.player = new Competitor('No-beard', gameboards.player);
    competitors.computer = new Competitor('Blackbeard', gameboards.computer);

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

function addAttackListeners(gameboard) {
    let squares = gameboard.querySelectorAll('.computer-square');
    squares.forEach(function(square) {
        square.addEventListener('click', pauseAttacks);
    });
}

function attackFlow(square, attacker, defender) {
    if (!square.isHit && !square.isMiss) {
        if (!square.isEmpty) {
            square.isHit = true;
    
            let hitShip = square.containedShip;
            hitShip.health -= 1;

            if (hitShip.health === 0) {
                hitShip.isAfloat = false;
                
                checkWinCondition(defender);          
                
            }
            
            renderShipInfo();
    
        } else {
            square.isMiss = true;
        }

        renderAttacks(defender, gameboards[defender]);
        addToGameLog(attacker, square);

        return defender;

    } else {
        return attacker;
    }
}

function checkWinCondition(competitor) {
    let competitorShips = ships[competitor];
    for (let ship in competitorShips) {
        if (competitorShips[ship].isAfloat) {
            return
        }
    }

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

function clickAttack(e) {
    if (isGameActive && currentTurn === 'player') {
        let attacker = 'player';
        let defender = 'computer';

        let clickedCoordinates = [parseInt(e.target.dataset.column), parseInt(e.target.dataset.row)];
        let clickedSquare = findSquare(gameboards[defender], clickedCoordinates);

        currentTurn = attackFlow(clickedSquare, attacker, defender);
    }

    if (currentTurn === 'computer') {
        return true;
    } else {
        return false;
    }
}

function computerAttack() {
    if (isGameActive && currentTurn === 'computer') {
        let attacker = 'computer';
        let defender = 'player';

        while (currentTurn === 'computer') {
            let randomCoordinates = generateRandomCoordinates();
            let randomSquare = findSquare(gameboards[defender], randomCoordinates);

            currentTurn = attackFlow(randomSquare, attacker, defender);
        }

        toggleTurnIndicator(attacker);
        fireBtn.disabled = false;
    }
}

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
    let xCoordinateColumnsNodeList = document.querySelectorAll(`[data-column='${square.xCoordinate}']`);
    let xCoordinateColumns = Array.prototype.slice.call(xCoordinateColumnsNodeList);

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

        if (competitor === 'computer') {
            addAttackListeners(competitorGameboard);
        }
    }
}

function renderHits(turn, squares) {
    let hitSquares = squares.filter(function(square) {
        return square.isHit;
    });

    hitSquares.forEach(function(square) {
        let xyMatchingSquareDOMNodes = findSquareDOM(square);

        let currentHit = xyMatchingSquareDOMNodes.filter(function(element) {
            return element.classList.contains(`${turn}-square`);
        });

        currentHit[0].classList.add('hit-square');
    });
}

function renderMisses(turn, squares) {
    let missedSquares = squares.filter(function(square) {
        return square.isMiss;
    });

    missedSquares.forEach(function(square) {
        let xyMatchingSquareDOMNodes = findSquareDOM(square);

        let currentHit = xyMatchingSquareDOMNodes.filter(function(element) {
            return element.classList.contains(`${turn}-square`);
        });

        currentHit[0].classList.add('missed-square');
    });
}

function renderShips() {
    let competitor = 'player';

    let competitorSquares = competitors[competitor].gameboard;
    let occupiedSquares = competitorSquares.squares.filter(function(square) {
        return !square.isEmpty;
    });
    
    occupiedSquares.forEach(function(square) {
        let xyMatchingSquareDOMNodes = findSquareDOM(square);
        let occupiedSquareDiv = xyMatchingSquareDOMNodes.filter(function(element) {
            return element.classList.contains('player-square');
        });

        occupiedSquareDiv[0].classList.add('ship-square');
    });
}

function renderShipInfo() {
    for (let competitor in ships) {
        let competitorShips = ships[competitor];
        for (let ship in competitorShips) {
            let currentShip = competitorShips[ship];
            let currentShipDOMNode = findShipDOM(currentShip, competitor);

            changeHealthBar(currentShip, currentShipDOMNode);

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

function toggleToComputerBoard() {
    let playerGameboard = document.querySelector('.player-gameboard-container');
    let computerGameboard = document.querySelector('.computer-gameboard-container');

    playerGameboard.classList.remove('visible-gameboard');
    playerGameboard.classList.add('hidden-gameboard');
    
    computerGameboard.classList.add('visible-gameboard');
    computerGameboard.classList.remove('hidden-gameboard');

    boardIndicators[0].classList.add('hidden');
    boardIndicators[1].classList.remove('hidden');

    fireBtn.disabled = true;
}

function toggleToPlayerBoard() {
    let playerGameboard = document.querySelector('.player-gameboard-container');
    let computerGameboard = document.querySelector('.computer-gameboard-container');

    playerGameboard.classList.add('visible-gameboard');
    computerGameboard.classList.add('hidden-gameboard');
    
    playerGameboard.classList.remove('hidden-gameboard');
    computerGameboard.classList.remove('visible-gameboard');

    boardIndicators[0].classList.remove('hidden');
    boardIndicators[1].classList.add('hidden');
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