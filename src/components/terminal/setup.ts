import { COLOR } from "./colors";
import { createCommands } from "./commands";
import type { GameHandle, Terminal } from "../../types";

const KONAMI = [
	"ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
	"ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
];

/** Wire up one [data-tech-terminal] widget. */
export function setupTerminal(root: HTMLElement) {
	const tabs = root.querySelectorAll<HTMLButtonElement>("[data-terminal-tab]");
	const panels = root.querySelectorAll<HTMLElement>("[data-terminal-panel]");
	const tabsView = root.querySelector<HTMLElement>("[data-terminal-tabs-view]");
	const screen = root.querySelector<HTMLElement>("[data-terminal-screen]");
	const history = root.querySelector<HTMLElement>("[data-terminal-history]");
	const form = root.querySelector<HTMLFormElement>("[data-terminal-form]");
	const input = root.querySelector<HTMLInputElement>("[data-terminal-input]");

	if (!history || !form || !input) return;

	const targets = [...panels].map((p) => p.dataset.terminalPanel ?? "");
	const commandLog: string[] = [];
	let logCursor = 0;
	let game: GameHandle | null = null;

	const terminal: Terminal = {
		targets,
		commandLog,

		write(content = "", className = COLOR.muted) {
			const line = document.createElement("div");
			line.textContent = content;
			line.className = className;
			history.append(line);
		},
		writeAll(lines, className) {
			for (const line of lines) terminal.write(line, className);
		},
		writeHTML(html, className = "") {
			const el = document.createElement("div");
			el.className = className;
			el.innerHTML = html;
			history.append(el);
			return el;
		},
		clear() {
			history.replaceChildren();
		},
		scrollToBottom() {
			if (screen) screen.scrollTop = screen.scrollHeight;
		},

		showTerminal() {
			tabsView?.classList.add("hidden");
			screen?.classList.remove("hidden");
			terminal.scrollToBottom();
		},
		showTabs() {
			screen?.classList.add("hidden");
			tabsView?.classList.remove("hidden");
		},
		selectTab(target) {
			if (!targets.includes(target)) return false;
			for (const tab of tabs) {
				tab.classList.toggle("is-active", tab.dataset.terminalTab === target);
			}
			for (const panel of panels) {
				const active = panel.dataset.terminalPanel === target;
				panel.classList.toggle("hidden", !active);
				panel.classList.toggle("grid", active);
			}
			return true;
		},

		startGame(factory) {
			if (game) return;
			terminal.showTerminal();
			game = factory(terminal, () => {
				game = null;
			});
		},
		gameRunning() {
			return game !== null;
		},
	};

	const commands = createCommands(terminal);

	// boot banner (waits in the hidden terminal until the first command)
	terminal.write("portfolio terminal v3.0", COLOR.heading);
	terminal.write("browse the tabs above, or type a command to drop into the shell.");
	terminal.write(
		"'help' lists commands. 'exit' returns to tabs. ↑↓ recall, Tab completes.",
		COLOR.info,
	);
	terminal.write("");

	// --- wiring ---

	for (const tab of tabs) {
		tab.addEventListener("click", () =>
			terminal.selectTab(tab.dataset.terminalTab ?? targets[0]),
		);
	}

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (game) {
			input.value = "";
			return;
		}

		const raw = input.value.trim();
		input.value = "";
		if (!raw) return;

		commandLog.push(raw);
		logCursor = commandLog.length;

		terminal.showTerminal();
		terminal.write(`visitor@portfolio:~$ ${raw}`, COLOR.muted);

		const [name, ...args] = raw.split(/\s+/);
		const cmd = commands[name.toLowerCase()];

		if (cmd) cmd.run({ args, raw });
		else terminal.write(`${name}: command not found (try 'help')`, COLOR.error);

		terminal.scrollToBottom();
	});

	// arrow-key history recall + Tab completion; a running game steals the keys
	input.addEventListener("keydown", (event) => {
		if (game) {
			game.key(event);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			if (commandLog.length === 0) return;
			logCursor = Math.max(0, logCursor - 1);
			input.value = commandLog[logCursor] ?? "";
			input.setSelectionRange(input.value.length, input.value.length);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			if (logCursor >= commandLog.length) return;
			logCursor = Math.min(commandLog.length, logCursor + 1);
			input.value = commandLog[logCursor] ?? "";
		} else if (event.key === "Tab") {
			event.preventDefault();
			const parts = input.value.split(/\s+/);
			const isFirst = parts.length === 1;
			const fragment = (parts.at(-1) ?? "").toLowerCase();
			if (!fragment) return;

			const pool = isFirst
				? Object.keys(commands).filter((n) => !commands[n].hidden)
				: targets;
			const match = pool.find((item) => item.startsWith(fragment));
			if (!match) return;

			parts[parts.length - 1] = match;
			input.value = parts.join(" ") + (isFirst ? " " : "");
		}
	});

	// konami code (page-wide) reveals the secrets menu
	let konamiIndex = 0;
	document.addEventListener("keydown", (event) => {
		if (event.key.toLowerCase() === KONAMI[konamiIndex].toLowerCase()) {
			konamiIndex++;
			if (konamiIndex === KONAMI.length) {
				konamiIndex = 0;
				terminal.showTerminal();
				terminal.write("");
				terminal.write("↑↑↓↓←→←→ B A  | cheat unlocked!", COLOR.accent);
				commands.secrets.run({ args: [], raw: "secrets" });
				terminal.scrollToBottom();
			}
		} else {
			konamiIndex = event.key === KONAMI[0] ? 1 : 0;
		}
	});
}
