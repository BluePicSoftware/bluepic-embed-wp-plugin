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

import {
	PanelBody,
	TextControl,
	Button,
	SelectControl,
	Spinner,
	Notice,
} from "@wordpress/components";
import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
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
	const [loading, setLoading] = useState(false);
	// const [apiResult, setApiResult] = useState(null);
	const [projects, setProjects] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		setLoading(true);

		apiFetch({
			path: "/wp/v2/bluepic-test-api-call",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (response.data.length === 0) {
					setError("no_projects");
				} else {
					setProjects(response.data);
					setAttributes({ projectId: response.data[0].id });
				}
				//setApiResult(response);
			})
			.catch((error) => {
				setError(error.message);
				// setApiResult("Error: " + error.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const projectOptions = projects.map((project) => ({
		label: project.name,
		value: project.id,
	}));

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "bluepic-embed")}>
					{/* <Button isSecondary onClick={handleTestApiCall} disabled={loading}>
						{loading ? <Spinner /> : __("Test API Call", "bluepic-embed")}
					</Button> */}
					{/* {apiResult && <div>{apiResult}</div>} */}
					{loading ? (
						<Spinner />
					) : error === "no_projects" ? (
						<Notice status="warning" isDismissible={false}>
							<p>
								{__(
									"You do not have any Bluepic Embed projects.",
									"bluepic-embed",
								)}
							</p>
							<Button
								isPrimary
								onClick={() => {
									window.open("https://embed.bluepic.io", "_blank");
								}}
							>
								{__("Create a new project", "bluepic-embed")}
							</Button>
						</Notice>
					) : error ? (
						<Notice status="error" isDismissible={false}>
							<p>
								{__("You are not authenticated with Bluepic.", "bluepic-embed")}
							</p>
							<Button
								isPrimary
								onClick={() => {
									window.location.href =
										"/wp-admin/admin.php?page=bluepic-settings";
								}}
							>
								{__("Authenticate with Bluepic", "bluepic-embed")}
							</Button>
						</Notice>
					) : (
						<SelectControl
							label={"Select project"}
							value={projectId}
							options={projectOptions}
							onChange={(value) => setAttributes({ projectId: value })}
						/>
					)}
					<TextControl
						label={__("Manual Project ID", "bluepic-embed")}
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
