import { COLOR } from "./colors";
import { snake } from "./games/snake";
import { sl } from "./games/sl";
import { hack } from "./games/hack";
import { tetris } from "./games/tetris";
import type { Command, Terminal } from "../../types";

const FORTUNES = [
	"There are only two hard things in CS: cache invalidation and naming things.",
	"It works on my machine. \u{1F937}",
	"Weeks of coding can save you hours of planning.",
	"A user interface is like a joke. If you have to explain it, it's not good.",
	"Deleted code is debugged code.",
	"Real programmers count from 0.",
	"The best error message is the one that never shows up.",
];

const NEOFETCH_LOGO = [
  "    ╱╲    ",
  "   ╱__╲   ",
  "  ╱╲  ╱╲  ",
  " ╱__╲╱__╲ ",
  " ╲  ╱╲  ╱ ",
  "  ╲╱__╲╱  ",
];

const COW = [
  "        \\   ^__^",
  "         \\  (oo)\\_______",
  "            (__)\\       )\\/\\\\",
  "                ||----w |",
  "                ||     ||",
];

/**
 * Build the command registry bound to a terminal. Add a command by adding one
 * entry; mark `hidden: true` to keep it out of `help` (that's a secret).
 */
export function createCommands(t: Terminal): Record<string, Command> {
	const commands: Record<string, Command> = {
		help: {
			summary: "show this help",
			run() {
				t.write("available commands:", COLOR.text);
				for (const [name, cmd] of Object.entries(commands)) {
					if (!cmd.hidden) t.write(`  ${name.padEnd(12)}${cmd.summary}`);
				}
				t.write("");
				t.write("'exit' returns to the tabs. some commands are hidden. Poke around.", COLOR.info);
			},
		},

		ls: {
			summary: "list skills categories",
			run: () => t.write(t.targets.join("  "), COLOR.text),
		},

		open: {
			summary: "open <category> to select tab (alias: cd)",
			run({ args }) {
				const target = args[0]?.toLowerCase() ?? "";
				if (!t.selectTab(target)) {
					t.write(`open: ${target || "?"}: no such category`, COLOR.error);
					return;
				}
				t.write(`selected ${target} | 'exit' to view`, COLOR.info);
				t.showTabs();
			},
		},

		echo: {
			summary: "echo <text> to print text",
			run: ({ args }) => t.write(args.join(" "), COLOR.text),
		},

		whoami: {
			summary: "print current user",
			run: () => t.write("visitor", COLOR.text),
		},

		pwd: {
			summary: "print working directory",
			run: () => t.write("/home/visitor/portfolio", COLOR.text),
		},

		date: {
			summary: "show current date/time",
			run: () => t.write(new Date().toString(), COLOR.text),
		},

		history: {
			summary: "show command history",
			run() {
				t.commandLog.forEach((cmd, i) =>
					t.write(`  ${String(i + 1).padStart(3)}  ${cmd}`),
				);
			},
		},

		man: {
			summary: "man <command> to describe a command",
			run({ args }) {
				const cmd = commands[args[0]?.toLowerCase() ?? ""];
				if (!cmd) {
					t.write(`no manual entry for ${args[0] ?? "?"}`, COLOR.error);
					return;
				}
				t.write(`${args[0]} | ${cmd.summary || "(secret)"}`, COLOR.text);
			},
		},

		neofetch: {
			summary: "system info + logo",
			run() {
				const info = [
					"visitor@portfolio",
					"-----------------",
					"os:      PortfolioOS x86_64",
					"shell:   portfolio-sh 3.0",
					"uptime:  always on",
					`stack:   ${t.targets.join(", ")}`,
					" editor:  neovim btw",
				];
				const rows = Math.max(NEOFETCH_LOGO.length, info.length);
				for (let i = 0; i < rows; i++) {
					t.write(
						`${(NEOFETCH_LOGO[i] ?? "        ").padEnd(9)}${info[i] ?? ""}`,
						i < 2 ? COLOR.accent : COLOR.text,
					);
				}
			},
		},

		cowsay: {
			summary: "cowsay <text> so the cow speaks",
			run({ args }) {
				const msg = args.join(" ") || "moo";
				t.writeAll(
					[` ${"-".repeat(msg.length + 2)}`, `| ${msg} |`, ` ${"-".repeat(msg.length + 2)}`, ...COW],
					COLOR.text,
				);
			},
		},

		fortune: {
			summary: "a random developer truth",
			run: () => t.write(FORTUNES[Math.floor(Math.random() * FORTUNES.length)], COLOR.info),
		},

		clear: {
			summary: "clear the terminal log",
			run: () => t.clear(),
		},

		exit: {
			summary: "return to the tabbed view",
			run: () => t.showTabs(),
		},

		// --- hidden: the secrets ---

		secrets: {
			summary: "reveal every hidden command",
			hidden: true,
			run() {
				t.write("hidden commands:", COLOR.heading);
				for (const [name, cmd] of Object.entries(commands)) {
					if (cmd.hidden) t.write(`  ${name.padEnd(12)}${cmd.summary}`);
				}
			},
		},

		snake: {
			summary: "play snake (arrows move, q quits)",
			run() {
				if (t.gameRunning()) return;
				t.write("launching snake | keep the input focused, arrows to steer.", COLOR.info);
				t.startGame(snake);
			},
		},

		tetris: {
			summary: "play tetris (arrows + space, q quits)",
			run() {
				if (t.gameRunning()) return;
				t.write("launching tetris | keep the input focused.", COLOR.info);
				t.startGame(tetris);
			},
		},

		sl: {
			summary: "you meant 'ls', didn't you?",
			hidden: true,
			run() {
				if (t.gameRunning()) return;
				t.write("choo choo", COLOR.warning);
				t.startGame(sl);
			},
		},

		theme: {
			summary: "toggle light / dark theme",
			hidden: true,
			run() {
				const root = document.documentElement;
				const light = root.dataset.theme !== "light";
				root.dataset.theme = light ? "light" : "dark";
				t.write(`theme → ${light ? "light" : "dark"} mode`, COLOR.info);
			},
		},

		sudo: {
			summary: "you are not root",
			hidden: true,
			run({ args }) {
				if (args.join(" ").includes("rm -rf")) {
					t.write("nice try. this portfolio is immortal.", COLOR.error);
					return;
				}
				t.write("visitor is not in the sudoers file. this incident will be reported.", COLOR.error);
			},
		},

		rm: {
			summary: "permission denied",
			hidden: true,
			run: () => t.write("rm: nothing here is going anywhere.", COLOR.error),
		},

		hack: {
			summary: "become a movie hacker",
			hidden: true,
			run() {
				t.startGame(hack);
			},
		},

		matrix: {
			summary: "follow the white rabbit",
			hidden: true,
			run() {
				const glyphs = "01<>/$#*+=-";
				for (let i = 0; i < 6; i++) {
					let row = "";
					for (let j = 0; j < 32; j++) row += glyphs[Math.floor(Math.random() * glyphs.length)];
					t.write(row, COLOR.success);
				}
				t.write("wake up, visitor...", COLOR.info);
			},
		},

		"42": {
			summary: "the ultimate answer",
			hidden: true,
			run: () => t.write("the answer to life, the universe, and everything.", COLOR.info),
		},
	};

	// aliases
	commands.cd = commands.open;
	commands.cat = commands.open;
	commands.uname = commands.neofetch;

	return commands;
}
