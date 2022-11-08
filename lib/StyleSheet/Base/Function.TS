import type { AnyNode, Container, Document } from '../../Common/Common.D.TS';

export function cloneNode(obj: object, parent?: AnyNode) {
	let cloned = new obj.constructor();

	for (let i in obj) {
		if (!Object.prototype.hasOwnProperty.call(obj, i)) {
			/* c8 ignore next 2 */
			continue;
		}
		if (i === 'proxyCache') {
			continue;
		}
		let value = obj[i];
		let type = typeof value;

		if (i === 'parent' && type === 'object') {
			if (parent) {
				cloned[i] = parent;
			}
		} else if (i === 'source') {
			cloned[i] = value;
		} else if (Array.isArray(value)) {
			cloned[i] = value.map((j) => cloneNode(j, cloned));
		} else {
			if (type === 'object' && value !== null) {
				value = cloneNode(value);
			}
			cloned[i] = value;
		}
	}

	return cloned;
}
