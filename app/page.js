"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
    const { user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push("/feed");
            } else {
                router.push("/auth/login");
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
