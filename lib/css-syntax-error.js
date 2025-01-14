/// <reference types="./css-syntax-error.d.ts" />

import { pico } from './deps.js';
import { LanguageConsoleConstructor } from '../mod.ts';




class CssSyntaxError extends Error {
	constructor(message , line , column , source , file , plugin) {
		super(message);
		this.name = 'CssSyntaxError';
		this.reason = message;

		if (file) {
			this.file = file;
		}
		if (source) {
			this.source = source;
		}
		if (plugin) {
			this.plugin = plugin;
		}
		if (typeof line !== 'undefined' && typeof column !== 'undefined') {
			if (typeof line === 'number') {
				this.line = line;
				this.column = column;
			}
			else {
				this.line = line.line;
				this.column = line.column;
				this.endLine = column.line;
				this.endColumn = column.column;
			}
		}

		this.setMessage();

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this , CssSyntaxError);
		}
	}




	setMessage() {
		this.message = this.plugin ? this.plugin + ': ' : '';
		this.message += this.file ? this.file : '<css input>';
		if (typeof this.line !== 'undefined') {
			this.message += ':' + this.line + ':' + this.column;
		}
		this.message += ': ' + this.reason;
	}




	showSourceCode(color) {
		if (!this.source) {
			return '';
		}

		let css = this.source;
		if (color == null) {
			color = pico.isColorSupported;
		}
		if (LanguageConsoleConstructor.SyntaxHighlight) {
			if (color) {
				css = LanguageConsoleConstructor.SyntaxHighlight(css);
			}
		}

		let lines = css.split(/\r?\n/);
		let start = Math.max(this.line - 3 , 0);
		let end = Math.min(this.line + 2 , lines.length);

		let maxWidth = String(end).length;

		let mark , aside;
		if (color) {
			let { bold , red , gray } = pico.createColors(true);
			mark = (text) => bold(red(text));
			aside = (text) => gray(text);
		}
		else {
			mark = aside = (str) => str;
		}

		return lines
			.slice(start , end)
			.map((line , index) => {
				let number = start + 1 + index;
				let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
				if (number === this.line) {
					let spacing = aside(gutter.replace(/\d/g , ' ')) +
						line.slice(0 , this.column - 1).replace(/[^\t]/g , ' ');
					return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^');
				}
				return ' ' + aside(gutter) + line;
			})
			.join('\n');
	}




	toString() {
		let code = this.showSourceCode();
		if (code) {
			code = '\n\n' + code + '\n';
		}
		return this.name + ': ' + this.message + code;
	}
}




export default CssSyntaxError;

CssSyntaxError.default = CssSyntaxError;