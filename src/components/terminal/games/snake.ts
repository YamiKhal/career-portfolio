import type { GameHandle, Terminal, Vec } from "../../../types";

const W = 20;
const H = 12;

const rand = (n: number) => Math.floor(Math.random() * n);
const cell = (char: string, cls: string) =>
	`<span class="${cls}">${char}</span>`;

/** Classic snake. Arrows steer (no 180s), q/Esc quits */
export function snake(t: Terminal, finish: () => void): GameHandle {
	let body: Vec[] = [{ x: 9, y: 6 }];
	let dir: Vec = { x: 1, y: 0 };
	let next: Vec = dir;
	let food = spawn();
	let score = 0;

	const board = t.writeHTML("");
	const timer = window.setInterval(tick, 130);

	function spawn(): Vec {
		let f: Vec;
		do {
			f = { x: rand(W), y: rand(H) };
		} while (body.some((s) => s.x === f.x && s.y === f.y));
		return f;
	}

	function render() {
		const cellWidth = 2;
		const wallText = `+${"-".repeat(W * cellWidth)}+`;
		const lines: string[] = [];

		lines.push(cell(wallText, "text-text-muted"));

		for (let y = 0; y < H; y++) {
			let row = cell("|", "text-text-muted");

			for (let x = 0; x < W; x++) {
				if (body[0].x === x && body[0].y === y) {
					row += cell("██", "text-success");
				} else if (body.some((s) => s.x === x && s.y === y)) {
					row += cell("██", "text-primary");
				} else if (food.x === x && food.y === y) {
					row += cell("@ ", "text-error");
				} else {
					row += " ".repeat(cellWidth);
				}
			}

			row += cell("|", "text-text-muted");

			if (y === 0) {
				row += cell(" SCORE", "text-info-muted");
			} else if (y === 1) {
				row += cell(` ${score}`, "text-text");
			}

			lines.push(row);
		}

		lines.push(cell(wallText, "text-text-muted"));

		board.innerHTML = lines.join("\n");
		t.scrollToBottom();
	}

	function tick() {
		dir = next;
		const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
		const dead =
			head.x < 0 ||
			head.x >= W ||
			head.y < 0 ||
			head.y >= H ||
			body.some((s) => s.x === head.x && s.y === head.y);
		if (dead) return end();

		body.unshift(head);
		if (head.x === food.x && head.y === food.y) {
			score++;
			food = spawn();
		} else {
			body.pop();
		}
		render();
	}

	function end() {
		window.clearInterval(timer);
		render();
		t.write(`game over | score ${score}`, "text-error");
		t.write("");
		t.scrollToBottom();
		finish();
	}

	render();

	return {
		key(event) {
			const moves: Record<string, Vec> = {
				ArrowUp: { x: 0, y: -1 },
				ArrowDown: { x: 0, y: 1 },
				ArrowLeft: { x: -1, y: 0 },
				ArrowRight: { x: 1, y: 0 },
			};
			if (event.key in moves) {
				event.preventDefault();
				const m = moves[event.key];
				if (m.x !== -dir.x || m.y !== -dir.y) next = m;
			} else if (event.key === "q" || event.key === "Escape") {
				event.preventDefault();
				end();
			}
		},
	};
}
