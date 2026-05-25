import { Button, Rows, Text } from "@canva/app-ui-kit";
import type { FrameCandidate } from "src/lib/types";
import { insertCandidateToDesign } from "src/lib/canva-insert";
type InsertButtonProps = {
    candidate?: FrameCandidate;
    onStatus: (message: string) => void;
    onError: (message: string) => void;
};
export function InsertButton({ candidate, onStatus, onError }: InsertButtonProps) {
    return (<Rows spacing="1u">
      <Button variant="primary" disabled={!candidate} onClick={async () => {
            if (!candidate) {
                return;
            }
            try {
                const result = await insertCandidateToDesign(candidate);
                if (result.success) {
                    onStatus(result.message);
                }
                else {
                    onError(result.message);
                }
            }
            catch (error) {
                onError(error instanceof Error ? error.message : "Unable to insert the generated shape.");
            }
        }} stretch>
        Insert to Design
      </Button>
      <Text size="small" tone="tertiary">
        Native frame support depends on Canva API capability. Fallback inserts as vector.
      </Text>
    </Rows>);
}
