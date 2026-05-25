import { Alert, Button, Rows, Text } from "@canva/app-ui-kit";
import { openDesign, type DesignEditing } from "@canva/design";
import { useState } from "react";
import * as styles from "styles/components.css";
type FixResult = {
    totalElementsFixed: number;
    totalPagesModified: number;
};
type AppState = {
    isLoading: boolean;
    lastFixResult?: FixResult;
    errorMessage?: string;
};
const SAFE_DISTANCE = 100;
const initialState: AppState = {
    isLoading: false,
};
export const App = () => {
    const [state, setState] = useState<AppState>(initialState);
    const checkAndFixElement = (element: DesignEditing.AbsoluteElement, pageDimensions: {
        width: number;
        height: number;
    } | undefined): boolean => {
        if (element.type === "unsupported") {
            return false;
        }
        if (!pageDimensions) {
            return false;
        }
        const distanceFromRight = pageDimensions.width - (element.left + element.width);
        const distanceFromBottom = pageDimensions.height - (element.top + element.height);
        let wasFixed = false;
        if (element.top < SAFE_DISTANCE) {
            element.top = SAFE_DISTANCE;
            wasFixed = true;
        }
        else if (distanceFromBottom < SAFE_DISTANCE) {
            element.top = pageDimensions.height - element.height - SAFE_DISTANCE;
            wasFixed = true;
        }
        if (element.left < SAFE_DISTANCE) {
            element.left = SAFE_DISTANCE;
            wasFixed = true;
        }
        else if (distanceFromRight < SAFE_DISTANCE) {
            element.left = pageDimensions.width - element.width - SAFE_DISTANCE;
            wasFixed = true;
        }
        return wasFixed;
    };
    const fixPositioningIssues = async () => {
        setState((prev) => ({
            ...prev,
            isLoading: true,
            errorMessage: undefined,
        }));
        try {
            let totalElementsFixed = 0;
            let totalPagesModified = 0;
            await openDesign({ type: "all_pages" }, async (session) => {
                for (const pageRef of session.pageRefs.toArray()) {
                    if (pageRef.type !== "absolute" || pageRef.locked) {
                        continue;
                    }
                    await session.helpers.openPage(pageRef, async (pageResult) => {
                        let elementsFixedOnPage = 0;
                        pageResult.page.elements.forEach((element) => {
                            if (element.locked) {
                                return;
                            }
                            if (checkAndFixElement(element, pageResult.page.dimensions)) {
                                elementsFixedOnPage++;
                            }
                        });
                        totalElementsFixed += elementsFixedOnPage;
                        if (elementsFixedOnPage > 0) {
                            totalPagesModified++;
                        }
                    });
                }
                await session.sync();
            });
            setState((prev) => ({
                ...prev,
                isLoading: false,
                lastFixResult: { totalElementsFixed, totalPagesModified },
            }));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            setState((prev) => ({
                ...prev,
                isLoading: false,
                errorMessage,
            }));
        }
    };
    return (<div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          This app automatically fixes elements that are positioned too close to
          the edges of pages.
        </Text>

        <Button variant="primary" onClick={fixPositioningIssues} disabled={state.isLoading}>
          Fix element positioning
        </Button>

        {state.lastFixResult && (<Alert tone="positive">
            Fixed {state.lastFixResult.totalElementsFixed} element(s) across{" "}
            {state.lastFixResult.totalPagesModified} pages.
          </Alert>)}

        {state.errorMessage && (<Alert tone="critical">{state.errorMessage}</Alert>)}
      </Rows>
    </div>);
};
