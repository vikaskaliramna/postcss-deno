import { bold, cyan, getColorEnabled, gray, green, magenta, red, yellow } from 'https://deno.land/std@0.159.0/fmt/colors.ts';
import tokenizer from '../tokenize.js';




import LanguageContentInputConstructor from '../input.js';




export const pico = {
	isColorSupported : getColorEnabled(),
	createColors     : () => ({ bold, red, gray }),
	cyan,
	gray,
	green,
	yellow,
	magenta
};

const HIGHLIGHT_THEME = {
	'brackets' : pico.cyan,
	'at-word'  : pico.cyan,
	'comment'  : pico.gray,
	'string'   : pico.green,
	'class'    : pico.yellow,
	'hash'     : pico.magenta,
	'call'     : pico.cyan,
	'('        : pico.cyan,
	')'        : pico.cyan,
	'{'        : pico.yellow,
	'}'        : pico.yellow,
	'['        : pico.yellow,
	']'        : pico.yellow,
	':'        : pico.yellow,
	';'        : pico.yellow
};




class LanguageConsoleConstructor {


	public static SyntaxHighlight($StyleSheetContent) : string {


		const processor = tokenizer(new LanguageContentInputConstructor($StyleSheetContent), { ignoreErrors : true });


		let result = '';

		while (!processor.endOfFile()) {
			let token = processor.nextToken();
			let color = HIGHLIGHT_THEME[ this.FunctionCheckType(token, processor) ];
			if (color) {
				result += token[ 1 ]
					.split(/\r?\n/)
					.map((i) => color(i))
					.join('\n');
			}
			else {
				result += token[ 1 ];
			}
		}


		return result;

	}





	static #FunctionCheckType([ type, value ], processor) {
		if (type === 'word') {
			if (value[ 0 ] === '.') {
				return 'class';
			}
			if (value[ 0 ] === '#') {
				return 'hash';
			}
		}

		if (!processor.endOfFile()) {
			let next = processor.nextToken();
			processor.back(next);
			if (next[ 0 ] === 'brackets' || next[ 0 ] === '(') {
				return 'call';
			}
		}

		return type;
	}


}




export { LanguageConsoleConstructor };
export default LanguageConsoleConstructor;