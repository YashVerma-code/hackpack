import { Toaster, toast } from "sonner";
import React from "react";
import { Button } from "./ui/button";


export default function ToastDemo() {
    return (
        <>
            <Toaster richColors position="bottom-right" />
            <Button
                className="bg-blue-700 m-5 h-12 px-6"
                onClick={() => toast.success("🎉 Welcome aboard! HackPack is ready to accelerate your development journey.")}
            >
                Launch a toast notification
            </Button>
        </>
    );
}