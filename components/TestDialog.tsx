import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

const TestDialog = () => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>Open Dialog</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content className="fixed inset-0 bg-white z-50">
					<Dialog.Title>Test Dialog</Dialog.Title>
					<Dialog.Close>Close</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default TestDialog;
