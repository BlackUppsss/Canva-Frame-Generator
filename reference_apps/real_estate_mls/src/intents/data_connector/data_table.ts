import type { ColumnConfig, DataTable, DataTableRow, GetDataTableRequest, } from "@canva/intents/data";
import { listings } from "../../data";
export type ListingsDataConfig = {
    propertyTypes?: string[];
};
export const propertyTypeOptions = ["House", "Apartment", "Townhouse"];
const columnConfigs: ColumnConfig[] = [
    { name: "Name", type: "string" as const },
    { name: "Address", type: "string" as const },
    { name: "Suburb", type: "string" as const },
    { name: "Price", type: "string" as const },
    { name: "Type", type: "string" as const },
    { name: "Photo", type: "media" as const },
];
export function getListingsDataTable(request: GetDataTableRequest): DataTable {
    const { dataSourceRef, limit } = request;
    const config = dataSourceRef
        ? (JSON.parse(dataSourceRef.source) as ListingsDataConfig)
        : {};
    const selectedTypes = config.propertyTypes?.length
        ? config.propertyTypes
        : propertyTypeOptions;
    const filtered = listings.filter((listing) => selectedTypes.includes(listing.listingType));
    const rows: DataTableRow[] = filtered.slice(0, limit.row).map((listing) => ({
        cells: [
            { type: "string" as const, value: listing.name },
            { type: "string" as const, value: listing.address },
            { type: "string" as const, value: listing.suburb },
            { type: "string" as const, value: listing.price },
            { type: "string" as const, value: listing.listingType },
            {
                type: "media" as const,
                value: [
                    {
                        type: "image_upload" as const,
                        mimeType: "image/png" as const,
                        url: listing.thumbnail.url,
                        thumbnailUrl: listing.thumbnail.url,
                        width: listing.thumbnail.width,
                        height: listing.thumbnail.height,
                        aiDisclosure: "none" as const,
                    },
                ],
            },
        ],
    }));
    return { columnConfigs, rows };
}
