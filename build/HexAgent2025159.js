require = (function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  "/src/HexAgent.js": [function (require, module, exports) {
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
        let board = this.perception.map(arr => arr.slice());
        let size = board.length;
        var player = this.id;

        let available = getEmptyHex(board);
        let nTurn = size * size - available.length;

        if (nTurn == 0) { // First move
          var movement = [Math.floor(size / 2), Math.floor(size / 2) - 1];

          var arr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 2, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
          var dij = dijkstra([0, 2], 1, 5, arr);

          return movement;
        } else {
          var board1 = [...board];
          return abMiniMax([], [new Node(0, -1, [2, 3], board1, 0, player, 0)], player);
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

    function isPositionValid(position, size) {

      var row = position[0];
      var col = position[1];

      if (row < 0 || row >= size || col < 0 || col >= size) {
        return false;
      } else {
        return true;
      }
    }

    // Dada una posición, devuelve sus vecinos y cuánto cuesta llegar a cada uno
    // Si el vecino ha sido tomado por el jugador, cuesta 0
    // Si el vecino no ha sido tomado por el jugador, cuesta 1
    // Si el vecino ha sido tomado por el enemigo, es inalcanzable (Infinity)
    function getNeighbours(position, size, player, board) {

      var row = position[0];
      var col = position[1];
      var neighbour = [];
      var result = [];
      var neighbourCost;
      var neighbourPlusCost = [];

      neighbour = [row - 1, col, getId(row - 1, col, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row - 1][col] == 0) {
          neighbourCost = 1;
        } else if (board[row - 1][col] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      neighbour = [row - 1, col + 1, getId(row - 1, col + 1, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row - 1][col + 1] == 0) {
          neighbourCost = 1;
        } else if (board[row - 1][col + 1] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      neighbour = [row, col - 1, getId(row, col - 1, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row][col - 1] == 0) {
          neighbourCost = 1;
        } else if (board[row][col - 1] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      neighbour = [row, col + 1, getId(row, col + 1, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row][col + 1] == 0) {
          neighbourCost = 1;
        } else if (board[row][col + 1] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      neighbour = [row + 1, col - 1, getId(row + 1, col - 1, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row + 1][col - 1] == 0) {
          neighbourCost = 1;
        } else if (board[row + 1][col - 1] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      neighbour = [row + 1, col, getId(row + 1, col, size)];
      if (isPositionValid(neighbour, size)) {
        if (board[row + 1][col] == 0) {
          neighbourCost = 1;
        } else if (board[row + 1][col] == player) {
          neighbourCost = 0;
        } else {
          neighbourCost = 1000000;
        }
        neighbourPlusCost = [neighbour, neighbourCost];

        result.push(neighbourPlusCost);
      }

      return result;
    }

    function getPositionValue(position, board) {
      return board[position[0]][position[1]];
    }

    function getId(row, col, size) {
      return row * size + col;
    }

    // Cambiar el actual costo de llegar a una cierta posición
    function changeCost(positions, id, newCost) {
      var length = positions.length;
      for (var i = 0; i < length; i++) {
        if (positions[i][2] == id) {
          positions[i][3] = newCost;
          break;
        }
      }
    }

    // Remover posiciones del Arreglo
    function eraseP(ids, arr) {
      for (var i = 0; i < ids.length; i++) {
        arr.splice(ids[i], 1);
        for (var j = i + 1; j < ids.length; j++) {
          ids[j]--;
        }
      }
    }

    // Remover duplicados ya visitados de la lista
    function removeDuplicates(visited, arr) {
      var ids = [];

      for (var i = 0; i < visited.length; i++) {
        for (var j = 0; j < arr.length; j++) {
          if (visited[i][2] == arr[j][0][2]) {
            ids.push(j);
          }
        }
      }
      ids.sort();
      eraseP(ids, arr);
    }

    function dijkstra(startingPosition, player, size, board) {
      // Arreglos para ejecutar Dijkstra
      var table = [];
      var graph = [];
      var visited = [];
      var unvisited = [];

      // auxPosition: Guardar en la tabla de dijkstra
      // auxHolder: Consultar vecinos y sus costos
      // auxGraph: Guardar en el grafo
      var auxPosition = [];
      var auxHolder = [];
      var auxGraph = [];
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          // [fila, columna, id, costo, filaOrigen, colOrigen, idOrigen]
          auxPosition = [i, j, getId(i, j, size), 1000000, 0, 0, 0];
          table.push(auxPosition);
          unvisited.push(auxPosition);

          auxHolder = [i, j];
          auxGraph = getNeighbours(auxHolder, size, player, board);
          graph.push(auxGraph);
        }
      }
      // Si la posicion inicial pertenece al jugador, no tiene costo.

      var costoPuntoInicial = 0;
      if (board[startingPosition[0]][startingPosition[1]] == 0) {
        costoPuntoInicial = 1;
      } else if (board[startingPosition[0]][startingPosition[1]] == player) {
        costoPuntoInicial = 0;
      } else {
        costoPuntoInicial = 1000000;
      }

      table[getId(startingPosition[0], startingPosition[1], size)][3] = costoPuntoInicial;
      unvisited[getId(startingPosition[0], startingPosition[1], size)][3] = costoPuntoInicial;
      // Ordenar los nodos no visitados, de menor a mayor, quedando al final la posInicial
      unvisited.sort((pos1, pos2) => pos2[3] - pos1[3]);

      var currentPosition = [];
      var positionsToVisit = unvisited.length;
      var currentNeighBours = [];
      var numberOfNeighbours;

      for (var i = 0; i < positionsToVisit; i++) {
        // Obtener los vecinos de la posición de menor costo no visitada
        currentPosition = unvisited.pop();
        currentNeighBours = getNeighbours(currentPosition, size, player, board);
        // Eliminar de los vecinos a verificar aquellos que ya se visitaron                        CHECKPOINT*************
        removeDuplicates(visited, currentNeighBours);
        // Número de vecinos restantes
        numberOfNeighbours = currentNeighBours.length;
        // Revisar
        var currentCost = 0;

        for (var j = 0; j < numberOfNeighbours; j++) {
          // Costo de llegar al vecino desde la pos actual + lo que costó llegar a la actual
          currentCost = currentNeighBours[j][1] + table[currentPosition[2]][3];
          // Si el costo es menor al de la tabla, se cambia el costo en la tabla
          // y se cambia el orígen que lo produjo
          if (currentCost < table[currentNeighBours[j][0][2]][3]) {
            table[currentNeighBours[j][0][2]][3] = currentCost;
            table[currentNeighBours[j][0][2]][4] = currentPosition[0];
            table[currentNeighBours[j][0][2]][5] = currentPosition[1];
            table[currentNeighBours[j][0][2]][6] = currentPosition[2];
            // además, se debe actualizar en la lista de posiciones no visitadas
            // el nuevo costo mínimo para llegar a ella
            changeCost(unvisited, currentNeighBours[j][0][2], currentCost);
          }
        }

        // Ahora se debe ordenar la lista de posiciones no visitadas
        unvisited.sort((pos1, pos2) => pos2[3] - pos1[3]);

        // Añadir el vecino evaluado a la lista de posiciones evaluados
        visited.push(currentPosition);
      }
      return table;
    }

    // Calcular la utilidad de un nodo para un determinado jugador
    function getNodeUtility(node, player) {
      //console.log("BOARD DEL NODO : ", node.getBoard());
      var size = node.getBoard().length;
      //console.log("TAMAÑ0 = ", size);
      var refTable = [];

      var minPathPlayer1 = Infinity;
      var minPathPlayer2 = Infinity;

      var auxMinPath;
      var auxMinPathArr = [];
      // Cálculo del costo del camino más corto para el jugador 1
      // teniendo en cuenta las posiciones de la fila superior (hacia la inferior)
      for (var i = 0; i < size; i++) {
        auxMinPathArr.length = 0;
        // Cálculo de tabla de dijkstra para el jugador 1
        refTable = dijkstra([i, 0], 1, size, node.getBoard());
        // Costo mínimo para llegar desde la columna izquierda a la derecha
        // teniendo en cuenta cada posición de ambas
        for (var j = 0; j < size; j++) {
          auxMinPathArr.push(refTable[getId(j, size - 1, size)][3]);
        }
        //console.log("AuxMinPathArr-->", auxMinPathArr);
        auxMinPath = Math.min(...auxMinPathArr);
        //console.log("AuxMinPath-->", auxMinPath);
        // el costo mínimo de camino para el jugador se debe actualizar
        if (auxMinPath < minPathPlayer1) {
          minPathPlayer1 = auxMinPath;
        }
      }

      // Cálculo del costo del camino más corto para el jugador 2
      // teniendo en cuenta las posiciones de la columna izquierda (hacia la derecha)
      for (var i = 0; i < size; i++) {
        auxMinPathArr.length = 0;
        // Cálculo de tabla de dijkstra para el jugador 2
        refTable = dijkstra([0, i], 2, size, node.getBoard());
        // Costo mínimo para llegar desde la fila superior a la fila inferior
        // teniendo en cuenta cada posición de ambas
        for (var j = 0; j < size; j++) {
          auxMinPathArr.push(refTable[getId(size - 1, j, size)][3]);
        }
        auxMinPath = Math.min(...auxMinPathArr);
        // el costo mínimo de camino para el jugador se debe actualizar
        if (auxMinPath < minPathPlayer2) {
          minPathPlayer2 = auxMinPath;
        }
      }

      var utility;
      var isFinished = false;

      if (minPathPlayer1 == 0 || minPathPlayer2 == 0) {
        isFinished = true;
      }

      if (player == "1") {
        utility = minPathPlayer2 - minPathPlayer1;
      } else {
        utility = minPathPlayer1 - minPathPlayer2;
      }

      return [utility, isFinished];
    }

    // Clase para representar un árbol
    class Node {
      // 
      constructor(depth, parent, generatingMovemement, board, profit, player, offspring) {
        this.depth = depth;
        this.parent = parent;
        this.generatingMovemement = generatingMovemement;
        this.board = board;
        this.profit = profit;
        this.player = player;
        this.offspring = offspring;
      }

      // methods
      getDepth() {
        return this.depth;
      }
      setDepth(newDepth) {
        this.depth = newDepth;
      }

      getParent() {
        return this.parent;
      }
      setParent(newParent) {
        this.parent = newParent;
      }

      getGeneratingMovemement() {
        return this.generatingMovemement;
      }
      setGeneratingMovemement(newGeneratingMovemement) {
        this.generatingMovemement = newGeneratingMovemement;
      }

      getBoard() {
        return this.board;
      }
      setBoard(newBoard) {
        this.board = newBoard;
      }

      getProfit() {
        return this.profit;
      }
      setProfit(newProfit) {
        this.profit = newProfit;
      }

      getPlayer() {
        return this.player;
      }
      setPlayer(newPlayer) {
        this.player = newPlayer;
      }

      getOffspring() {
        return this.offspring;
      }

      setOffspring(newOffspring) {
        this.offspring = newOffspring;
      }
    }

    // Generar los movimientos disponibles en un tablero
    function getAvailableMovements(board) {
      var result = [];
      var size = board.length;

      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          if (board[i][j] == 0) {
            result.push([i, j]);
          }
        }
      }

      return result;
    }

    // Generar un nuevo tablero de acuerdo a un movimiento
    function generateBoard(board, movement, player) {
      var result = board.map(arr => arr.slice());;
      result[movement[0]][movement[1]] = player;
      return result;
    }

    //Cambia el jugador en cada turno
    function changePlayer(player) {
      if (player == "1") {
        return "2";
      } else {
        return "1";
      }
    }

    //Indica si dos tableros son iguales
    function repeatBoard(board1, board2) {

      var size = board1.length;
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          if (board1[i][j] != board2[i][j]) {
            return false;
          }
        }
      }
      return true;
    }

    //Indica si un nodo ya está dentro de un arreglo de nodos
    function repeatNode(node, nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (repeatBoard(node.getBoard(), nodes[i].getBoard())) {
          return true;
        }
      }
      return false;
    }

    //Retorna la mejor utilidad
    function max(values) {
      var max = [];
      if (values.length == 1) {
        return values[0].getProfit();
      } else {
        max = values[0].getProfit();
        for (var i = 1; i < values.length; i++) {
          if (values[i].getProfit()[0] > max[0]) {
            max = values[i].getProfit();
          } else if (values[i].getProfit()[0] == max[0]) {
            if (values[i].getProfit()[1]) {
              max = values[i].getProfit();
            }
          }
        }
        return max;
      }
    }

    //Retorna la peor utilidad
    function min(values) {
      var min = [];
      if (values.length == 1) {
        return values[0].getProfit();
      } else {
        min = values[0].getProfit();
        for (var i = 1; i < values.length; i++) {
          if (values[i].getProfit()[0] < min[0]) {
            min = values[i].getProfit();
          } else if (values[i].getProfit()[0] == min[0]) {
            if (!values[i].getProfit()[1]) {
              min = values[i].getProfit();
            }
          }
        }
        return min;
      }
    }

    //Calcula los valores en el resto de nodos del árbol
    function calculateProfit(nodes) {
      var pos = nodes.length - 1;
      var aux;
      var values = [];
      while (pos > 0) {
        values.push(nodes[pos]);
        aux = pos - 1;
        while (values[values.length - 1].getParent() == nodes[aux].getParent()) {
          values.push(nodes[aux]);
          aux--;
        }
        if (nodes[values[values.length - 1].getParent()].getPlayer() == nodes[0].getPlayer()) {
          nodes[values[values.length - 1].getParent()].setProfit(max(values));
          values = [];
        } else {
          nodes[values[values.length - 1].getParent()].setProfit(min(values));
          values = [];
        }
        pos = aux;
      }
      return nodes[0].getProfit();
    }

    //Encuentra el movimiento óptimo luego de aplicar la búsqueda minimax:
    function findMovement(profit, nodes) {
      var min = 0;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].getDepth() == 1 && nodes[i].getProfit()[0] == profit[0] && nodes[i].getProfit()[1] == profit[1]) {
          if (nodes[i].getOffspring() < nodes[min].getOffspring()) {
            min = i;
          }
        }
      }
      return nodes[min].getGeneratingMovemement();
    }

    //Incrementa la descendencia de los nodos de un arreglo
    function incrementNodesOffspring(nodes) {
      var depth = 1;
      var pos = nodes.length - 1;
      var aux;
      while (pos > -1) {
        aux = nodes[pos].getOffspring() + 1;
        if (aux <= depth) {
          nodes[pos].setOffspring(aux);
        }
        pos = nodes[pos].getParent();
        depth++;
      }
    }

    //Aplica búsqueda minimax y retorna la jugada óptima
    function abMiniMax(visitedNodes, nodesToVisit, player) {
      var children;
      var currentNode;
      var newNode;
      var childrenMoves = [];
      // var para mirar el while    
      while (nodesToVisit.length != 0) {
        currentNode = nodesToVisit[0];

        nodesToVisit.splice(0, 1);
        currentNode.setProfit(getNodeUtility(currentNode, player));
        visitedNodes.push(currentNode);

        if (currentNode.getProfit()[1] == false && currentNode.getDepth() < 2) {
          childrenMoves = getAvailableMovements(currentNode.getBoard());
          children = false;
          for (var i = 0; i < childrenMoves.length; i++) {
            newNode = new Node(currentNode.getDepth() + 1, visitedNodes.length - 1,
              childrenMoves[i], generateBoard(currentNode.getBoard(),
                childrenMoves[i], currentNode.getPlayer()), 0,
              changePlayer(currentNode.getPlayer()), 0);
            if (!repeatNode(newNode, visitedNodes)) {
              nodesToVisit.push(newNode);
              children = true;
            }
          }
          if (children) {
            incrementNodesOffspring(visitedNodes);
          }
        }
      }

      var profit = calculateProfit(visitedNodes);

      return findMovement(profit, visitedNodes);
    }
  }, { "ai-agents": 4 }], 1: [function (require, module, exports) {
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
      stop() { }
    }

    module.exports = Agent;
  }, {}], 2: [function (require, module, exports) {

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
            if (this.currentAgentIndex >= keys.length - 1) this.currentAgentIndex = 0; else this.currentAgentIndex++;
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
  }, {}], 3: [function (require, module, exports) {
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
      goalTest(solution) { }
      //TODO return boolean


      /**
       * The transition model. Tells how to change the state (data) based on the given actions. You must override
       * @param {} data 
       * @param {*} action 
       * @param {*} agentID 
       */
      update(data, action, agentID) { }
      //TODO modify data


      /**
       * Gives the world representation for the agent at the current stage
       * @param {*} agentID 
       * @returns and object with the information to be sent to the agent
       */
      perceptionForAgent(data, agentID) { }
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
  }, { "../core/AgentController": 2 }], 4: [function (require, module, exports) {
    const Problem = require('./core/Problem');
    const Agent = require('./core/Agent');
    const AgentController = require('./core/AgentController');

    module.exports = { Problem, Agent, AgentController };
  }, { "./core/Agent": 1, "./core/AgentController": 2, "./core/Problem": 3 }]
}, {}, []);
