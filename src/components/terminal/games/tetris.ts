import type { GameHandle, Terminal, Vec } from "../../../types";

const W = 10;
const H = 16;

type Piece = { cells: Vec[]; color: string; rotatable: boolean };

// Tetrominoes, each with a palette color. Rotation pivots around cells[1].
const SHAPES: Piece[] = [
	{ color: "text-info", rotatable: true, cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }] }, // I
	{ color: "text-warning", rotatable: false, cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, // O
	{ color: "text-secondary", rotatable: true, cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, // T
	{ color: "text-success", rotatable: true, cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] }, // S
	{ color: "text-error", rotatable: true, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, // Z
	{ color: "text-primary", rotatable: true, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, // J
	{ color: "text-text", rotatable: true, cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] }, // L
];

const cell = (char: string, cls: string) => `<span class="${cls}">${char}</span>`;

/** Tetris. ← → move, ↓ soft-drop, ↑ rotate, space hard-drop, q quits. */
export function tetris(t: Terminal, finish: () => void): GameHandle {
	const grid: (string | null)[][] = Array.from({ length: H }, () => Array(W).fill(null));
	let piece = randomPiece();
	let pos: Vec = { x: 3, y: 0 };
	let score = 0;
	let over = false;

	const board = t.writeHTML("");
	const timer = window.setInterval(drop, 500);

	function randomPiece(): Piece {
		const p = SHAPES[Math.floor(Math.random() * SHAPES.length)];
		return { color: p.color, rotatable: p.rotatable, cells: p.cells.map((c) => ({ ...c })) };
	}

	function collides(cells: Vec[], at: Vec): boolean {
		return cells.some((c) => {
			const x = at.x + c.x;
			const y = at.y + c.y;
			return x < 0 || x >= W || y >= H || (y >= 0 && grid[y][x] !== null);
		});
	}

	function lockAndClear() {
		for (const c of piece.cells) {
			const y = pos.y + c.y;
			if (y >= 0) grid[y][pos.x + c.x] = piece.color;
		}
		for (let y = H - 1; y >= 0; y--) {
			if (grid[y].every((v) => v !== null)) {
				grid.splice(y, 1);
				grid.unshift(Array(W).fill(null));
				score += 100;
				y++; // re-check the shifted row
			}
		}
		piece = randomPiece();
		pos = { x: 3, y: 0 };
		if (collides(piece.cells, pos)) end();
	}

	function drop() {
		if (over) return;
		const down = { x: pos.x, y: pos.y + 1 };
		if (collides(piece.cells, down)) lockAndClear();
		else pos = down;
		render();
	}

	function move(dx: number) {
		const to = { x: pos.x + dx, y: pos.y };
		if (!collides(piece.cells, to)) {
			pos = to;
			render();
		}
	}

	function rotate() {
		if (!piece.rotatable) return;
		const pivot = piece.cells[1];
		const rotated = piece.cells.map((c) => ({
			x: pivot.x - (c.y - pivot.y),
			y: pivot.y + (c.x - pivot.x),
		}));
		if (!collides(rotated, pos)) {
			piece.cells = rotated;
			render();
		}
	}

	function hardDrop() {
		while (!collides(piece.cells, { x: pos.x, y: pos.y + 1 })) pos.y++;
		drop();
	}

	function end() {
		over = true;
		window.clearInterval(timer);
		render();
		t.write(`game over | score ${score}`, "text-error");
		t.write("");
		t.scrollToBottom();
		finish();
	}

	function render() {
		const view = grid.map((row) => row.slice());
		for (const c of piece.cells) {
			const x = pos.x + c.x;
			const y = pos.y + c.y;
			if (y >= 0 && y < H && x >= 0 && x < W) view[y][x] = piece.color;
		}

		const wall = cell("+" + "-".repeat(W) + "+", "text-text-muted") + "\n";
		let out = cell(`tetris  score:${score}  [← → ↓ · ↑ rotate · space drop · q]`, "text-info") + "\n" + wall;
		for (let y = 0; y < H; y++) {
			out += cell("|", "text-text-muted");
			for (let x = 0; x < W; x++) {
				const color = view[y][x];
				out += color ? cell("#", color) : " ";
			}
			out += cell("|", "text-text-muted") + "\n";
		}
		board.innerHTML = out + wall;
		t.scrollToBottom();
	}

	render();

	return {
		key(event) {
			if (over) return;
			switch (event.key) {
				case "ArrowLeft": event.preventDefault(); move(-1); break;
				case "ArrowRight": event.preventDefault(); move(1); break;
				case "ArrowDown": event.preventDefault(); drop(); break;
				case "ArrowUp": event.preventDefault(); rotate(); break;
				case " ": event.preventDefault(); hardDrop(); break;
				case "q":
				case "Escape": event.preventDefault(); end(); break;
			}
		},
	};
}
