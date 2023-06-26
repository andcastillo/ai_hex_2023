require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/src/HexAgent.js":[function(require,module,exports){
const Agent = require('ai-agents').Agent;

class HexAgent extends Agent {
    constructor(value) {
        super(value);
    }

    /**
     * return a new move. The move is an array of two integers, representing the
     * row and column number of the hex to play. If the given movement is not valid,
     * the Hex controller will perform a random valid movement for the player
     * Example: [1, 1]
     */
    send() {
        let board = this.perception;
        let size = board.length;
        let available = getEmptyHex(board);
        let nTurn = size * size - available.length;
        //console.log(nTurn)
        if (nTurn % 2 == 1) {//player 2 human
            // var playerCords = prompt("Your cords in row,col format: ");
            // let move = [parseInt(playerCords[0]), parseInt(playerCords[2])]
            // let boardWithThatMove = seeVirtualBoard(board,move,'2')
            // console.log("Board: ", boardWithThatMove)
            // console.log("Evalution score: (P2)",evaluateBoard(board,'2'))
            //mahine playing, copy paste this block to get our solution :)
            let machineCords = findBestMove(JSON.parse(JSON.stringify(board)), '2')
            //console.log("machine cords: ", machineCords)
            //let boardWithThatMove = seeVirtualBoard(board, machineCords, '2')
            //console.log("Board: ", boardWithThatMove)
            //console.log("Evalution score: (P2)", evaluateBoard(board, '2'))
            return machineCords;
        } else if (nTurn % 2 == 0) {//mahine playing, copy paste this block to get our solution :)
            //let move = available[Math.round(Math.random() * (available.length - 1))];
            //let machineCords = [Math.floor(move / board.length), move % board.length]
            let machineCords = findBestMove(JSON.parse(JSON.stringify(board)), '1')
            //console.log("machine cords: ", machineCords)
            //let boardWithThatMove = seeVirtualBoard(board, machineCords, '1')
            //console.log("Board: ", boardWithThatMove)
            //console.log("Evalution score: (P1)", evaluateBoard(board, '1'))
            return machineCords;
        }
    }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}











// Minimax function with alpha-beta pruning
function minimax(board, depth, maximizingPlayer, alpha, beta, playerId) {//colocar el id del jugador a hallar el maximo score como parametro
    //console.log(board)
    // Base case: If the game is over or maximum depth is reached
    // return the evaluation score of the board
    if (depth === 0 || gameIsOver(board)) {
        return evaluateBoard(board, playerId);//colocar el id del jugador a hallar la evaluacion como parametro
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of possibleMoves(board)) {
            let newBoard = seeVirtualBoard(JSON.parse(JSON.stringify(board)), move, '2');
            let value = minimax(newBoard, depth - 1, false, alpha, beta, playerId);
            maxEval = Math.max(maxEval, value);
            alpha = Math.max(alpha, value);
            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of possibleMoves(board)) {
            let newBoard = seeVirtualBoard(JSON.parse(JSON.stringify(board)), move, '1');
            let value = minimax(newBoard, depth - 1, true, alpha, beta, playerId);
            minEval = Math.min(minEval, value);
            beta = Math.min(beta, value);
            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}

// Function to find the best move for the AI player using Minimax
function findBestMove(board, playerId) {
    let bestEval = -Infinity;
    let bestMove;
    //console.log("first board: ", board)
    //o cambiar makeMove, sale mejor?
    for (let move of possibleMoves(board)) {//crear una funcion possibleMoves que traduzca getEmptyHex en vez de ids, cords [row,col]
        let newBoard = seeVirtualBoard(JSON.parse(JSON.stringify(board)), move, playerId);
        //console.log("newBoard: ", newBoard)
        let value = minimax(newBoard, 2, false, -Infinity, Infinity, playerId);

        if (value > bestEval) {
            bestEval = value;
            bestMove = move;
        }
    }

    return bestMove;
}




function evaluateBoard(board, playerId) {
    board = JSON.parse(JSON.stringify(board))

    // Calculate control score
    const controlScore = calculateControl(board, playerId);

    // Calculate connectivity score
    const connectivityScore = calculateConnectivity(board, playerId);

    // Calculate final evaluation score
    const evaluationScore = controlScore * (1.5) + connectivityScore * (0.4);

    return evaluationScore;
}

// Helper function to calculate control score
function calculateControl(board, playerId) {
    const boardSize = board.length;
    let controlScore = 0;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === playerId) {
                // Increase control score for player's positions closer to opponent's goal sides
                if (playerId === '1') {
                    controlScore += i;
                } else if (playerId === '2') {
                    controlScore += j;
                }
                else {
                    controlScore += boardSize - 1 - j;
                }
            }
        }
    }

    return controlScore;
}

// Helper function to calculate connectivity score
function calculateConnectivity(board, playerId) {
    const boardSize = board.length;
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    let connectivityScore = 0;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === playerId && !visited[i][j]) {
                dfs(board, i, j, playerId, visited);
                connectivityScore++;
            }
        }
    }

    return connectivityScore;
}

// Helper function for depth-first search (DFS)
function dfs(board, row, col, playerId, visited) {
    const boardSize = board.length;
    const directions = [
        [-1, 0], // Up
        [1, 0], // Down
        [0, -1], // Left
        [0, 1], // Right
        [-1, 1], // Top-right
        [1, -1], // Bottom-left
    ];

    visited[row][col] = true;

    for (let [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;

        if (isValidPosition(newRow, newCol, boardSize) && board[newRow][newCol] === playerId && !visited[newRow][newCol]) {
            dfs(board, newRow, newCol, playerId, visited);
        }
    }
}

// Helper function to check if a position is valid on the board
function isValidPosition(row, col, boardSize) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

// Helper function to calculate the shortest distance to goal sides for a player
function calculateShortestDistance(board, playerId) {
    const boardSize = board.length;
    const goalSides = playerId === '1' ? ['top', 'bottom'] : ['left', 'right'];
    const distances = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));

    // Initialize distances to 0 for positions on goal sides
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === playerId && (goalSides.includes('top') && i === 0 || goalSides.includes('bottom') && i === boardSize - 1 ||
                goalSides.includes('left') && j === 0 || goalSides.includes('right') && j === boardSize - 1)) {
                distances[i][j] = 0;
            }
        }
    }

    // Perform Dijkstra's algorithm to calculate shortest distances
    const queue = [];

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === playerId) {
                queue.push([i, j]);
            }
        }
    }

    while (queue.length > 0) {
        const [row, col] = queue.shift();
        const currDistance = distances[row][col] + 1;

        const directions = [
            [-1, 0], // Up
            [1, 0], // Down
            [0, -1], // Left
            [0, 1], // Right
            [-1, 1], // Top-right
            [1, -1], // Bottom-left
        ];

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            if (isValidPosition(newRow, newCol, boardSize) && distances[newRow][newCol] > currDistance) {
                distances[newRow][newCol] = currDistance;
                queue.push([newRow, newCol]);
            }
        }
    }

    // Find the minimum distance to goal sides
    let minDistance = Infinity;

    if (goalSides.includes('top')) {
        for (let j = 0; j < boardSize; j++) {
            minDistance = Math.min(minDistance, distances[0][j]);
        }
    }

    if (goalSides.includes('bottom')) {
        for (let j = 0; j < boardSize; j++) {
            minDistance = Math.min(minDistance, distances[boardSize - 1][j]);
        }
    }

    if (goalSides.includes('left')) {
        for (let i = 0; i < boardSize; i++) {
            minDistance = Math.min(minDistance, distances[i][0]);
        }
    }

    if (goalSides.includes('right')) {
        for (let i = 0; i < boardSize; i++) {
            minDistance = Math.min(minDistance, distances[i][boardSize - 1]);
        }
    }

    return minDistance;
}




function seeVirtualBoard(board, move, playerId) {
    let row = move[0]
    let col = move[1]
    if (board[row][col] === 0) {
        board[row][col] = playerId;
    } else {
        //console.log(board)
        throw Error
    }

    return board
}

function possibleMoves(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push([k, j]);
            }
        }
    }
    return result;
}


function gameIsOver(tablero) {
    let board = tablero;
    let size = board.length;
    for (let player of ['1', '2']) {
        for (let i = 0; i < size; i++) {
            let hex = -1;
            if (player === '1') {
                if (board[i][0] === player) {
                    hex = i * size;
                }
            } else if (player === '2') {
                if (board[0][i] === player) {
                    hex = i;
                }
            }
            if (hex >= 0) {
                let row = Math.floor(hex / size);
                let col = hex % size;
                // setVisited(neighbor, player, board);
                board[row][col] = -1;
                let status = check(hex, player, board);
                board[row][col] = player;
                if (status) {
                    return true;
                }
            }
        }
    }
    return false;
}


/**
 * Chech if there exist a path from the currentHex to the target side of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function check(currentHex, player, board) {
    if (isEndHex(currentHex, player, board.length)) {
        return true;
    }
    let neighbors = getNeighborhood(currentHex, player, board);
    for (let neighbor of neighbors) {
        let size = board.length;
        let row = Math.floor(neighbor / size);
        let col = neighbor % size;
        // setVisited(neighbor, player, board);
        board[row][col] = -1;
        let res = check(neighbor, player, board);
        // resetVisited(neighbor, player, board);
        board[row][col] = player;
        if (res == true) {
            return true;
        }
    }
    return false;
}

/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
    let size = board.length;
    let row = Math.floor(currentHex / size);
    let col = currentHex % size;
    let result = [];

    // Check the six neighbours of the current hex
    pushIfAny(result, board, player, row - 1, col);
    pushIfAny(result, board, player, row - 1, col + 1);
    pushIfAny(result, board, player, row, col + 1);
    pushIfAny(result, board, player, row, col - 1);
    pushIfAny(result, board, player, row + 1, col);
    pushIfAny(result, board, player, row + 1, col - 1);

    return result;
}

function pushIfAny(result, board, player, row, col) {
    let size = board.length;
    if (row >= 0 && row < size && col >= 0 && col < size) {
        if (board[row][col] === player) {
            result.push(col + row * size);
        }
    }
}

/**
 * Chech if the current hex is at the opposite border of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Number} size 
 */
function isEndHex(currentHex, player, size) {
    if (player === "1") {
        if ((currentHex + 1) % size === 0) {
            return true;
        }
    } else if (player === "2") {
        if (Math.floor(currentHex / size) === size - 1) {
            return true;
        }
    }
}

},{"ai-agents":4}],1:[function(require,module,exports){
//const tf = require('@tensorflow/tfjs-node');

class Agent {
    constructor(name) {
        this.id = name;
        if (!name) {
            this.id = Math.round(Math.random() * 10e8);
        }
        this.state = null;
        this.perception = null;
        this.table = { "default": 0 };
    }

    /**
     * Setup of the agent. Could be override by the class extension
     * @param {*} parameters 
     */
    setup(initialState = {}) {
        this.initialState = initialState;
    }

    /**
     * Function that receive and store the perception of the world that is sent by the agent controller. This data is stored internally
     * in the this.perception variable
     * @param {Object} inputs 
     */
    receive(inputs) {
        this.perception = inputs;
    }

    /**
     * Inform to the Agent controller about the action to perform
     */
    send() {
        return this.table["deafult"];
    }

    /**
     * Return the agent id
     */
    getLocalName() {
        return this.id;
    }

    /**
      * Return the agent id
      */
    getID() {
        return this.id;
    }

    /**
     * Do whatever you do when the agent is stoped. Close connections to databases, write files etc.
     */
    stop() {}
}

module.exports = Agent;
},{}],2:[function(require,module,exports){

class AgentController {
    constructor() {
        this.agents = {};
        this.world0 = null;
        this.actions = [];
        this.data = { states: {}, world: {} };
    }
    /**
     * Setup the configuration for the agent controller
     * @param {Object} parameter 
     */
    setup(parameter) {
        this.problem = parameter.problem;
        this.world0 = JSON.parse(JSON.stringify(parameter.world));
        this.data.world = JSON.parse(JSON.stringify(parameter.world));
    }
    /**
     * Register the given agent in the controller pool. The second parameter stand for the initial state of the agent
     * @param {Agent} agent 
     * @param {Object} state0 
     */
    register(agent, state0) {
        if (this.agents[agent.getID()]) {
            throw 'AgentIDAlreadyExists';
        } else {
            this.agents[agent.getID()] = agent;
            this.data.states[agent.getID()] = state0;
            //TODO conver state0 to an inmutable object
            agent.setup(state0);
        }
    }
    /**
     * Remove the given agent from the controller pool
     * @param {Object} input 
     */
    unregister(input) {
        let id = "";
        if (typeof input == 'string') {
            id = input;
        } else if (typeof input == 'object') {
            id = input.getID();
        } else {
            throw 'InvalidAgentType';
        }
        let agent = this.agents[id];
        agent.stop();
        delete this.agents[id];
    }

    /**
    * This function start the virtual life. It will continously execute the actions
    * given by the agents in response to the perceptions. It stop when the solution function
    * is satisfied or when the max number of iterations is reached.
    * If it must to run in interactive mode, the start mode return this object, which is actually 
    * the controller
    * @param {Array} callbacks 
    */
    start(callbacks, interactive = false) {
        this.callbacks = callbacks;
        this.currentAgentIndex = 0;
        if (interactive === false) {
            this.loop();
            return null;
        } else {
            return this;
        }
    }

    /**
     * Executes the next iteration in the virtual life simulation
     */
    next() {
        if (!this.problem.goalTest(this.data)) {
            let keys = Object.keys(this.agents);
            let agent = this.agents[keys[this.currentAgentIndex]];
            agent.receive(this.problem.perceptionForAgent(this.getData(), agent.getID()));
            // Espera
            let action = agent.send();
            this.actions.push({ agentID: agent.getID(), action });
            this.problem.update(this.data, action, agent.getID());
            if (this.problem.goalTest(this.data)) {
                this.finishAll();
                return false;
            } else {
                if (this.callbacks.onTurn) {
                    this.callbacks.onTurn({ actions: this.getActions(), data: JSON.parse(JSON.stringify(this.data)) });
                }
                if (this.currentAgentIndex >= keys.length - 1) this.currentAgentIndex = 0;else this.currentAgentIndex++;
                return true;
            }
        }
    }

    /**
     * Virtual life loop. At the end of every step it executed the onTurn call back. It could b used for animations of login
     */
    loop() {
        let stop = false;
        while (!stop) {
            //Creates a thread for every single agent
            Object.values(this.agents).forEach(agent => {
                if (!this.problem.goalTest(this.data)) {
                    agent.receive(this.problem.perceptionForAgent(this.getData(), agent.getID()));
                    let action = agent.send();
                    this.actions.push({ agentID: agent.getID(), action });
                    this.problem.update(this.data, action, agent.getID());
                    if (this.problem.goalTest(this.data)) {
                        stop = true;
                    } else {
                        if (this.callbacks.onTurn) this.callbacks.onTurn({ actions: this.getActions(), data: this.data });
                    }
                }
            });
        }
        this.finishAll();
    }

    /**
     * This function is executed once the virtual life loop is ended. It must stop every single agent in the pool
     * and execute the onFinish callback 
     */
    finishAll() {
        // Stop all the agents
        Object.values(this.agents).forEach(agent => {
            //agent.stop();
            this.unregister(agent);
        });
        //Execute the callback
        if (this.callbacks.onFinish) this.callbacks.onFinish({ actions: this.getActions(), data: this.data });
    }

    /**
     * Return a copu of the agent controller data. The returned object contains the data of the problem (world) and the
     * state of every single agent in the controller pool (states)
     */
    getData() {
        return this.data;
    }
    /**
     * Return the history of the actions performed by the agents during the current virtual life loop
     */
    getActions() {
        return JSON.parse(JSON.stringify(this.actions));
    }

    /**
     * This function stop all the threads started by the agent controller and stops registered agents
     */
    stop() {
        this.finishAll();
    }
}

module.exports = AgentController;
},{}],3:[function(require,module,exports){
const AgentController = require('../core/AgentController');

/**
 * This class specifies the problem to be solved
 */
class Problem {
    constructor(initialState) {
        this.controller = new AgentController();
    }

    /**
     * Check if the given solution solves the problem. You must override
     * @param {Object} solution 
     */
    goalTest(solution) {}
    //TODO return boolean


    /**
     * The transition model. Tells how to change the state (data) based on the given actions. You must override
     * @param {} data 
     * @param {*} action 
     * @param {*} agentID 
     */
    update(data, action, agentID) {}
    //TODO modify data


    /**
     * Gives the world representation for the agent at the current stage
     * @param {*} agentID 
     * @returns and object with the information to be sent to the agent
     */
    perceptionForAgent(data, agentID) {}
    //TODO return the perception


    /**
     * Add a new agent to solve the problem
     * @param {*} agentID 
     * @param {*} agentClass 
     * @param {*} initialState 
     */
    addAgent(agentID, agentClass, initialState) {
        let agent = new agentClass(agentID);
        this.controller.register(agent, initialState);
    }

    /**
     * Solve the given problem
     * @param {*} world 
     * @param {*} callbacks 
     */
    solve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        this.controller.start(callbacks, false);
    }

    /**
    * Returns an interable function that allow to execute the simulation step by step
    * @param {*} world 
    * @param {*} callbacks 
    */
    interactiveSolve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        return this.controller.start(callbacks, true);
    }
}

module.exports = Problem;
},{"../core/AgentController":2}],4:[function(require,module,exports){
const Problem = require('./core/Problem');
const Agent = require('./core/Agent');
const AgentController = require('./core/AgentController');

module.exports = { Problem, Agent, AgentController };
},{"./core/Agent":1,"./core/AgentController":2,"./core/Problem":3}]},{},[]);
