import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Point to the PDF worker on a CDN to avoid Next.js build issues
//pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
/**
 * Extracts text from an image file
 */
export const recognizeImage = async (file: File): Promise<string> => {
	const {
		data: { text },
	} = await Tesseract.recognize(file, "eng");
	return text;
};

/**
 * Extracts text from a PDF file
 * Strategy: Convert each page to a canvas, then OCR the canvas.
 */
export const recognizePDF = async (file: File): Promise<string> => {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
	let fullText = "";

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const viewport = page.getViewport({ scale: 2 }); // Scale 2x for better OCR accuracy

		// Create an off-screen canvas to render the PDF page
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		if (context) {
			await page.render({ canvasContext: context, viewport } as any).promise;

			// Pass the canvas (which is now an image of the page) to Tesseract
			const {
				data: { text },
			} = await Tesseract.recognize(canvas, "eng");
			fullText += `--- Page ${i} ---\n${text}\n\n`;
		}
	}

	return fullText;
};
