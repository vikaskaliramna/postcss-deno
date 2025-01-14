/// <reference types="./fromJSON.d.ts" />

import Declaration from './declaration.js';
import PreviousMap from './previous-map.js';
import Comment from './comment.js';
import AtRule from './at-rule.js';
import Input from './input.js';
import Root from './root.js';
import Rule from './rule.js';




function fromJSON(json , inputs) {
	if (Array.isArray(json)) {
		return json.map((n) => fromJSON(n));
	}

	let { inputs : ownInputs , ...defaults } = json;
	if (ownInputs) {
		inputs = [];
		for (let input of ownInputs) {
			let inputHydrated = { ...input , __proto__ : Input.prototype };
			if (inputHydrated.map) {
				inputHydrated.map = {
					...inputHydrated.map ,
					__proto__ : PreviousMap.prototype
				};
			}
			inputs.push(inputHydrated);
		}
	}
	if (defaults.nodes) {
		defaults.nodes = json.nodes.map((n) => fromJSON(n , inputs));
	}
	if (defaults.source) {
		let { inputId , ...source } = defaults.source;
		defaults.source = source;
		if (inputId != null) {
			defaults.source.input = inputs[ inputId ];
		}
	}
	if (defaults.type === 'root') {
		return new Root(defaults);
	}
	else if (defaults.type === 'decl') {
		return new Declaration(defaults);
	}
	else if (defaults.type === 'rule') {
		return new Rule(defaults);
	}
	else if (defaults.type === 'comment') {
		return new Comment(defaults);
	}
	else if (defaults.type === 'atrule') {
		return new AtRule(defaults);
	}
	else {
		throw new Error('Unknown node type: ' + json.type);
	}
}




export default fromJSON;

fromJSON.default = fromJSON;