/// <reference types="./document.d.ts" />

import Container from './container-base.js';




import LazyResult from './lazy-result.js'
import Processor from './processor.js'




class Document extends Container {
	constructor(defaults) {
		// type needs to be passed to super, otherwise child roots won't be normalized correctly
		super({ type : 'document' , ...defaults });

		if (!this.nodes) {
			this.nodes = [];
		}
	}




	toResult(opts = {}) {
		let lazy = new LazyResult(new Processor() , this , opts);

		return lazy.stringify();
	}
}



export default Document;

Document.default = Document;