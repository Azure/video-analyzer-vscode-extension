export const limitOnePerGraph = [
    // Only one RTSP source is allowed per graph topology.
    "#Microsoft.VideoAnalyzer.RtspSource"
];

export const mustBeImmediatelyDownstreamOf = [
    // Motion detection processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.VideoAnalyzer.MotionDetectionProcessor", ["#Microsoft.VideoAnalyzer.RtspSource"]],
    // Signal gate processor: Must be immediately downstream from RTSP source.
    ["#Microsoft.VideoAnalyzer.SignalGateProcessor", ["#Microsoft.VideoAnalyzer.RtspSource"]],
    // File sink: Must be immediately downstream from signal gate processor.
    ["#Microsoft.VideoAnalyzer.FileSink", ["#Microsoft.VideoAnalyzer.SignalGateProcessor"]],
    // Line Crossing processor: Must be immediately downstream from object tracking processor.
    ["#Microsoft.VideoAnalyzer.LineCrossingProcessor", ["#Microsoft.VideoAnalyzer.ObjectTrackingProcessor"]]
];

export const cannotBeImmediatelyDownstreamOf = [
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.VideoAnalyzer.FileSink", "#Microsoft.VideoAnalyzer.HttpExtension"],
    // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
    ["#Microsoft.VideoAnalyzer.FileSink", "#Microsoft.VideoAnalyzer.MotionDetectionProcessor"],
    // IoT Hub Sink: Cannot be immediately downstream of an IoT Hub Source.
    ["#Microsoft.VideoAnalyzer.IotHubMessageSink", "#Microsoft.VideoAnalyzer.IotHubMessageSource"]
];

export const cannotBeDownstreamOf = [
    // Motion detection processor: Cannot be used downstream of a graph extension processor.
    ["#Microsoft.VideoAnalyzer.MotionDetectionProcessor", "#Microsoft.VideoAnalyzer.HttpExtension"],
    ["#Microsoft.VideoAnalyzer.MotionDetectionProcessor", "#Microsoft.VideoAnalyzer.GrpcExtension"],
    // Motion detection processors cannot be in sequence
    ["#Microsoft.VideoAnalyzer.MotionDetectionProcessor", "#Microsoft.VideoAnalyzer.MotionDetectionProcessor"],
    // Signal gate processors cannot be in sequence
    ["#Microsoft.VideoAnalyzer.SignalGateProcessor", "#Microsoft.VideoAnalyzer.SignalGateProcessor"],
    // ObjectTrackingProcessor cannot be downstream of CognitiveServicesProcessor
    ["#Microsoft.VideoAnalyzer.ObjectTrackingProcessor", "#Microsoft.VideoAnalyzer.CognitiveServicesVisionProcessor"]
];

export const documentationLinks = {
    limitationsAtPreview: "https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview"
};
