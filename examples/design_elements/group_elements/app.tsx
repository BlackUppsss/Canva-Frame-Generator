import { Alert, Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtPoint } from "@canva/design";
import * as styles from "styles/components.css";
import { useFeatureSupport } from "@canva/app-hooks";
export const App = () => {
    const isSupported = useFeatureSupport();
    const isRequiredFeatureSupported = isSupported(addElementAtPoint);
    const handleClick = () => {
        addElementAtPoint({
            type: "group",
            children: [
                {
                    type: "embed",
                    url: "https://www.youtube.com/watch?v=LLFhKaqnWwk",
                    width: 100,
                    height: 100,
                    top: 0,
                    left: 0,
                },
                {
                    type: "embed",
                    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    width: 100,
                    height: 100,
                    top: 0,
                    left: 100,
                },
            ],
        });
    };
    return (<div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Text>
          This example demonstrates how apps can create groups of elements.
        </Text>
        <Button variant="primary" onClick={handleClick} disabled={!isRequiredFeatureSupported} stretch>
          Add group element
        </Button>
        {!isRequiredFeatureSupported && <UnsupportedAlert />}
      </Rows>
    </div>);
};
const UnsupportedAlert = () => (<Alert tone="warn">
    Sorry, the required features are not supported in the current design.
  </Alert>);
