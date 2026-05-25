import { prepareContentPublisher } from "@canva/intents/content";
import { prepareDataConnector } from "@canva/intents/data";
import { prepareDesignEditor } from "@canva/intents/design";
import contentPublisher from "./intents/content_publisher";
import dataConnector from "./intents/data_connector";
import designEditor from "./intents/design_editor";
prepareContentPublisher(contentPublisher);
prepareDataConnector(dataConnector);
prepareDesignEditor(designEditor);
