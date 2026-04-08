import React from "react";
import { Toaster, toast } from "sonner";
import "../styles/toast.css"; // plain CSS file for styles

export default function ToastDemo() {
    return (
        <>
            <Toaster richColors position="bottom-right" />
            <button
                className="custom-toast-button"
                onClick={() =>
                    toast.success("🎉 Welcome aboard! HackPack is ready to accelerate your development journey.")
                }
            >
                Launch a toast notification
            </button>
        </>
    );
}