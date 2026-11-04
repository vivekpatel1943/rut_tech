import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "../shared/components/Sidebar";
import { AppRouter } from "./router";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0a0a0c] text-zinc-100">
        <Sidebar />
        <AppRouter />
      </div>
    </BrowserRouter>
  );
};

export default App;

