import { Buffer , dirname , existsSync , join , readFileSync } from './deps.js';

/// <reference types="./previous-map.d.ts" />
import { SourceMapConsumer , SourceMapGenerator } from './source_map.ts';




function fromBase64(str) {
	if (Buffer) {
		return Buffer.from(str , 'base64').toString();
	}
	else {
		/* c8 ignore next 2 */
		return window.atob(str);
	}
}




class PreviousMap {
	constructor(css , opts) {
		if (opts.map === false) {
			return;
		}
		this.loadAnnotation(css);
		this.inline = this.startWith(this.annotation , 'data:');

		let prev = opts.map ? opts.map.prev : undefined;
		let text = this.loadMap(opts.from , prev);
		if (!this.mapFile && opts.from) {
			this.mapFile = opts.from;
		}
		if (this.mapFile) {
			this.root = dirname(this.mapFile);
		}
		if (text) {
			this.text = text;
		}
	}




	consumer() {
		if (!this.consumerCache) {
			this.consumerCache = new SourceMapConsumer(this.text);
		}
		return this.consumerCache;
	}




	withContent() {
		return !!(
			this.consumer().sourcesContent &&
			this.consumer().sourcesContent.length > 0
		);
	}




	startWith(string , start) {
		if (!string) {
			return false;
		}
		return string.substr(0 , start.length) === start;
	}




	getAnnotationURL(sourceMapString) {
		return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/ , '').trim();
	}




	loadAnnotation(css) {
		let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
		if (!comments) {
			return;
		}

		// sourceMappingURLs from comments, strings, etc.
		let start = css.lastIndexOf(comments.pop());
		let end = css.indexOf('*/' , start);

		if (start > -1 && end > -1) {
			// Locate the last sourceMappingURL to avoid pickin
			this.annotation = this.getAnnotationURL(css.substring(start , end));
		}
	}




	decodeInline(text) {
		let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
		let baseUri = /^data:application\/json;base64,/;
		let charsetUri = /^data:application\/json;charset=utf-?8,/;
		let uri = /^data:application\/json,/;

		if (charsetUri.test(text) || uri.test(text)) {
			return decodeURIComponent(text.substr(RegExp.lastMatch.length));
		}

		if (baseCharsetUri.test(text) || baseUri.test(text)) {
			return fromBase64(text.substr(RegExp.lastMatch.length));
		}

		let encoding = text.match(/data:application\/json;([^,]+),/)[ 1 ];
		throw new Error('Unsupported source map encoding ' + encoding);
	}




	loadFile(path) {
		this.root = dirname(path);
		if (existsSync(path)) {
			this.mapFile = path;
			return readFileSync(path , 'utf-8').toString().trim();
		}
	}




	loadMap(file , prev) {
		if (prev === false) {
			return false;
		}

		if (prev) {
			if (typeof prev === 'string') {
				return prev;
			}
			else if (typeof prev === 'function') {
				let prevPath = prev(file);
				if (prevPath) {
					let map = this.loadFile(prevPath);
					if (!map) {
						throw new Error(
							'Unable to load previous source map: ' + prevPath.toString()
						);
					}
					return map;
				}
			}
			else if (prev instanceof SourceMapConsumer) {
				return SourceMapGenerator.fromSourceMap(prev).toString();
			}
			else if (prev instanceof SourceMapGenerator) {
				return prev.toString();
			}
			else if (this.isMap(prev)) {
				return JSON.stringify(prev);
			}
			else {
				throw new Error(
					'Unsupported previous source map format: ' + prev.toString()
				);
			}
		}
		else if (this.inline) {
			return this.decodeInline(this.annotation);
		}
		else if (this.annotation) {
			let map = this.annotation;
			if (file) {
				map = join(dirname(file) , map);
			}
			return this.loadFile(map);
		}
	}




	isMap(map) {
		if (typeof map !== 'object') {
			return false;
		}
		return (
			typeof map.mappings === 'string' ||
			typeof map._mappings === 'string' ||
			Array.isArray(map.sections)
		);
	}
}




export default PreviousMap;

PreviousMap.default = PreviousMap;