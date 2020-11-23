// Limitations from
// https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview

export default class GraphValidationRules {
    static limitOnePerGraph = [
        // Only one RTSP source is allowed per graph topology.
        "#Microsoft.Media.MediaGraphRtspSource",
    ];

    static mustBeImmediatelyDownstreamOf = [
        // Motion detection processor: Must be immediately downstream from RTSP source.
        ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", ["#Microsoft.Media.MediaGraphRtspSource"]],
        // Signal gate processor: Must be immediately downstream from RTSP source.
        ["#Microsoft.Media.MediaGraphSignalGateProcessor", ["#Microsoft.Media.MediaGraphRtspSource"]],
        // Asset sink: Must be immediately downstream from RTSP source or signal gate processor.
        ["#Microsoft.Media.MediaGraphAssetSink", ["#Microsoft.Media.MediaGraphRtspSource", "#Microsoft.Media.MediaGraphSignalGateProcessor"]],
        // File sink: Must be immediately downstream from signal gate processor.
        ["#Microsoft.Media.MediaGraphFileSink", ["#Microsoft.Media.MediaGraphSignalGateProcessor"]]
    ];

    static cannotBeImmediatelyDownstreamOf = [
        // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
        ["#Microsoft.Media.MediaGraphFileSink", "#Microsoft.Media.MediaGraphHttpExtension"],
        // File sink: Cannot be immediately downstream of HTTP extension processor, or motion detection processor
        ["#Microsoft.Media.MediaGraphFileSink", "#Microsoft.Media.MediaGraphMotionDetectionProcessor"],
        // IoT Hub Sink: Cannot be immediately downstream of an IoT Hub Source.
        ["#Microsoft.Media.MediaGraphIoTHubMessageSink", "#Microsoft.Media.MediaGraphIoTHubMessageSource"]
    ];

    static cannotBeDownstreamOf = [
        // Motion detection processor: Cannot be used downstream of a graph extension processor.
        ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", "#Microsoft.Media.MediaGraphHttpExtension"],
        ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", "#Microsoft.Media.MediaGraphGrpcExtension"],
        // Motion detection processors cannot be in sequence
        ["#Microsoft.Media.MediaGraphMotionDetectionProcessor", "#Microsoft.Media.MediaGraphMotionDetectionProcessor"],
        // Signal gate processors cannot be in sequence
        ["#Microsoft.Media.MediaGraphSignalGateProcessor", "#Microsoft.Media.MediaGraphSignalGateProcessor"]
    ];

    static documentationLinks = {
        limitationsAtPreview:
            "https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/quotas-limitations#limitations-on-graph-topologies-at-preview"
    };
}
