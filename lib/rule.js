/// <reference types="./rule.d.ts" />


import ContainerBase, { cleanSource, markDirtyUp } from './container-base.js';

import { isClean, my } from './symbols.js';
import Declaration from './declaration.js';
import Comment from './comment.js';
import AtRule from './at-rule.js';
import list from './list.js';


import parse from './parse.js';




class Rule extends ContainerBase {
	constructor(defaults) {
		super(defaults);
		this.type = 'rule';
		if (!this.nodes) {
			this.nodes = [];
		}
	}




	get selectors() {
		return list.comma(this.selector);
	}




	set selectors(values) {
		let match = this.selector ? this.selector.match(/,\s*/) : null;
		let sep = match ? match[ 0 ] : ',' + this.raw('between' , 'beforeOpen');
		this.selector = values.join(sep);
	}

	normalize(nodes, sample) {
		if (typeof nodes === 'string') {
			nodes = cleanSource(parse(nodes).nodes);
		}
		else if (Array.isArray(nodes)) {
			nodes = nodes.slice(0);
			for (let i of nodes) {
				if (i.parent) {
					i.parent.removeChild(i, 'ignore');
				}
			}
		}
		else if (nodes.type === 'root' && this.type !== 'document') {
			nodes = nodes.nodes.slice(0);
			for (let i of nodes) {
				if (i.parent) {
					i.parent.removeChild(i, 'ignore');
				}
			}
		}
		else if (nodes.type) {
			nodes = [nodes];
		}
		else if (nodes.prop) {
			if (typeof nodes.value === 'undefined') {
				throw new Error('Value field is missed in node creation');
			}
			else if (typeof nodes.value !== 'string') {
				nodes.value = String(nodes.value);
			}
			nodes = [new Declaration(nodes)];
		}
		else if (nodes.selector) {
			nodes = [new Rule(nodes)];
		}
		else if (nodes.name) {
			nodes = [new AtRule(nodes)];
		}
		else if (nodes.text) {
			nodes = [new Comment(nodes)];
		}
		else {
			throw new Error('Unknown node type in node creation');
		}

		let processed = nodes.map((i) => {
			/* c8 ignore next */
			if (!i[my]) {
				Container.rebuild(i);
			}
			i = i.proxyOf;
			if (i.parent) {
				i.parent.removeChild(i);
			}
			if (i[isClean]) {
				markDirtyUp(i);
			}
			if (typeof i.raws.before === 'undefined') {
				if (sample && typeof sample.raws.before !== 'undefined') {
					i.raws.before = sample.raws.before.replace(/\S/g, '');
				}
			}
			i.parent = this.proxyOf;
			return i;
		});

		return processed;
	}


}




export default Rule;