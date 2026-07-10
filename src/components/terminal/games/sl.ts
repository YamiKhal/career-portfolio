import type { GameHandle, Terminal } from "../../../types";

// The classic mistake-punishing steam locomotive. Scrolls right-to-left.
const TRAIN = [
	"      ====        ________                ___________",
	"  _D _|  |_______/        \\__I_I_____===__|_________|",
	"   |(_)---  |   H\\________/ |   |        =|___ ___|  ",
	"   /     |  |   H  |  |     |   |         ||_| |_||  ",
	"  |      |  |   H  |__--------------------| [___] |  ",
	"  | ________|___H__/__|_____/[][]~\\_______|       |  ",
	"  |/ |   |-----------I_____I [][] []  D   |=======|__",
];

const VIEW = 62;

/** Renders `sl` | an animated train chugging across the log. q/Esc skips it. */
export function sl(t: Terminal, finish: () => void): GameHandle {
	const trainWidth = Math.max(...TRAIN.map((line) => line.length));
	let offset = VIEW;

	const board = t.writeHTML("", "text-warning");
	const timer = window.setInterval(step, 60);

	function step() {
		const start = offset < 0 ? -offset : 0;
		board.textContent = TRAIN
			.map((line) => (" ".repeat(Math.max(0, offset)) + line).slice(start, start + VIEW))
			.join("\n");
		t.scrollToBottom();

		if (--offset < -trainWidth) end();
	}

	function end() {
		window.clearInterval(timer);
		finish();
	}

	step();

	return {
		key(event) {
			if (event.key === "q" || event.key === "Escape") {
				event.preventDefault();
				end();
			}
		},
	};
}
