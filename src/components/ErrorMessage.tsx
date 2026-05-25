import { Alert, Text } from "@canva/app-ui-kit";
type ErrorMessageProps = {
    message?: string;
};
export function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) {
        return null;
    }
    return (<Alert tone="critical">
      <Text size="small">{message}</Text>
    </Alert>);
}
