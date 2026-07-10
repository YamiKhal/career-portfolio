import type { GameHandle, Terminal } from "../../../types";
import { COLOR } from "../colors";

const SPINNER = ["|", "/", "-", "\\"];
const BAR_WIDTH = 24;

const TARGETS = [
	"portfolio.local",
	"mainframe.yamikhal.internal",
	"trackgames.app",
	"127.0.0.1",
	"coffee-machine.local",
] as const;

const PROXIES = [
	"Frankfurt",
	"Amsterdam",
	"Reykjavík",
	"Singapore",
	"São Paulo",
	"Tokyo",
	"some guy's Raspberry Pi",
] as const;

const PASSWORDS = [
	"admin",
	"password123",
	"letmein",
	"correct-horse-battery-staple",
	"yami-was-here",
] as const;

const FILES = [
	"projects.json",
	"unfinished-side-projects.zip",
	"production.env.definitely-safe",
	"questionable-css-decisions.txt",
	"todo-final-final-v7.md",
	"coffee-consumption.csv",
	"secret-cat-photo.png",
] as const;

const COMMANDS = [
	"sudo exploit --force",
	"inject payload.bin",
	"override firewall",
	"decrypt credentials",
] as const;

type Color = (typeof COLOR)[keyof typeof COLOR];

interface PromptState {
	value: string;
	resolve: (value: string) => void;
	render: () => void;
}

interface PhaseOptions {
	label: string;
	duration?: number;
	failChance?: number;
	retries?: number;
}

function randomItem<T>(items: readonly T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability: number): boolean {
	return Math.random() < probability;
}

/** interactive, randomized "hacking" sequence, q to abort */
export function hack(t: Terminal, finish: () => void): GameHandle {
	let stopped = false;
	let finished = false;
	let activePrompt: PromptState | undefined;

	const timers = new Set<number>();

	function schedule(callback: () => void, delay: number): number {
		const timer = window.setTimeout(() => {
			timers.delete(timer);
			callback();
		}, delay);

		timers.add(timer);
		return timer;
	}

	function wait(delay: number): Promise<void> {
		return new Promise((resolve) => {
			schedule(resolve, delay);
		});
	}

	function write(text: string, color: Color = COLOR.info): void {
		const line = t.writeHTML("", color);
		line.textContent = text;
		t.scrollToBottom();
	}

	async function typeLine(
		text: string,
		color: Color = COLOR.info,
		speed = 12,
	): Promise<void> {
		const line = t.writeHTML("", color);

		for (const character of text) {
			if (stopped) return;

			line.textContent += character;
			t.scrollToBottom();

			await wait(speed + randomInt(0, 8));
		}
	}

	async function animatePhase({
		label,
		duration = randomInt(700, 1400),
		failChance = 0,
		retries = 0,
	}: PhaseOptions): Promise<boolean> {
		for (let attempt = 0; attempt <= retries; attempt++) {
			if (stopped) return false;

			const board = t.writeHTML("", COLOR.warning);
			const startedAt = performance.now();
			const shouldFail = chance(failChance) && attempt < retries;

			await new Promise<void>((resolve) => {
				function frame(now: number): void {
					if (stopped) {
						resolve();
						return;
					}

					const elapsed = now - startedAt;
					const progress = Math.min(elapsed / duration, 1);
					const percentage = Math.floor(progress * 100);
					const filled = Math.floor(progress * BAR_WIDTH);
					const spinner =
						SPINNER[Math.floor(elapsed / 80) % SPINNER.length];

					board.textContent = [
						`[${spinner}] ${label.padEnd(28)}`,
						`[${"#".repeat(filled)}${".".repeat(BAR_WIDTH - filled)}]`,
						`${percentage.toString().padStart(3)}%`,
					].join(" ");

					t.scrollToBottom();

					if (progress >= 1) {
						resolve();
						return;
					}

					schedule(() => frame(performance.now()), 40);
				}

				frame(performance.now());
			});

			if (stopped) return false;

			if (shouldFail) {
				board.className = COLOR.error;
				board.textContent = `[-] ${label.padEnd(28)} FAILED`;

				await wait(250);
				await typeLine(
					`    ${randomItem([
						"connection reset by peer",
						"checksum mismatch",
						"firewall rejected payload",
						"permission denied",
						"proxy node stopped responding",
					])}`,
					COLOR.error,
				);

				await wait(350);
				await typeLine(
					`[*] retrying with ${randomItem([
						"rotated encryption keys",
						"a smaller payload",
						"legacy compatibility mode",
						"more dramatic typing",
						"the firewall politely disabled",
					])}...`,
					COLOR.warning,
				);

				await wait(400);
				continue;
			}

			board.className = COLOR.success;
			board.textContent = `[+] ${label.padEnd(28)} OK`;

			return true;
		}

		return false;
	}

	function prompt(
		label: string,
		color: Color = COLOR.warning,
	): Promise<string> {
		const board = t.writeHTML("", color);

		return new Promise((resolve) => {
			const state: PromptState = {
				value: "",
				resolve,
				render() {
					board.textContent = `${label}${state.value}█`;
					t.scrollToBottom();
				},
			};

			activePrompt = state;
			state.render();
		});
	}

	async function requestCommand(expected: string): Promise<void> {
		while (!stopped) {
			const entered = (await prompt("root@mainframe:~$ ")).trim();

			if (stopped) return;

			if (entered.toLowerCase() === expected.toLowerCase()) {
				write(`[+] accepted: ${entered}`, COLOR.success);
				return;
			}

			write(
				`[-] command not found: ${entered || "(nothing)"}`,
				COLOR.error,
			);

			await wait(250);

			write(`hint: try "${expected}"`, COLOR.info);
		}
	}

	async function passwordChallenge(): Promise<void> {
		const password = randomItem(PASSWORDS);

		write("[*] encrypted administrator password recovered", COLOR.info);
		write(`[*] password hint: ${password}`, COLOR.warning);

		for (let attempt = 1; attempt <= 3 && !stopped; attempt++) {
			const entered = await prompt(
				`password attempt ${attempt}/3: `,
				COLOR.warning,
			);

			if (entered === password) {
				write("[+] password accepted", COLOR.success);
				return;
			}

			write("[-] invalid password", COLOR.error);
		}

		if (stopped) return;

		await wait(300);
		write("[!] too many failed attempts", COLOR.error);
		await wait(400);
		write("[*] bypassing password prompt instead...", COLOR.warning);
		await animatePhase({
			label: "Exploiting password reset",
			failChance: 0.4,
			retries: 2,
		});
	}

	async function renderNetworkScan(): Promise<void> {
		const count = randomInt(4, 7);

		for (let index = 0; index < count; index++) {
			if (stopped) return;

			const ip = `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(2, 254)}`;
			const port = randomItem([21, 22, 80, 443, 3000, 5432, 6379, 8080]);

			write(
				`  ${ip.padEnd(16)} port ${port.toString().padEnd(5)} ${randomItem(
					["OPEN", "FILTERED", "OPEN", "OPEN"],
				)}`,
				port === 6379 || port === 5432 ? COLOR.warning : COLOR.info,
			);

			await wait(randomInt(70, 180));
		}
	}

	async function renderProxyRoute(): Promise<void> {
		const routes = [...PROXIES].sort(() => Math.random() - 0.5);
		const amount = randomInt(4, routes.length);

		for (let index = 0; index < amount; index++) {
			if (stopped) return;

			write(
				`  proxy ${index + 1}: ${routes[index]} ${
					index === amount - 1 ? "CONNECTED" : "OK"
				}`,
				index === amount - 1 ? COLOR.success : COLOR.info,
			);

			await wait(randomInt(90, 220));
		}
	}

	async function renderFiles(): Promise<void> {
		const files = [...FILES].sort(() => Math.random() - 0.5);
		const amount = randomInt(3, 6);

		for (const file of files.slice(0, amount)) {
			if (stopped) return;

			write(`[+] found /classified/${file}`, COLOR.success);
			await wait(randomInt(120, 280));
		}
	}

	async function run(): Promise<void> {
		const target = randomItem(TARGETS);

		await typeLine(
			"YAMI-OS CYBER OPERATIONS CONSOLE v4.2.0",
			COLOR.success,
			20,
		);

		await typeLine(
			"Warning: unauthorized access is extremely cinematic.",
			COLOR.warning,
		);

		await wait(350);
		write(`[*] target: ${target}`, COLOR.info);
		write(`[*] session id: ${crypto.randomUUID().slice(0, 8)}`, COLOR.info);

		await wait(500);

		await animatePhase({
			label: "Initializing exploit toolkit",
			failChance: 0.25,
			retries: 1,
		});

		await animatePhase({
			label: "Scanning network",
			failChance: 0.3,
			retries: 2,
		});

		await renderNetworkScan();

		const firstCommand = randomItem(COMMANDS);
		await requestCommand(firstCommand);

		await animatePhase({
			label: "Fingerprinting services",
			failChance: 0.35,
			retries: 2,
		});

		await animatePhase({
			label: "Bypassing firewall",
			failChance: 0.55,
			retries: 3,
		});

		if (chance(0.65)) {
			write("[!] intrusion detection system triggered", COLOR.error);
			await wait(400);

			await requestCommand("disable alarms");

			await animatePhase({
				label: "Suppressing security alerts",
				failChance: 0.4,
				retries: 2,
			});
		}

		write("[*] constructing anonymous route", COLOR.info);
		await renderProxyRoute();

		await animatePhase({
			label: "Encrypting proxy tunnel",
			failChance: 0.3,
			retries: 1,
		});

		if (chance(0.6)) {
			await passwordChallenge();
		}

		await animatePhase({
			label: "Injecting payload",
			failChance: 0.5,
			retries: 3,
		});

		await animatePhase({
			label: "Escalating privileges",
			failChance: 0.45,
			retries: 2,
		});

		await animatePhase({
			label: "Covering digital footprints",
			failChance: 0.2,
			retries: 1,
		});

		if (stopped) return;

		await wait(350);

		write("", COLOR.info);
		write("╔════════════════════════════════════════════╗", COLOR.success);
		write("║              ACCESS GRANTED                ║", COLOR.success);
		write("║            PRIVILEGE LEVEL: ROOT           ║", COLOR.success);
		write("╚════════════════════════════════════════════╝", COLOR.success);

		await wait(700);

		write("[*] searching classified filesystem...", COLOR.info);
		await renderFiles();

		await wait(700);

		if (chance(0.4)) {
			write("[!] remote administrator connected", COLOR.error);
			await wait(400);
			write('[admin] "who is this?"', COLOR.warning);

			const response = await prompt("you: ", COLOR.info);

			if (!stopped) {
				write(
					`[admin] "${response ? "understandable, have a nice day" : "...hello?"}"`,
					COLOR.warning,
				);
			}
		}

		await wait(600);

		write("", COLOR.info);
		await typeLine(
			"Just kidding. It's still only a portfolio. 😎",
			COLOR.success,
			25,
		);

		end();
	}

	function end(): void {
		if (finished) return;

		finished = true;
		stopped = true;
		activePrompt = undefined;

		for (const timer of timers) {
			window.clearTimeout(timer);
		}

		timers.clear();
		finish();
	}

	void run();

	return {
		key(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				write("[!] hacking sequence aborted", COLOR.error);
				end();
				return;
			}

			if (!activePrompt) {
				if (event.key.toLowerCase() === "q") {
					event.preventDefault();
					write("[!] hacking sequence aborted", COLOR.error);
					end();
				}

				return;
			}

			event.preventDefault();

			if (event.key === "Enter") {
				const promptState = activePrompt;
				activePrompt = undefined;

				promptState.resolve(promptState.value);
				return;
			}

			if (event.key === "Backspace") {
				activePrompt.value = activePrompt.value.slice(0, -1);
				activePrompt.render();
				return;
			}

			if (
				event.key.length === 1 &&
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey
			) {
				activePrompt.value += event.key;
				activePrompt.render();
			}
		},
	};
}
