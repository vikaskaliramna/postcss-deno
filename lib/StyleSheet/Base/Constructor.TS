import { AnyNode, Container, Document, Result, WarningOptions } from '../../Common/Common.D.TS';

import type { InterfaceLanguageStyleSheetNodeBase, NodeErrorOptions } from './Constructor.D.TS';

import { BooleanClean, my } from '../../symbols.js';
import CssSyntaxError from '../../css-syntax-error.js';
import Stringifier from '../../stringifier.js';
import stringify from '../../stringify.js';
import { cloneNode } from './Function.TS';
import InterfaceLanguageStyleSheetNodeComment from '../Comment/Constructor.D.TS';

class LanguageStyleSheetNodeBaseConstructor implements InterfaceLanguageStyleSheetNodeBase {
	declare type: string;
	declare raws: any;
	declare nodes: never[];
	declare source: any;
	declare parent: Document | Container | undefined;
	declare proxyCache: any;

	[BooleanClean] = false;
	[my] = true;

	constructor(defaults: object = {}) {
		this.raws = {};
		this[BooleanClean] = false;
		this[my] = true;

		this.#ConfigureNode(defaults);
	}

	#ConfigureNode(defaults: any) {
		for (let name in defaults) {
			if (name === 'nodes') {
				this.nodes = [];
				for (const node of defaults[name]) {
					if (typeof node.clone === 'function') {
						this.append(node.clone());
					} else {
						this.append(node);
					}
				}
				return undefined;
			}

			this[<keyof typeof this> name] = defaults[name];
		}
	}

	AppendStyleSheetNode($StyleSheetNode: any) {
		throw new Error('Append method not implemented.');
	}

	append($StyleSheetNode: any) {
		return this.AppendStyleSheetNode($StyleSheetNode);
	}

	RemoveStyleSheetNode() {
		if (this.parent) {
			this.parent.removeChild(this);
		}
		this.parent = undefined;
		return this;
	}

	remove() {
		return this.RemoveStyleSheetNode();
	}

	get StyleSheetNodeProxy() {
		return this;
	}

	get proxyOf() {
		return this.StyleSheetNodeProxy;
	}

	error($StringContent: string, $Configuration: NodeErrorOptions | {} = {}): CssSyntaxError {
		if (this.source) {
			let { start, end } = this.rangeBy($Configuration);
			return this.source.input.error(
				$StringContent,
				{ line: start.line, column: start.column },
				{ line: end.line, column: end.column },
				$Configuration,
			);
		}

		return new CssSyntaxError($StringContent);
	}

	warn(result: Result, $StringContent: string, $Configuration: WarningOptions) {
		let data: Record<string, any> = { node: this };
		for (let i in $Configuration) {
			data[i] = $Configuration[<keyof typeof $Configuration> i];
		}
		return result.warn($StringContent, data);
	}

	toString(stringifier = stringify) {
		if (stringifier.stringify) {
			stringifier = stringifier.stringify;
		}
		let result = '';
		stringifier(this, (i) => {
			result += i;
		});
		return result;
	}

	assign(overrides = {}) {
		for (let name in overrides) {
			this[<keyof typeof this> name] = overrides[<keyof typeof overrides> name];
		}
		return this;
	}

	clone(overrides = {}) {
		let cloned = cloneNode(this);

		for (let name in overrides) {
			cloned[name] = overrides[<keyof typeof overrides> name];
		}

		return cloned;
	}

	cloneBefore($StyleSheetNode = {}) {
		let cloned = this.clone($StyleSheetNode);

		if (this.parent?.type !== 'document' /**  || this.parent?.type !== 'Language-StyleSheet-Node-Document'  */) {
			(this.parent as any).insertBefore(this, cloned);
		}

		return cloned;
	}

	cloneAfter(overrides = {}) {
		let cloned = this.clone(overrides);
		this.parent?.insertAfter(this, cloned);
		return cloned;
	}

	replaceWith(...nodes) {
		if (this.parent) {
			let bookmark = this;
			let foundSelf = false;
			for (let node of nodes) {
				if (node === this) {
					foundSelf = true;
				} else if (foundSelf) {
					this.parent?.insertAfter(bookmark, node);
					bookmark = node;
				} else {
					this.parent?.insertBefore(bookmark, node);
				}
			}

			if (!foundSelf) {
				this.remove();
			}
		}

		return this;
	}

	next() {
		if (!this.parent) {
			return undefined;
		}
		let index = this.parent.index(this);
		return this.parent.nodes[index + 1];
	}

	prev() {
		if (!this.parent) {
			return undefined;
		}
		let index = this.parent.index(this);
		return this.parent.nodes[index - 1];
	}

	before(add) {
		this.parent.insertBefore(this, add);
		return this;
	}

	after(add) {
		this.parent.insertAfter(this, add);
		return this;
	}

	root() {
		let result = this;
		while (result.parent && result.parent.type !== 'document') {
			result = result.parent;
		}
		return result;
	}

	raw(prop, defaultType) {
		let str = new Stringifier();
		return str.raw(this, prop, defaultType);
	}

	cleanRaws(keepBetween) {
		delete this.raws.before;
		delete this.raws.after;
		if (!keepBetween) {
			delete this.raws.between;
		}
	}

	toJSON(_, inputs) {
		let fixed = {};
		let emitInputs = inputs == null;
		inputs = inputs || new Map();
		let inputsNextIndex = 0;

		for (let name in this) {
			if (!Object.prototype.hasOwnProperty.call(this, name)) {
				/* c8 ignore next 2 */
				continue;
			}
			if (name === 'parent' || name === 'proxyCache') {
				continue;
			}
			if (name === 'BooleanClean' || name === 'BooleanMy') {
				continue;
			}
			let value = this[name];

			if (Array.isArray(value)) {
				fixed[name] = value.map((i) => {
					if (typeof i === 'object' && i.toJSON) {
						return i.toJSON(null, inputs);
					} else {
						return i;
					}
				});
			} else if (typeof value === 'object' && value.toJSON) {
				fixed[name] = value.toJSON(null, inputs);
			} else if (name === 'source') {
				let inputId = inputs.get(value.input);
				if (inputId == null) {
					inputId = inputsNextIndex;
					inputs.set(value.input, inputsNextIndex);
					inputsNextIndex++;
				}
				fixed[name] = {
					inputId,
					start: value.start,
					end: value.end,
				};
			} else {
				fixed[name] = value;
			}
		}

		if (emitInputs) {
			fixed.inputs = [...inputs.keys()].map((input) => input.toJSON());
		}

		return fixed;
	}

	positionInside(index) {
		let string = this.toString();
		let column = this.source.start.column;
		let line = this.source.start.line;

		for (let i = 0; i < index; i++) {
			if (string[i] === '\n') {
				column = 1;
				line += 1;
			} else {
				column += 1;
			}
		}

		return { line, column };
	}

	positionBy(opts) {
		let pos = this.source.start;
		if (opts.index) {
			pos = this.positionInside(opts.index);
		} else if (opts.word) {
			let index = this.toString().indexOf(opts.word);
			if (index !== -1) {
				pos = this.positionInside(index);
			}
		}
		return pos;
	}

	rangeBy(opts) {
		let start = {
			line: this.source.start.line,
			column: this.source.start.column,
		};
		let end = this.source.end
			? {
				line: this.source.end.line,
				column: this.source.end.column + 1,
			}
			: {
				line: start.line,
				column: start.column + 1,
			};

		if (opts.word) {
			let index = this.toString().indexOf(opts.word);
			if (index !== -1) {
				start = this.positionInside(index);
				end = this.positionInside(index + opts.word.length);
			}
		} else {
			if (opts.start) {
				start = {
					line: opts.start.line,
					column: opts.start.column,
				};
			} else if (opts.index) {
				start = this.positionInside(opts.index);
			}

			if (opts.end) {
				end = {
					line: opts.end.line,
					column: opts.end.column,
				};
			} else if (opts.endIndex) {
				end = this.positionInside(opts.endIndex);
			} else if (opts.index) {
				end = this.positionInside(opts.index + 1);
			}
		}

		if (
			end.line < start.line ||
			(end.line === start.line && end.column <= start.column)
		) {
			end = { line: start.line, column: start.column + 1 };
		}

		return { start, end };
	}

	getProxyProcessor() {
		return {
			set(node, prop, value) {
				if (node[prop] === value) {
					return true;
				}
				node[prop] = value;
				if (
					prop === 'prop' ||
					prop === 'value' ||
					prop === 'name' ||
					prop === 'params' ||
					prop === 'important' ||
					/* c8 ignore next */
					prop === 'text'
				) {
					node.markDirty();
				}
				return true;
			},

			get(node, prop) {
				if (prop === 'proxyOf') {
					return node;
				} else if (prop === 'root') {
					return () => node.root().toProxy();
				} else {
					return node[prop];
				}
			},
		};
	}

	toProxy() {
		if (!this.proxyCache) {
			this.proxyCache = new Proxy(this, this.getProxyProcessor());
		}
		return this.proxyCache;
	}

	addToError(error) {
		error.postcssNode = this;
		if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
			let s = this.source;
			error.stack = error.stack.replace(
				/\n\s{4}at /,
				`$&${s.input.from}:${s.start.line}:${s.start.column}$&`,
			);
		}
		return error;
	}

	markDirty() {
		if (this[BooleanClean]) {
			this[BooleanClean] = false;
			let next = this;
			while ((next = next.parent)) {
				next[BooleanClean] = false;
			}
		}
	}
}

export { LanguageStyleSheetNodeBaseConstructor };
export default LanguageStyleSheetNodeBaseConstructor;
