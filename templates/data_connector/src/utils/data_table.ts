import type { BooleanDataTableCell, ColumnConfig, DataTable, DataTableCell, DateDataTableCell, NumberDataTableCell, StringDataTableCell, } from "@canva/intents/data";
import type { APIResponseItem } from "src/api/data_source";
export interface DataTableColumn<T extends APIResponseItem> {
    label: string;
    getValue: keyof T | ((result: T) => boolean | string | number | Date);
    toCell: (value: any) => DataTableCell;
}
export function toDataTable<T extends APIResponseItem>(apiData: T[], columns: DataTableColumn<T>[], rowLimit: number): DataTable {
    const items = apiData.slice(0, rowLimit);
    const dataTable: DataTable = {
        columnConfigs: columnConfig(columns),
        rows: [],
    };
    items.forEach((item) => {
        const cells = columns.map((column) => {
            const value = typeof column.getValue === "function"
                ? column.getValue(item)
                : item[column.getValue];
            return column.toCell(value);
        });
        dataTable.rows.push({ cells });
    });
    return dataTable;
}
function columnConfig<T extends APIResponseItem>(columns: DataTableColumn<T>[]): ColumnConfig[] {
    return columns.map((column) => ({
        name: column.label,
        type: column.toCell({} as unknown).type,
    }));
}
export function stringCell(value: string): StringDataTableCell {
    return {
        type: "string",
        value,
    };
}
export function numberCell(value: number, formatting?: string): NumberDataTableCell {
    return {
        type: "number",
        value,
        metadata: {
            formatting,
        },
    };
}
export function booleanCell(value: boolean): BooleanDataTableCell {
    return {
        type: "boolean",
        value,
    };
}
export function dateCell(value: number | Date | string): DateDataTableCell {
    if (typeof value === "string") {
        value = new Date(value);
    }
    if (value instanceof Date) {
        value = value.valueOf() / 1000;
    }
    return {
        type: "date",
        value,
    };
}
