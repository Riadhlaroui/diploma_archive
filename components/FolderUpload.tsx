"use client";

import React, { ChangeEvent } from "react";

// Extend the input attributes to include vendor-specific props
interface DirectoryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	webkitdirectory?: string | boolean;
	directory?: string | boolean;
}

const FolderUpload: React.FC = () => {
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);

			// Accessing webkitRelativePath safely
			filesArray.forEach((file) => {
				console.log(file.name, "is at", (file as any).webkitRelativePath);
			});
		}
	};

	return (
		<input
			type="file"
			onChange={handleFileChange}
			// Cast the attributes to our custom interface
			{...({
				webkitdirectory: "true",
				directory: "true",
				multiple: true,
			} as DirectoryInputProps)}
		/>
	);
};

export default FolderUpload;
