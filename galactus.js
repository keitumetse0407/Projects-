/**
 * GALACTUS TUI - Tony Stark Level Development Environment
 * Version: 1.0.0-Stark
 * 
 * A recursive, self-evolving terminal framework that absorbs skills
 * and optimizes for resource-constrained devices (Mobicel V54)
 * 
 * Usage: node galactus.js [command]
 * Commands:
 *   run           - Start the TUI
 *   install       - Show available skills to install
 *   skills        - List installed skills
 *   clear        - Clear screen buffer
 *   help         - Show this help
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ==== CORE KERNEL ====
const Galactus = {
    version: '1.0.0-Stark',
    skills: new Map(),
    history: [],
    config: {
        maxHistory: 100,
        screenBuffer: [],
        lastFrame: null,
        dirty: true
    },
    
    // Colors for TUI
    colors: {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        bold: '\x1b[1m',
        dim: '\x1b[2m',
        italic: '\x1b[3m',
        underline: '\x1b[4m'
    },
    
    // ANSI cursor commands
    cursor: {
        home: '\x1b[H',
        clear: '\x1b[2J',
        hide: '\x1b[?25l',
        show: '\x1b[?25h',
        up: '\x1b[A',
        down: '\x1b[B',
        right: '\x1b[C',
        left: '\x1b[D'
    },
    
    // Initialize Galactus
    init() {
        this.loadSkills();
        this.renderBanner();
    },
    
    // Render startup banner
    renderBanner() {
        console.clear();
        const c = this.colors;
        console.log(`${c.cyan}${c.bold}`);
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║     🦾 GALACTUS TUI - Tony Stark Development Framework 🦾     ║');
        console.log('║          Recursive Self-Evolving System v1.0.0          ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log(`${c.reset}`);
        console.log(`${c.green}[SYSTEM]${c.reset} Galactus kernel loaded`);
        console.log(`${c.green}[SYSTEM]${c.reset} ${this.skills.size} skills available`);
        console.log(`${c.green}[SYSTEM]${c.reset} Type '${c.yellow}help${c.reset}' for commands`);
        console.log('');
    },
    
    // Load skills from /root/skills/
    loadSkills() {
        const skillsDir = '/root/skills';
        if (!fs.existsSync(skillsDir)) return;
        
        const dirs = fs.readdirSync(skillsDir);
        dirs.forEach(dir => {
            const skillPath = path.join(skillsDir, dir);
            if (fs.statSync(skillPath).isDirectory()) {
                const skill = {
                    name: dir,
                    path: skillPath,
                    loaded: false,
                    meta: null
                };
                
                // Try to load SKILL.md as metadata
                const metaPath = path.join(skillPath, 'SKILL.md');
                if (fs.existsSync(metaPath)) {
                    try {
                        const content = fs.readFileSync(metaPath, 'utf8');
                        const nameMatch = content.match(/name:\s*(\S+)/);
                        const descMatch = content.match(/description:\s*([^\n]+)/);
                        skill.meta = {
                            name: nameMatch ? nameMatch[1] : dir,
                            description: descMatch ? descMatch[1] : 'No description'
                        };
                    } catch (e) {
                        // Ignore metadata errors
                    }
                }
                
                this.skills.set(dir, skill);
            }
        });
    },
    
    // Absorb a new skill (recursive injection)
    async absorb(skillName) {
        const skill = this.skills.get(skillName);
        if (!skill) {
            console.log(`${this.colors.red}[ERROR]${this.colors.reset} Skill '${skillName}' not found`);
            return false;
        }
        
        console.log(`${this.colors.cyan}[EVOLVING]${this.colors.reset} Integrating ${skillName}...`);
        
        // Try to load skill module
        const jsPath = path.join(skill.path, 'index.js');
        const jsonPath = path.join(skill.path, 'skill.json');
        
        if (fs.existsSync(jsonPath)) {
            try {
                const skillData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                skill.loaded = true;
                skill.module = skillData;
                console.log(`${this.colors.green}[SUCCESS]${this.colors.reset} Skill ${skillName} integrated. System at ${this.getPowerLevel() * 10}% power.`);
                return true;
            } catch (e) {
                console.log(`${this.colors.red}[ERROR]${this.colors.reset} Failed to load skill: ${e.message}`);
                return false;
            }
        }
        
        // Try SKILL.md
        const mdPath = path.join(skill.path, 'SKILL.md');
        if (fs.existsSync(mdPath)) {
            skill.loaded = true;
            skill.module = { type: 'markdown', path: mdPath };
            console.log(`${this.colors.green}[SUCCESS]${this.colors.reset} Skill ${skillName} integrated. System at ${this.getPowerLevel() * 10}% power.`);
            return true;
        }
        
        console.log(`${this.colors.yellow}[WARN]${this.colors.reset} No executable module found, marking as loaded`);
        skill.loaded = true;
        return true;
    },
    
    getPowerLevel() {
        let loaded = 0;
        this.skills.forEach(s => { if (s.loaded) loaded++; });
        return Math.min(100, loaded * 10);
    },
    
    // List skills
    listSkills() {
        console.log(`\n${this.colors.bold}Available Skills:${this.colors.reset}\n`);
        
        this.skills.forEach((skill, name) => {
            const status = skill.loaded ? `${this.colors.green}●${this.colors.reset}` : `${this.colors.dim}○${this.colors.reset}`;
            const meta = skill.meta || { name: name, description: 'No description' };
            console.log(`  ${status} ${meta.name.padEnd(20)} ${meta.description}`);
        });
        console.log('');
    },
    
    // Buffer-differenced rendering (for optimal performance)
    renderDifferential(newFrame) {
        if (!this.config.lastFrame) {
            this.config.lastFrame = newFrame;
            return newFrame;
        }
        
        // Compare and only return changed lines
        const changed = [];
        for (let i = 0; i < newFrame.length; i++) {
            if (this.config.lastFrame[i] !== newFrame[i]) {
                changed.push({ line: i, content: newFrame[i] });
            }
        }
        
        this.config.lastFrame = newFrame;
        return changed;
    },
    
    // Add to history
    addHistory(cmd) {
        this.config.history.push(cmd);
        if (this.config.history.length > this.config.maxHistory) {
            this.config.history.shift();
        }
    },
    
    // Memory pruning
    gc() {
        // Clear old frame buffer
        this.config.screenBuffer = [];
        this.config.dirty = true;
        // Suggest GC to V8
        if (global.gc) global.gc();
    },
    
    // Hot reload a file (watch for changes)
    hotReload(filePath, callback) {
        if (!fs.existsSync(filePath)) {
            console.log(`${this.colors.red}[ERROR]${this.colors.reset} File not found: ${filePath}`);
            return;
        }
        
        let lastStat = fs.statSync(filePath);
        
        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                const newStat = fs.statSync(filePath);
                if (newStat.mtimeMs !== lastStat.mtimeMs) {
                    console.log(`${this.colors.yellow}[HOT]${this.colors.reset} ${path.basename(filePath)} changed - reloading...`);
                    lastStat = newStat;
                    callback();
                }
            }
        });
        
        return watcher;
    },
    
    // Exit gracefully
    shutdown() {
        console.log(`\n${this.colors.cyan}[SYSTEM]${this.colors.reset} Shutting down Galactus...`);
        this.gc();
    }
};

// ==== SKILL MODULES ====

// Tile Generator Skill
const TileGenerator = {
    name: 'tile-generator',
    description: 'Generates 16x16 pixel art tiles',
    
    generate(options = {}) {
        const size = options.size || 16;
        const type = options.type || 'ground';
        const colors = options.colors || ['#c0392b', '#d35400', '#a93226'];
        
        const pixels = [];
        for (let y = 0; y < size; y++) {
            let row = '';
            for (let x = 0; x < size; x++) {
                let color = colors[0];
                
                // Add texture based on type
                if (type === 'ground') {
                    if (x === 0 || y === 0) color = colors[2];
                    else if (x === size - 1 || y === size - 1) color = colors[2];
                    else if ((x + y) % 4 === 0) color = colors[1];
                }
                
                const r = parseInt(color.slice(1,3), 16);
                const g = parseInt(color.slice(3,5), 16);
                const b = parseInt(color.slice(5,7), 16);
                row += `\x1b[48;2;${r};${g};${b}m  `;
            }
            pixels.push(row);
        }
        return pixels;
    },
    
    toHexArray(pixels) {
        return pixels.map(row => {
            return row.replace(/\\x1b\[[0-9;]+m/g, '').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(', ');
        });
    }
};

// Physics Simulator Skill
const PhysicsSim = {
    name: 'physics-sim',
    description: 'Real-time physics sandbox',
    
    config: {
        gravity: 0.4,
        jumpVelocity: 8.0,
        friction: 0.85,
        terminalVel: 8.0
    },
    
    simulate(jumpHeight, maxSpeed, gravity) {
        const g = gravity || this.config.gravity;
        const v0 = Math.sqrt(2 * g * jumpHeight * TILE);
        return {
            initialVelocity: v0.toFixed(2),
            framesToApex: (v0 / g).toFixed(1),
            height: jumpHeight,
            maxSpeed: maxSpeed
        };
    },
    
    tweak(param, value) {
        if (this.config[param] !== undefined) {
            this.config[param] = value;
            return true;
        }
        return false;
    },
    
    getConfig() {
        return { ...this.config };
    }
};

// Agent Auto-Fix Skill
const AgentAutoFix = {
    name: 'agent-auto-fix',
    description: 'Scans code for bugs before execution',
    
    patterns: [
        { regex: /checkCollision\(.*\).*\.width.*\)/, severity: 'warn', msg: 'AABB check may have edge case' },
        { regex: /while\s*\(!.*checkCollision/, severity: 'warn', msg: 'Infinite loop risk in collision' },
        { regex: /Math\.floor.*\/.*TILE/, severity: 'info', msg: 'Consider caching tile calculation' }
    ],
    
    scan(filePath) {
        if (!fs.existsSync(filePath)) {
            return { errors: [`File not found: ${filePath}`] };
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        
        this.patterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern.regex, 'g');
            while ((match = regex.exec(content)) !== null) {
                issues.push({
                    line: content.substring(0, match.index).split('\n').length,
                    severity: pattern.severity,
                    message: pattern.msg,
                    match: match[0].substring(0, 50)
                });
            }
        });
        
        return { file: filePath, issues };
    }
};

// Hot Reload Engine Skill
const HotReload = {
    name: 'hot-reload',
    description: 'Live code reloading',
    
    watchers: new Map(),
    
    watch(filePath, onChange) {
        if (this.watchers.has(filePath)) {
            return { success: false, message: 'Already watching' };
        }
        
        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                console.log(`\x1b[33m[HOT]\x1b[0m ${path.basename(filePath)} changed`);
                onChange();
            }
        });
        
        this.watchers.set(filePath, watcher);
        return { success: true, message: 'Now watching' };
    },
    
    unwatch(filePath) {
        const watcher = this.watchers.get(filePath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(filePath);
            return { success: true };
        }
        return { success: false };
    },
    
    unwatchAll() {
        this.watchers.forEach(w => w.close());
        this.watchers.clear();
    }
};

// ==== COMMAND PARSER ====
function parseCommand(input) {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    return { cmd, args };
}

// ==== MAIN LOOP ====
async function main() {
    Galactus.init();
    
    const args = process.argv.slice(2);
    const cmd = args[0] || 'interactive';
    
    if (cmd === 'run') {
        // Interactive mode
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        console.log(`\n${Galactus.colors.cyan}[SYSTEM]${Galactus.colors.reset} Entering interactive mode`);
        console.log(`Type '${Galactus.colors.yellow}skills${Galactus.colors.reset}' to see available, '${Galactus.colors.yellow}install <name>${Galactus.colors.reset}' to add\n`);
        
        rl.setPrompt(`${Galactus.colors.green}galactus>${Galactus.colors.reset} `);
        rl.prompt();
        
        rl.on('line', async (line) => {
            const input = line.trim();
            if (!input) {
                rl.prompt();
                return;
            }
            
            if (input === 'exit' || input === 'quit') {
                Galactus.shutdown();
                process.exit(0);
            }
            
            const { cmd, args } = parseCommand(input);
            
            switch(cmd) {
                case 'help':
                case '?':
                    console.log(`
${Galactus.colors.bold}Commands:${Galactus.colors.reset}
  skills              List available skills
  install <name>      Absorb a skill
  scan <file>        Scan code for bugs
  tile <type>        Generate tile preview
  physics            Show physics config
  physics <g> <j>    Tweak gravity/jump
  reload <file>      Start hot reload
  clear              Clear screen
  skills             Show skills
  history            Show command history
  gc                 Force memory cleanup
  help               Show this help
                    `.trim());
                    break;
                    
                case 'skills':
                case 'list':
                    Galactus.listSkills();
                    break;
                    
                case 'install':
                case 'absorb':
                    if (args[0]) {
                        await Galactus.absorb(args[0]);
                    } else {
                        console.log(`${Galactus.colors.yellow}[WARN]${Galactus.colors.reset} Usage: install <skill-name>`);
                    }
                    break;
                    
                case 'scan':
                    if (args[0]) {
                        const result = AgentAutoFix.scan(args[0]);
                        console.log(`\n${Galactus.colors.bold}Scanning: ${result.file}${Galactus.colors.reset}`);
                        if (result.issues.length === 0) {
                            console.log(`${Galactus.colors.green}[OK]${Galactus.colors.reset} No issues found`);
                        } else {
                            result.issues.forEach(i => {
                                const sev = i.severity === 'error' ? Galactus.colors.red : 
                                         i.severity === 'warn' ? Galactus.colors.yellow : Galactus.colors.blue;
                                console.log(`  ${sev}[${i.severity.toUpperCase()}]${Galactus.colors.reset} Line ${i.line}: ${i.message}`);
                            });
                        }
                    }
                    break;
                    
                case 'tile':
                    const type = args[0] || 'ground';
                    const tiles = TileGenerator.generate({ type });
                    console.log(`\n${Galactus.colors.yellow}${type.toUpperCase()} TILE:${Galactus.colors.reset}`);
                    tiles.forEach(row => console.log(row));
                    console.log(Galactus.colors.reset);
                    break;
                    
                case 'physics':
                    if (args.length > 0) {
                        PhysicsSim.tweak('gravity', parseFloat(args[0]));
                    }
                    if (args.length > 1) {
                        PhysicsSim.tweak('jumpVelocity', parseFloat(args[1]));
                    }
                    console.log(`\n${Galactus.colors.bold}Physics Config:${Galactus.colors.reset}`);
                    const cfg = PhysicsSim.getConfig();
                    Object.entries(cfg).forEach(([k, v]) => {
                        console.log(`  ${k}: ${v}`);
                    });
                    break;
                    
                case 'reload':
                    if (args[0]) {
                        const result = HotReload.watch(args[0], () => {
                            console.log(`\n${Galactus.colors.green}[READY]${Galactus.colors.reset} File reloaded`);
                        });
                        console.log(`${Galactus.colors.green}[OK]${Galactus.colors.reset} ${result.message}`);
                    }
                    break;
                    
                case 'clear':
                    console.clear();
                    break;
                    
                case 'history':
                    console.log(`\n${Galactus.colors.bold}Command History:${Galactus.colors.reset}`);
                    Galactus.config.history.forEach((cmd, i) => {
                        console.log(`  ${i + 1}. ${cmd}`);
                    });
                    break;
                    
                case 'gc':
                    Galactus.gc();
                    console.log(`${Galactus.colors.green}[OK]${Galactus.colors.reset} Memory cleaned`);
                    break;
                    
                case 'version':
                    console.log(`Galactus TUI v${Galactus.version}`);
                    break;
                    
                default:
                    console.log(`${Galactus.colors.red}[ERROR]${Galactus.colors.reset} Unknown command: ${cmd}`);
                    console.log(`Type '${Galactus.colors.yellow}help${Galactus.colors.reset}' for available commands`);
            }
            
            Galactus.addHistory(input);
            rl.prompt();
        });
        
    } else if (cmd === 'install') {
        // Install all available skills
        console.log(`${Galactus.colors.cyan}[SYSTEM]${Galactus.colors.reset} Loading all skills...`);
        for (const [name, skill] of Galactus.skills) {
            await Galactus.absorb(name);
        }
        console.log(`\n${Galactus.colors.green}[DONE]${Galactus.colors.reset} All skills loaded. Power level: ${Galactus.getPowerLevel()}%`);
        
    } else if (cmd === 'skills') {
        Galactus.listSkills();
        
    } else if (cmd === 'clear') {
        console.clear();
        
    } else if (cmd === 'help') {
        console.log(`
${Galactus.colors.bold}GALACTUS TUI${Galactus.colors.reset}

Usage: node galactus.js <command>

Commands:
  run           - Start interactive mode
  install       - Auto-install all skills
  skills        - List available skills
  clear         - Clear screen
  help          - Show this help
        `.trim());
        
    } else {
        console.log(`Unknown command: ${cmd}`);
        console.log(`Run 'node galactus.js help' for usage`);
    }
}

// Export for external use
module.exports = { Galactus, TileGenerator, PhysicsSim, AgentAutoFix, HotReload };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}