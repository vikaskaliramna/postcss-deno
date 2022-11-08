import { AtRuleProps, InterfaceLanguageStyleSheetNodeAsperandRule } from './Constructor.D.TS';

import Container from '../../container.js';
import { ChildNode } from '../../Common/Common.D.TS';

class AtRule extends Container implements InterfaceLanguageStyleSheetNodeAsperandRule {
	type: 'atrule';

	name!: string;
	params!: string;

	constructor(defaults: AtRuleProps) {
		super(defaults);
		this.type = 'atrule';
	}
	nodes: ChildNode[] = [];

	append(...children: any) {
		if (!this.proxyOf.nodes) {
			this.nodes = [];
		}
		return super.append(...children);
	}

	prepend(...children: any) {
		if (!this.proxyOf.nodes) {
			this.nodes = [];
		}
		return super.prepend(...children);
	}
}

export default AtRule;
