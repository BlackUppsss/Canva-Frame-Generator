import type { RenderSelectionUiRequest } from "@canva/intents/data";
import { useEffect, useState } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import type { ListingsDataConfig } from "./data_table";
const REASON_DATA_SELECTION = "data_selection";
const REASON_OUTDATED_SOURCE_REF = "outdated_source_ref";
const REASON_APP_ERROR = "app_error";
type SelectionState = {
    propertyTypes: string[];
    error: string | null;
    loading: boolean;
    success: boolean;
};
function resolveInvocationContext(ctx: RenderSelectionUiRequest["invocationContext"], intl: IntlShape): Partial<SelectionState> | undefined {
    if (ctx.reason === REASON_DATA_SELECTION && ctx.dataSourceRef) {
        try {
            const saved = JSON.parse(ctx.dataSourceRef.source) as ListingsDataConfig;
            return { propertyTypes: saved.propertyTypes ?? [] };
        }
        catch {
            return {
                error: intl.formatMessage({
                    defaultMessage: "Failed to load saved selection",
                    description: "Error when saved data connector config is invalid",
                }),
            };
        }
    }
    if (ctx.reason === REASON_OUTDATED_SOURCE_REF) {
        return {
            error: intl.formatMessage({
                defaultMessage: "Your previously selected data is no longer available. Please make a new selection.",
                description: "Error when data connector source ref is outdated",
            }),
        };
    }
    if (ctx.reason === REASON_APP_ERROR) {
        return {
            error: ctx.message ??
                intl.formatMessage({
                    defaultMessage: "An error occurred with your data",
                    description: "Generic data connector error message",
                }),
        };
    }
}
export function useDataSelection(request: RenderSelectionUiRequest) {
    const intl = useIntl();
    const [state, setState] = useState<SelectionState>({
        propertyTypes: [],
        error: null,
        loading: false,
        success: false,
    });
    const updateSelection = (patch: Partial<SelectionState>) => setState((prev) => ({ ...prev, ...patch }));
    useEffect(() => {
        const patch = resolveInvocationContext(request.invocationContext, intl);
        if (patch) {
            updateSelection(patch);
        }
    }, [request.invocationContext, intl]);
    async function loadData() {
        updateSelection({ loading: true, error: null, success: false });
        try {
            const result = await request.updateDataRef({
                source: JSON.stringify({
                    propertyTypes: state.propertyTypes,
                } satisfies ListingsDataConfig),
                title: intl.formatMessage({
                    defaultMessage: "MLS Property Listings",
                    description: "Title for the data connector data source",
                }),
            });
            if (result.status === "completed") {
                updateSelection({ success: true });
            }
            else {
                const message = result.status === "app_error" && "message" in result
                    ? result.message
                    : null;
                updateSelection({
                    error: message ??
                        intl.formatMessage({
                            defaultMessage: "An error occurred",
                            description: "Generic error loading data",
                        }),
                });
            }
        }
        catch {
            updateSelection({
                error: intl.formatMessage({
                    defaultMessage: "Failed to update data",
                    description: "Error when data connector update fails",
                }),
            });
        }
        finally {
            updateSelection({ loading: false });
        }
    }
    return {
        ...state,
        setPropertyTypes: (propertyTypes: string[]) => updateSelection({ propertyTypes }),
        loadData,
    };
}
