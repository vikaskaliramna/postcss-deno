/// <reference types="./at-rule.d.ts" />

import { isClean, my } from "./symbols.js";
import Declaration from "./declaration.js";
import Comment from "./comment.js";
import Container from "./container.js";

import  ParentContainer  from  './container-base.js';


import  parse  from  './parse.js';
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

/* c8 ignore start */
const  rebuild = (node) => {
    if (node.type === "atrule") {
      Object.setPrototypeOf(node, AtRule.prototype);
    } else if (node.type === "rule") {
      Object.setPrototypeOf(node, Rule.prototype);
    } else if (node.type === "decl") {
      Object.setPrototypeOf(node, Declaration.prototype);
    } else if (node.type === "comment") {
      Object.setPrototypeOf(node, Comment.prototype);
    }

    node[my] = true;

    if (node.nodes) {
      node.nodes.forEach((child) => {
        Container.rebuild(child);
      });
    }
  };
  /* c8 ignore stop */


class  AtRule  extends  ParentContainer  {

        constructor(defaults)  {

                super(defaults);
                this.type = "atrule";

        }




        append(...children) {

                if  (!this.proxyOf.nodes) this.nodes = [];


                return  super.append(...children);
        }

  prepend(...children) {
    if (!this.proxyOf.nodes) this.nodes = [];
    return super.prepend(...children);
  }
  normalize(nodes, sample) {
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

}

export default AtRule;