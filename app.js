// app.js – Enhanced Quantum Circuit Builder with Code Import & Visualization

//------------------------------------------------------------
// Complex number utilities
//------------------------------------------------------------
class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }

  static from(other) {
    return new Complex(other.re, other.im);
  }

  static add(a, b) {
    return new Complex(a.re + b.re, a.im + b.im);
  }

  static sub(a, b) {
    return new Complex(a.re - b.re, a.im - b.im);
  }

  static mul(a, b) {
    return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  }

  static conj(a) {
    return new Complex(a.re, -a.im);
  }

  static magnitudeSquared(a) {
    return a.re * a.re + a.im * a.im;
  }

  toString() {
    const re = this.re.toFixed(3);
    const im = this.im.toFixed(3);
    return `${re} ${this.im >= 0 ? "+" : "-"} ${Math.abs(im)}i`;
  }
}

//------------------------------------------------------------
// Gate matrices (single qubit)
//------------------------------------------------------------
const SQRT1_2 = 1 / Math.sqrt(2);
const SINGLE_QUBIT_GATES = {
  h: [
    [new Complex(SQRT1_2, 0), new Complex(SQRT1_2, 0)],
    [new Complex(SQRT1_2, 0), new Complex(-SQRT1_2, 0)],
  ],
  x: [
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)],
  ],
  y: [
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)],
  ],
  z: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)],
  ],
  s: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)],
  ],
  t: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.SQRT1_2, Math.SQRT1_2)],
  ],
};

//------------------------------------------------------------
// SimpleQuantumCircuit – enhanced with import functionality
//------------------------------------------------------------
class SimpleQuantumCircuit {
  constructor(qubits = 3, cols = 8) {
    this.numQubits = qubits;
    this.numCols = cols;
    this.gates = [];
    this.history = [[]];
  }

  addGate(gate, qubit, col, params = {}) {
    if (qubit >= this.numQubits) throw new Error("Invalid qubit index");
    if ((gate === "cx" || gate === "cz") && qubit + 1 >= this.numQubits) {
      throw new Error("Not enough qubits for two-qubit gate");
    }
    this.gates.push({ gate, qubit, col, params });
    this.history.push(JSON.parse(JSON.stringify(this.gates)));
  }

  clear() {
    this.gates = [];
    this.history = [[]];
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      this.gates = JSON.parse(
        JSON.stringify(this.history[this.history.length - 1])
      );
    }
  }

  exportCode(language) {
    switch (language) {
      case "qasm":
        return this.exportQASM();
      case "qiskit":
        return this.exportQiskit();
      case "cirq":
        return this.exportCirq();
      case "qsharp":
        return this.exportQSharp();
      case "quil":
        return this.exportQuil();
      default:
        return this.exportQASM();
    }
  }

  exportQASM() {
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\n`;
    qasm += `qreg q[${this.numQubits}];\n`;
    qasm += `creg c[${this.numQubits}];\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
        case "x":
        case "y":
        case "z":
        case "s":
        case "t":
          qasm += `${g.gate} q[${g.qubit}];\n`;
          break;
        case "cx":
          qasm += `cx q[${g.qubit}],q[${g.qubit + 1}];\n`;
          break;
        case "cz":
          qasm += `cz q[${g.qubit}],q[${g.qubit + 1}];\n`;
          break;
        case "measure":
          qasm += `measure q[${g.qubit}] -> c[${g.qubit}];\n`;
          break;
      }
    });
    return qasm;
  }

  exportQiskit() {
    let code = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n\n`;
    code += `# Create quantum circuit\n`;
    code += `qr = QuantumRegister(${this.numQubits}, 'q')\n`;
    code += `cr = ClassicalRegister(${this.numQubits}, 'c')\n`;
    code += `circuit = QuantumCircuit(qr, cr)\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
        case "x":
        case "y":
        case "z":
        case "s":
        case "t":
          code += `circuit.${g.gate}(qr[${g.qubit}])\n`;
          break;
        case "cx":
          code += `circuit.cx(qr[${g.qubit}], qr[${g.qubit + 1}])\n`;
          break;
        case "cz":
          code += `circuit.cz(qr[${g.qubit}], qr[${g.qubit + 1}])\n`;
          break;
        case "measure":
          code += `circuit.measure(qr[${g.qubit}], cr[${g.qubit}])\n`;
          break;
      }
    });
    return code;
  }

  exportCirq() {
    let code = `import cirq\n\n`;
    code += `# Create qubits\n`;
    for (let i = 0; i < this.numQubits; i++) {
      code += `q${i} = cirq.GridQubit(${i}, 0)\n`;
    }
    code += `\n# Create circuit\ncircuit = cirq.Circuit()\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `circuit.append(cirq.H(q${g.qubit}))\n`;
          break;
        case "x":
          code += `circuit.append(cirq.X(q${g.qubit}))\n`;
          break;
        case "y":
          code += `circuit.append(cirq.Y(q${g.qubit}))\n`;
          break;
        case "z":
          code += `circuit.append(cirq.Z(q${g.qubit}))\n`;
          break;
        case "s":
          code += `circuit.append(cirq.S(q${g.qubit}))\n`;
          break;
        case "t":
          code += `circuit.append(cirq.T(q${g.qubit}))\n`;
          break;
        case "cx":
          code += `circuit.append(cirq.CNOT(q${g.qubit}, q${g.qubit + 1}))\n`;
          break;
        case "cz":
          code += `circuit.append(cirq.CZ(q${g.qubit}, q${g.qubit + 1}))\n`;
          break;
        case "measure":
          code += `circuit.append(cirq.measure(q${g.qubit}))\n`;
          break;
      }
    });
    return code;
  }

  exportQSharp() {
    let code = `namespace QuantumCircuit {\n    open Microsoft.Quantum.Canon;\n    open Microsoft.Quantum.Intrinsic;\n\n`;
    code += `    operation RunCircuit() : Unit {\n`;
    code += `        using (qubits = Qubit[${this.numQubits}]) {\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `            H(qubits[${g.qubit}]);\n`;
          break;
        case "x":
          code += `            X(qubits[${g.qubit}]);\n`;
          break;
        case "y":
          code += `            Y(qubits[${g.qubit}]);\n`;
          break;
        case "z":
          code += `            Z(qubits[${g.qubit}]);\n`;
          break;
        case "s":
          code += `            S(qubits[${g.qubit}]);\n`;
          break;
        case "t":
          code += `            T(qubits[${g.qubit}]);\n`;
          break;
        case "cx":
          code += `            CNOT(qubits[${g.qubit}], qubits[${
            g.qubit + 1
          }]);\n`;
          break;
        case "cz":
          code += `            CZ(qubits[${g.qubit}], qubits[${
            g.qubit + 1
          }]);\n`;
          break;
        case "measure":
          code += `            M(qubits[${g.qubit}]);\n`;
          break;
      }
    });

    code += `            ResetAll(qubits);\n        }\n    }\n}`;
    return code;
  }

  exportQuil() {
    let code = `# Quantum circuit in Quil\n`;
    code += `DECLARE mem BIT[${this.numQubits}]\n\n`;

    const sorted = [...this.gates].sort((a, b) => a.col - b.col);
    sorted.forEach((g) => {
      switch (g.gate) {
        case "h":
          code += `H ${g.qubit}\n`;
          break;
        case "x":
          code += `X ${g.qubit}\n`;
          break;
        case "y":
          code += `Y ${g.qubit}\n`;
          break;
        case "z":
          code += `Z ${g.qubit}\n`;
          break;
        case "s":
          code += `S ${g.qubit}\n`;
          break;
        case "t":
          code += `T ${g.qubit}\n`;
          break;
        case "cx":
          code += `CNOT ${g.qubit} ${g.qubit + 1}\n`;
          break;
        case "cz":
          code += `CZ ${g.qubit} ${g.qubit + 1}\n`;
          break;
        case "measure":
          code += `MEASURE ${g.qubit} mem[${g.qubit}]\n`;
          break;
      }
    });
    return code;
  }

  simulateStateVector() {
    if (this.numQubits > 4) throw new Error("Simulation limited to 4 qubits");
    const dim = 1 << this.numQubits;
    let state = Array(dim)
      .fill(0)
      .map(() => new Complex(0, 0));
    state[0] = new Complex(1, 0);

    const orderedGates = [...this.gates].sort((a, b) => a.col - b.col);

    for (const g of orderedGates) {
      if (SINGLE_QUBIT_GATES[g.gate]) {
        state = applySingleQubitGate(
          state,
          this.numQubits,
          g.qubit,
          SINGLE_QUBIT_GATES[g.gate]
        );
      } else if (g.gate === "cx") {
        state = applyCX(state, this.numQubits, g.qubit, g.qubit + 1);
      } else if (g.gate === "cz") {
        state = applyCZ(state, this.numQubits, g.qubit, g.qubit + 1);
      }
    }

    return state;
  }

  probabilityDistribution() {
    try {
      const state = this.simulateStateVector();
      const probs = {};
      state.forEach((amp, idx) => {
        const bin = idx.toString(2).padStart(this.numQubits, "0");
        probs[bin] = Complex.magnitudeSquared(amp);
      });
      return probs;
    } catch (e) {
      const states = Math.pow(2, this.numQubits);
      const probs = {};
      for (let i = 0; i < states; i++) {
        const state = i.toString(2).padStart(this.numQubits, "0");
        probs[state] = i === 0 ? 1 : 0;
      }
      return probs;
    }
  }
}

//------------------------------------------------------------
// Code Parsers
//------------------------------------------------------------
class CodeParsers {
  static parseQASM(code) {
    const gates = [];
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) => line && !line.startsWith("#") && !line.startsWith("//")
      );

    let numQubits = 3;
    let currentCol = 0;

    for (const line of lines) {
      if (line.includes("qreg q[")) {
        const match = line.match(/qreg q\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }

      if (
        line.startsWith("OPENQASM") ||
        line.startsWith("include") ||
        line.startsWith("creg")
      )
        continue;

      // Parse gates
      if (line.match(/^[hxyzst] q\[(\d+)\]/)) {
        const match = line.match(/^([hxyzst]) q\[(\d+)\]/);
        if (match) {
          gates.push({
            gate: match[1],
            qubit: parseInt(match[2]),
            col: currentCol++,
          });
        }
      } else if (line.match(/^c[xz] q\[(\d+)\],q\[(\d+)\]/)) {
        const match = line.match(/^c([xz]) q\[(\d+)\],q\[(\d+)\]/);
        if (match) {
          gates.push({
            gate: `c${match[1]}`,
            qubit: parseInt(match[2]),
            col: currentCol++,
          });
        }
      } else if (line.match(/^measure q\[(\d+)\]/)) {
        const match = line.match(/^measure q\[(\d+)\]/);
        if (match) {
          gates.push({
            gate: "measure",
            qubit: parseInt(match[1]),
            col: currentCol++,
          });
        }
      }
    }

    return { gates, numQubits };
  }

  static parseQiskit(code) {
    const gates = [];
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    let numQubits = 3;
    let currentCol = 0;

    for (const line of lines) {
      if (line.includes("QuantumRegister(")) {
        const match = line.match(/QuantumRegister\((\d+)/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }

      // Parse single qubit gates
      const singleMatch = line.match(/circuit\.([hxyzst])\(qr\[(\d+)\]\)/);
      if (singleMatch) {
        gates.push({
          gate: singleMatch[1],
          qubit: parseInt(singleMatch[2]),
          col: currentCol++,
        });
        continue;
      }

      // Parse two qubit gates
      const twoMatch = line.match(
        /circuit\.(c[xz])\(qr\[(\d+)\], qr\[(\d+)\]\)/
      );
      if (twoMatch) {
        gates.push({
          gate: twoMatch[1],
          qubit: parseInt(twoMatch[2]),
          col: currentCol++,
        });
        continue;
      }

      // Parse measure
      if (line.includes("circuit.measure")) {
        const measureMatch = line.match(/circuit\.measure\(qr\[(\d+)\]/);
        if (measureMatch) {
          gates.push({
            gate: "measure",
            qubit: parseInt(measureMatch[1]),
            col: currentCol++,
          });
        }
      }
    }

    return { gates, numQubits };
  }

  static parseCirq(code) {
    const gates = [];
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    let numQubits = 3;
    let currentCol = 0;

    // Count qubits
    const qubitLines = lines.filter((line) =>
      line.match(/q\d+ = cirq\.GridQubit/)
    );
    if (qubitLines.length > 0) numQubits = qubitLines.length;

    for (const line of lines) {
      // Parse single qubit gates
      const singleMatch = line.match(
        /circuit\.append\(cirq\.([HXYZT])\(q(\d+)\)\)/
      );
      if (singleMatch) {
        gates.push({
          gate: singleMatch[1].toLowerCase(),
          qubit: parseInt(singleMatch[2]),
          col: currentCol++,
        });
        continue;
      }

      // Parse two qubit gates
      const cnotMatch = line.match(
        /circuit\.append\(cirq\.CNOT\(q(\d+), q(\d+)\)\)/
      );
      if (cnotMatch) {
        gates.push({
          gate: "cx",
          qubit: parseInt(cnotMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      const czMatch = line.match(
        /circuit\.append\(cirq\.CZ\(q(\d+), q(\d+)\)\)/
      );
      if (czMatch) {
        gates.push({
          gate: "cz",
          qubit: parseInt(czMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      // Parse measure
      if (line.includes("cirq.measure")) {
        const measureMatch = line.match(
          /circuit\.append\(cirq\.measure\(q(\d+)\)\)/
        );
        if (measureMatch) {
          gates.push({
            gate: "measure",
            qubit: parseInt(measureMatch[1]),
            col: currentCol++,
          });
        }
      }
    }

    return { gates, numQubits };
  }

  static parseQSharp(code) {
    const gates = [];
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"));

    let numQubits = 3;
    let currentCol = 0;

    for (const line of lines) {
      if (line.includes("Qubit[")) {
        const match = line.match(/Qubit\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }

      // Parse gates
      const gateMatch = line.match(/([HXYZT])\(qubits\[(\d+)\]\)/);
      if (gateMatch) {
        gates.push({
          gate: gateMatch[1].toLowerCase(),
          qubit: parseInt(gateMatch[2]),
          col: currentCol++,
        });
        continue;
      }

      const cnotMatch = line.match(/CNOT\(qubits\[(\d+)\], qubits\[(\d+)\]\)/);
      if (cnotMatch) {
        gates.push({
          gate: "cx",
          qubit: parseInt(cnotMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      const czMatch = line.match(/CZ\(qubits\[(\d+)\], qubits\[(\d+)\]\)/);
      if (czMatch) {
        gates.push({
          gate: "cz",
          qubit: parseInt(czMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      if (line.includes("M(qubits[")) {
        const measureMatch = line.match(/M\(qubits\[(\d+)\]\)/);
        if (measureMatch) {
          gates.push({
            gate: "measure",
            qubit: parseInt(measureMatch[1]),
            col: currentCol++,
          });
        }
      }
    }

    return { gates, numQubits };
  }

  static parseQuil(code) {
    const gates = [];
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    let numQubits = 3;
    let currentCol = 0;

    for (const line of lines) {
      if (line.includes("DECLARE mem BIT[")) {
        const match = line.match(/DECLARE mem BIT\[(\d+)\]/);
        if (match) numQubits = parseInt(match[1]);
        continue;
      }

      // Parse single qubit gates
      const singleMatch = line.match(/^([HXYZT]) (\d+)$/);
      if (singleMatch) {
        gates.push({
          gate: singleMatch[1].toLowerCase(),
          qubit: parseInt(singleMatch[2]),
          col: currentCol++,
        });
        continue;
      }

      // Parse two qubit gates
      const cnotMatch = line.match(/^CNOT (\d+) (\d+)$/);
      if (cnotMatch) {
        gates.push({
          gate: "cx",
          qubit: parseInt(cnotMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      const czMatch = line.match(/^CZ (\d+) (\d+)$/);
      if (czMatch) {
        gates.push({
          gate: "cz",
          qubit: parseInt(czMatch[1]),
          col: currentCol++,
        });
        continue;
      }

      // Parse measure
      const measureMatch = line.match(/^MEASURE (\d+)/);
      if (measureMatch) {
        gates.push({
          gate: "measure",
          qubit: parseInt(measureMatch[1]),
          col: currentCol++,
        });
      }
    }

    return { gates, numQubits };
  }

  static parse(code, language) {
    try {
      switch (language) {
        case "qasm":
          return this.parseQASM(code);
        case "qiskit":
          return this.parseQiskit(code);
        case "cirq":
          return this.parseCirq(code);
        case "qsharp":
          return this.parseQSharp(code);
        case "quil":
          return this.parseQuil(code);
        default:
          throw new Error("Unsupported language");
      }
    } catch (error) {
      throw new Error(`Parse error: ${error.message}`);
    }
  }
}

//------------------------------------------------------------
// Linear algebra helpers
//------------------------------------------------------------
function applySingleQubitGate(state, n, target, matrix) {
  const dim = state.length;
  const newState = state.map(() => new Complex(0, 0));
  const bit = 1 << (n - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & bit) === 0) {
      const idx0 = i;
      const idx1 = i | bit;
      const amp0 = state[idx0];
      const amp1 = state[idx1];

      const new0 = Complex.add(
        Complex.mul(matrix[0][0], amp0),
        Complex.mul(matrix[0][1], amp1)
      );
      const new1 = Complex.add(
        Complex.mul(matrix[1][0], amp0),
        Complex.mul(matrix[1][1], amp1)
      );
      newState[idx0] = new0;
      newState[idx1] = new1;
    }
  }
  return newState;
}

function applyCX(state, n, control, target) {
  const dim = state.length;
  const newState = state.map((c) => Complex.from(c));
  const cbit = 1 << (n - 1 - control);
  const tbit = 1 << (n - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & cbit) !== 0 && (i & tbit) === 0) {
      const idx0 = i;
      const idx1 = i | tbit;
      const temp = newState[idx0];
      newState[idx0] = newState[idx1];
      newState[idx1] = temp;
    }
  }
  return newState;
}

function applyCZ(state, n, control, target) {
  const dim = state.length;
  const newState = state.map((c) => Complex.from(c));
  const cbit = 1 << (n - 1 - control);
  const tbit = 1 << (n - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & cbit) !== 0 && (i & tbit) !== 0) {
      newState[i] = Complex.mul(newState[i], new Complex(-1, 0));
    }
  }
  return newState;
}

//------------------------------------------------------------
// Global variables
//------------------------------------------------------------
let circuit;
let codeEditor;
let importEditor;
let blochScene, blochCamera, blochRenderer, blochVector, blochArrow;
let resultsChart;
let currentTab = "code";
let blochInitialized = false;
let resultsInitialized = false;

//------------------------------------------------------------
// Initialization
//------------------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
  circuit = new SimpleQuantumCircuit(3, 8);
  await setupEditors();
  buildGatePalette();
  setupTabs();
  setupToolbar();
  setupImportPanel();
  drawCircuit();

  refreshCode();
  showToast("Quantum Circuit Builder loaded successfully!");
});

//------------------------------------------------------------
// Monaco Editors
//------------------------------------------------------------
async function setupEditors() {
  return new Promise((resolve) => {
    if (typeof require === "undefined") {
      const codeContainer = document.getElementById("codeEditor");
      codeContainer.innerHTML =
        '<textarea class="form-control" rows="15" readonly id="codeTextarea">// Loading...</textarea>';
      const importContainer = document.getElementById("importEditor");
      importContainer.innerHTML =
        '<textarea class="form-control" rows="8" id="importTextarea">// Paste quantum code here</textarea>';
      resolve();
      return;
    }

    require.config({
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" },
    });
    require(["vs/editor/editor.main"], () => {
      try {
        codeEditor = monaco.editor.create(
          document.getElementById("codeEditor"),
          {
            value: "// Quantum code will appear here\n",
            language: "plaintext",
            theme: "vs-dark",
            readOnly: true,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }
        );

        importEditor = monaco.editor.create(
          document.getElementById("importEditor"),
          {
            value: "// Paste quantum code here\n",
            language: "plaintext",
            theme: "vs-dark",
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }
        );

        refreshCode();
        resolve();
      } catch (e) {
        console.error("Monaco setup failed:", e);
        resolve();
      }
    });
  });
}

//------------------------------------------------------------
// Import Panel Setup
//------------------------------------------------------------
function setupImportPanel() {
  const visualiseBtn = document.getElementById("btnVisualise");
  const clearImportBtn = document.getElementById("btnClearImport");
  const importLangSelect = document.getElementById("importLangSelect");

  visualiseBtn.addEventListener("click", () => {
    visualiseFromCode();
  });

  clearImportBtn.addEventListener("click", () => {
    if (importEditor && typeof importEditor.setValue === "function") {
      importEditor.setValue("// Paste quantum code here\n");
    } else {
      const textarea = document.getElementById("importTextarea");
      if (textarea) textarea.value = "// Paste quantum code here";
    }
    showImportStatus("Import cleared", "success");
  });

  importLangSelect.addEventListener("change", () => {
    updateImportEditorLanguage();
  });

  updateImportEditorLanguage();
}

function updateImportEditorLanguage() {
  const language = document.getElementById("importLangSelect").value;
  if (importEditor && typeof importEditor.setModelLanguage === "function") {
    const monacoLanguage = language === "qasm" ? "plaintext" : "python";
    monaco.editor.setModelLanguage(importEditor.getModel(), monacoLanguage);
  }
}

function visualiseFromCode() {
  const language = document.getElementById("importLangSelect").value;
  let code = "";

  if (importEditor && typeof importEditor.getValue === "function") {
    code = importEditor.getValue();
  } else {
    const textarea = document.getElementById("importTextarea");
    if (textarea) code = textarea.value;
  }

  if (!code.trim() || code.trim() === "// Paste quantum code here") {
    showImportStatus("Please paste some quantum code first", "error");
    return;
  }

  try {
    showImportStatus("Parsing code...", "info");
    const visualiseBtn = document.getElementById("btnVisualise");
    visualiseBtn.classList.add("loading");

    setTimeout(() => {
      try {
        const { gates, numQubits } = CodeParsers.parse(code, language);

        // Update circuit
        circuit.clear();
        circuit.numQubits = numQubits;
        circuit.numCols = Math.max(8, gates.length + 2);

        // Add gates to circuit
        gates.forEach((g) => {
          circuit.addGate(g.gate, g.qubit, g.col, g.params || {});
        });

        // Update visualizations
        drawCircuit();
        refreshCode();
        updateVisualizations();

        showImportStatus(
          `Successfully imported ${gates.length} gates on ${numQubits} qubits`,
          "success"
        );
        showToast(`Circuit imported from ${language.toUpperCase()}!`);

        // Switch to circuit view
        switchToTab("code");
      } catch (error) {
        showImportStatus(`Error: ${error.message}`, "error");
        showToast(`Import failed: ${error.message}`, "error");
      } finally {
        visualiseBtn.classList.remove("loading");
      }
    }, 300); // Small delay for visual feedback
  } catch (error) {
    showImportStatus(`Error: ${error.message}`, "error");
    showToast(`Import failed: ${error.message}`, "error");
  }
}

function showImportStatus(message, type) {
  const statusDiv = document.getElementById("importStatus");
  statusDiv.textContent = message;
  statusDiv.className = `import-status ${type}`;
}

//------------------------------------------------------------
// Gate Palette
//------------------------------------------------------------
function buildGatePalette() {
  const gates = [
    { name: "H", gate: "h" },
    { name: "X", gate: "x" },
    { name: "Y", gate: "y" },
    { name: "Z", gate: "z" },
    { name: "S", gate: "s" },
    { name: "T", gate: "t" },
    { name: "CX", gate: "cx" },
    { name: "CZ", gate: "cz" },
    { name: "M", gate: "measure" },
  ];

  const palette = document.getElementById("gatePalette");
  palette.innerHTML = "";

  gates.forEach((g) => {
    const tile = document.createElement("div");
    tile.className = `gate-tile gate-${g.gate}`;
    tile.textContent = g.name;
    tile.dataset.gate = g.gate;
    tile.draggable = true;
    tile.addEventListener("dragstart", onGateDragStart);
    tile.addEventListener("dragend", onGateDragEnd);
    palette.appendChild(tile);
  });
}

function onGateDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.gate);
  e.target.classList.add("dragging");
  document.querySelector(".circuit-wrapper").classList.add("drag-over");
}

function onGateDragEnd(e) {
  e.target.classList.remove("dragging");
  document.querySelector(".circuit-wrapper").classList.remove("drag-over");
}

//------------------------------------------------------------
// Circuit Drawing (SVG)
//------------------------------------------------------------
function drawCircuit() {
  const canvas = document.getElementById("circuitCanvas");
  canvas.innerHTML = "";
  const width = circuit.numCols * 80 + 100;
  const height = circuit.numQubits * 80 + 60;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  // Qubit lines & labels
  for (let q = 0; q < circuit.numQubits; q++) {
    const y = 40 + q * 80;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 60);
    line.setAttribute("y1", y);
    line.setAttribute("x2", width - 40);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "var(--color-border)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 30);
    text.setAttribute("y", y + 5);
    text.setAttribute("fill", "var(--color-text)");
    text.setAttribute("font-size", "14");
    text.setAttribute("font-weight", "500");
    text.textContent = `q${q}`;
    svg.appendChild(text);
  }

  console.log("hekllo");
  
  // Gates
  circuit.gates.forEach((g) => {
    const x = 60 + g.col * 80;
    const y = 40 + g.qubit * 80;

    if (g.gate === "cx" || g.gate === "cz") {
      const controlY = y;
      const targetY = 40 + (g.qubit + 1) * 80;

      // control dot
      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", controlY);
      dot.setAttribute("r", 5);
      dot.setAttribute("fill", "var(--color-text)");
      svg.appendChild(dot);

      // vertical line
      const vline = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      vline.setAttribute("x1", x);
      vline.setAttribute("y1", controlY);
      vline.setAttribute("x2", x);
      vline.setAttribute("y2", targetY);
      vline.setAttribute("stroke", "var(--color-text)");
      vline.setAttribute("stroke-width", "2");
      svg.appendChild(vline);

      // target shape
      if (g.gate === "cx") {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", targetY);
        circle.setAttribute("r", 18);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "var(--color-text)");
        circle.setAttribute("stroke-width", "2");
        svg.appendChild(circle);

        const cross1 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        cross1.setAttribute("x1", x - 10);
        cross1.setAttribute("y1", targetY);
        cross1.setAttribute("x2", x + 10);
        cross1.setAttribute("y2", targetY);
        cross1.setAttribute("stroke", "var(--color-text)");
        cross1.setAttribute("stroke-width", "2");
        svg.appendChild(cross1);

        const cross2 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        cross2.setAttribute("x1", x);
        cross2.setAttribute("y1", targetY - 10);
        cross2.setAttribute("x2", x);
        cross2.setAttribute("y2", targetY + 10);
        cross2.setAttribute("stroke", "var(--color-text)");
        cross2.setAttribute("stroke-width", "2");
        svg.appendChild(cross2);
      } else if (g.gate === "cz") {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", x - 18);
        rect.setAttribute("y", targetY - 18);
        rect.setAttribute("width", 36);
        rect.setAttribute("height", 36);
        rect.setAttribute("rx", 6);
        rect.setAttribute("fill", "var(--color-secondary)");
        rect.setAttribute("stroke", "var(--color-border)");
        rect.setAttribute("stroke-width", "1");
        svg.appendChild(rect);

        const txt = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        txt.setAttribute("x", x);
        txt.setAttribute("y", targetY + 5);
        txt.setAttribute("fill", "var(--color-text)");
        txt.setAttribute("font-size", "12");
        txt.setAttribute("font-weight", "500");
        txt.setAttribute("text-anchor", "middle");
        txt.textContent = "Z";
        svg.appendChild(txt);
      }
    } else {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x - 18);
      rect.setAttribute("y", y - 18);
      rect.setAttribute("width", 36);
      rect.setAttribute("height", 36);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", "var(--color-secondary)");
      rect.setAttribute("stroke", "var(--color-border)");
      rect.setAttribute("stroke-width", "1");
      svg.appendChild(rect);

      const txt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      txt.setAttribute("x", x);
      txt.setAttribute("y", y + 6);
      txt.setAttribute("fill", "var(--color-text)");
      txt.setAttribute("font-size", "12");
      txt.setAttribute("font-weight", "500");
      txt.setAttribute("text-anchor", "middle");
      txt.textContent = g.gate.toUpperCase().replace("MEASURE", "M");
      svg.appendChild(txt);
    }
  });

  // Drop zones
  for (let row = 0; row < circuit.numQubits; row++) {
    for (let col = 0; col < circuit.numCols; col++) {
      const zone = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      zone.setAttribute("x", 42 + col * 80);
      zone.setAttribute("y", 22 + row * 80);
      zone.setAttribute("width", 36);
      zone.setAttribute("height", 36);
      zone.setAttribute("fill", "transparent");
      zone.dataset.row = row;
      zone.dataset.col = col;
      svg.appendChild(zone);
    }
  }

  canvas.appendChild(svg);

  console.log("efjhdskjfhekjgdf",canvas.querySelectorAll("rect[data-row]"));
  
  // Drag events for drop-zones
  canvas.querySelectorAll("rect[data-row]").forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", onDropGate);
  });

  document.getElementById(
    "circuitInfo"
  ).textContent = `${circuit.numQubits} qubits, ${circuit.numCols} columns`;
}

function onDropGate(e) {
  console.log("onDropGate called!");
  e.preventDefault();
  
  const gateName = e.dataTransfer.getData("text/plain");
  const row = parseInt(e.target.dataset.row, 10);
  const col = parseInt(e.target.dataset.col, 10);

  try {
    // Call the addGate function from composer.html
    if (typeof addGate === "function") {
      console.log("Calling addGate function:", gateName, row);
      
      if (gateName === "cx") {
        addGate("CNOT", row + 1, row); // target, control
      } else if (gateName === "cz") {
        addGate("CZ", row + 1, row);
      } else {
        addGate(gateName.toUpperCase(), row);
      }
    }
    
    // Still update the app.js circuit for consistency
    circuit.addGate(gateName, row, col);
    drawCircuit();
    refreshCode();
    updateVisualizations();
    showToast(`Added ${gateName.toUpperCase()} gate on q${row}`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

//------------------------------------------------------------
// Tabs and Toolbar
//------------------------------------------------------------
function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      switchToTab(target);
    });
  });
}

function switchToTab(target) {
  currentTab = target;

  document
    .querySelectorAll(".tab-button")
    .forEach((b) => b.classList.remove("active"));
  document.querySelector(`[data-tab="${target}"]`).classList.add("active");

  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById(`${target}Tab`).classList.add("active");

  if (target === "bloch" && !blochInitialized) {
    setTimeout(() => {
      initBlochSphere();
      blochInitialized = true;
    }, 100);
  } else if (target === "results" && !resultsInitialized) {
    setTimeout(() => {
      initResultsChart();
      resultsInitialized = true;
    }, 100);
  }

  if (target === "bloch" && blochInitialized) {
    updateBlochSphereFromCircuit();
  } else if (target === "results" && resultsInitialized) {
    updateResultsChart();
  }
}

function setupToolbar() {
  q("btnAddQubit").addEventListener("click", () => {
    circuit.numQubits++;
    drawCircuit();
    refreshCode();
    updateVisualizations();
    showToast("Added qubit");
  });

  q("btnRemoveQubit").addEventListener("click", () => {
    if (circuit.numQubits > 1) {
      circuit.numQubits--;
      circuit.gates = circuit.gates.filter((g) => g.qubit < circuit.numQubits);
      drawCircuit();
      refreshCode();
      updateVisualizations();
      showToast("Removed qubit");
    }
  });

  q("btnUndo").addEventListener("click", () => {
    circuit.undo();
    drawCircuit();
    refreshCode();
    updateVisualizations();
    showToast("Undone");
  });

  q("btnRedo").addEventListener("click", () =>
    showToast("Redo not implemented", "warning")
  );

  q("btnClear").addEventListener("click", () => {
    circuit.clear();
    drawCircuit();
    refreshCode();
    updateVisualizations();
    showToast("Circuit cleared");
  });

  q("btnSimulate").addEventListener("click", () => {
    updateVisualizations();
    showToast("Circuit simulated!");
  });

  if (q("codeLangSelect")) {
    q("codeLangSelect").addEventListener("change", refreshCode);
  }
}

//------------------------------------------------------------
// Refresh Code
//------------------------------------------------------------
function refreshCode() {
  const language = document.getElementById("codeLangSelect")?.value || "qasm";
  const code = circuit.exportCode(language);

  if (codeEditor && typeof codeEditor.setValue === "function") {
    codeEditor.setValue(code);
  } else {
    const textarea = document.getElementById("codeTextarea");
    if (textarea) {
      textarea.value = code;
    }
  }
}

//------------------------------------------------------------
// Visualization Updates
//------------------------------------------------------------
function updateVisualizations() {
  if (currentTab === "bloch" && blochInitialized) {
    updateBlochSphereFromCircuit();
  } else if (currentTab === "results" && resultsInitialized) {
    updateResultsChart();
  }
}

//------------------------------------------------------------
// Bloch Sphere (Three.js)
//------------------------------------------------------------
function initBlochSphere() {
  if (!window.THREE) {
    console.error("Three.js not loaded");
    document.getElementById("blochSphere").innerHTML =
      '<div style="padding: 20px; text-align: center; color: red;">Three.js library not loaded</div>';
    return;
  }

  const container = document.getElementById("blochSphere");
  if (!container) return;

  container.innerHTML = "";

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width === 0 || height === 0) {
    setTimeout(() => initBlochSphere(), 100);
    return;
  }

  blochScene = new THREE.Scene();
  blochCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  blochCamera.position.set(2.5, 2.5, 2.5);
  blochCamera.lookAt(0, 0, 0);

  blochRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  blochRenderer.setSize(width, height);
  blochRenderer.setClearColor(0x000000, 0);
  container.appendChild(blochRenderer.domElement);

  // Sphere wireframe
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x666666,
    wireframe: true,
    opacity: 0.3,
    transparent: true,
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  blochScene.add(sphereMesh);

  // Coordinate axes
  const axisLen = 1.3;

  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-axisLen, 0, 0),
    new THREE.Vector3(axisLen, 0, 0),
  ]);
  const xLine = new THREE.Line(
    xGeo,
    new THREE.LineBasicMaterial({ color: 0xff0000 })
  );
  blochScene.add(xLine);

  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -axisLen, 0),
    new THREE.Vector3(0, axisLen, 0),
  ]);
  const yLine = new THREE.Line(
    yGeo,
    new THREE.LineBasicMaterial({ color: 0x00ff00 })
  );
  blochScene.add(yLine);

  const zGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -axisLen),
    new THREE.Vector3(0, 0, axisLen),
  ]);
  const zLine = new THREE.Line(
    zGeo,
    new THREE.LineBasicMaterial({ color: 0x0000ff })
  );
  blochScene.add(zLine);

  const vecGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 1),
  ]);
  blochVector = new THREE.Line(
    vecGeo,
    new THREE.LineBasicMaterial({
      color: 0xff4444,
      linewidth: 3,
    })
  );
  blochScene.add(blochVector);

  const arrowGeo = new THREE.ConeGeometry(0.05, 0.2, 8);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
  blochArrow = new THREE.Mesh(arrowGeo, arrowMat);
  blochArrow.position.set(0, 0, 1);
  blochScene.add(blochArrow);

  let isDragging = false;
  let prev = { x: 0, y: 0 };

  const onMouseDown = (e) => {
    isDragging = true;
    prev.x = e.clientX;
    prev.y = e.clientY;
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - prev.x) * 0.01;
    const dy = (e.clientY - prev.y) * 0.01;
    prev.x = e.clientX;
    prev.y = e.clientY;

    const spherical = new THREE.Spherical();
    spherical.setFromVector3(blochCamera.position);
    spherical.theta -= dx;
    spherical.phi += dy;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    blochCamera.position.setFromSpherical(spherical);
    blochCamera.lookAt(0, 0, 0);
  };

  const onMouseUp = () => (isDragging = false);

  container.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  function animate() {
    requestAnimationFrame(animate);
    if (blochRenderer && blochScene && blochCamera) {
      blochRenderer.render(blochScene, blochCamera);
    }
  }
  animate();

  updateBlochSphereFromCircuit();
}

function updateBlochSphereFromCircuit() {
  if (!blochScene || !blochVector || !blochArrow) return;

  try {
    const stateVec = circuit.simulateStateVector();
    const alpha = reducedAmplitude(stateVec, circuit.numQubits, 0, 0);
    const beta = reducedAmplitude(stateVec, circuit.numQubits, 0, 1);

    const norm = Math.sqrt(
      Complex.magnitudeSquared(alpha) + Complex.magnitudeSquared(beta)
    );
    if (norm === 0) return;

    const a = new Complex(alpha.re / norm, alpha.im / norm);
    const b = new Complex(beta.re / norm, beta.im / norm);

    const x = 2 * (a.re * b.re + a.im * b.im);
    const y = 2 * (a.im * b.re - a.re * b.im);
    const z = Complex.magnitudeSquared(a) - Complex.magnitudeSquared(b);

    blochVector.geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x, y, z),
    ]);

    blochArrow.position.set(x, y, z);
    if (x !== 0 || y !== 0 || z !== 0) {
      blochArrow.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2));
    }

    document.getElementById(
      "amplitude"
    ).textContent = `${a.toString()} , ${b.toString()}`;
    const phase = Math.atan2(a.im, a.re) * (180 / Math.PI);
    document.getElementById("phase").textContent = `${phase.toFixed(1)}°`;

    let stateName = "superposition";
    if (Math.abs(z - 1) < 0.01) stateName = "|0⟩";
    else if (Math.abs(z + 1) < 0.01) stateName = "|1⟩";
    else if (Math.abs(x - 1) < 0.01) stateName = "|+⟩";
    else if (Math.abs(x + 1) < 0.01) stateName = "|-⟩";
    else if (Math.abs(y - 1) < 0.01) stateName = "|+i⟩";
    else if (Math.abs(y + 1) < 0.01) stateName = "|-i⟩";

    document.getElementById("currentState").textContent = stateName;
  } catch (e) {
    console.error("Bloch sphere update failed:", e);
  }
}

function reducedAmplitude(state, n, qubit, bitVal) {
  let amp = new Complex(0, 0);
  const bit = 1 << (n - 1 - qubit);
  state.forEach((c, idx) => {
    if (((idx & bit) !== 0) === (bitVal === 1)) {
      amp = Complex.add(amp, c);
    }
  });
  return amp;
}

//------------------------------------------------------------
// Results Chart (Chart.js)
//------------------------------------------------------------
function initResultsChart() {
  if (!window.Chart) {
    console.error("Chart.js not loaded");
    document.getElementById("resultsChart").innerHTML =
      '<div style="padding: 20px; text-align: center; color: red;">Chart.js library not loaded</div>';
    return;
  }

  updateResultsChart();
}

function updateResultsChart() {
  const canvas = document.getElementById("resultsChart");
  if (!canvas || !window.Chart) return;

  const probs = circuit.probabilityDistribution();
  const labels = Object.keys(probs);
  const data = labels.map((k) => probs[k]);
  const colors = [
    "#1FB8CD",
    "#FFC185",
    "#B4413C",
    "#ECEBD5",
    "#5D878F",
    "#DB4545",
    "#D2BA4C",
    "#964325",
    "#944454",
    "#13343B",
  ];

  if (resultsChart) {
    resultsChart.destroy();
  }

  resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.map((l) => `|${l}⟩`),
      datasets: [
        {
          label: "Probability",
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 1,
          borderColor: labels.map((_, i) => colors[i % colors.length]),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${(ctx.parsed.y * 100).toFixed(2)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            callback: (value) => `${(value * 100).toFixed(0)}%`,
          },
        },
        x: {
          title: {
            display: true,
            text: "Quantum States",
          },
        },
      },
    },
  });

  updateStateTable(probs);
}

function updateStateTable(probs) {
  const tableDiv = document.getElementById("stateTable");
  if (!tableDiv) return;

  const entries = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  let html =
    "<table><thead><tr><th>State</th><th>Probability</th><th>Amplitude</th></tr></thead><tbody>";

  entries.forEach(([state, p]) => {
    const amp = Math.sqrt(p);
    html += `<tr><td>|${state}⟩</td><td>${(p * 100).toFixed(
      2
    )}%</td><td>${amp.toFixed(3)}</td></tr>`;
  });

  html += "</tbody></table>";
  tableDiv.innerHTML = html;
}

//------------------------------------------------------------
// Utilities
//------------------------------------------------------------
function q(id) {
  return document.getElementById(id);
}

function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.className = `status-indicator ${type}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}
