
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

export type Loglevel = "error" | "warn" | "info" | "verbose" | "debug" | "silly"

export interface LoggerMachineOptions {
	loglevel: Loglevel
}

/**
 * Logger base class, implements core logger mechanics
 *  - triage log messages based on loglevel
 *  - default formatting includes timestamp, can be overridden
 *  - handle errors separately from the other log messages
 *  - abstract methods require logger subclasses to persist the log
 */
export abstract class LoggerMachine implements Logger {
	private readonly threshold: number
	private readonly loglevels: Loglevel[] = ["error", "warn", "info", "verbose", "debug", "silly"]
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

	protected getLoglevelNumber(loglevel: Loglevel): number {
		return this.loglevels.indexOf(<Loglevel>loglevel.toLowerCase())
	}

	constructor({loglevel}: LoggerMachineOptions) {
		this.threshold = this.getLoglevelNumber(loglevel)
	}

	abstract logErrorMessage(errorMessage: string): void
	abstract logMessage(message: string): void

	protected timestamp() {
		return `[${new Date().toISOString()}] `
	}

	protected loglevelTag(loglevel: Loglevel) {
		return this.rpad(`(${loglevel.toUpperCase()}) `, 3 + this.getLongestValue(this.loglevels).length)
	}

	protected formatError(error: Error): string {
		return this.timestamp() + this.loglevelTag("error") + error.stack
	}

	protected formatMessage(loglevel: Loglevel, message: string): string {
		return this.timestamp() + this.loglevelTag(loglevel) + message
	}

	private reportMessage(loglevel: Loglevel, message: string): void {
		if (this.getLoglevelNumber(loglevel) <= this.threshold)
			this.logMessage(this.formatMessage(loglevel, message))
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
		return chalk.yellow(this.timestamp()) + chalk.red(this.loglevelTag("error") + error.stack)
	}

	protected formatMessage(loglevel: Loglevel, message: string): string {
		const color = this.colors[this.getLoglevelNumber(loglevel)]
		const chalkFunction: (s: string) => string = (<any>chalk)[color]
		return chalk.yellow(this.timestamp()) + chalkFunction(this.loglevelTag(loglevel) + message)
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
		this.stream = createWriteStream(logfile, {flags: "a"})
		this.eol = eol
	}

	logErrorMessage(errorMessage: string) {
		super.logErrorMessage(errorMessage)
		this.stream.write(this.eol + stripAnsi(errorMessage))
	}

	logMessage(message: string) {
		super.logMessage(message)
		this.stream.write(this.eol + stripAnsi(message))
	}
}
