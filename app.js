const examples = {
  torch: {
    fnn: `import torch.nn as nn

class SimpleFNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 10)
        )`,
    cnn: `import torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.Flatten()
        )
        self.classifier = nn.Sequential(
            nn.Linear(32 * 8 * 8, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )`,
    lstm: `import torch.nn as nn

class TextLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = nn.Embedding(num_embeddings=8000, embedding_dim=128)
        self.encoder = nn.LSTM(
            input_size=128,
            hidden_size=256,
            num_layers=2,
            batch_first=True,
            bidirectional=True
        )
        self.dropout = nn.Dropout(0.4)
        self.fc = nn.Linear(512, 6)`,
    transformer: `import torch.nn as nn

class TinyTransformer(nn.Module):
    def __init__(self):
        super().__init__()
        self.token = nn.Embedding(12000, 256)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=256,
            nhead=8,
            dim_feedforward=1024,
            dropout=0.1,
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=4)
        self.norm = nn.LayerNorm(256)
        self.head = nn.Linear(256, 4)`
  },
  mindspore: {
    fnn: `import mindspore.nn as nn

class SimpleFNN(nn.Cell):
    def __init__(self):
        super().__init__()
        self.net = nn.SequentialCell([
            nn.Flatten(),
            nn.Dense(784, 256),
            nn.ReLU(),
            nn.Dense(256, 64),
            nn.ReLU(),
            nn.Dense(64, 10)
        ])`,
    cnn: `import mindspore.nn as nn

class SmallCNN(nn.Cell):
    def __init__(self):
        super().__init__()
        self.features = nn.SequentialCell([
            nn.Conv2d(3, 16, kernel_size=3, pad_mode="pad", padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(16, 32, kernel_size=3, pad_mode="pad", padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Flatten()
        ])
        self.classifier = nn.SequentialCell([
            nn.Dense(32 * 8 * 8, 128),
            nn.ReLU(),
            nn.Dense(128, 10)
        ])`,
    lstm: `import mindspore.nn as nn

class TextLSTM(nn.Cell):
    def __init__(self):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size=8000, embedding_size=128)
        self.encoder = nn.LSTM(
            input_size=128,
            hidden_size=256,
            num_layers=2,
            batch_first=True,
            bidirectional=True
        )
        self.dropout = nn.Dropout(p=0.4)
        self.fc = nn.Dense(512, 6)`,
    transformer: `import mindspore.nn as nn

class TinyTransformer(nn.Cell):
    def __init__(self):
        super().__init__()
        self.token = nn.Embedding(vocab_size=12000, embedding_size=256)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=256,
            nhead=8,
            dim_feedforward=1024,
            dropout=0.1,
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=4)
        self.norm = nn.LayerNorm((256,))
        self.head = nn.Dense(256, 4)`
  }
};

const modelMeta = {
  fnn: {
    title: "FNN 全连接分类",
    input: "784",
    task: "把一个样本表示为一条向量，再输出类别分数",
    summary: "FNN 的底层结构是一层层神经元。后一层的每个神经元都接收前一层全部输出，所以它很适合讲清楚“权重矩阵”和“参数量”的来源。"
  },
  cnn: {
    title: "CNN 图像分类",
    input: "3x32x32",
    task: "输入图像张量，逐步提取空间特征，最后输出类别分数",
    summary: "CNN 的关键不是简单堆层，而是保留图像的高、宽、通道结构。卷积核在局部窗口滑动，池化压缩空间尺寸，最后 Flatten 才进入分类器。"
  },
  lstm: {
    title: "LSTM 序列分类",
    input: "tokens",
    task: "输入一串词编号，沿时间步传递记忆，最后输出类别分数",
    summary: "LSTM 的结构要按时间展开看。同一个 LSTM 单元反复处理每个时间步，用隐藏状态和细胞状态把前面的信息带到后面。"
  },
  transformer: {
    title: "Transformer 文本分类",
    input: "tokens",
    task: "输入一串词编号，用注意力建立全局联系，最后输出类别分数",
    summary: "Transformer 的核心是让每个 Token 直接观察其他 Token。Embedding 决定向量宽度，nhead 决定从多少个角度看关系，num_layers 决定堆叠深度。"
  }
};

const dom = {
  framework: document.querySelector("#frameworkSelect"),
  code: document.querySelector("#codeInput"),
  segments: [...document.querySelectorAll(".segment")],
  tabs: [...document.querySelectorAll(".tab")],
  views: [...document.querySelectorAll(".tab-view")],
  analyze: document.querySelector("#analyzeButton"),
  format: document.querySelector("#formatButton"),
  graph: document.querySelector("#networkGraph"),
  graphStage: document.querySelector(".graph-stage"),
  graphPan: document.querySelector("#graphPan"),
  ioSummary: document.querySelector("#ioSummary"),
  table: document.querySelector("#layerTable"),
  teacherExplanation: document.querySelector("#teacherExplanation"),
  teacherQuestions: document.querySelector("#teacherQuestions"),
  resetTeaching: document.querySelector("#resetTeachingButton"),
  layerCount: document.querySelector("#layerCount"),
  paramCount: document.querySelector("#paramCount"),
  outputCount: document.querySelector("#outputCount"),
  parseStatus: document.querySelector("#parseStatus"),
  modelTag: document.querySelector("#modelTag"),
  shapeFlow: document.querySelector("#shapeFlow"),
  batch: document.querySelector("#batchInput"),
  inputSize: document.querySelector("#inputSizeInput")
};

let currentModel = "fnn";
let teachingDirty = false;
let lastTemplate = { explanation: "", questions: "" };
let lastLayers = [];
let lastSummary = null;

const typeNotes = {
  Conv2d: "卷积层：用若干卷积核扫描局部区域，输出新的特征图。",
  MaxPool2d: "池化层：降低高宽，保留强响应，让后续计算更轻。",
  AvgPool2d: "平均池化：降低高宽，用局部平均代表区域信息。",
  Flatten: "展平层：把多维特征图变成一条向量。",
  Linear: "全连接层：每个输出神经元连接所有输入。",
  Dense: "全连接层：MindSpore 中对应 PyTorch 的 Linear。",
  ReLU: "激活函数：引入非线性，避免多层线性层退化为一层。",
  Dropout: "Dropout：训练时随机屏蔽部分神经元，缓解过拟合。",
  Embedding: "Embedding：把离散词编号查表变成连续向量。",
  LSTM: "LSTM：沿时间步传递隐藏状态和细胞状态。",
  GRU: "GRU：更轻量的门控循环网络。",
  RNN: "RNN：基础循环网络，适合解释时间步展开。",
  TransformerEncoderLayer: "Transformer编码层：包含多头注意力、前馈网络、残差和归一化。",
  TransformerEncoder: "Transformer编码器：把编码层堆叠多次。",
  LayerNorm: "LayerNorm：稳定每个位置的特征分布。"
};

function setExample() {
  dom.code.value = examples[dom.framework.value][currentModel];
  dom.inputSize.value = modelMeta[currentModel].input;
  teachingDirty = false;
  analyze();
}

function splitArgs(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseArgs(text) {
  const args = {};
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  const inside = start >= 0 && end > start ? text.slice(start + 1, end) : "";
  const positional = [];

  splitArgs(inside).forEach((part) => {
    const eq = part.indexOf("=");
    if (eq > -1) {
      args[part.slice(0, eq).trim()] = part.slice(eq + 1).trim().replaceAll("\"", "").replaceAll("'", "");
    } else {
      positional.push(part.replaceAll("\"", "").replaceAll("'", ""));
    }
  });

  args._positional = positional;
  return args;
}

function parseLayers(code) {
  const patterns = [
    "TransformerEncoderLayer",
    "TransformerEncoder",
    "Conv2d",
    "MaxPool2d",
    "AvgPool2d",
    "Flatten",
    "Linear",
    "Dense",
    "Dropout",
    "Embedding",
    "LSTM",
    "GRU",
    "RNN",
    "LayerNorm",
    "ReLU"
  ];
  const layers = [];
  const lines = code.split(/\n/);

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    const type = patterns.find((name) => trimmed.includes(`nn.${name}(`));
    if (!type) return;
    let block = trimmed;
    let depth = parenDepth(trimmed);
    let cursor = lineIndex + 1;
    while (depth > 0 && cursor < lines.length) {
      const nextLine = lines[cursor].trim();
      block += ` ${nextLine}`;
      depth += parenDepth(nextLine);
      cursor += 1;
    }
    layers.push({
      index: layers.length + 1,
      line: lineIndex + 1,
      type,
      raw: block,
      args: parseArgs(block),
      params: 0,
      input: "",
      output: "",
      note: typeNotes[type] || "可识别网络层。"
    });
  });

  return layers;
}

function parenDepth(text) {
  return [...text].reduce((depth, ch) => {
    if (ch === "(") return depth + 1;
    if (ch === ")") return depth - 1;
    return depth;
  }, 0);
}

function numberValue(value, fallback = 0) {
  if (value === undefined || value === null) return fallback;
  const nums = String(value)
    .replace(/[()[\]]/g, "")
    .split("*")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((num) => !Number.isNaN(num));
  if (!nums.length) return fallback;
  return nums.reduce((acc, num) => acc * num, 1);
}

function getArg(layer, names, position, fallback) {
  for (const name of names) {
    if (layer.args[name] !== undefined) return layer.args[name];
  }
  return layer.args._positional[position] ?? fallback;
}

function initialState() {
  const batch = Math.max(1, Number.parseInt(dom.batch.value, 10) || 32);
  const raw = dom.inputSize.value.trim().toLowerCase();
  const dims = raw.split("x").map((part) => Number.parseInt(part, 10));

  if (dims.length === 3 && dims.every((num) => !Number.isNaN(num))) {
    return { mode: "image", batch, c: dims[0], h: dims[1], w: dims[2] };
  }

  if (currentModel === "fnn") {
    return { mode: "vector", batch, features: numberValue(raw, 784) };
  }

  return { mode: "tokens", batch, seq: 64 };
}

function shapeLabel(state) {
  if (state.mode === "image") return `${state.batch} x ${state.c} x ${state.h} x ${state.w}`;
  if (state.mode === "sequence") return `${state.batch} x ${state.seq || 64} x ${state.hidden || 128}`;
  if (state.mode === "tokens") return `${state.batch} x ${state.seq || 64}`;
  return `${state.batch} x ${state.features || state.hidden || 10}`;
}

function inferShapes(layers) {
  const state = initialState();

  layers.forEach((layer) => {
    layer.input = shapeLabel(state);

    if (layer.type === "Conv2d") {
      const inC = numberValue(getArg(layer, ["in_channels"], 0, state.c || 3));
      const outC = numberValue(getArg(layer, ["out_channels"], 1, state.c || 16));
      const kernel = numberValue(getArg(layer, ["kernel_size"], 2, 3), 3);
      const padding = numberValue(getArg(layer, ["padding"], 4, 0), 0);
      const stride = numberValue(getArg(layer, ["stride"], 3, 1), 1);
      layer.params = outC * inC * kernel * kernel + outC;
      state.mode = "image";
      state.c = outC;
      state.h = Math.max(1, Math.floor(((state.h || 32) + 2 * padding - kernel) / stride + 1));
      state.w = Math.max(1, Math.floor(((state.w || 32) + 2 * padding - kernel) / stride + 1));
      layer.note = `卷积后通道变为 ${outC}，高宽由 kernel/stride/padding 决定。`;
    } else if (layer.type === "MaxPool2d" || layer.type === "AvgPool2d") {
      const kernel = numberValue(getArg(layer, ["kernel_size"], 0, 2), 2);
      const stride = numberValue(getArg(layer, ["stride"], 1, kernel), kernel);
      state.h = Math.max(1, Math.floor(((state.h || 32) - kernel) / stride + 1));
      state.w = Math.max(1, Math.floor(((state.w || 32) - kernel) / stride + 1));
      layer.note = `池化后高宽约缩小为原来的 1/${stride}。`;
    } else if (layer.type === "Flatten") {
      state.features = state.mode === "image"
        ? (state.c || 1) * (state.h || 1) * (state.w || 1)
        : state.features || state.hidden || 784;
      state.mode = "vector";
      layer.note = `展平成 ${state.features} 维向量，才可以接全连接分类器。`;
    } else if (layer.type === "Linear" || layer.type === "Dense") {
      const inF = numberValue(getArg(layer, ["in_features", "in_channels"], 0, state.features || state.hidden || 256));
      const outF = numberValue(getArg(layer, ["out_features", "out_channels"], 1, 10));
      layer.params = inF * outF + outF;
      state.features = outF;
      state.mode = "vector";
      layer.note = `输出 ${outF} 维；若这是最后一层，通常表示 ${outF} 个类别的 logits。`;
    } else if (layer.type === "Embedding") {
      const vocab = numberValue(getArg(layer, ["num_embeddings", "vocab_size"], 0, 8000));
      const dim = numberValue(getArg(layer, ["embedding_dim", "embedding_size"], 1, 128));
      layer.params = vocab * dim;
      state.mode = "sequence";
      state.seq = 64;
      state.hidden = dim;
      layer.note = `词表大小 ${vocab}，每个 token 被映射为 ${dim} 维向量。`;
    } else if (["LSTM", "GRU", "RNN"].includes(layer.type)) {
      const inputSize = numberValue(getArg(layer, ["input_size"], 0, state.hidden || 128));
      const hidden = numberValue(getArg(layer, ["hidden_size"], 1, 256));
      const numLayers = numberValue(getArg(layer, ["num_layers"], 2, 1), 1);
      const bidirectional = layer.raw.includes("bidirectional=True");
      const gates = layer.type === "LSTM" ? 4 : layer.type === "GRU" ? 3 : 1;
      const directions = bidirectional ? 2 : 1;
      layer.params = directions * numLayers * gates * (inputSize * hidden + hidden * hidden + hidden);
      state.mode = "sequence";
      state.hidden = hidden * directions;
      layer.note = `${numLayers} 层${bidirectional ? "双向" : "单向"} ${layer.type}，每个时间步输出 ${state.hidden} 维。`;
    } else if (layer.type === "TransformerEncoderLayer") {
      const dModel = numberValue(getArg(layer, ["d_model"], 0, state.hidden || 256));
      const heads = numberValue(getArg(layer, ["nhead"], 1, 8));
      const ff = numberValue(getArg(layer, ["dim_feedforward"], 2, dModel * 4));
      layer.params = 4 * dModel * dModel + 2 * dModel * ff;
      state.mode = "sequence";
      state.hidden = dModel;
      layer.note = `d_model=${dModel}，${heads} 个注意力头，每个头约 ${Math.floor(dModel / heads)} 维。`;
    } else if (layer.type === "TransformerEncoder") {
      const n = numberValue(getArg(layer, ["num_layers"], 1, 1), 1);
      layer.params = n * (state.hidden || 256) * (state.hidden || 256) * 8;
      layer.note = `将同一个编码层堆叠 ${n} 次，输出形状保持为 ${shapeLabel(state)}。`;
    } else if (layer.type === "LayerNorm") {
      const dim = numberValue(layer.args._positional[0], state.hidden || state.features || 256);
      layer.params = dim * 2;
      layer.note = `对 ${dim} 维特征做归一化，稳定深层网络。`;
    } else if (layer.type === "Dropout") {
      layer.note = "训练时随机屏蔽一部分神经元，推理时不改变输出形状。";
    } else if (layer.type === "ReLU") {
      layer.note = "只改变数值，不改变张量形状。";
    }

    layer.output = shapeLabel(state);
  });

  return layers;
}

function summarize(layers) {
  const batch = Math.max(1, Number.parseInt(dom.batch.value, 10) || 32);
  const first = layers[0];
  const finalLayer = [...layers].reverse().find((layer) => layer.type === "Linear" || layer.type === "Dense");
  const classes = finalLayer
    ? numberValue(getArg(finalLayer, ["out_features", "out_channels"], 1, 10), 10)
    : numberValue(layers[layers.length - 1]?.output?.split("x").pop(), 0);
  const params = layers.reduce((sum, layer) => sum + layer.params, 0);
  const embedding = layers.find((layer) => layer.type === "Embedding");
  const lstm = layers.find((layer) => layer.type === "LSTM" || layer.type === "GRU" || layer.type === "RNN");
  const encoderLayer = layers.find((layer) => layer.type === "TransformerEncoderLayer");
  const encoder = layers.find((layer) => layer.type === "TransformerEncoder");
  const flatten = layers.find((layer) => layer.type === "Flatten");

  return {
    batch,
    firstShape: first?.input || shapeLabel(initialState()),
    finalShape: layers[layers.length - 1]?.output || "",
    classes,
    params,
    embedding,
    lstm,
    encoderLayer,
    encoder,
    flatten,
    finalLayer
  };
}

function renderIoSummary(layers, summary) {
  const inputText = {
    fnn: `输入是 ${summary.firstShape}。每个样本是一条向量，例如 MNIST 图片展平后的 784 个像素值。`,
    cnn: `输入是 ${summary.firstShape}。含义是 Batch x 通道 x 高 x 宽，图像的空间结构仍然保留。`,
    lstm: `输入先看作 ${summary.firstShape}。每行是一句话的 token 编号序列，之后由 Embedding 变成向量序列。`,
    transformer: `输入先看作 ${summary.firstShape}。每个位置是一个 token 编号，Embedding 后才进入注意力模块。`
  };
  const middleText = {
    fnn: "中间层不断做“矩阵乘法 + 激活函数”，每个输出神经元都混合上一层所有信息。",
    cnn: `卷积/池化负责提取局部特征；${summary.flatten ? `Flatten 后变成 ${summary.flatten.output}。` : "接分类器前需要 Flatten。"} `,
    lstm: summary.lstm
      ? `${formatLayerName(summary.lstm)} 从左到右处理时间步，隐藏状态维度来自 hidden_size 和是否双向。`
      : "需要 LSTM/GRU/RNN 层来沿时间步传递记忆。",
    transformer: summary.encoderLayer
      ? `${formatLayerName(summary.encoderLayer)} 使用多头注意力建模全局关系，再由编码器堆叠多层。`
      : "需要 TransformerEncoderLayer 来体现注意力结构。"
  };
  const outputText = `输出是 ${summary.finalShape || "未识别"}。若最后一层为 ${summary.classes || "N"} 维，它表示每个样本的 ${summary.classes || "N"} 个类别分数 logits；通常再接 Softmax/Argmax 得到最终类别。`;

  dom.ioSummary.innerHTML = [
    ["输入是什么", inputText[currentModel]],
    ["中间怎么变", middleText[currentModel]],
    ["输出怎么理解", outputText]
  ].map(([title, text]) => `
    <section class="io-card">
      <strong>${title}</strong>
      <p>${text}</p>
    </section>
  `).join("");
}

function drawGraph(layers, summary) {
  let graphWidth = Math.max(1120, layers.length * 155 + 520);
  let graphHeight = 680;
  if (currentModel === "lstm") {
    const lstmLayer = summary.lstm;
    const layersN = Math.min(4, lstmLayer ? numberValue(getArg(lstmLayer, ["num_layers"], 2, 1), 1) : 1);
    graphWidth = Math.max(graphWidth, 1560);
    graphHeight = Math.max(graphHeight, 260 + layersN * 110 + 220);
  }
  if (currentModel === "transformer") {
    const encoder = summary.encoder;
    const numLayers = Math.min(6, encoder ? numberValue(getArg(encoder, ["num_layers"], 1, 1), 1) : 1);
    graphWidth = Math.max(graphWidth, 1200 + numLayers * 148);
  }
  clearSvg(graphWidth, graphHeight);
  addDefs();
  addTitle(modelMeta[currentModel].title, modelMeta[currentModel].task);

  if (currentModel === "fnn") drawFnn(layers, summary);
  if (currentModel === "cnn") drawCnn(layers, summary);
  if (currentModel === "lstm") drawLstm(layers, summary);
  if (currentModel === "transformer") drawTransformer(layers, summary);
}

function clearSvg(width, height) {
  dom.graph.setAttribute("viewBox", `0 0 ${width} ${height}`);
  dom.graph.style.width = `${width}px`;
  dom.graph.style.height = `${height}px`;
  dom.graph.innerHTML = "";
}

function addDefs() {
  const defs = svgNode("defs");
  const marker = svgNode("marker", { id: "arrow", markerWidth: 10, markerHeight: 10, refX: 8, refY: 3, orient: "auto" });
  marker.appendChild(svgNode("path", { d: "M0,0 L0,6 L9,3 z", fill: "#8797a1" }));
  defs.appendChild(marker);
  dom.graph.appendChild(defs);
}

function addTitle(title, subtitle) {
  label(title, 28, 36, "graph-title", "start");
  label(subtitle, 28, 62, "graph-caption", "start");
}

function drawFnn(layers, summary) {
  const visible = layers.filter((layer) => ["Flatten", "Linear", "Dense", "ReLU", "Dropout"].includes(layer.type));
  const nodes = [{ type: "Input", input: "", output: summary.firstShape, line: "-", note: "input" }, ...visible];
  const xs = nodes.map((_, i) => 95 + i * 150);

  nodes.forEach((node, i) => {
    const x = xs[i];
    if (i > 0) arrow(xs[i - 1] + 50, 285, x - 50, 285);
    if (node.type === "ReLU" || node.type === "Dropout") {
      circle(x, 285, 26, node.type === "ReLU" ? "#ca5b35" : "#7b6584");
      label(node.type, x, 290, "tiny-label");
    } else if (node.type === "Input") {
      neuronColumn(x, 285, 5, "#0f7b72");
    } else {
      neuronColumn(x, 285, node.type === "Flatten" ? 4 : 6, "#245e9b");
    }
    label(node.type === "Input" ? "输入" : node.type, x, 126, "diagram-label");
    label(`line ${node.line}`, x, 150, "diagram-code");
    shapeLabelSvg(node.output || node.input, x, 470);
  });

  const outX = xs[xs.length - 1] + 130;
  arrow(xs[xs.length - 1] + 54, 285, outX - 18, 285);
  outputBlock(outX, 226, summary.classes, "输出 logits");
}

function drawCnn(layers, summary) {
  const visible = layers.filter((layer) => ["Conv2d", "MaxPool2d", "AvgPool2d", "Flatten", "Linear", "Dense", "ReLU"].includes(layer.type));
  const nodes = [{ type: "Input", output: summary.firstShape, line: "-" }, ...visible];
  const xs = nodes.map((_, i) => 90 + i * 148);

  nodes.forEach((node, i) => {
    const x = xs[i];
    if (i > 0) arrow(xs[i - 1] + 54, 285, x - 54, 285);
    if (node.type === "Input") {
      featureStack(x - 40, 244, 76, 76, "#0f7b72");
    } else if (node.type === "Conv2d") {
      featureStack(x - 36, 246, 70, 70, "#2d6cdf");
      kernelPatch(x - 10, 266);
    } else if (node.type.includes("Pool")) {
      featureStack(x - 28, 256, 54, 54, "#a77a16");
    } else if (node.type === "Flatten") {
      featureStack(x - 14, 232, 30, 122, "#7b6584");
    } else if (node.type === "ReLU") {
      circle(x, 285, 25, "#ca5b35");
      label("ReLU", x, 290, "tiny-label");
    } else {
      neuronColumn(x, 285, 5, "#245e9b");
    }
    label(node.type === "Input" ? "输入图像" : node.type, x, 126, "diagram-label");
    label(`line ${node.line}`, x, 150, "diagram-code");
    shapeLabelSvg(node.output || "", x, 478);
  });

  const outX = xs[xs.length - 1] + 135;
  arrow(xs[xs.length - 1] + 58, 285, outX - 18, 285);
  outputBlock(outX, 226, summary.classes, "类别 logits");
}

function drawLstm(layers, summary) {
  const emb = summary.embedding;
  const lstm = summary.lstm;
  const hidden = lstm ? numberValue(getArg(lstm, ["hidden_size"], 1, 256)) : 256;
  const layersN = Math.min(4, lstm ? numberValue(getArg(lstm, ["num_layers"], 2, 1), 1) : 1);
  const bidirectional = lstm?.raw.includes("bidirectional=True");
  const outHidden = hidden * (bidirectional ? 2 : 1);
  const embDim = emb ? numberValue(getArg(emb, ["embedding_dim", "embedding_size"], 1, 128)) : 128;

  // ===== 布局参数(全部集中在这里,避免硬编码冲突) =====
  const tokenX = 60;       // Token 序列框
  const embX = 220;        // Embedding 框
  const flowBoxW = 126;
  const flowBoxH = 114;
  const flowBoxTopY = 220;       // Token/Embedding 框顶部 y
  const flowBoxCenterY = flowBoxTopY + flowBoxH / 2;  // = 277

  const cellsStartX = 440;  // 第一个时间步 LSTM cell 左上 x (留出与 Embedding 的箭头空间)
  const cellW = 100;
  const cellH = 70;
  const stepGap = 150;
  const layerGap = 110;     // 行间距 (>cellH=70, 留 40 间隔)
  const firstLayerY = 200;  // 第一层 LSTM cell 顶部 y

  const steps = ["t=1", "t=2", "t=3", "..."];

  // ===== 1. 左侧:Token序列 + Embedding =====
  flowBox(tokenX, flowBoxTopY, "Token序列", `${summary.batch} x 64`, `line ${emb?.line || "-"}`);
  arrow(tokenX + flowBoxW + 4, flowBoxCenterY, embX - 6, flowBoxCenterY);
  flowBox(embX, flowBoxTopY, "Embedding", `${embDim}维`, `line ${emb?.line || "-"}`);

  // Embedding 到 LSTM 网格的箭头(进入第一层第一个 cell 的左侧)
  const firstCellCenterY = firstLayerY + cellH / 2;
  arrow(embX + flowBoxW + 4, flowBoxCenterY, cellsStartX - 8, firstCellCenterY);

  // ===== 2. 每行(每层)左侧的层标签 =====
  for (let layerIndex = 0; layerIndex < layersN; layerIndex += 1) {
    const y = firstLayerY + layerIndex * layerGap;
    // 层标签放在第一个 cell 的左边
    label(`第${layerIndex + 1}层`, cellsStartX - 50, y + cellH / 2 + 5, "diagram-label");
  }

  // ===== 3. LSTM 时间步 × 层 网格 =====
  steps.forEach((step, stepIndex) => {
    const x = cellsStartX + stepIndex * stepGap;
    // 时间步标签放在最上面一层之上
    label(step, x + cellW / 2, firstLayerY - 14, "diagram-code");

    for (let layerIndex = 0; layerIndex < layersN; layerIndex += 1) {
      const y = firstLayerY + layerIndex * layerGap;
      // 绘制 cell
      rounded(x, y, cellW, cellH, "#ffffff", "#ca5b35");
      label("LSTM", x + cellW / 2, y + cellH / 2 + 5, "diagram-label");

      // 同层水平箭头(t -> t+1):画在 cell 之间,起点是上一个 cell 右侧,终点是当前 cell 左侧
      if (stepIndex > 0) {
        const prevX = cellsStartX + (stepIndex - 1) * stepGap + cellW;
        arrow(prevX + 4, y + cellH / 2, x - 6, y + cellH / 2);
      }

      // 跨层垂直箭头(下层 -> 上层):画在 cell 之间,起点是上一层 cell 底部,终点是当前层 cell 顶部
      if (layerIndex > 0) {
        const prevLayerBottom = firstLayerY + (layerIndex - 1) * layerGap + cellH;
        arrow(x + cellW / 2, prevLayerBottom + 4, x + cellW / 2, y - 6);
      }
    }
  });

  // ===== 4. 右侧:最终表示 + 输出 =====
  const lastStepRightX = cellsStartX + (steps.length - 1) * stepGap + cellW;
  const topLayerCenterY = firstLayerY + (layersN - 1) * layerGap + cellH / 2;
  const finalBoxX = lastStepRightX + 40;
  const finalBoxY = topLayerCenterY - flowBoxH / 2;

  arrow(lastStepRightX + 4, topLayerCenterY, finalBoxX - 6, topLayerCenterY);
  flowBox(finalBoxX, finalBoxY, "最终表示", `${bidirectional ? "双向" : "单向"} ${layersN}层`, `${outHidden}维`);

  const outputBlockX = finalBoxX + flowBoxW + 24;
  const outputBlockY = finalBoxY - 2;
  arrow(finalBoxX + flowBoxW + 4, topLayerCenterY, outputBlockX - 6, topLayerCenterY);
  outputBlock(outputBlockX, outputBlockY, summary.classes, "分类 logits");

  // ===== 5. 图例(放在最下层下方,避免覆盖网格) =====
  const legendY = firstLayerY + layersN * layerGap + 30;
  legend([
    ["#ca5b35", `LSTM cell hidden_size=${hidden}`],
    ["#8797a1", "→ 时间步方向 (按列前进)"],
    ["#8797a1", "↑ 跨层方向 (下层输出送入上层)"]
  ], 60, legendY);

  // ===== 6. 代码定位标签 =====
  label(`LSTM line ${lstm?.line || "-"}`, finalBoxX + flowBoxW / 2, finalBoxY + flowBoxH + 20, "diagram-code");
}

function drawTransformer(layers, summary) {
  const emb = summary.embedding;
  const encLayer = summary.encoderLayer;
  const enc = summary.encoder;
  const dModel = encLayer
    ? numberValue(getArg(encLayer, ["d_model"], 0, 256))
    : emb ? numberValue(getArg(emb, ["embedding_dim", "embedding_size"], 1, 256)) : 256;
  const heads = encLayer ? numberValue(getArg(encLayer, ["nhead"], 1, 8), 8) : 8;
  const ff = encLayer ? numberValue(getArg(encLayer, ["dim_feedforward"], 2, dModel * 4), dModel * 4) : dModel * 4;
  const numLayers = Math.min(6, enc ? numberValue(getArg(enc, ["num_layers"], 1, 1), 1) : 1);

  // ===== 布局参数集中管理 =====
  const flowBoxW = 126;
  const flowBoxH = 114;
  const startX = 62;
  const y = 240;             // flowBox 顶部 y
  const flowCenterY = y + flowBoxH / 2;   // = 297
  const gap = 12;            // 模块间间距

  // ----- 左侧三个 flowBox: Token / Embedding / 位置编码 -----
  flowBox(startX, y, "Token", `${summary.batch} x 64`, "输入");
  const embBoxX = startX + flowBoxW + gap + 32;
  arrow(startX + flowBoxW + 4, flowCenterY, embBoxX - 6, flowCenterY);

  flowBox(embBoxX, y, "Embedding", `d=${dModel}`, `line ${emb?.line || "-"}`);
  const posBoxX = embBoxX + flowBoxW + gap + 32;
  arrow(embBoxX + flowBoxW + 4, flowCenterY, posBoxX - 6, flowCenterY);

  flowBox(posBoxX, y, "位置编码", "pos", "顺序");

  // ----- Encoder 堆叠 -----
  const encStartX = posBoxX + flowBoxW + gap + 32;
  arrow(posBoxX + flowBoxW + 4, flowCenterY, encStartX - 6, flowCenterY);

  const encW = 122;
  const encStep = 138;   // 每个 encoder 占用宽度(含间隔)
  const encH = 200;
  const encY = y - 28;
  for (let i = 0; i < numLayers; i += 1) {
    const x = encStartX + i * encStep;
    rounded(x, encY, encW, encH, "#ffffff", "#2d6cdf");
    label(`Encoder ${i + 1}`, x + encW / 2, encY + 24, "diagram-label");
    // 多头注意力子模块
    rounded(x + 16, encY + 44, encW - 32, 40, "#eef5ff", "#2d6cdf");
    label(`${heads} heads`, x + encW / 2, encY + 68, "tiny-label");
    // FFN 子模块
    rounded(x + 16, encY + 96, encW - 32, 40, "#fff4ef", "#ca5b35");
    label(`FFN ${ff}`, x + encW / 2, encY + 120, "tiny-label");
    // 行号
    label(`line ${encLayer?.line || "-"}`, x + encW / 2, encY + 162, "diagram-code");

    if (i > 0) {
      const prevRight = encStartX + (i - 1) * encStep + encW;
      arrow(prevRight + 4, flowCenterY, x - 6, flowCenterY);
    }
  }

  // ----- 分类头 -----
  const lastEncRight = encStartX + (numLayers - 1) * encStep + encW;
  const headBoxX = lastEncRight + gap + 24;
  arrow(lastEncRight + 4, flowCenterY, headBoxX - 6, flowCenterY);
  flowBox(headBoxX, y, "分类头", `${summary.classes}类`, `line ${summary.finalLayer?.line || "-"}`);

  // ----- 输出 block -----
  const outputBlockW = 142;
  const outputBlockX = headBoxX + flowBoxW + gap + 24;
  const outputBlockY = y - 2;
  arrow(headBoxX + flowBoxW + 4, flowCenterY, outputBlockX - 6, flowCenterY);
  outputBlock(outputBlockX, outputBlockY, summary.classes, "输出 logits");

  // ----- 图例 -----
  legend([
    ["#2d6cdf", `d_model=${dModel}, nhead=${heads}`],
    ["#ca5b35", `dim_feedforward=${ff}`],
    ["#0f7b72", `num_layers=${numLayers}`]
  ], 60, encY + encH + 50);
}

function featureStack(x, y, w, h, color) {
  for (let i = 3; i >= 0; i--) {
    dom.graph.appendChild(svgNode("rect", {
      x: x + i * 8,
      y: y - i * 8,
      width: w,
      height: h,
      rx: 4,
      fill: i === 0 ? "#ffffff" : "#f4f7f9",
      stroke: color,
      "stroke-width": 1.8
    }));
  }
}

function kernelPatch(x, y) {
  rounded(x, y, 42, 42, "rgba(202,91,53,0.16)", "#ca5b35");
  line(x + 14, y, x + 14, y + 42, "#ca5b35", 1);
  line(x + 28, y, x + 28, y + 42, "#ca5b35", 1);
  line(x, y + 14, x + 42, y + 14, "#ca5b35", 1);
  line(x, y + 28, x + 42, y + 28, "#ca5b35", 1);
}

function attentionWeb(cx, cy, heads) {
  const points = [
    [cx - 78, cy + 42],
    [cx - 26, cy + 4],
    [cx + 34, cy + 14],
    [cx + 88, cy + 54]
  ];
  points.forEach((a, i) => {
    points.forEach((b, j) => {
      if (i < j) line(a[0], a[1], b[0], b[1], "#b7c4ca", 1);
    });
  });
  points.forEach((point, i) => {
    circle(point[0], point[1], 16, ["#0f7b72", "#2d6cdf", "#ca5b35", "#a77a16"][i]);
    label(`词${i + 1}`, point[0], point[1] + 5, "tiny-label light");
  });
  label(`${heads} heads`, cx, cy + 100, "diagram-label");
}

function outputBlock(x, y, classes, title) {
  rounded(x, y, 142, 118, "#ffffff", "#245e9b");
  label(title, x + 71, y + 28, "diagram-label");
  const n = Math.min(8, Math.max(2, classes || 4));
  for (let i = 0; i < n; i += 1) {
    const barWidth = 18 + (i % 4) * 18;
    dom.graph.appendChild(svgNode("rect", {
      x: x + 22,
      y: y + 45 + i * 7,
      width: barWidth,
      height: 4,
      rx: 2,
      fill: i === 2 ? "#ca5b35" : "#9ab0ba"
    }));
  }
  label(`${classes || "N"}类`, x + 108, y + 76, "diagram-note");
  label("Softmax / Argmax", x + 71, y + 104, "tiny-label");
}

function flowBox(x, y, title, sub, detail) {
  rounded(x, y, 126, 114, "#ffffff", "#0f7b72");
  label(title, x + 63, y + 32, "diagram-label");
  label(sub, x + 63, y + 62, "diagram-note");
  label(detail, x + 63, y + 90, "tiny-label");
}

function neuronColumn(x, y, count, color) {
  const start = y - ((count - 1) * 22) / 2;
  for (let i = 0; i < count; i += 1) {
    circle(x, start + i * 22, 10, color);
  }
}

function shapeLabelSvg(value, x, y) {
  const text = String(value || "");
  if (!text) return;
  const compact = text.replaceAll(" x ", "x");
  if (compact.length <= 14) {
    label(compact, x, y, "diagram-note");
    return;
  }
  const parts = compact.split("x");
  const mid = Math.ceil(parts.length / 2);
  label(parts.slice(0, mid).join("x"), x, y - 8, "diagram-note");
  label(parts.slice(mid).join("x"), x, y + 10, "diagram-note");
}

function legend(items, x, y) {
  rounded(x, y, 360, 92, "#fbfcfd", "#dce4ea");
  items.forEach(([color, text], index) => {
    const rowY = y + 24 + index * 24;
    line(x + 18, rowY - 4, x + 52, rowY - 4, color, 4);
    label(text, x + 64, rowY, "diagram-note", "start");
  });
}

function callout(x, y, title, text) {
  rounded(x, y, 330, 116, "#fbfcfd", "#dce4ea");
  label(title, x + 16, y + 28, "callout-title", "start");
  wrapText(text, 21).forEach((lineText, i) => label(lineText, x + 16, y + 56 + i * 18, "callout-text", "start"));
}

function wrapText(text, size) {
  const result = [];
  for (let i = 0; i < text.length; i += size) result.push(text.slice(i, i + size));
  return result.slice(0, 3);
}

function rounded(x, y, width, height, fill, stroke) {
  dom.graph.appendChild(svgNode("rect", { x, y, width, height, rx: 8, fill, stroke, "stroke-width": 2 }));
}

function circle(cx, cy, r, color) {
  dom.graph.appendChild(svgNode("circle", { cx, cy, r, fill: "#ffffff", stroke: color, "stroke-width": 2 }));
}

function line(x1, y1, x2, y2, color, width) {
  dom.graph.appendChild(svgNode("line", { x1, y1, x2, y2, stroke: color, "stroke-width": width }));
}

function arrow(x1, y1, x2, y2) {
  dom.graph.appendChild(svgNode("line", { x1, y1, x2, y2, stroke: "#8797a1", "stroke-width": 2, "marker-end": "url(#arrow)" }));
}

function label(value, x, y, className, anchor = "middle") {
  dom.graph.appendChild(svgText(value, x, y, className, anchor));
}

function svgNode(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function svgText(value, x, y, className, anchor = "middle") {
  const text = svgNode("text", { x, y, class: className, "text-anchor": anchor });
  text.textContent = value;
  return text;
}

function formatLayerName(layer) {
  if (!layer) return "未识别";
  return `${layer.type}(第${layer.index}层)`;
}

function codeHint(layer) {
  if (!layer) return "未识别";
  return layer.raw.replace("nn.", "").slice(0, 34);
}

function formatParams(layer) {
  const map = {
    Conv2d: ["in_channels", "out_channels", "kernel_size", "stride", "padding"],
    Linear: ["in_features", "out_features"],
    Dense: ["in_channels", "out_channels"],
    Embedding: ["num_embeddings", "vocab_size", "embedding_dim", "embedding_size"],
    LSTM: ["input_size", "hidden_size", "num_layers", "bidirectional"],
    TransformerEncoderLayer: ["d_model", "nhead", "dim_feedforward"],
    TransformerEncoder: ["num_layers"],
    Dropout: ["p", "dropout"],
    MaxPool2d: ["kernel_size", "stride"]
  };
  const parts = (map[layer.type] || [])
    .filter((key) => layer.args[key] !== undefined)
    .map((key) => `${key}=${layer.args[key]}`);
  return parts.join("; ") || layer.args._positional.join(", ") || "默认配置";
}

function renderTable(layers) {
  dom.table.innerHTML = layers.map((layer) => `
    <tr>
      <td>${layer.index}<br><span class="line-ref">line ${layer.line}</span></td>
      <td><strong>${layer.type}</strong></td>
      <td>${formatParams(layer)}</td>
      <td>${layer.input}</td>
      <td>${layer.output}</td>
      <td>${layer.note}</td>
    </tr>
  `).join("");
}

function buildTeachingTemplate(layers, summary) {
  const totalParams = formatNumber(summary.params);
  const common = [
    `【${modelMeta[currentModel].title}】`,
    modelMeta[currentModel].summary,
    "",
    `本例从代码中识别出 ${layers.length} 个网络层，估算参数量约 ${totalParams}。输入形状是 ${summary.firstShape}，最终输出形状是 ${summary.finalShape}。`,
    `最后一层输出 ${summary.classes || "N"} 维时，不是直接得到“答案文本”，而是得到每个类别的分数 logits。通常再经过 Softmax 或 Argmax，得到预测类别。`,
    "",
    "可以让学生按“输入是什么 -> 中间怎么变 -> 输出怎么解释”的顺序读图，再回到代码中找对应参数。"
  ];

  if (currentModel === "cnn") {
    common.push("", "CNN讲解重点：卷积层改变通道数，池化层压缩高宽，Flatten 把 C x H x W 变成一条向量，分类器才输出每个类别的分数。");
  }
  if (currentModel === "lstm") {
    common.push("", "LSTM讲解重点：Embedding 先把词编号变成向量；LSTM 沿时间步重复使用同一套参数；hidden_size、num_layers、bidirectional 会直接影响输出维度。");
  }
  if (currentModel === "transformer") {
    common.push("", "Transformer讲解重点：Embedding 输出 d_model 维向量；nhead 表示多头注意力的头数；num_layers 表示编码层堆叠次数；分类头把最终表示映射成类别分数。");
  }

  return {
    explanation: common.join("\n"),
    questions: teachingQuestions(summary).map((item, index) => `${index + 1}. ${item}`).join("\n")
  };
}

function teachingQuestions(summary) {
  if (currentModel === "fnn") {
    return [
      "为什么 FNN 输入通常要先展平成一条向量？这样会丢失什么信息？",
      `最后输出 ${summary.classes} 维，为什么可以理解为 ${summary.classes} 个类别分数？`,
      "Linear(784, 256) 的参数量为什么大约是 784 x 256？"
    ];
  }
  if (currentModel === "cnn") {
    return [
      "Conv2d 的 out_channels 为什么会决定特征图的通道数？",
      "池化层为什么会让高宽变小？这对计算量有什么影响？",
      `最后 ${summary.finalShape} 中的 ${summary.classes} 代表什么？为什么还需要 Softmax/Argmax？`
    ];
  }
  if (currentModel === "lstm") {
    return [
      "Embedding 层为什么能把词编号变成向量？",
      "hidden_size 和 bidirectional=True 如何影响 LSTM 输出维度？",
      "为什么 LSTM 的图要按时间步展开，而不是只画一层方块？"
    ];
  }
  return [
    "d_model、nhead、dim_feedforward 分别对应图中的哪个位置？",
    "为什么 Transformer 需要位置编码？",
    `最后分类头输出 ${summary.classes} 类 logits，它和注意力模块的输出有什么关系？`
  ];
}

function syncTeachingTemplate(force = false) {
  if (!lastSummary) return;
  const template = buildTeachingTemplate(lastLayers, lastSummary);
  lastTemplate = template;
  if (force || !teachingDirty) {
    dom.teacherExplanation.value = template.explanation;
    dom.teacherQuestions.value = template.questions;
    teachingDirty = false;
  }
}

function formatNumber(num) {
  if (num > 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function analyze() {
  const layers = inferShapes(parseLayers(dom.code.value));
  const summary = summarize(layers);
  lastLayers = layers;
  lastSummary = summary;

  drawGraph(layers, summary);
  renderIoSummary(layers, summary);
  renderTable(layers);
  syncTeachingTemplate(false);

  dom.layerCount.textContent = layers.length;
  dom.paramCount.textContent = formatNumber(summary.params);
  dom.outputCount.textContent = summary.classes || 0;
  dom.parseStatus.textContent = layers.length ? "已解析" : "未识别到支持的网络层";
  dom.modelTag.textContent = modelMeta[currentModel].title;
  dom.shapeFlow.textContent = layers.length ? `${summary.firstShape} -> ${summary.finalShape}` : "输入 -> 输出";
  updateGraphPan();
}

function updateGraphPan() {
  const max = Math.max(0, dom.graphStage.scrollWidth - dom.graphStage.clientWidth);
  dom.graphPan.max = String(max);
  dom.graphPan.value = String(Math.min(dom.graphStage.scrollLeft, max));
  dom.graphPan.disabled = max === 0;
}

dom.framework.addEventListener("change", setExample);
dom.analyze.addEventListener("click", analyze);
dom.format.addEventListener("click", setExample);
dom.batch.addEventListener("input", analyze);
dom.inputSize.addEventListener("input", analyze);
dom.code.addEventListener("input", () => {
  window.clearTimeout(window.__analyzeTimer);
  window.__analyzeTimer = window.setTimeout(analyze, 300);
});
dom.teacherExplanation.addEventListener("input", () => { teachingDirty = true; });
dom.teacherQuestions.addEventListener("input", () => { teachingDirty = true; });
dom.resetTeaching.addEventListener("click", () => {
  teachingDirty = false;
  syncTeachingTemplate(true);
});
dom.graphPan.addEventListener("input", () => {
  dom.graphStage.scrollLeft = Number(dom.graphPan.value);
});
dom.graphStage.addEventListener("scroll", () => {
  dom.graphPan.value = String(dom.graphStage.scrollLeft);
});
dom.graphStage.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    dom.graphStage.scrollLeft += event.deltaY;
    event.preventDefault();
  }
}, { passive: false });

let dragStartX = 0;
let dragScrollLeft = 0;
dom.graphStage.addEventListener("pointerdown", (event) => {
  dragStartX = event.clientX;
  dragScrollLeft = dom.graphStage.scrollLeft;
  dom.graphStage.classList.add("dragging");
  dom.graphStage.setPointerCapture(event.pointerId);
});
dom.graphStage.addEventListener("pointermove", (event) => {
  if (!dom.graphStage.classList.contains("dragging")) return;
  dom.graphStage.scrollLeft = dragScrollLeft - (event.clientX - dragStartX);
});
dom.graphStage.addEventListener("pointerup", () => {
  dom.graphStage.classList.remove("dragging");
});
dom.graphStage.addEventListener("pointercancel", () => {
  dom.graphStage.classList.remove("dragging");
});
window.addEventListener("resize", updateGraphPan);

dom.segments.forEach((button) => {
  button.addEventListener("click", () => {
    dom.segments.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentModel = button.dataset.model;
    teachingDirty = false;
    setExample();
  });
});

dom.tabs.forEach((button) => {
  button.addEventListener("click", () => {
    dom.tabs.forEach((item) => item.classList.remove("active"));
    dom.views.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}View`).classList.add("active");
  });
});

setExample();
