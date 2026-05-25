import type { ExpandUrlRequest, ExpandUrlResponse, GetContentRequest, GetContentResponse, UrlExpanderIntent, } from "@canva/intents/asset";
import { prepareUrlExpander } from "@canva/intents/asset";
import { exampleAssets } from "./asset";
import { mapBaseAssetToURLExpanderAsset } from "./mapper";
async function expandUrl(request: ExpandUrlRequest): Promise<ExpandUrlResponse> {
    const foundAsset = exampleAssets.find((a) => a.url === request.url);
    if (foundAsset) {
        return {
            status: "completed",
            result: {
                ref: {
                    type: "asset",
                    id: foundAsset.id,
                    name: foundAsset.name,
                    iconUrl: foundAsset.url,
                    description: foundAsset.mimeType,
                },
            },
        };
    }
    else {
        return { status: "not_found" };
    }
}
async function getContent(request: GetContentRequest): Promise<GetContentResponse> {
    const { ref } = request;
    const foundAsset = exampleAssets.find((asset) => asset.id === ref.id);
    if (!foundAsset) {
        return {
            status: "app_error",
            message: "Asset not found",
        };
    }
    return {
        status: "completed",
        result: {
            type: "asset",
            asset: mapBaseAssetToURLExpanderAsset(foundAsset),
        },
    };
}
const urlExpander: UrlExpanderIntent = {
    expandUrl,
    getContent,
};
prepareUrlExpander(urlExpander);
