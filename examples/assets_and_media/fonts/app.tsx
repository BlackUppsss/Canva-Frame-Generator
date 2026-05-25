import { Box, Button, ChevronDownIcon, FormField, Rows, Select, Text, TextInput, Title, SegmentedControl, ImageCard, } from "@canva/app-ui-kit";
import type { Font, FontStyle, FontWeightName } from "@canva/asset";
import { findFonts, requestFontSelection } from "@canva/asset";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { useState, useEffect, useCallback } from "react";
import * as styles from "styles/components.css";
import { useFeatureSupport } from "@canva/app-hooks";
type TextConfig = {
    text: string;
    color: string;
    fontWeight: FontWeightName;
    fontStyle: FontStyle;
};
const initialConfig: TextConfig = {
    text: "Hello world",
    color: "#8B3DFF",
    fontWeight: "normal",
    fontStyle: "normal",
};
const fontStyleOptions: {
    value: FontStyle;
    label: FontStyle;
    disabled?: boolean;
}[] = [
    { value: "normal", label: "normal", disabled: false },
    { value: "italic", label: "italic", disabled: false },
];
export const App = () => {
    const isSupported = useFeatureSupport();
    const addElement = [addElementAtPoint, addElementAtCursor].find((fn) => isSupported(fn));
    const [textConfig, setTextConfig] = useState<TextConfig>(initialConfig);
    const [selectedFont, setSelectedFont] = useState<Font | undefined>(undefined);
    const [availableFonts, setAvailableFonts] = useState<readonly Font[]>([]);
    const fetchFonts = useCallback(async () => {
        const response = await findFonts();
        setAvailableFonts(response.fonts);
    }, [setAvailableFonts]);
    useEffect(() => {
        fetchFonts();
    }, [fetchFonts]);
    const { text, fontWeight, fontStyle } = textConfig;
    const disabled = text.trim().length === 0;
    const availableFontWeights = getFontWeights(selectedFont);
    const availableFontStyles = getFontStyles(fontWeight, selectedFont);
    const availableStyleValues = new Set(availableFontStyles.map((style) => style.value));
    const availableFontStyleOptions = fontStyleOptions.map((styleOption) => {
        if (!availableStyleValues.has(styleOption.value)) {
            return { ...styleOption, disabled: true };
        }
        return { ...styleOption, disabled: false };
    });
    const resetSelectedFontStyleAndWeight = (selectedFont?: Font) => {
        setTextConfig((prevState) => {
            return {
                ...prevState,
                fontStyle: getFontStyles(fontWeight, selectedFont)[0]?.value || "normal",
                fontWeight: getFontWeights(selectedFont)[0]?.value || "normal",
            };
        });
    };
    return (<div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          This example demonstrates how apps can apply fonts to text elements
          and add to design.
        </Text>
        <FormField label="Text" value={text} control={(props) => (<TextInput {...props} onChange={(value) => {
                setTextConfig((prevState) => {
                    return {
                        ...prevState,
                        text: value,
                    };
                });
            }}/>)}/>
        <Title size="small">Font selection</Title>
        {availableFonts.length > 0 && (<FormField label="Font family" value={selectedFont?.ref} control={(props) => (<Select {...props} stretch onChange={(ref) => {
                    const selected = availableFonts.find((f) => f.ref === ref);
                    setSelectedFont(selected);
                    resetSelectedFontStyleAndWeight(selected);
                }} options={availableFonts.map((f) => ({
                    value: f.ref,
                    label: f.name,
                }))}/>)}/>)}
        <Button variant="secondary" icon={ChevronDownIcon} iconPosition="end" alignment="start" stretch={true} onClick={async () => {
            const response = await requestFontSelection({
                selectedFontRef: selectedFont?.ref,
            });
            if (response.type === "completed") {
                setSelectedFont(response.font);
                resetSelectedFontStyleAndWeight(response.font);
            }
        }} disabled={disabled}>
          {selectedFont?.name || "Select a font"}
        </Button>
        {selectedFont?.previewUrl && (<Box background="neutralLow" padding="2u" width="full">
            <Rows spacing="0" align="center">
              <Box>
                <ImageCard thumbnailUrl={selectedFont.previewUrl} alt={selectedFont.name}/>
              </Box>
            </Rows>
          </Box>)}
        <Title size="small">Font options</Title>
        <FormField label="Font weight" value={fontWeight} control={(props) => (<Select {...props} stretch onChange={(fontWeight) => {
                setTextConfig((prevState) => {
                    return {
                        ...prevState,
                        fontWeight,
                    };
                });
            }} disabled={!selectedFont || availableFontWeights.length === 0} options={availableFontWeights}/>)}/>
        <FormField label="Font style" value={fontStyle} control={(props) => (<SegmentedControl {...props} options={availableFontStyleOptions} value={fontStyle} onChange={(style) => {
                setTextConfig((prevState) => {
                    return {
                        ...prevState,
                        fontStyle: style,
                    };
                });
            }}/>)}/>
        <Button variant="primary" onClick={() => {
            if (!addElement) {
                return;
            }
            addElement({
                type: "text",
                ...textConfig,
                fontRef: selectedFont?.ref,
                children: [textConfig.text],
            });
        }} disabled={disabled || !addElement} tooltipLabel={!addElement
            ? "This feature is not supported in the current page"
            : undefined} stretch>
          Add text element
        </Button>
      </Rows>
    </div>);
};
const getFontWeights = (font?: Font): {
    value: FontWeightName;
    label: FontWeightName;
}[] => {
    return font
        ? font.weights.map((w) => ({
            value: w.weight,
            label: w.weight,
        }))
        : [];
};
const getFontStyles = (fontWeight: FontWeightName, font?: Font): {
    value: FontStyle;
    label: FontStyle;
}[] => {
    return font
        ? (font.weights
            .find((w) => w.weight === fontWeight)
            ?.styles.map((s) => ({ value: s, label: s })) ?? [])
        : [];
};
