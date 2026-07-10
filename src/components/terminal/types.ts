export type Vec = { x: number; y: number };

export type CommandContext = { args: string[]; raw: string };

export type Command = {
	summary: string;
	/** Hidden commands are the secrets — excluded from `help`, listed by `secrets`. */
	hidden?: boolean;
	run: (ctx: CommandContext) => void;
};

/** A running game: receives keydown events until it calls its `finish` callback. */
export type GameHandle = { key: (event: KeyboardEvent) => void };

export type GameFactory = (t: Terminal, finish: () => void) => GameHandle;

/** The surface a command or game talks to. Implemented in setup.ts. */
export interface Terminal {
	readonly targets: string[];
	readonly commandLog: string[];

	/** Append a plain text line (safe from HTML injection). */
	write(content?: string, className?: string): void;
	writeAll(lines: string[], className?: string): void;
	/** Append an element whose innerHTML a game re-renders each frame. */
	writeHTML(html: string, className?: string): HTMLElement;
	clear(): void;
	scrollToBottom(): void;

	showTerminal(): void;
	showTabs(): void;
	selectTab(target: string): boolean;
	panelTitles(target: string): string[];

	startGame(factory: GameFactory): void;
	gameRunning(): boolean;
}
