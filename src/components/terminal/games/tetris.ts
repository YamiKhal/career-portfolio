import type { GameHandle, Terminal, Vec } from "../../../types";

const W = 10;
const H = 16;
const CELL_WIDTH = 2;

type Piece = { cells: Vec[]; color: string; rotatable: boolean; name: string };

type ActivePiece = Piece & {
	x: number;
	y: number;
};

const SHAPES: Piece[] = [
	{
		name: "I",
		color: "text-info",
		rotatable: true,
		cells: [
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
			{ x: 3, y: 1 },
		],
	},
	{
		name: "O",
		color: "text-warning",
		rotatable: false,
		cells: [
			{ x: 1, y: 0 },
			{ x: 2, y: 0 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
		],
	},
	{
		name: "T",
		color: "text-secondary",
		rotatable: true,
		cells: [
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
		],
	},
	{
		name: "S",
		color: "text-success",
		rotatable: true,
		cells: [
			{ x: 1, y: 0 },
			{ x: 2, y: 0 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
		],
	},
	{
		name: "Z",
		color: "text-error",
		rotatable: true,
		cells: [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
		],
	},
	{
		name: "J",
		color: "text-primary",
		rotatable: true,
		cells: [
			{ x: 0, y: 0 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
		],
	},
	{
		name: "L",
		color: "text-text",
		rotatable: true,
		cells: [
			{ x: 2, y: 0 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
			{ x: 2, y: 1 },
		],
	},
];

const cell = (char: string, cls: string) =>
	`<span class="${cls}">${char}</span>`;
const clonePiece = (piece: Piece): Piece => ({
	...piece,
	cells: piece.cells.map((c) => ({ ...c })),
});

/** Tetris. ← → move, ↓ soft-drop, ↑ rotate, space hard-drop, q quits. */
export function tetris(t: Terminal, finish: () => void): GameHandle {
	const grid: (string | null)[][] = Array.from({ length: H }, () =>
		Array<string | null>(W).fill(null),
	);

	let bag: Piece[] = [];
	let nextPiece = takePiece();
	let piece = spawnPiece();

	let score = 0;
	let lines = 0;
	let level = 1;
	let over = false;
	let timer = window.setInterval(drop, getDropSpeed());

	const board = t.writeHTML("");

	function refillBag() {
		bag = SHAPES.map(clonePiece);

		for (let i = bag.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[bag[i], bag[j]] = [bag[j], bag[i]];
		}
	}

	function takePiece() {
		if (bag.length === 0) refillBag();
		return bag.pop()!;
	}

	function spawnPiece(): ActivePiece {
		const spawned: ActivePiece = {
			...clonePiece(nextPiece),
			x: 3,
			y: -1,
		};

		nextPiece = takePiece();
		return spawned;
	}

	function getDropSpeed() {
		return Math.max(90, 550 - (level -1) * 45);
	}

	function restartTimer() {
		window.clearInterval(timer);
		timer = window.setInterval(drop, getDropSpeed());
	}

	function collides(cells: Vec[], at: Vec): boolean {
		return cells.some((c) => {
			const gridX = at.x + c.x;
			const gridY = at.y + c.y;
			return (
				gridX < 0 ||
				gridX >= W ||
				gridY >= H ||
				(gridY >= 0 && grid[gridY][gridX] !== null)
			);
		});
	}

	function getGhostY(): number {
		let ghostY = piece.y;

		while (!collides(piece.cells, {x: piece.x, y: ghostY + 1})) {
			ghostY++;
		}

		return ghostY;
	}

	function clearLines(): number {
		let cleared = 0;

		for (let y = H - 1; y >= 0; y--) {
			if (grid[y].every((value) => value !== null)) {
				grid.splice(y, 1);
				grid.unshift(Array<string | null>(W).fill(null));
				cleared++;
				y++;
			}
		}

		return cleared;
	}

	function addLineScore(cleared: number) {
		const points = [0,100,300,500,800];

		score += points[cleared] * level;
		lines += cleared;

		const newLevel = Math.floor(lines / 10) + 1;

		if (newLevel !== level) {
			level = newLevel;
			restartTimer();
		}
	}

	function lockPiece() {
		let lockedAboveBoard = false;

		for (const c of piece.cells) {
			const x = piece.x + c.x;
			const y = piece.y + c.y;

			if (y < 0) {
				lockedAboveBoard = true;
				continue;
			}

			grid[y][x] = piece.color;
		}

		if (lockedAboveBoard) {
			end();
			return;
		}

		addLineScore(clearLines());
		piece = spawnPiece();

		if (collides(piece.cells, {x: piece.x, y: piece.y})) {
			end();
		}
	}

	function drop() {
		if (over) return;

		if (!collides(piece.cells, {x: piece.x, y: piece.y +1})) {
			piece.y++;
		} else {
			lockPiece();
		}

		render();
	}

	function softDrop() {
		if (over) return;

		if (!collides(piece.cells, {x: piece.x, y: piece.y +1})) {
			piece.y++;
			score++;
			render();
		} else {
			lockPiece();
			render();
		}
	}

	function hardDrop() {
		if (over) return;

		const startY = piece.y;
		piece.y = getGhostY();

		score += Math.max(0, piece.y - startY) * 2;
		lockPiece();
		render();
	}

	function move(dx: number) {
		if (!collides(piece.cells, {x: piece.x + dx, y: piece.y})) {
			piece.x += dx;
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

		const kicks = [0, -1, 1, -2, 2];

		for (const offset of kicks) {
			if (!collides(rotated, {x: piece.x + offset, y: piece.y})) {
				piece.cells = rotated;
				piece.x += offset;
				render();
				return;
			}
		}
	}

	function end() {
		if (over) return;

		over = true;
		window.clearInterval(timer);

		render();
		t.write(`game over | score ${score}`, "text-error");
		t.write("");
		t.scrollToBottom();
		finish();
	}

	function renderPreviewRow(y: number): string {
		const width = 4;
		let row = "";

		for (let x = 0; x < width; x++) {
			const occupied = nextPiece.cells.some(
				(c) => c.x === x && c.y === y,
			);

			row += occupied ? cell("██", nextPiece.color) : "  ";
		}

		return row;
	}

	function renderSidebar(y: number): string {
		switch (y) {
			case 0:
				return cell(" SCORE", "text-info-muted");
			case 1:
				return cell(` ${score}`, "text-text");
			case 3:
				return cell(" LINES", "text-info-muted");
			case 4:
				return cell(` ${lines}`, "text-text");
			case 6:
				return cell(" LEVEL", "text-info-muted");
			case 7:
				return cell(` ${level}`, "text-text");
			case 9:
				return cell(" NEXT", "text-info-muted");
			case 11:
				return ` ${renderPreviewRow(0)}`;
			case 12:
				return ` ${renderPreviewRow(1)}`;
			case 13:
				return ` ${renderPreviewRow(2)}`;
			case 15:
				return cell(" ↑ rotate", "text-text-muted");
			case 16:
				return cell(" space drop", "text-text-muted");
			case 17:
				return cell(" q quit", "text-text-muted");
			default:
				return "";
		}
	}

	function render() {
		const view = grid.map((row) =>
			row.map((color) => ({
				color,
				ghost: false,
			})),
		);

		const ghostY = getGhostY();

		if (ghostY !== piece.y) {
			for (const c of piece.cells) {
				const x = piece.x + c.x;
				const y = ghostY + c.y;

				if (
					x >= 0 &&
					x < W &&
					y >= 0 &&
					y < H &&
					view[y][x].color === null
				) {
					view[y][x] = {
						color: piece.color,
						ghost: true,
					};
				}
			}
		}

		for (const c of piece.cells) {
			const x = piece.x + c.x;
			const y = piece.y + c.y;

			if (x >= 0 && x < W && y >= 0 && y < H) {
				view[y][x] = {
					color: piece.color,
					ghost: false,
				};
			}
		}

		const wallText = `+${"-".repeat(W * CELL_WIDTH)}+`;
		const lines: string[] = [];

		lines.push(cell(wallText, "text-text-muted"));

		for (let y = 0; y < H; y++) {
			let row = cell("|", "text-text-muted");

			for (let x = 0; x < W; x++) {
				const current = view[y][x];

				if (current.color && current.ghost) {
					row += cell("░░", `${current.color} opacity-40`);
				} else if (current.color) {
					row += cell("██", current.color);
				} else {
					row += " ".repeat(CELL_WIDTH);
				}
			}

			row += cell("|", "text-text-muted");
			row += renderSidebar(y);

			lines.push(row);
		}

		lines.push(cell(wallText, "text-text-muted"));

		board.innerHTML = lines.join("\n");
		t.scrollToBottom();
	}

	render();

	return {
		key(event) {
			if (over) return;

			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					move(-1);
					break;

				case "ArrowRight":
					event.preventDefault();
					move(1);
					break;

				case "ArrowDown":
					event.preventDefault();
					softDrop();
					break;

				case "ArrowUp":
					event.preventDefault();
					rotate();
					break;

				case " ":
					event.preventDefault();
					hardDrop();
					break;

				case "q":
				case "Escape":
					event.preventDefault();
					end();
					break;
			}
		},
	};
}
