// Matrix Rain
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight / 2;
canvas.width = window.innerWidth / 2;

const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%^&*';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = fontSize + 'px monospace';
  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}
setInterval(drawMatrix, 50);

// Terminal Simulation
const terminal = document.getElementById('terminal');
const logs = [
  "Initializing system scan...",
  "Accessing secure node...",
  "Bypassing firewall...",
  "Connection established.",
  "Monitoring network traffic...",
  "Running vulnerability check...",
  "System secure."
];
let logIndex = 0;

function typeLog() {
  if (logIndex < logs.length) {
    const line = document.createElement('div');
    line.textContent = logs[logIndex] + " █";
    terminal.appendChild(line);
    logIndex++;
    setTimeout(typeLog, 2000);
  } else {
    logIndex = 0;
    terminal.innerHTML = "";
    typeLog();
  }
}
typeLog();

// Network Visualization
const netCanvas = document.getElementById('network');
const netCtx = netCanvas.getContext('2d');
netCanvas.height = window.innerHeight / 2;
netCanvas.width = window.innerWidth / 2;

let nodes = [];
for (let i = 0; i < 30; i++) {
  nodes.push({
    x: Math.random() * netCanvas.width,
    y: Math.random() * netCanvas.height,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2
  });
}

function drawNetwork() {
  netCtx.clearRect(0, 0, netCanvas.width, netCanvas.height);
  netCtx.fillStyle = '#0F0';
  nodes.forEach(node => {
    netCtx.beginPath();
    netCtx.arc(node.x, node.y, 2, 0, Math.PI * 2);
    netCtx.fill();
    node.x += node.dx;
    node.y += node.dy;
    if (node.x < 0 || node.x > netCanvas.width) node.dx *= -1;
    if (node.y < 0 || node.y > netCanvas.height) node.dy *= -1;
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 100) {
        netCtx.strokeStyle = 'rgba(0,255,0,0.3)';
        netCtx.beginPath();
        netCtx.moveTo(nodes[i].x, nodes[i].y);
        netCtx.lineTo(nodes[j].x, nodes[j].y);
        netCtx.stroke();
      }
    }
  }
}
setInterval(drawNetwork, 50);

// Hologram Placeholder (CSS animation or SVG can be added here)
document.getElementById('hologram').innerHTML = `
  <div style="color:#0F0;text-align:center;padding-top:40%;font-size:20px;">
    [Holographic Human Wireframe Animation Placeholder]
  </div>
`;
