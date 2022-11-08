import { isClean, my } from './symbols.js';





export function cleanSource(nodes : any[]) {
	return nodes.map((i) => {
		if (i.nodes) {
			i.nodes = cleanSource(i.nodes);
		}
		delete i.source;
		return i;
	});
}


export function markDirtyUp(node) {
	node[ isClean ] = false;
	if (node.proxyOf.nodes) {
		for (let i of node.proxyOf.nodes) {
			markDirtyUp(i);
		}
	}
}


/* c8 ignore start */
const rebuild = (node) => {
	if (node.type === 'atrule') {
		Object.setPrototypeOf(node, AtRule.prototype);
	}
	else if (node.type === 'rule') {
		Object.setPrototypeOf(node, Rule.prototype);
	}
	else if (node.type === 'decl') {
		Object.setPrototypeOf(node, Declaration.prototype);
	}
	else if (node.type === 'comment') {
		Object.setPrototypeOf(node, Comment.prototype);
	}

	node[ my ] = true;

	if (node.nodes) {
		node.nodes.forEach((child) => {
			Container.rebuild(child);
		});
	}
};