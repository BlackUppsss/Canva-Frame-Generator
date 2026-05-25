import { useContext } from "react";
import type { AppContextType } from "./app_context";
import { AppContext } from "./app_context";
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within a ContextProvider");
    }
    return context;
};
