import type { JSX } from "react";
import { createContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import type { ImageType } from "src/api/api";
import { getRemainingCredits } from "src/api/api";
import { ContextMessages as Messages } from "./context.messages";
export interface AppContextType {
    appError: string;
    setAppError: (value: string) => void;
    creditsError: string;
    setCreditsError: (value: string) => void;
    loadingApp: boolean;
    setLoadingApp: (value: boolean) => void;
    isLoadingImages: boolean;
    setIsLoadingImages: (value: boolean) => void;
    jobId: string;
    setJobId: (value: string) => void;
    remainingCredits: number;
    setRemainingCredits: (value: number) => void;
    promptInput: string;
    setPromptInput: (value: string) => void;
    promptInputError: string;
    setPromptInputError: (value: string) => void;
    generatedImages: ImageType[];
    setGeneratedImages: (value: ImageType[]) => void;
}
export const AppContext = createContext<AppContextType>({
    appError: "",
    setAppError: () => { },
    creditsError: "",
    setCreditsError: () => { },
    loadingApp: true,
    setLoadingApp: () => { },
    isLoadingImages: false,
    setIsLoadingImages: () => { },
    jobId: "",
    setJobId: () => { },
    remainingCredits: 0,
    setRemainingCredits: () => { },
    promptInput: "",
    setPromptInput: () => { },
    promptInputError: "",
    setPromptInputError: () => { },
    generatedImages: [] as ImageType[],
    setGeneratedImages: () => { },
});
export const ContextProvider = ({ children, }: {
    children: React.ReactNode;
}): JSX.Element => {
    const [appError, setAppError] = useState<string>("");
    const [loadingApp, setLoadingApp] = useState<boolean>(true);
    const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
    const [jobId, setJobId] = useState<string>("");
    const [remainingCredits, setRemainingCredits] = useState<number>(0);
    const [promptInput, setPromptInput] = useState<string>("");
    const [promptInputError, setPromptInputError] = useState<string>("");
    const [generatedImages, setGeneratedImages] = useState<ImageType[]>([]);
    const [creditsError, setCreditsError] = useState<string>("");
    const intl = useIntl();
    useEffect(() => {
        const fetchDataOnMount = async () => {
            try {
                setLoadingApp(true);
                try {
                    const { credits } = await getRemainingCredits();
                    setRemainingCredits(credits);
                }
                catch (error) {
                    setAppError(intl.formatMessage(Messages.appErrorGetRemainingCreditsFailed));
                    console.error("Error fetching remaining credits:", error);
                }
            }
            catch (error) {
                setAppError(intl.formatMessage(Messages.appErrorGeneral));
                console.error("Error fetching data:", error);
            }
            finally {
                setLoadingApp(false);
            }
        };
        fetchDataOnMount();
    }, []);
    useEffect(() => {
        if (loadingApp || remainingCredits > 0) {
            setCreditsError("");
            return;
        }
        const errorMessage = intl.formatMessage(Messages.alertNotEnoughCredits);
        setCreditsError(errorMessage);
    }, [loadingApp, remainingCredits]);
    const setPromptInputHandler = (value: string) => {
        if (promptInputError ===
            intl.formatMessage(Messages.promptMissingErrorMessage)) {
            setPromptInputError("");
        }
        if (value === "") {
            setPromptInputError("");
        }
        setPromptInput(value);
    };
    const value: AppContextType = {
        appError,
        setAppError,
        creditsError,
        setCreditsError,
        loadingApp,
        setLoadingApp,
        isLoadingImages,
        setIsLoadingImages,
        jobId,
        setJobId,
        remainingCredits,
        setRemainingCredits,
        promptInput,
        setPromptInput: setPromptInputHandler,
        promptInputError,
        setPromptInputError,
        generatedImages,
        setGeneratedImages,
    };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
