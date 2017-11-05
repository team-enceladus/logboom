
import chalk from "chalk"
import stripAnsi = require("strip-ansi")
import {WriteStream, createWriteStream} from "fs"

export interface Logger {
	error(error: Error): void
	warn(message: string): void
	info(message: string): void
	verbose(message: string): void
	debug(message: string): void
	silly(message: string): void
}

export type Level = "error" | "warn" | "info" | "verbose" | "debug" | "silly"

export interface LoggerMachineOptions {
	level: Level
}

/**
 * Logger base class, implements core logger mechanics
 *  - triage log messages based on level
 *  - default formatting includes timestamp, can be overridden
 *  - handle errors separately from the other log messages
 *  - abstract methods require logger subclasses to persist the log
 */
export abstract class LoggerMachine implements Logger {
	private readonly threshold: number
	private readonly levels: Level[] = ["error", "warn", "info", "verbose", "debug", "silly"]
	private readonly getLongestValue = (arr: string[]): string => {
		let longest: string = ""
		for (const subject of arr)
			if (subject.length > longest.length)
				longest = subject
		return longest
	}
	private readonly rpad = (subject: string, length: number): string => {
		while (subject.length < length) subject += " "
		return subject
	}

	protected getLevelNumber(level: Level): number {
		return this.levels.indexOf(<Level>level.toLowerCase())
	}

	constructor({level}: LoggerMachineOptions) {
		this.threshold = this.getLevelNumber(level)
	}

	abstract logErrorMessage(errorMessage: string): void
	abstract logMessage(message: string): void

	protected timestamp() {
		return `[${new Date().toISOString()}] `
	}

	protected levelTag(level: Level) {
		return this.rpad(`(${level.toUpperCase()}) `, 3 + this.getLongestValue(this.levels).length)
	}

	protected formatError(error: Error): string {
		return this.timestamp() + this.levelTag("error") + error.stack
	}

	protected formatMessage(level: Level, message: string): string {
		return this.timestamp() + this.levelTag(level) + message
	}

	private reportMessage(level: Level, message: string): void {
		if (this.getLevelNumber(level) <= this.threshold)
			this.logMessage(this.formatMessage(level, message))
	}

	error(error: Error) { this.logErrorMessage(this.formatError(error)) }
	warn(message: string) { this.reportMessage("warn", message) }
	info(message: string) { this.reportMessage("info", message) }
	verbose(message: string) { this.reportMessage("verbose", message) }
	debug(message: string) { this.reportMessage("debug", message) }
	silly(message: string) { this.reportMessage("silly", message) }
}

/**
 * Console logger outputs fancy colored logs to stdout and sterr
 */
export class ConsoleLogger extends LoggerMachine {
	private readonly colors: string[] = ["red", "magenta", "cyan", "green", "blue", "gray"]

	protected formatError(error: Error): string {
		return chalk.yellow(this.timestamp()) + chalk.red(this.levelTag("error") + error.stack)
	}

	protected formatMessage(level: Level, message: string): string {
		const color = this.colors[this.getLevelNumber(level)]
		const chalkFunction: (s: string) => string = (<any>chalk)[color]
		return chalk.yellow(this.timestamp()) + chalkFunction(this.levelTag(level) + message)
	}

	logErrorMessage(errorMessage: string) {
		console.error(errorMessage)
	}

	logMessage(message: string) {
		console.log(message)
	}
}

export interface FileLoggerOptions extends LoggerMachineOptions {
	logfile: string
	eol?: string
}

/**
 * File logger writes to text file and the console
 *  - colors are stripped out for the logfile saved to disk
 */
export class FileLogger extends ConsoleLogger {
	private readonly stream: WriteStream
	private readonly eol: string

	constructor({logfile, eol = "\n", ...options}: FileLoggerOptions) {
		super(options)
		this.eol = eol
		this.stream = createWriteStream(logfile, {flags: "a"})
		this.stream.write(eol)
	}

	logErrorMessage(errorMessage: string) {
		super.logErrorMessage(errorMessage)
		this.stream.write(stripAnsi(errorMessage) + this.eol)
	}

	logMessage(message: string) {
		super.logMessage(message)
		this.stream.write(stripAnsi(message) + this.eol)
	}
}
