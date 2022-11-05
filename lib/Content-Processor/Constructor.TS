import type { InterfaceLanguageContentProcessorConstructor } from './Constructor.D.TS';

/// <reference types="./Constructor.D.TS" />

import NoWorkResult from '../no-work-result.js';
import LazyResult from '../lazy-result.js';
import { AcceptedPlugin, Plugin, ProcessOptions, TransformCallback, Transformer } from '../postcss.d.ts';

class LanguageContentProcessorConstructor implements InterfaceLanguageContentProcessorConstructor {
	plugins: (Plugin | Transformer | TransformCallback)[];
	version: string;

	constructor(plugins: Array<AcceptedPlugin> = []) {
		this.version = '8.4.18';
		this.plugins = this.normalize(plugins);
	}

	ApplyExtension(plugin: AcceptedPlugin) {
		this.plugins = this.plugins.concat(this.normalize([plugin]));
		return this;
	}

	/**  @deprecated Prefer using `ApplyExtension()` instead.  */
	use(plugin: AcceptedPlugin) {
		return this.ApplyExtension(plugin);
	}

	process($StyleSheetStringContent: string, $ProcessorConfiguration: ProcessOptions = {}): NoWorkResult | LazyResult {
		if (
			this.plugins.length === 0 &&
			typeof $ProcessorConfiguration.parser === 'undefined' &&
			typeof $ProcessorConfiguration.stringifier === 'undefined' &&
			typeof $ProcessorConfiguration.syntax === 'undefined'
		) {
			return new NoWorkResult(this, $StyleSheetStringContent, $ProcessorConfiguration);
		}

		return new LazyResult(this, $StyleSheetStringContent, $ProcessorConfiguration);
	}

	normalize($PluginList: Array<AcceptedPlugin | any>): Array<(Plugin | Transformer | TransformCallback)> {
		let normalized: Array<Plugin> = [];

		for (let CurrentPlugin__ of $PluginList) {
			if (CurrentPlugin__.postcss === true) {
				CurrentPlugin__ = CurrentPlugin__();
			} else if (CurrentPlugin__.postcss) {
				CurrentPlugin__ = CurrentPlugin__.postcss;
			}

			if (typeof CurrentPlugin__ === 'object' && Array.isArray(CurrentPlugin__.plugins)) {
				normalized = normalized.concat(CurrentPlugin__.plugins);
			} else if (typeof CurrentPlugin__ === 'object' && CurrentPlugin__.postcssPlugin) {
				normalized.push(CurrentPlugin__);
			} else if (typeof CurrentPlugin__ === 'function') {
				normalized.push(CurrentPlugin__);
			} else if (typeof CurrentPlugin__ === 'object' && (CurrentPlugin__.parse || CurrentPlugin__.stringify)) {
				if (Deno.env.get('DENO_ENV') !== 'production') {
					throw new Error(
						'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
							'one of the syntax/parser/stringifier options as outlined ' +
							'in your PostCSS runner documentation.',
					);
				}
			} else {
				throw new Error(CurrentPlugin__ + ' is not a PostCSS plugin');
			}
		}
		return (normalized);
	}
}

export { LanguageContentProcessorConstructor };
export default LanguageContentProcessorConstructor;
