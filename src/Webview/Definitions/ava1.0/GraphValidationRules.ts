// Limitations from
// https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview

export const limitOnePerGraph = [
    // Only one RTSP source is allowed per graph topology.
    "#Microsoft.VideoAnalyzer.GraphRtspSource"
];

export const mustBeImmediatelyDownstreamOf = [
    // Motion detection processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor", ["#Microsoft.VideoAnalyzer.GraphRtspSource"]],
    // Signal gate processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.VideoAnalyzer.GraphSignalGateProcessor", ["#Microsoft.VideoAnalyzer.GraphRtspSource"]],
    // Asset sink: Must be immediately downstream from RTSP source or signal gate processor.
    ["#Microsoft.VideoAnalyzer.GraphAssetSink", ["#Microsoft.VideoAnalyzer.GraphRtspSource", "#Microsoft.VideoAnalyzer.GraphSignalGateProcessor"]],
    // File sink: Must be immediately downstream from signal gate processor.
    ["#Microsoft.VideoAnalyzer.GraphFileSink", ["#Microsoft.VideoAnalyzer.GraphSignalGateProcessor"]]
];

export const cannotBeImmediatelyDownstreamOf = [
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.VideoAnalyzer.GraphFileSink", "#Microsoft.VideoAnalyzer.GraphHttpExtension"],
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.VideoAnalyzer.GraphFileSink", "#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor"],
    // IoT Hub Sink: Cannot be immediately downstream of an IoT Hub Source.
    ["#Microsoft.VideoAnalyzer.GraphIoTHubMessageSink", "#Microsoft.VideoAnalyzer.GraphIoTHubMessageSource"]
];

export const cannotBeDownstreamOf = [
    // Motion detection processor: Cannot be used downstream of a graph extension processor.
    ["#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor", "#Microsoft.VideoAnalyzer.GraphHttpExtension"],
    ["#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor", "#Microsoft.VideoAnalyzer.GraphGrpcExtension"],
    // Motion detection processors cannot be in sequence
    ["#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor", "#Microsoft.VideoAnalyzer.GraphMotionDetectionProcessor"],
    // Signal gate processors cannot be in sequence
    ["#Microsoft.VideoAnalyzer.GraphSignalGateProcessor", "#Microsoft.VideoAnalyzer.GraphSignalGateProcessor"]
];

export const documentationLinks = {
    limitationsAtPreview: "https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview"
};
