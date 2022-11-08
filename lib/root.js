/// <reference types="./root.d.ts" />

import Container from './container-base.js';
import LazyResult from './lazy-result.js'
import Processor from './processor.js'

import { isClean, my } from "./symbols.js";

import AtRule from './at-rule.js'
import Rule from './rule.js'
import parse from './parse.js';
import Comment from './comment.js'



function cleanSource(nodes) {
	return nodes.map((i) => {
	  if (i.nodes) i.nodes = cleanSource(i.nodes);
	  delete i.source;
	  return i;
	});
      }

      function markDirtyUp(node) {
	node['isClean'] = false;
	if (node.proxyOf.nodes) {
	  for (let i of node.proxyOf.nodes) {
	    markDirtyUp(i);
	  }
	}
      }


class Root extends Container {
	constructor(defaults) {
		super(defaults);
		this.type = 'root';
		if (!this.nodes) {
			this.nodes = [];
		}
	}




	removeChild(child , ignore) {
		let index = this.index(child);

		if (!ignore && index === 0 && this.nodes.length > 1) {
			this.nodes[ 1 ].raws.before = this.nodes[ index ].raws.before;
		}

		return super.removeChild(child);
	}




	custom_normalize(nodes, sample) {
		if (typeof nodes === "string") {
		  nodes = cleanSource(parse(nodes).nodes);
		} else if (Array.isArray(nodes)) {
		  nodes = nodes.slice(0);
		  for (let i of nodes) {
		    if (i.parent) i.parent.removeChild(i, "ignore");
		  }
		} else if (nodes.type === "root" && this.type !== "document") {
		  nodes = nodes.nodes.slice(0);
		  for (let i of nodes) {
		    if (i.parent) i.parent.removeChild(i, "ignore");
		  }
		} else if (nodes.type) {
		  nodes = [nodes];
		} else if (nodes.prop) {
		  if (typeof nodes.value === "undefined") {
		    throw new Error("Value field is missed in node creation");
		  } else if (typeof nodes.value !== "string") {
		    nodes.value = String(nodes.value);
		  }
		  nodes = [new Declaration(nodes)];
		} else if (nodes.selector) {
		  nodes = [new Rule(nodes)];
		} else if (nodes.name) {
		  nodes = [new AtRule(nodes)];
		} else if (nodes.text) {
		  nodes = [new Comment(nodes)];
		} else {
		  throw new Error("Unknown node type in node creation");
		}

		let processed = nodes.map((i) => {
		  /* c8 ignore next */
		  if (!i[my]) rebuild(i);
		  i = i.proxyOf;
		  if (i.parent) i.parent.removeChild(i);
		  if (i['isClean']) markDirtyUp(i);
		  if (typeof i.raws.before === "undefined") {
		    if (sample && typeof sample.raws.before !== "undefined") {
		      i.raws.before = sample.raws.before.replace(/\S/g, "");
		    }
		  }
		  i.parent = this.proxyOf;
		  return i;
		});

		return processed;
	      }
	normalize(child , sample , type) {
		let nodes = this.custom_normalize(child);

		if (sample) {
			if (type === 'prepend') {
				if (this.nodes.length > 1) {
					sample.raws.before = this.nodes[ 1 ].raws.before;
				}
				else {
					delete sample.raws.before;
				}
			}
			else if (this.first !== sample) {
				for (let node of nodes) {
					node.raws.before = sample.raws.before;
				}
			}
		}

		return nodes;
	}




	toResult(opts = {}) {
		let lazy = new LazyResult(new Processor() , this , opts);
		return lazy.stringify();
	}
}




Root.registerLazyResult = (dependant) => {
	LazyResult = dependant;
};

Root.registerProcessor = (dependant) => {
	Processor = dependant;
};

export default Root;

Root.default = Root;