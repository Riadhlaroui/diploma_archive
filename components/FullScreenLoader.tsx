import { Loader2 } from "lucide-react"; // or any spinner you like
import React from "react";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
      <Loader2 className="w-10 h-10 animate-spin text-gray-600 dark:text-white" />
    </div>
  );
};

export default FullScreenLoader;
