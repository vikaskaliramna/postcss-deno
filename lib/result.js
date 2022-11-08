/// <reference types="./result.d.ts" />

import Warning from './warning.js';




class Result {
	constructor(processor , root , opts) {
		this.processor = processor;
		this.messages = [];
		this.root = root;
		this.opts = opts;
		this.css = undefined;
		this.map = undefined;
	}




	get content() {
		return this.css;
	}




	toString() {
		return this.css;
	}




	warn(text , opts = {}) {
		if (!opts.plugin) {
			if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
				opts.plugin = this.lastPlugin.postcssPlugin;
			}
		}

		let warning = new Warning(text , opts);
		this.messages.push(warning);

		return warning;
	}




	warnings() {
		return this.messages.filter((i) => i.type === 'warning');
	}
}




export default Result;

Result.default = Result;