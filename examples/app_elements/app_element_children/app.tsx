import { Button, FormField, NumberInput, Rows, Text, Title, } from "@canva/app-ui-kit";
import type { AppElementRendererOutput, ShapeElementAtPoint, AppElementOptions, } from "@canva/design";
import { initAppElement } from "@canva/design";
import { useEffect, useState } from "react";
import * as styles from "styles/components.css";
type AppElementData = {
    rows: number;
    columns: number;
    width: number;
    height: number;
    spacing: number;
    rotation: number;
};
type AppElementChangeEvent = {
    data: AppElementData;
    update?: (opts: AppElementOptions<AppElementData>) => Promise<void>;
};
const initialState: AppElementChangeEvent = {
    data: {
        rows: 3,
        columns: 3,
        width: 100,
        height: 100,
        spacing: 25,
        rotation: 0,
    },
};
const appElementClient = initAppElement<AppElementData>({
    render: (data) => {
        const elements: AppElementRendererOutput = [];
        for (let row = 0; row < data.rows; row++) {
            for (let column = 0; column < data.columns; column++) {
                const { width, height, spacing, rotation } = data;
                const top = row * (height + spacing);
                const left = column * (width + spacing);
                const element = createSquareShapeElement({
                    width,
                    height,
                    top,
                    left,
                    rotation,
                });
                elements.push(element);
            }
        }
        return elements;
    },
});
export const App = () => {
    const [state, setState] = useState<AppElementChangeEvent>(initialState);
    const { data: { width, height, rows, columns, spacing, rotation }, } = state;
    const disabled = width < 1 || height < 1 || rows < 1 || columns < 1;
    useEffect(() => {
        appElementClient.registerOnElementChange((appElement) => {
            setState(appElement
                ? { data: appElement.data, update: appElement.update }
                : initialState);
        });
    }, []);
    return (<div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          This example demonstrates how app elements can be made up of one or
          more elements, and how those elements can be positioned relatively to
          one another.
        </Text>
        <Title size="small">Grid</Title>
        <FormField label="Rows" value={rows} control={(props) => (<NumberInput {...props} min={1} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            rows: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <FormField label="Columns" value={columns} control={(props) => (<NumberInput {...props} min={1} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            columns: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <FormField label="Spacing" value={spacing} control={(props) => (<NumberInput {...props} min={1} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            spacing: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <Title size="small">Squares</Title>
        <FormField label="Width" value={width} control={(props) => (<NumberInput {...props} min={1} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            width: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <FormField label="Height" value={height} control={(props) => (<NumberInput {...props} min={1} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            height: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <FormField label="Rotation" value={rotation} control={(props) => (<NumberInput {...props} min={-180} max={180} onChange={(value) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            rotation: Number(value || 0),
                        },
                    };
                });
            }}/>)}/>
        <Button variant="primary" stretch onClick={() => {
            if (state.update) {
                state.update({ data: state.data });
            }
            else {
                appElementClient.addElement({ data: state.data });
            }
        }} disabled={disabled}>
          {`${state.update ? "Update" : "Add"} element`}
        </Button>
      </Rows>
    </div>);
};
const createSquareShapeElement = ({ width, height, top, left, rotation, }: {
    width: number;
    height: number;
    top: number;
    left: number;
    rotation: number;
}): ShapeElementAtPoint => {
    return {
        type: "shape",
        paths: [
            {
                d: `M 0 0 H ${width} V ${height} H 0 L 0 0`,
                fill: {
                    dropTarget: false,
                    color: "#ff0099",
                },
            },
        ],
        viewBox: {
            width,
            height,
            top: 0,
            left: 0,
        },
        width,
        height,
        rotation,
        top,
        left,
    };
};
