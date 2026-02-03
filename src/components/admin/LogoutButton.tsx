"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1f2937] hover:text-white transition-colors group"
        >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Logout</span>
        </button>
    );
}
