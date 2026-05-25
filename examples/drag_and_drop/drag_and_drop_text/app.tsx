import React, { useState, useCallback } from "react";
import { FormField, Rows, Select, Text, TextInput, Title, TypographyCard, } from "@canva/app-ui-kit";
import type { FontWeight, TextAttributes, TextDragConfig } from "@canva/design";
import { ui } from "@canva/design";
import * as styles from "styles/components.css";
import { useFeatureSupport } from "@canva/app-hooks";
type UIState = {
    text: string;
    fontWeight: FontWeight;
    fontStyle: TextAttributes["fontStyle"];
    decoration: TextAttributes["decoration"];
    textAlign: TextAttributes["textAlign"];
};
const initialState: UIState = {
    text: "Hello world",
    fontWeight: "normal",
    fontStyle: "normal",
    decoration: "none",
    textAlign: "start",
};
export const App = () => {
    const [state, setState] = useState<UIState>(initialState);
    const isSupported = useFeatureSupport();
    const { text, fontWeight, fontStyle, decoration, textAlign } = state;
    const isDragDropSupported = isSupported(ui.startDragToPoint);
    const onDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
        const dragData: TextDragConfig = {
            type: "text",
            children: [text],
            fontWeight,
            fontStyle,
            decoration,
            textAlign,
        };
        if (isSupported(ui.startDragToPoint)) {
            ui.startDragToPoint(event, dragData);
        }
    }, [text, fontWeight, fontStyle, decoration, textAlign, isSupported]);
    return (<div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Text>
          This example demonstrates how apps can support drag-and-drop of
          customizable text elements with styling options.
        </Text>

        {isDragDropSupported ? (<>
            
            <Rows spacing="1u">
              <Title size="small">Text content</Title>
              <FormField label="Text" value={text} control={(props) => (<TextInput {...props} onChange={(value) => {
                    setState((prevState) => ({
                        ...prevState,
                        text: value,
                    }));
                }}/>)}/>
            </Rows>

            
            <Rows spacing="1u">
              <Title size="small">Text styling</Title>

              <FormField label="Font weight" value={fontWeight} control={(props) => (<Select<FontWeight> {...props} stretch onChange={(fontWeight) => {
                    setState((prevState) => ({
                        ...prevState,
                        fontWeight,
                    }));
                }} options={[
                    { value: "normal", label: "Normal" },
                    { value: "light", label: "Light" },
                    { value: "bold", label: "Bold" },
                ]}/>)}/>

              <FormField label="Font style" value={fontStyle} control={(props) => (<Select<TextAttributes["fontStyle"]> {...props} stretch onChange={(fontStyle) => {
                    setState((prevState) => ({
                        ...prevState,
                        fontStyle,
                    }));
                }} options={[
                    { value: "normal", label: "Normal" },
                    { value: "italic", label: "Italic" },
                ]}/>)}/>

              <FormField label="Decoration" value={decoration} control={(props) => (<Select<TextAttributes["decoration"]> {...props} stretch onChange={(decoration) => {
                    setState((prevState) => ({
                        ...prevState,
                        decoration,
                    }));
                }} options={[
                    { value: "none", label: "None" },
                    { value: "underline", label: "Underline" },
                ]}/>)}/>

              <FormField label="Text alignment" value={textAlign} control={(props) => (<Select<TextAttributes["textAlign"]> {...props} stretch onChange={(textAlign) => {
                    setState((prevState) => ({
                        ...prevState,
                        textAlign,
                    }));
                }} options={[
                    { value: "start", label: "Start" },
                    { value: "center", label: "Center" },
                    { value: "end", label: "End" },
                ]}/>)}/>
            </Rows>

            
            <Rows spacing="1u">
              <Title size="small">Preview and drag to design</Title>
              <Text size="small" tone="tertiary">
                Drag the text card below to add it to your design.
              </Text>

              <TypographyCard ariaLabel="Drag text to add to design" onDragStart={onDragStart}>
                <div style={{
                fontWeight,
                fontStyle,
                textDecoration: decoration === "underline" ? "underline" : "none",
                textAlign,
            }}>
                  {text}
                </div>
              </TypographyCard>
            </Rows>
          </>) : (<Rows spacing="2u">
            <Text tone="tertiary">
              Text drag-and-drop is not supported in this design type.
            </Text>
            <Text size="small" tone="tertiary">
              This feature only works in fixed design types like presentations,
              posters, and social media posts. It's not available in responsive
              document types like Canva Docs or Sheets.
            </Text>
          </Rows>)}
      </Rows>
    </div>);
};
