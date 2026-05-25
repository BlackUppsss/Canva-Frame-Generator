import { Box, Button, Grid, Placeholder, ProgressBar, Rows, Text, } from "@canva/app-ui-kit";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { cancelImageGenerationJob, getImageGenerationJobStatus, } from "src/api/api";
import { useAppContext } from "src/context/use_app_context";
import { Paths } from "src/routes/paths";
const INTERVAL_DURATION_IN_MS = 100;
const TOTAL_PROGRESS_PERCENTAGE = 100;
const LOADING_THRESHOLD_IN_SECONDS = 1;
const manageLoadingProgress = (durationInSeconds: number, loading: boolean, setProgress: (value: number) => void) => {
    let intervalId = 0;
    let progress = 0;
    const totalSteps = (durationInSeconds * 1000) / INTERVAL_DURATION_IN_MS;
    if (loading) {
        intervalId = window.setInterval(() => {
            progress += TOTAL_PROGRESS_PERCENTAGE / totalSteps;
            if (progress >= TOTAL_PROGRESS_PERCENTAGE) {
                clearInterval(intervalId);
            }
            else {
                setProgress(progress);
            }
        }, INTERVAL_DURATION_IN_MS);
    }
    return () => clearInterval(intervalId);
};
export const LoadingResults = ({ durationInSeconds, }: {
    durationInSeconds: number;
}) => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const { isLoadingImages, setIsLoadingImages, jobId, setJobId, promptInput, setGeneratedImages, setRemainingCredits, } = useAppContext();
    useEffect(() => {
        const clearLoadingProgress = manageLoadingProgress(durationInSeconds, isLoadingImages, setProgress);
        const pollJobStatus = async () => {
            if (jobId) {
                try {
                    const { images, credits } = await getImageGenerationJobStatus({
                        jobId,
                    });
                    setGeneratedImages(images);
                    setRemainingCredits(credits);
                    setJobId("");
                    setIsLoadingImages(false);
                }
                catch (error) {
                    if (error === "Job not found") {
                        setJobId("");
                        setIsLoadingImages(false);
                        navigate(Paths.HOME);
                    }
                }
            }
        };
        pollJobStatus();
        return () => {
            clearLoadingProgress();
        };
    }, [
        durationInSeconds,
        isLoadingImages,
        setIsLoadingImages,
        setProgress,
        jobId,
    ]);
    const onCancelClick = async () => {
        await cancelImageGenerationJob(jobId);
        setIsLoadingImages(false);
        navigate(Paths.HOME);
    };
    const intl = useIntl();
    if (durationInSeconds <= LOADING_THRESHOLD_IN_SECONDS) {
        return null;
    }
    return (<Rows spacing="2u">
      <Box paddingTop="4u">
        
        <Grid columns={2} spacing="2u">
          {Array.from({ length: 4 }, (_, index) => (<Placeholder shape="square" key={index}/>))}
        </Grid>
      </Box>
      <Text size="large" alignment="center">
        <FormattedMessage defaultMessage="Generating “<strong>{value}</strong>”. This may take up to a minute." description="A message to indicate that the app is generating an image based on the user's prompt, but that this could take some time" values={{
            value: promptInput,
            strong: (chunks) => <strong>{chunks}</strong>,
        }}/>
      </Text>
      <ProgressBar value={Math.min(progress, 100)} ariaLabel={intl.formatMessage({
            defaultMessage: "image generation",
            description: "An aria label for the progress bar for image generation",
        })}/>
      <Button variant="secondary" onClick={onCancelClick} stretch={true}>
        {intl.formatMessage({
            defaultMessage: "Cancel",
            description: "A button label to stop generating an image",
        })}
      </Button>
    </Rows>);
};
