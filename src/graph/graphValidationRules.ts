// Limitations from
// https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview

export const limitOnePerGraph = [
    // Only one RTSP source is allowed per graph topology.
    "#Microsoft.Media.MediaGraphRtspSource",
    // HTTP extension processor: There can be at most one such processor per graph topology.
    "#Microsoft.Media.MediaGraphHttpExtension",
    // Motion detection processor: There can be at most one such processor per graph topology.
    "#Microsoft.Media.MediaGraphMotionDetectionProcessor"
];

export const mustBeImmediatelyDownstreamOf = [
    // Frame rate filter processor: Must be immediately downstream from RTSP source or motion detection processor.
    ["#Microsoft.Media.MediaGraphFrameRateFilterProcessor", ["#Microsoft.Media.MediaGraphRtspSource", "#Microsoft.Media.MediaGraphMotionDetectionProcessor"]],
    // Motion detection processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", ["#Microsoft.Media.MediaGraphRtspSource"]],
    // Signal gate processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.Media.MediaGraphSignalGateProcessor", ["#Microsoft.Media.MediaGraphRtspSource"]],
    // Asset sink: Must be immediately downstream from RTSP source or signal gate processor.
    ["#Microsoft.Media.MediaGraphAssetSink", ["#Microsoft.Media.MediaGraphRtspSource", "#Microsoft.Media.MediaGraphSignalGateProcessor"]],
    // File sink: Must be immediately downstream from signal gate processor.
    ["#Microsoft.Media.MediaGraphFileSink", ["#Microsoft.Media.MediaGraphSignalGateProcessor"]]
];

export const cannotBeImmediatelyDownstreamOf = [
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.Media.MediaGraphFileSink", "#Microsoft.Media.MediaGraphHttpExtension"],
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.Media.MediaGraphFileSink", "#Microsoft.Media.MediaGraphMotionDetectionProcessor"],
    // IoT Hub Sink: Cannot be immediately downstream of an IoT Hub Source.
    ["#Microsoft.Media.MediaGraphIoTHubMessageSink", "#Microsoft.Media.MediaGraphIoTHubMessageSource"]
];

export const cannotBeDownstreamOf = [
    // Frame rate filter processor: Cannot be used downstream of a HTTP extension processor.
    ["#Microsoft.Media.MediaGraphFrameRateFilterProcessor", "#Microsoft.Media.MediaGraphHttpExtension"],
    // Frame rate filter processor: Cannot be upstream from a motion detection processor.
    // note the flipped order as this is an upstream rule
    ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", "#Microsoft.Media.MediaGraphFrameRateFilterProcessor"],
    // Motion detection processor: Cannot be used downstream of a HTTP extension processor.
    ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", "#Microsoft.Media.MediaGraphHttpExtension"]
];

export const documentationLinks = {
    limitationsAtPreview: "https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview"
};
