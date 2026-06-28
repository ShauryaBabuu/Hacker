/* ============================================================
   SHAURYA BABU — HACKER LANDING PAGE
   script.js
   ============================================================ */

'use strict';

// ─── Utility ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const raf = requestAnimationFrame;

// ─── 1. MATRIX RAIN ─────────────────────────────────────────
(function initMatrix() {
  const canvas = $('matrixCanvas');
  const ctx    = canvas.getContext('3d');

  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF!@#$%^&*<>[]{}|=+~';

  let W, H, cols, drops;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
    const fontSize = 13;
    cols   = Math.floor(W / fontSize);
    drops  = Array.from({ length: cols }, () => Math.random() * -100);
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
  }

  function draw() {
    // Fade trail
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, 0, W, H);

    drops.forEach((y, i) => {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x  = i * 13;

      // Head char — bright white-green
      ctx.fillStyle = '#ccffcc';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur  = 8;
      ctx.fillText(ch, x, y);

      // Random secondary glow
      if (Math.random() > 0.96) {
        ctx.fillStyle = '#00ff41';
        ctx.shadowBlur = 14;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - 13);
      }

      // Dim trail chars handled by fade above; paint normal green
      ctx.fillStyle = `rgba(0,${Math.floor(Math.random() * 80 + 150)},50,0.85)`;
      ctx.shadowBlur = 4;
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - 13 * 2);

      drops[i] += 13;
      if (drops[i] > H && Math.random() > 0.975) {
        drops[i] = Math.random() * -80;
      }
    });

    ctx.shadowBlur = 0;
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 38);
})();


// ─── 2. HOLOGRAPHIC HUMANOID ────────────────────────────────
(function initHolo() {
  const canvas = $('holoCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, t = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  // Simplified wireframe humanoid body parts as ellipses + lines
  // We'll rotate/project a 3D stick-figure approximation

  const GREEN   = '#00ff41';
  const GREENDIM = '#00661a';
  const GREENMID = '#00cc33';

  // 3D joint positions (x,y,z) — canonical T-pose, centered at 0
  const rawJoints = {
    head:    [0,  1.7,  0],
    neck:    [0,  1.35, 0],
    lshoulder:[-0.5, 1.2, 0],
    rshoulder:[ 0.5, 1.2, 0],
    lelbow:  [-0.75, 0.65, 0],
    relbow:  [ 0.75, 0.65, 0],
    lwrist:  [-0.85, 0.05, 0],
    rwrist:  [ 0.85, 0.05, 0],
    hip:     [ 0,   0.6,  0],
    lhip:    [-0.3, 0.55, 0],
    rhip:    [ 0.3, 0.55, 0],
    lknee:   [-0.35,-0.2, 0],
    rknee:   [ 0.35,-0.2, 0],
    lankle:  [-0.38,-0.95,0],
    rankle:  [ 0.38,-0.95,0],
  };

  const bones = [
    ['head','neck'], ['neck','lshoulder'], ['neck','rshoulder'],
    ['lshoulder','lelbow'], ['lelbow','lwrist'],
    ['rshoulder','relbow'], ['relbow','rwrist'],
    ['neck','hip'], ['hip','lhip'], ['hip','rhip'],
    ['lhip','lknee'], ['lknee','lankle'],
    ['rhip','rknee'], ['rknee','rankle'],
    ['lshoulder','lhip'], ['rshoulder','rhip'],
  ];

  function project(joint, angleY, scale, cx, cy) {
    let [x, y, z] = joint;
    // Rotate around Y
    const cosA = Math.cos(angleY);
    const sinA = Math.sin(angleY);
    const nx = x * cosA - z * sinA;
    const nz = x * sinA + z * cosA;
    // Simple perspective
    const fov = 3;
    const pz  = nz + fov;
    const px  = (nx / pz) * scale + cx;
    const py  = (-y / pz) * scale + cy;
    return { x: px, y: py, depth: nz };
  }

  // Scan ring params
  let scanY = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const cx    = W / 2;
    const cy    = H / 2 - H * 0.03;
    const scale = Math.min(W, H) * 0.72;
    const angleY = t * 0.008;   // slow Y rotation
    // Gentle breath sway
    const sway  = Math.sin(t * 0.04) * 0.05;

    // Project all joints
    const projected = {};
    for (const [name, pos] of Object.entries(rawJoints)) {
      projected[name] = project(
        [pos[0] + sway, pos[1], pos[2]],
        angleY, scale, cx, cy
      );
    }

    // Draw grid floor
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 0.5;
    const gridY = projected['lankle'].y + 10;
    for (let gx = -5; gx <= 5; gx++) {
      const screenX = cx + (gx / 5) * (W * 0.45);
      ctx.beginPath();
      ctx.moveTo(screenX, gridY);
      ctx.lineTo(cx + (gx / 10) * W, gridY + 60);
      ctx.stroke();
    }
    for (let gz = 0; gz <= 5; gz++) {
      const frac = gz / 5;
      const y1   = gridY + frac * 60;
      const hw   = W * 0.45 * (1 - frac * 0.5);
      ctx.beginPath();
      ctx.moveTo(cx - hw, y1);
      ctx.lineTo(cx + hw, y1);
      ctx.stroke();
    }
    ctx.restore();

    // ── Bones ──
    bones.forEach(([a, b]) => {
      const pa = projected[a], pb = projected[b];
      const avgDepth = (pa.depth + pb.depth) / 2;
      const alpha    = Math.max(0.2, Math.min(0.95, 0.6 + avgDepth * 0.15));

      const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
      grad.addColorStop(0, `rgba(0,255,65,${alpha})`);
      grad.addColorStop(0.5, `rgba(0,204,51,${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(0,255,65,${alpha})`);

      ctx.save();
      ctx.shadowColor  = GREEN;
      ctx.shadowBlur   = 10;
      ctx.strokeStyle  = grad;
      ctx.lineWidth    = 1.5;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.restore();
    });

    // ── Joints (dots) ──
    Object.values(projected).forEach(p => {
      ctx.save();
      ctx.shadowColor = GREEN;
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = '#ccffcc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ── Head circle ──
    const head = projected['head'];
    const headR = scale * 0.09;
    ctx.save();
    ctx.shadowColor = GREEN;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = `rgba(0,255,65,0.85)`;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.ellipse(head.x, head.y, headR, headR * 1.1, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cross-hatch on head
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.5;
    for (let i = -2; i <= 2; i++) {
      const oy = head.y + (i / 3) * headR;
      const hw = Math.sqrt(Math.max(0, headR * headR - (i / 3 * headR) ** 2)) * 0.9;
      ctx.beginPath(); ctx.moveTo(head.x - hw, oy); ctx.lineTo(head.x + hw, oy); ctx.stroke();
    }
    ctx.restore();

    // ── Scan ring ──
    const topY = projected['head'].y - headR * 1.5;
    const botY = projected['lankle'].y + 12;
    scanY = (scanY + 1.4) % (botY - topY);
    const sy = topY + scanY;

    // Width of figure at this height — rough linear interp
    const figW = scale * 0.3 * (1 - Math.abs((sy - cy) / (H * 0.55)) * 0.5);

    ctx.save();
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur  = 16;
    ctx.strokeStyle = `rgba(57,255,20,0.7)`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.ellipse(cx, sy, Math.max(10, figW), 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glow beneath scan
    const scanGrad = ctx.createLinearGradient(cx - figW, sy, cx + figW, sy);
    scanGrad.addColorStop(0, 'transparent');
    scanGrad.addColorStop(0.5, 'rgba(57,255,20,0.08)');
    scanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(cx - figW, sy, figW * 2, 20);
    ctx.restore();

    // ── Status readouts ──
    ctx.save();
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = GREENDIM;
    ctx.shadowBlur = 0;
    const readouts = [
      `SYS: ONLINE`,
      `SCAN: ${Math.floor((scanY / (botY - topY)) * 100)}%`,
      `ID: BABU.S`,
      `MODE: GHOST`,
    ];
    readouts.forEach((r, i) => {
      ctx.fillText(r, 10, 30 + i * 14);
    });
    ctx.restore();

    t++;
    raf(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();


// ─── 3. TERMINAL ANIMATION ───────────────────────────────────
(function initTerminal() {
  const output = $('terminalOutput');
  const MAX_LINES = 28;

  const SEQUENCES = [
    { type:'cmd', text:'nmap -sS -O 192.168.1.0/24' },
    { type:'dim', text:'Starting Nmap 7.94 at 2024...' },
    { type:'data',text:'Host: 192.168.1.1  Ports: 22/open 80/open 443/open' },
    { type:'data',text:'Host: 192.168.1.44 Ports: 3306/open (MySQL)' },
    { type:'warn',text:'[!] OS detected: Linux 5.x kernel' },
    { type:'ok',  text:'[+] 14 hosts up, 241 hosts scanned' },
    { type:'cmd', text:'ssh root@192.168.1.44 -p 22' },
    { type:'warn',text:'Warning: Permanently added host to known_hosts.' },
    { type:'access',text:'ACCESS GRANTED — root@phantom-node' },
    { type:'cmd', text:'cat /etc/shadow | head -5' },
    { type:'data',text:'root:$6$xyz$Qd8mXk...:19832:0:99999:7:::' },
    { type:'data',text:'daemon:*:18375:0:99999:7:::' },
    { type:'cmd', text:'./exploit.py --target 192.168.1.44 --payload rev_tcp' },
    { type:'dim', text:'[*] Generating shellcode...' },
    { type:'dim', text:'[*] Encoding payload (x86/shikata_ga_nai)' },
    { type:'ok',  text:'[+] Payload ready: 4096 bytes' },
    { type:'warn',text:'[!] Firewall rule bypass: iptables -F' },
    { type:'access',text:'[>] SHELL ESTABLISHED — tty /dev/pts/3' },
    { type:'cmd', text:'netstat -antp | grep ESTABLISHED' },
    { type:'data',text:'tcp 0 0 192.168.1.44:22 10.0.0.7:59231 ESTABLISHED' },
    { type:'cmd', text:'hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.0.0.1' },
    { type:'dim', text:'[DATA] 16 tasks | 1 server | 14344385 logins' },
    { type:'dim', text:'[STATUS] 0:01:14 finished | 7204 tries/min' },
    { type:'ok',  text:'[+] 10.0.0.1:22 - login: admin   password: shadow88' },
    { type:'cmd', text:'python3 -c "import pty; pty.spawn(\'/bin/bash\')"' },
    { type:'access',text:'root@darknet:~# ▋' },
    { type:'cmd', text:'ls -la /var/www/html/secret/' },
    { type:'data',text:'.htpasswd  config.php  dump.sql  keys/' },
    { type:'cmd', text:'cat /var/www/html/secret/config.php' },
    { type:'data',text:"DB_PASS='g0dM0d3_2024' ADMIN_KEY='0xDEADBEEF'" },
    { type:'warn',text:'[!] Exfil buffer: 128MB — packaging...' },
    { type:'ok',  text:'[+] Transfer complete. 00:00:04 elapsed' },
    { type:'cmd', text:'systemctl status fail2ban' },
    { type:'dim', text:'● fail2ban.service — Fail2Ban Service' },
    { type:'dim', text:'   Loaded: loaded; Active: active (running)' },
    { type:'warn',text:'[!] 43 bans active. Rotating proxy...' },
    { type:'ok',  text:'[+] Proxy rotated: TOR exit node 179.43.xx.xx' },
    { type:'cmd', text:'msfconsole -q -x "use exploit/multi/handler"' },
    { type:'data',text:'msf6 exploit(multi/handler) > set LHOST 0.0.0.0' },
    { type:'data',text:'msf6 exploit(multi/handler) > run' },
    { type:'access',text:'[*] Started reverse TCP handler on 0.0.0.0:4444' },
    { type:'cmd', text:'tcpdump -i eth0 -n port 443 -w capture.pcap' },
    { type:'dim', text:'tcpdump: listening on eth0, link-type EN10MB' },
    { type:'data',text:'21:44:03.114 IP 185.234.xx → 10.0.0.7: Flags [S]' },
    { type:'data',text:'21:44:03.215 IP 10.0.0.7  → 185.234.xx: Flags [S.]' },
    { type:'ok',  text:'[+] Handshake captured. TLS 1.3 detected.' },
    { type:'cmd', text:'aircrack-ng -w /usr/share/wordlists/rockyou.txt cap.pcap' },
    { type:'dim', text:'Opening cap.pcap...' },
    { type:'data',text:'# BSSID              ESSID   Encryption' },
    { type:'data',text:'1  CC:40:D0:xx:xx     HOME-5G  WPA (1 handshake)' },
    { type:'ok',  text:'KEY FOUND! [ nightmare2049 ]' },
    { type:'cmd', text:'whoami && hostname && id' },
    { type:'access',text:'root  phantom-0xBEEF  uid=0(root) gid=0(root)' },
    { type:'cmd', text:'echo "SHAURYA BABU WAS HERE" >> /etc/motd' },
    { type:'ok',  text:'[+] Ghost tag written.' },
    { type:'cmd', text:'history -c && exit' },
    { type:'warn',text:'[!] Erasing footprints...' },
    { type:'ok',  text:'[+] Session closed. No trace.' },
  ];

  let seqIdx = 0;
  let charBuffer = [];
  let isTyping = false;

  function appendLine(type, text) {
    const el = document.createElement('span');
    el.className = `line line-${type}`;
    el.textContent = text;
    output.appendChild(el);

    // Trim old lines
    while (output.children.length > MAX_LINES) {
      output.removeChild(output.firstChild);
    }
    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
  }

  function typeNextSequence() {
    if (isTyping) return;
    isTyping = true;

    const seq = SEQUENCES[seqIdx % SEQUENCES.length];
    seqIdx++;

    if (seq.type === 'cmd') {
      // Type character by character
      let i = 0;
      const el = document.createElement('span');
      el.className = 'line line-cmd';
      el.textContent = 'root@shadow:~# ';
      output.appendChild(el);
      while (output.children.length > MAX_LINES) output.removeChild(output.firstChild);

      const iv = setInterval(() => {
        el.textContent += seq.text[i++];
        if (i >= seq.text.length) {
          clearInterval(iv);
          setTimeout(() => {
            isTyping = false;
            scheduleNext();
          }, 150);
        }
      }, 28 + Math.random() * 30);
    } else {
      appendLine(seq.type, seq.text);
      isTyping = false;
      scheduleNext();
    }
  }

  function scheduleNext() {
    const delay = 320 + Math.random() * 900;
    setTimeout(typeNextSequence, delay);
  }

  scheduleNext();

  // Live clock line injected periodically
  setInterval(() => {
    const now = new Date();
    const ts  = `[${now.toTimeString().slice(0,8)}] SYS_MONITOR: CPU ${(Math.random()*40+10).toFixed(1)}% MEM ${(Math.random()*30+50).toFixed(0)}% NET ${(Math.random()*900+100).toFixed(0)}Kb/s`;
    appendLine('dim', ts);
  }, 7000);
})();


// ─── 4. NETWORK VISUALIZATION ────────────────────────────────
(function initNetwork() {
  const canvas = $('networkCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  let nodes = [];
  let packets = [];

  const NODE_COUNT = 22;
  const GREEN = '#00ff41';

  class Node {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 3 + 1.5;
      this.vx   = (Math.random() - 0.5) * 0.28;
      this.vy   = (Math.random() - 0.5) * 0.28;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.04 + Math.random() * 0.03;
      this.type = Math.random() > 0.8 ? 'hub' : 'node';
      if (this.type === 'hub') this.r = 5 + Math.random() * 3;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
  }

  class Packet {
    constructor(src, dst) {
      this.src = src; this.dst = dst;
      this.t = 0; this.speed = 0.012 + Math.random() * 0.02;
    }
    update() { this.t += this.speed; }
    get done() { return this.t >= 1; }
    get x() { return this.src.x + (this.dst.x - this.src.x) * this.t; }
    get y() { return this.src.y + (this.dst.y - this.src.y) * this.t; }
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
    nodes = Array.from({ length: NODE_COUNT }, () => new Node());
  }

  function spawnPacket() {
    if (nodes.length < 2) return;
    const src = nodes[Math.floor(Math.random() * nodes.length)];
    const dst = nodes[Math.floor(Math.random() * nodes.length)];
    if (src !== dst) packets.push(new Packet(src, dst));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background hex grid (subtle)
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 0.5;
    const hx = 40, hy = 46;
    for (let row = 0; row < H / hy + 1; row++) {
      for (let col = 0; col < W / hx + 1; col++) {
        const ox = col * hx * 2 + (row % 2 ? hx : 0);
        const oy = row * hy;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          const px = ox + 18 * Math.cos(a);
          const py = oy + 18 * Math.sin(a);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    ctx.restore();

    // ── Edges ──
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(W, H) * 0.4;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.5;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = GREEN;
          ctx.lineWidth = 0.6;
          ctx.shadowColor = GREEN;
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // ── Packets ──
    packets = packets.filter(p => !p.done);
    packets.forEach(p => {
      p.update();
      ctx.save();
      ctx.shadowColor = '#ccffcc';
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = '#ccffcc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ── Nodes ──
    nodes.forEach(n => {
      n.update();
      const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
      const r = n.r + pulse * (n.type === 'hub' ? 3 : 1.5);

      if (n.type === 'hub') {
        // Outer ring
        ctx.save();
        ctx.globalAlpha = 0.15 + pulse * 0.15;
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner glow
        ctx.save();
        ctx.shadowColor = GREEN;
        ctx.shadowBlur  = 20;
        ctx.fillStyle   = '#39ff14';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.shadowColor = GREEN;
        ctx.shadowBlur  = 10 + pulse * 8;
        ctx.fillStyle   = `rgba(0,${Math.floor(180 + pulse * 75)},50,0.9)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // ── Scanning reticle ──
    const cx = W / 2, cy = H / 2;
    const scanR = (Date.now() % 3000) / 3000;
    const scanRadius = scanR * Math.min(W, H) * 0.48;
    ctx.save();
    ctx.globalAlpha = (1 - scanR) * 0.4;
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, scanRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ── Corner data text ──
    ctx.save();
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = '#006622';
    ctx.fillText(`NODES: ${nodes.length}`, 10, H - 36);
    ctx.fillText(`PKT/S: ${Math.floor(Math.random()*400+800)}`, 10, H - 24);
    ctx.fillText(`LATENCY: ${(Math.random()*2+0.4).toFixed(2)}ms`, 10, H - 12);
    ctx.restore();

    raf(draw);
  }

  setInterval(spawnPacket, 300);
  resize();
  window.addEventListener('resize', resize);
  draw();
})();


// ─── 5. CENTER SUBTITLE TYPEWRITER ──────────────────────────
(function initSubtitle() {
  const el = $('subtitleText');
  const lines = [
    'CYBERSECURITY SPECIALIST',
    'PENETRATION TESTER',
    'DIGITAL GHOST',
    'SYSTEM ARCHITECT',
    'OFFENSIVE SECURITY',
    'ETHICAL HACKER',
  ];
  let li = 0, ci = 0, deleting = false;

  function tick() {
    const target = lines[li];
    if (!deleting) {
      el.textContent = target.slice(0, ++ci);
      if (ci === target.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 65);
    } else {
      el.textContent = target.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  tick();
})();


// ─── 6. HEX STREAM BAR ───────────────────────────────────────
(function initHexBar() {
  const el = $('hexStream');
  function gen() {
    let s = '';
    for (let i = 0; i < 38; i++) {
      s += Math.floor(Math.random() * 256).toString(16).padStart(2,'0').toUpperCase() + ' ';
    }
    el.textContent = s;
  }
  gen();
  setInterval(gen, 900);
})();


// ─── 7. DOWNLOAD + ACCESS FLASH ─────────────────────────────
(function initDownloadSequence() {
  const overlay   = $('dlOverlay');
  const titleEl   = $('dlTitle');
  const filesEl   = $('dlFiles');
  const barFill   = $('dlBarFill');
  const pctEl     = $('dlPct');
  const statsEl   = $('dlStats');
  const flashEl   = $('accessFlash');

  // Fake file pools
  const FILE_POOL = [
    ['sys_kernel.img',    '284 MB'], ['shadow_dump.tar.gz', '17 MB'],
    ['credentials.db',   '3.2 MB'], ['network_map.json',   '841 KB'],
    ['exploit_kit.zip',  '62 MB'],  ['priv_keys.tar',      '128 KB'],
    ['capture.pcap',     '44 MB'],  ['rootkit_v3.bin',     '9.7 MB'],
    ['passwd_hashes.txt','2.1 MB'], ['mail_archive.mbox',  '391 MB'],
    ['firewall_rules.sh','55 KB'],  ['vpn_config.ovpn',    '12 KB'],
    ['db_backup.sql',    '730 MB'], ['tokens_2024.json',   '88 KB'],
    ['ssl_certs.pem',    '204 KB'], ['session_logs.gz',    '19 MB'],
    ['recon_output.txt', '3.8 MB'], ['payload_gen.py',     '76 KB'],
    ['jwt_secrets.env',  '4 KB'],   ['host_scan.xml',      '1.2 MB'],
    ['auth_bypass.sh',   '22 KB'],  ['mem_dump.raw',       '512 MB'],
    ['config_backup.zip','8.3 MB'], ['ids_rules.conf',     '640 KB'],
  ];

  // Pick N unique random files
  function pickFiles(n) {
    const pool = [...FILE_POOL];
    const out  = [];
    while (out.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  // Show access flash (granted or declined)
  function showFlash(type) {
    flashEl.className = `access-flash ${type}`;
    flashEl.innerHTML = `<span class="access-flash-text">${
      type === 'granted' ? 'ACCESS GRANTED' : 'ACCESS DECLINED'
    }</span>`;
    // Remove class after animation so it can re-trigger
    setTimeout(() => { flashEl.className = 'access-flash'; }, 2500);
  }

  // Run one full download sequence (~25-30 seconds)
  function runSequence() {
    const files     = pickFiles(7 + Math.floor(Math.random() * 5));
    const totalDur  = 25000 + Math.random() * 5000;   // 25-30s
    const granted   = Math.random() > 0.35;            // 65% granted, 35% declined

    // Reset UI
    filesEl.innerHTML = '';
    barFill.style.width = '0%';
    pctEl.textContent   = '0%';
    statsEl.textContent = 'SPEED: -- KB/s | ETA: --s';
    titleEl.textContent = 'INITIATING TRANSFER...';

    overlay.classList.add('visible');

    let startTime     = performance.now();
    let fileIdx       = 0;
    let lastFileTime  = 0;
    const fileInterval = totalDur / files.length;

    // Rows already shown
    const rows = [];

    function updateBar(now) {
      const elapsed = now - startTime;
      let progress  = Math.min(elapsed / totalDur, 1);

      // If declined, bar stalls around 60-85% then stays frozen
      if (!granted && progress > 0.65) {
        progress = 0.65 + (progress - 0.65) * 0.08;
        if (progress > 0.72) progress = 0.72;
      }

      const pct  = Math.floor(progress * 100);
      const speed = granted
        ? (2800 + Math.random() * 4200).toFixed(0)
        : (progress < 0.65 ? (2800 + Math.random() * 4200).toFixed(0) : '0');
      const remaining = Math.max(0, ((totalDur - elapsed) / 1000)).toFixed(1);

      barFill.style.width = pct + '%';
      pctEl.textContent   = pct + '%';
      statsEl.textContent = `SPEED: ${speed} KB/s \u00a0|\u00a0 ETA: ${remaining}s`;

      // Add file rows over time
      if (elapsed - lastFileTime > fileInterval && fileIdx < files.length) {
        const [fname, fsize] = files[fileIdx];
        const row = document.createElement('div');
        row.className = 'dl-file-row';

        const isDone = fileIdx < Math.floor(progress * files.length);
        row.innerHTML =
          `<span class="dl-file-name">${fname}</span>` +
          `<span class="dl-file-size">${fsize}</span>` +
          `<span class="${isDone ? 'dl-file-status-ok' : 'dl-file-status-run'}">${isDone ? '✓ OK' : '▶ ...'}</span>`;

        filesEl.appendChild(row);
        // Keep only last 6 rows visible
        while (filesEl.children.length > 6) filesEl.removeChild(filesEl.firstChild);

        lastFileTime = elapsed;
        fileIdx++;
      }

      // Update existing rows' status
      Array.from(filesEl.querySelectorAll('.dl-file-status-run')).forEach(s => {
        // Mark complete randomly as progress advances
        if (Math.random() > 0.7) {
          s.className = 'dl-file-status-ok';
          s.textContent = '✓ OK';
        }
      });

      // Title text changes
      if (!granted && progress >= 0.65) {
        titleEl.textContent = 'FIREWALL DETECTED — HOLD...';
      } else if (progress < 0.15) {
        titleEl.textContent = 'INITIATING TRANSFER...';
      } else if (progress < 0.5) {
        titleEl.textContent = 'DOWNLOADING FILES...';
      } else if (progress < 0.85) {
        titleEl.textContent = 'EXFILTRATING DATA...';
      } else {
        titleEl.textContent = 'FINALIZING...';
      }

      if (elapsed < totalDur) {
        requestAnimationFrame(updateBar);
      } else {
        // Sequence done
        setTimeout(() => {
          overlay.classList.remove('visible');
          // Show flash 400ms after overlay hides
          setTimeout(() => {
            showFlash(granted ? 'granted' : 'declined');
            // Wait before next sequence: 3-5s after flash
            setTimeout(runSequence, 3500 + Math.random() * 2000);
          }, 400);
        }, 600);
      }
    }

    requestAnimationFrame(updateBar);
  }

  // Kick off first sequence after 4 seconds so page loads first
  setTimeout(runSequence, 4000);
})();
