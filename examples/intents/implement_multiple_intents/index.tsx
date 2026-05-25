import { prepareContentPublisher } from "@canva/intents/content";
import { prepareDesignEditor } from "@canva/intents/design";
import contentPublisher from "./intents/content_publisher";
import designEditor from "./intents/design_editor";
prepareContentPublisher(contentPublisher);
prepareDesignEditor(designEditor);
