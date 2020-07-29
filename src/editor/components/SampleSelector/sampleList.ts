import { IDropdownOption } from "office-ui-fabric-react";

export const sampleOptionsList: IDropdownOption[] = [
  {
    text: "Continuous video recording to an Azure Media Services Asset",
    key: "cvr-asset",
  },
  {
    text: "Continuous video recording and inferencing using HTTP Extension",
    key: "cvr-with-httpExtension",
  },
  {
    text: "Continuous video recording with Motion Detection",
    key: "cvr-with-motion",
  },
  {
    text:
      "Event-based video recording to Assets based on events from external AI",
    key: "evr-httpExtension-assets",
  },
  {
    text:
      "Event-based video recording to Assets based on specific objects being detected by external inference engine",
    key: "evr-hubMessage-assets",
  },
  {
    text:
      "Event-based recording of video to files based on messages sent via IoT Edge Hub",
    key: "evr-hubMessage-files",
  },
  {
    text:
      "Event-based video recording to assets and local files based on motion events",
    key: "evr-motion-assets-files",
  },
  {
    text: "Event-based video recording to Assets based on motion events",
    key: "evr-motion-assets",
  },
  {
    text: "Event-based video recording to local files based on motion events",
    key: "evr-motion-files",
  },
  {
    text:
      "Analyzing live video using HTTP Extension to send images to an external inference engine",
    key: "httpExtension",
  },
  {
    text: "Analyzing live video to detect motion and emit events",
    key: "motion-detection",
  },
  {
    text:
      "Event-based video recording to Assets based on motion events, and using HTTP Extension to send images to an external inference engine",
    key: "motion-with-httpExtension",
  },
];
