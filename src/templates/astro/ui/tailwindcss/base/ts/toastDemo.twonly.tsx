import { Toaster, toast } from "sonner";
import React from "react";

export default function ToastDemo() {
    return (
        <>
            <Toaster richColors position="bottom-right" />
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 m-5"
                onClick={() => toast.success("🎉 Welcome aboard! HackPack is ready to accelerate your development journey.")}
            >
                Launch a toast notification
            </button>
        </>
    );
}