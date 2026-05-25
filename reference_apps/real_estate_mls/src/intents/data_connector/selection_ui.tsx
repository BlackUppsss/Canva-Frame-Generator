import type { RenderSelectionUiRequest } from "@canva/intents/data";
import { Alert, Box, Button, CheckboxGroup, FormField, Rows, Scrollable, Text, } from "@canva/app-ui-kit";
import { useIntl } from "react-intl";
import { propertyTypeOptions } from "./data_table";
import { useDataSelection } from "./use_data_selection";
export const SelectionUi = (request: RenderSelectionUiRequest) => {
    const intl = useIntl();
    const { propertyTypes, setPropertyTypes, error, loading, success, loadData } = useDataSelection(request);
    return (<Scrollable>
      <Box paddingY="2u">
        <Rows spacing="3u">
          <Text size="small" tone="tertiary">
            {intl.formatMessage({
            defaultMessage: "Select which property types to include in your design.",
            description: "Helper text for the data connector selection UI",
        })}
          </Text>
          {error && <Alert tone="critical" title={error}/>}
          {success && (<Alert tone="positive" title={intl.formatMessage({
                defaultMessage: "Data loaded successfully",
                description: "Success message after loading data",
            })}/>)}
          <FormField label={intl.formatMessage({
            defaultMessage: "Property type",
            description: "Label for property type filter",
        })} control={(props) => (<CheckboxGroup {...props} value={propertyTypes} options={propertyTypeOptions.map((type) => ({
                label: type,
                value: type,
            }))} onChange={setPropertyTypes}/>)}/>
          <Button variant="primary" onClick={loadData} loading={loading} stretch>
            {intl.formatMessage({
            defaultMessage: "Load data",
            description: "Button label to load listing data",
        })}
          </Button>
        </Rows>
      </Box>
    </Scrollable>);
};
