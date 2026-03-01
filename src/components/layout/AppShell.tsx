import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-8 h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
