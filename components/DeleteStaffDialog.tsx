import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const DeleteStaffDialog = ({ open, onOpenChange }: Props) => {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content className="w-full max-w-lg fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-none shadow-lg">
					<Dialog.Title className="text-lg font-semibold">
						Delete Staff Member
					</Dialog.Title>

					<Dialog.Close className="absolute top-2 right-2 text-gray-500 hover:text-black">
						<X />
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default DeleteStaffDialog;
