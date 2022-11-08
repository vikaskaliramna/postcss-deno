import StyleSheetNode from './node.js';




class Container extends StyleSheetNode {

	get first() {
		if (!this.proxyOf.nodes) {
			return undefined;
		}
		return this.proxyOf.nodes[ 0 ];
	}




	get last() {
		if (!this.proxyOf.nodes) {
			return undefined;
		}
		return this.proxyOf.nodes[ this.proxyOf.nodes.length - 1 ];
	}




	push(child) {
		child.parent = this;
		this.proxyOf.nodes.push(child);
		return this;
	}




	each(callback) {
		if (!this.proxyOf.nodes) {
			return undefined;
		}
		let iterator = this.getIterator();

		let index , result;
		while (this.indexes[ iterator ] < this.proxyOf.nodes.length) {
			index = this.indexes[ iterator ];
			result = callback(this.proxyOf.nodes[ index ] , index);
			if (result === false) {
				break;
			}

			this.indexes[ iterator ] += 1;
		}

		delete this.indexes[ iterator ];
		return result;
	}




	walk(callback) {
		return this.each((child , i) => {
			let result;
			try {
				result = callback(child , i);
			}
			catch (e) {
				throw child.addToError(e);
			}
			if (result !== false && child.walk) {
				result = child.walk(callback);
			}

			return result;
		});
	}




	walkDecls(prop , callback) {
		if (!callback) {
			callback = prop;
			return this.walk((child , i) => {
				if (child.type === 'decl') {
					return callback(child , i);
				}
			});
		}
		if (prop instanceof RegExp) {
			return this.walk((child , i) => {
				if (child.type === 'decl' && prop.test(child.prop)) {
					return callback(child , i);
				}
			});
		}
		return this.walk((child , i) => {
			if (child.type === 'decl' && child.prop === prop) {
				return callback(child , i);
			}
		});
	}




	walkRules(selector , callback) {
		if (!callback) {
			callback = selector;

			return this.walk((child , i) => {
				if (child.type === 'rule') {
					return callback(child , i);
				}
			});
		}
		if (selector instanceof RegExp) {
			return this.walk((child , i) => {
				if (child.type === 'rule' && selector.test(child.selector)) {
					return callback(child , i);
				}
			});
		}
		return this.walk((child , i) => {
			if (child.type === 'rule' && child.selector === selector) {
				return callback(child , i);
			}
		});
	}




	walkAtRules(name , callback) {
		if (!callback) {
			callback = name;
			return this.walk((child , i) => {
				if (child.type === 'atrule') {
					return callback(child , i);
				}
			});
		}
		if (name instanceof RegExp) {
			return this.walk((child , i) => {
				if (child.type === 'atrule' && name.test(child.name)) {
					return callback(child , i);
				}
			});
		}
		return this.walk((child , i) => {
			if (child.type === 'atrule' && child.name === name) {
				return callback(child , i);
			}
		});
	}




	walkComments(callback) {
		return this.walk((child , i) => {
			if (child.type === 'comment') {
				return callback(child , i);
			}
		});
	}




	append(...children) {
		for (let child of children) {
			let nodes = this.normalize(child , this.last);
			for (let node of nodes) this.proxyOf.nodes.push(node);
		}

		this.markDirty();

		return this;
	}




	prepend(...children) {
		children = children.reverse();
		for (let child of children) {
			let nodes = this.normalize(child , this.first , 'prepend').reverse();
			for (let node of nodes) this.proxyOf.nodes.unshift(node);
			for (let id in this.indexes) {
				this.indexes[ id ] = this.indexes[ id ] + nodes.length;
			}
		}

		this.markDirty();

		return this;
	}




	cleanRaws(keepBetween) {
		super.cleanRaws(keepBetween);
		if (this.nodes) {
			for (let node of this.nodes) node.cleanRaws(keepBetween);
		}
	}




	insertBefore(exist , add) {
		exist = this.index(exist);

		let type = exist === 0 ? 'prepend' : false;
		let nodes = this.normalize(add , this.proxyOf.nodes[ exist ] , type).reverse();
		for (let node of nodes) this.proxyOf.nodes.splice(exist , 0 , node);

		let index;
		for (let id in this.indexes) {
			index = this.indexes[ id ];
			if (exist <= index) {
				this.indexes[ id ] = index + nodes.length;
			}
		}

		this.markDirty();

		return this;
	}




	insertAfter(exist , add) {
		exist = this.index(exist);

		let nodes = this.normalize(add , this.proxyOf.nodes[ exist ]).reverse();
		for (let node of nodes) this.proxyOf.nodes.splice(exist + 1 , 0 , node);

		let index;
		for (let id in this.indexes) {
			index = this.indexes[ id ];
			if (exist < index) {
				this.indexes[ id ] = index + nodes.length;
			}
		}

		this.markDirty();

		return this;
	}




	removeChild(child) {
		child = this.index(child);
		this.proxyOf.nodes[ child ].parent = undefined;
		this.proxyOf.nodes.splice(child , 1);

		let index;
		for (let id in this.indexes) {
			index = this.indexes[ id ];
			if (index >= child) {
				this.indexes[ id ] = index - 1;
			}
		}

		this.markDirty();

		return this;
	}




	removeAll() {
		for (let node of this.proxyOf.nodes) node.parent = undefined;
		this.proxyOf.nodes = [];

		this.markDirty();

		return this;
	}




	replaceValues(pattern , opts , callback) {
		if (!callback) {
			callback = opts;
			opts = {};
		}

		this.walkDecls((decl) => {
			if (opts.props && !opts.props.includes(decl.prop)) {
				return;
			}
			if (opts.fast && !decl.value.includes(opts.fast)) {
				return;
			}

			decl.value = decl.value.replace(pattern , callback);
		});

		this.markDirty();

		return this;
	}




	every(condition) {
		return this.nodes.every(condition);
	}




	some(condition) {
		return this.nodes.some(condition);
	}




	index(child) {
		if (typeof child === 'number') {
			return child;
		}
		if (child.proxyOf) {
			child = child.proxyOf;
		}
		return this.proxyOf.nodes.indexOf(child);
	}




	getProxyProcessor() {
		return {
			set(node , prop , value) {
				if (node[ prop ] === value) {
					return true;
				}
				node[ prop ] = value;
				if (prop === 'name' || prop === 'params' || prop === 'selector') {
					node.markDirty();
				}
				return true;
			} ,

			get(node , prop) {
				if (prop === 'proxyOf') {
					return node;
				}
				else if (!node[ prop ]) {
					return node[ prop ];
				}
				else if (
					prop === 'each' ||
					(typeof prop === 'string' && prop.startsWith('walk'))
				) {
					return (...args) => {
						return node[ prop ](
							...args.map((i) => {
								if (typeof i === 'function') {
									return (child , index) => i(child.toProxy() , index);
								}
								else {
									return i;
								}
							})
						);
					};
				}
				else if (prop === 'every' || prop === 'some') {
					return (cb) => {
						return node[ prop ]((child , ...other) =>
							cb(child.toProxy() , ...other)
						);
					};
				}
				else if (prop === 'root') {
					return () => node.root().toProxy();
				}
				else if (prop === 'nodes') {
					return node.nodes.map((i) => i.toProxy());
				}
				else if (prop === 'first' || prop === 'last') {
					return node[ prop ].toProxy();
				}
				else {
					return node[ prop ];
				}
			}
		};
	}




	getIterator() {
		if (!this.lastEach) {
			this.lastEach = 0;
		}
		if (!this.indexes) {
			this.indexes = {};
		}

		this.lastEach += 1;
		let iterator = this.lastEach;
		this.indexes[ iterator ] = 0;

		return iterator;
	}
}




export default Container;