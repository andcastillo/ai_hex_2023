require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        return table["deafult"];
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
        this.world = null;
        this.actions = [];
        this.data = { states: [], world: {} };
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
            let action = agent.send();
            this.actions.push({ agentID: agent.getID(), action });
            this.problem.update(this.data, action, agent.getID());
            if (this.problem.goalTest(this.data)) {
                this.finishAll();
                return false;
            } else {
                if (this.callbacks.onTurn) {
                    this.callbacks.onTurn({ actions: this.getActions(), data: this.data });
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
},{"./core/Agent":1,"./core/AgentController":2,"./core/Problem":3}],"/src/HexAgent.js":[function(require,module,exports){
const Agent = require("ai-agents").Agent;
class HexAgent extends Agent {
  constructor(value) {
    super(value);
    this.minimax = this.minimax.bind(this);
    this.send = this.send.bind(this);
  }
  send() {
    //Se encarga de hacer una copia del tablero.
    var board = this.perception.map(function (arr) {
      return arr.slice();
    });
    let size = board.length;
    // Mediante getEmptyHex obtiene las casillas vacias del tablero.
    let disponibles = getEmptyHex(board);
    let nTurn = size * size - disponibles.length;
    if (nTurn == 0) {
      //Si HexAgent arranca como jugador 1 entonces juega en la casilla que está encima del centro.
      return [Math.floor(size / 2) - 1, Math.floor(size / 2)];
    }
    if (nTurn == 1) {
      //Si HexAgent es el jugador 2 entonces juegue directamente al centro.
      return [Math.floor(size / 2), Math.floor(size / 2)];
    }
    let profundidad = 3;
    let max_player = true;
    //Obtiene mediante minimax el mejor movimiento posible de acuerdo a la heurística
    let movimiento = this.minimax(board, profundidad, max_player);
    return [Math.floor(movimiento / board.length), movimiento % board.length];
  }

  minimax(board) {
    var escogencia = [];
    let nodo_raiz = new Node(board, this.id, undefined, -99);
    //Crea una copia superficial del mapa y lo guarda en la variable tablero_raiz
    var tablero_raiz = nodo_raiz.board.map(function (arr) {
      return arr.slice();
    });
    // Obtiene los posibles movimientos a realizar.
    var movimientos = getEmptyHex(tablero_raiz);
    let primer_nivel = 1;
    //En cada iteracion crea una copia del board y sobre cada copia intenta realizar algún movimiento.
    for (let movimiento of movimientos) {
      let tablero_hijo = tablero_raiz.map(function (arr) {
        return arr.slice();
      });
      tablero_hijo[Math.floor(movimiento / tablero_raiz.length)][
        movimiento % tablero_raiz.length
      ] = nodo_raiz.id;
      // Solicita a dijkstra que dado el movimiento probado entonces se calcule el camino mas corto.
      let beta = new Node(tablero_hijo, nodo_raiz.id, nodo_raiz, 99);
      //Retorna el movimiento sin necesidad de hacer más cálculos pues es un movimiento ganador.
      if (beta.dijkstra(nodo_raiz.id, tablero_hijo) === 0) {
        return movimiento;
      }
      // Se almacena el id del oponente en
      let id_oponente = "2";
      if (beta.id !== "1") {
        id_oponente = "1";
      }
      //Se obtienen los espacios en blanco del tablero Hex.
      let movimientos_beta = getEmptyHex(tablero_hijo);
      for (let movimiento_beta of movimientos_beta) {
        let tablero_alfa = beta.board.map(function (arr) {
          return arr.slice();
        });
        // Se crea una copia del tablero para cada posible movimiento,
        // el hijo de beta corresponde a alfa.
        tablero_alfa[Math.floor(movimiento_beta / tablero_hijo.length)][
          movimiento_beta % tablero_hijo.length
        ] = id_oponente;
        // Se crea el nodo que va a representar el movimiento realizado, este nodo sera el alfa.
        let alfa = new Node(tablero_alfa, id_oponente, beta, -99);
        let movimientos_alfa = getEmptyHex(tablero_alfa);
        for (let movimiento_alfa of movimientos_alfa) {
          var tablero_hijo_alfa = tablero_alfa.map(function (arr) {
            return arr.slice();
          });
          // Realiza el movimiento  del nuevo beta, es decir, el hijo de alfa.
          tablero_hijo_alfa[Math.floor(movimiento_alfa / tablero_alfa.length)][
            movimiento_alfa % tablero_alfa.length
          ] = nodo_raiz.id;
          var hijo_alfa = new Node(tablero_hijo_alfa, nodo_raiz.id, alfa, 99);
          // Calcula la heuristica de este nodo de profundidad tres.
          hijo_alfa.calcularHeuristica(hijo_alfa.id, hijo_alfa.board);
          // Si la heuristica del nodo hoja resulta ser mayor que la de su padre (el alfa) entonces
          // el valor de alfa debe ser actualizado pues este nodo maximiza.
          if (hijo_alfa.heuristic > alfa.heuristic) {
            alfa.heuristic = hijo_alfa.heuristic;
          }
          // Se realiza poda
          if (hijo_alfa.heuristic >= beta.heuristic) {
            break;
          }
        }
        //Se pasa a analizar un nivel mas arriba
        primer_nivel = primer_nivel + 1;
        // Si la heuristica de alfa resulta menor que la de beta entonces beta debe tomar ese menor valor
        // pues beta minimiza.
        if (alfa.heuristic < beta.heuristic) {
          beta.heuristic = alfa.heuristic;
        }
        // Se realiza una poda
        if (alfa.heuristic <= nodo_raiz.heuristic) {
          break;
        }
      }
      // Se realiza una comparacion entre beta y la raiz alfa para saber si vale la pena subir un valor.
      if (beta.heuristic > nodo_raiz.heuristic) {
        nodo_raiz.heuristic = beta.heuristic;
        escogencia = movimiento;
      }
    }
    return escogencia;
  }
}

module.exports = HexAgent;

class Node {
    //se crea el constructor de la clase Node que recibe los parámetros: board, id, parent y heuristic.
  constructor(board, id, parent, heuristic) {
    // Establece los valores de las propiedades del objeto Node.

    this.parent = parent; // Propiedad que almacena el nodo padre.
    this.board = board; // Propiedad que almacena el estado del tablero.
    this.id = id; // Propiedad que almacena el identificador del agente asociado al nodo.
    this.heuristic = heuristic; // Propiedad que almacena la heurística asociada al nodo.
  }
  /**
   * Método de la clase Node que calcula la heurística del nodo.
   * Recibe los parámetros: id (identificador del agente) y tablero (estado del tablero).
   * @param {Matrix} tablero
   * @param {Int} id
   */
  calcularHeuristica(id, tablero) {
    
    let oponente = "1"; // Variable para almacenar el identificador del oponente.
    if (id === "1") {
      oponente = "2";
    }
    // Calcula la heurística restando el resultado de la función dijkstra para el oponente y el agente actual.
    let heuristica = this.dijkstra(oponente, tablero) - this.dijkstra(id, tablero);

    this.heuristic = heuristica; // Actualiza el valor de la propiedad heuristic con el resultado calculado.
  }

  /**
   * Implementamos el algoritmo de Dijkstra para encontrar el camino más corto desde 
   * un punto de partida hasta un objetivo en un grafo ponderado.
   * @param {string} id - Identificador del agente.
   * @param {number[][]} tablero - Matriz del tablero.
   * @returns {number} - El costo mínimo del camino o 99 si no se encontró un camino válido.
   */
  dijkstra(id, tablero) {
    let colaDijkstra = []; // Cola de prioridad para los nodos a visitar
    let tableroSize = tablero.length; // Tamaño del tablero
    // Definimos la matriz de costos mínimos encontrados
    let matrizCostos = new Array(tableroSize * tableroSize); 
    matrizCostos.fill(99); // Inicializar con un valor alto (99)

    let coorVisitadas = new Set(); // Conjunto para almacenar las coordenadas ya visitadas
    let costosIniciales = { 1: 0, 2: 99, 0: 1 }; // Costos iniciales asociados a los símbolos en el tablero

    // Si el agente es '1', llenar la primera columna de matrizCostos y agregar nodos iniciales a la cola
    if (id === "1") {
      for (let i = 0; i < tableroSize; i++) {
        colaDijkstra.push(
          new nodeDijkstra(i * tableroSize, costosIniciales[tablero[i][0]])
        );
        matrizCostos[i * tableroSize] = costosIniciales[tablero[i][0]];
      }
    }
    // Si el agente es '2', llenar la primera fila de matrizCostos y agregar nodos iniciales a la cola
    else {
      if (id === "2") {
        costosIniciales = { 1: 99, 2: 0, 0: 1 }; // Intercambiar los costos asociados a los símbolos
        for (let i = 0; i < tableroSize; i++) {
          colaDijkstra.push(new nodeDijkstra(i, costosIniciales[tablero[0][i]]));
          matrizCostos[i] = costosIniciales[tablero[0][i]];
        }
      }
    }

    colaDijkstra.sort((a, b) => (a.costo > b.costo ? 1 : -1)); // Ordenar la cola de prioridad por peso ascendente

    while (colaDijkstra.length) {
      let currentNodeDijkstra = colaDijkstra.shift(); // Extraer el nodo con el peso mínimo de la cola

      if (coorVisitadas.has(currentNodeDijkstra.coordenada)) {
        continue; // Si ya se visitó este nodo, omitirlo
      }
      coorVisitadas.add(currentNodeDijkstra.coordenada); // Marcar el nodo como visitado

      // Comprobar si se ha alcanzado una condición de victoria dependiendo del agente
      if (id === "1") {
        if ((currentNodeDijkstra.coordenada + 1) % tableroSize === 0) {
          return currentNodeDijkstra.costo; // Se alcanzó el objetivo, retornar el peso actual
        }
      } else {
        if (id === "2") {
          if (currentNodeDijkstra.coordenada >= tableroSize * tableroSize - tableroSize) {
            return currentNodeDijkstra.costo; // Se alcanzó el objetivo, retornar el peso actual
          }
        }
      }
      // Obtener las coordenadas de los nodos adyacentes
      let adyacentesCoordenadas = this.coorAdyacente(
        currentNodeDijkstra,
        tableroSize
      ); 

      for (let nodeAyacente of adyacentesCoordenadas) {
        let rowNodeAdyacente = Math.floor(nodeAyacente / tableroSize);
        let colNodeAdyacente = nodeAyacente % tableroSize;
        // Calcula el costo del nodo adyacente
        let costoNodeAdyacente =
          currentNodeDijkstra.costo + costosIniciales[tablero[rowNodeAdyacente][colNodeAdyacente]]; 
        if (costoNodeAdyacente < matrizCostos[nodeAyacente]) {
          matrizCostos[nodeAyacente] = costoNodeAdyacente;
          colaDijkstra.push(new nodeDijkstra(nodeAyacente, costoNodeAdyacente)); // Agregar el nodo adyacente a la cola con su costo actualizado
        }
      }
      colaDijkstra.sort((a, b) => (a.costo > b.costo ? 1 : -1)); // Ordenar nuevamente la cola de prioridad
    }

    return 99; // No se encontró un camino válido, retornar un valor alto
  }

  /**
 * Obtiene las coordenadas de los nodos adyacentes a un nodo dado en un tablero cuadrado.
 * @param {object} nodeActual - Nodo actual de Dijkstra con la propiedad 'coordenada'.
 * @param {number} size - Tamaño del tablero cuadrado.
 * @returns {number[]} - Coordenadas de los nodos adyacentes.
 */
    coorAdyacente(nodeActual, size) {
    let coorActual = nodeActual.coordenada; // Coordenada actual del nodo
    let row = Math.floor(nodeActual.coordenada / size); // Fila correspondiente a la coordenada actual
    let col = nodeActual.coordenada % size; // Columna correspondiente a la coordenada actual
    let result = []; // Array para almacenar las coordenadas de los nodos adyacentes
  
    // Verificar si hay una fila anterior y agregar la coordenada superior a 'result'
    if (row > 0) {
      result.push(coorActual - size);
    }
    // Verificar si hay una fila anterior y una columna siguiente, y agregar la coordenada diagonal superior derecha a 'result'
    if (row > 0 && col + 1 < size) {
      result.push(coorActual - size + 1);
    }
    // Verificar si hay una columna anterior y agregar la coordenada izquierda a 'result'
    if (col > 0) {
      result.push(coorActual - 1);
    }
    // Verificar si hay una columna siguiente y agregar la coordenada derecha a 'result'
    if (col + 1 < size) {
      result.push(coorActual + 1);
    }
    // Verificar si hay una fila siguiente y una columna anterior, y agregar la coordenada diagonal inferior izquierda a 'result'
    if (row + 1 < size && col > 0) {
      result.push(coorActual + size - 1);
    }
    // Verificar si hay una fila siguiente y agregar la coordenada inferior a 'result'
    if (row + 1 < size) {
      result.push(coorActual + size);
    }
    return result; // Retornar las coordenadas de los nodos adyacentes
  }
  
}

class nodeDijkstra {
  constructor(coordenada, costo) {
    this.coordenada = coordenada;
    this.costo = costo;
  }
}

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

},{"ai-agents":4}]},{},[]);
