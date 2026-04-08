import { Toaster, toast } from "sonner";
import React from "react";

export default function ToastDemo() {
    return (
        <>
            <Toaster richColors position="bottom-right" />
            <button
                className="btn btn-primary"
                onClick={() => toast.success("🎉 Welcome aboard! HackPack is ready to accelerate your development journey.")}
            >
                Launch a toast notification
            </button>
        </>
    );
}