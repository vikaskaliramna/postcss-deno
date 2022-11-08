import type { InterfaceLanguageStyleSheetNodeContainer } from '../Container/Constructor.D.TS';
import type { InterfaceLanguageStyleSheetNodeBase } from '../Base/Constructor.D.TS';

export declare interface InterfaceLanguageStyleSheetNodeDeclarationCollectionRaw extends Record<string, unknown> {
	/**
	 * The space symbols before the node. It also stores `*`
	 * and `_` symbols before the declaration (IE hack).
	 */
	before?: string;

	/**
	 * The symbols between the property and value for declarations.
	 */
	between?: string;

	/**
	 * The content of the important statement, if it is not just `!important`.
	 */
	important?: string;

	/**
	 * Declaration value with comments.
	 */
	value?: {
		value: string;
		raw: string;
	};
}
/**
 *
 *  @deprecated `DeclarationRaws` has been deprecated in favour of `InterfaceLanguageStyleSheetNodeDeclarationCollectionRw`
 *
 */
export interface DeclarationRaws extends InterfaceLanguageStyleSheetNodeDeclarationCollectionRaw {}

export interface InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty {
	/** Name of the declaration. */
	prop: string;
	/** Value of the declaration. */
	value: string;
	/** Whether the declaration has an `!important` annotation. */
	important?: boolean;
	/** Information used to generate byte-to-byte equal node string as it was in the origin input. */
	raws?: InterfaceLanguageStyleSheetNodeDeclarationCollectionRaw;
}


/**
 *
 *  @deprecated `DeclarationRaDeclarationPropsws` has been deprecated in favour of `InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty`
 *
 */
export interface DeclarationProps extends InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty {}
/**
 * Represents a CSS declaration.
 *
 * ```js
 * Once (root, { Declaration }) {
 *   let color = new Declaration({ prop: 'color', value: 'black' })
 *   root.append(color)
 * }
 * ```
 *
 * ```js
 * const root = postcss.parse('a { color: black }')
 * const decl = root.first.first
 * decl.type       //=> 'decl'
 * decl.toString() //=> ' color: black'
 * ```
 */
declare interface InterfaceLanguageStyleSheetNodeDeclaration extends InterfaceLanguageStyleSheetNodeBase {
	type: 'decl';
	parent: InterfaceLanguageStyleSheetNodeContainer  | undefined;
	raws: InterfaceLanguageStyleSheetNodeDeclarationCollectionRaw;

	/**
	 * The declaration's property name.
	 *
	 * ```js
	 * const root = postcss.parse('a { color: black }')
	 * const decl = root.first.first
	 * decl.prop //=> 'color'
	 * ```
	 */
	prop: string;

	/**
	 * The declaration’s value.
	 *
	 * This value will be cleaned of comments. If the source value contained
	 * comments, those comments will be available in the `raws` property.
	 * If you have not changed the value, the result of `decl.toString()`
	 * will include the original raws value (comments and all).
	 *
	 * ```js
	 * const root = postcss.parse('a { color: black }')
	 * const decl = root.first.first
	 * decl.value //=> 'black'
	 * ```
	 */
	value: string;

	/**
	 * `true` if the declaration has an `!important` annotation.
	 *
	 * ```js
	 * const root = postcss.parse('a { color: black !important; color: red }')
	 * root.first.first.important //=> true
	 * root.first.last.important  //=> undefined
	 * ```
	 */
	important: boolean;

	/**
	 * `true` if declaration is declaration of CSS Custom Property
	 * or Sass variable.
	 *
	 * ```js
	 * const root = postcss.parse(':root { --one: 1 }')
	 * let one = root.first.first
	 * one.variable //=> true
	 * ```
	 *
	 * ```js
	 * const root = postcss.parse('$one: 1')
	 * let one = root.first
	 * one.variable //=> true
	 * ```
	 */
	variable: boolean;

	// constructor(defaults?: InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty);

	assign(overrides: object | InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty): this;

	clone(overrides?: Partial<InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty>): this;

	cloneBefore(overrides?: Partial<InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty>): this;

	cloneAfter(overrides?: Partial<InterfaceLanguageStyleSheetNodeDeclarationCollectionProperty>): this;
}

export type { InterfaceLanguageStyleSheetNodeDeclaration };
export default InterfaceLanguageStyleSheetNodeDeclaration;
