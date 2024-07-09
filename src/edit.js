/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";

import { PanelBody, TextControl, ToggleControl } from "@wordpress/components";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { projectId } = attributes;
	const currentYear = new Date().getFullYear().toString();
	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "bluepic-embed")}>
					<TextControl
						label={__("Project ID", "bluepic-embed")}
						value={projectId || ""}
						onChange={(value) => setAttributes({ projectId: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				style={{
					"pointer-events": "all",
				}}
			>
				<iframe
					{...useBlockProps()}
					src={`https://template.bluepic.io/${projectId}`}
					style={{
						width: "100%",
						margin: "auto",
						border: "none",
						height: "80vh",
						"pointer-events": "none",
					}}
					allowFullScreen
				></iframe>
			</div>
		</>
	);
}
