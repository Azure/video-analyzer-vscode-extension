export const sampleTopology = {
  "@apiVersion": "1.0",
  name: "EVRtoAssetsOnMotionDetecion",
  properties: {
    description: "Event-based video recording to Assets based on motion events",
    parameters: [{
        name: "rtspUserName",
        type: "String",
        description: "rtsp source user name.",
        default: "dummyUserName",
      },
      {
        name: "rtspPassword",
        type: "String",
        description: "rtsp source password.",
        default: "dummyPassword",
      },
      {
        name: "rtspUrl",
        type: "String",
        description: "rtsp Url",
      },
      {
        name: "motionSensitivity",
        type: "String",
        description: "motion detection sensitivity",
        default: "medium",
      },
      {
        name: "hubSinkOutputName",
        type: "String",
        description: "hub sink output name",
        default: "iothubsinkoutput",
      },
    ],

    sources: [{
      "@type": "#Microsoft.Media.MediaGraphRtspSource",
      name: "rtspSource",
      endpoint: {
        "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
        url: "${rtspUrl}",
        credentials: {
          "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
          username: "${rtspUserName}",
          password: "${rtspPassword}",
        },
      },
    }, ],
    processors: [{
        "@type": "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
        name: "motionDetection",
        sensitivity: "${motionSensitivity}",
        inputs: [{
          nodeName: "rtspSource",
        }, ],
      },
      {
        "@type": "#Microsoft.Media.MediaGraphSignalGateProcessor",
        name: "signalGateProcessor",
        inputs: [{
            nodeName: "motionDetection",
          },
          {
            nodeName: "rtspSource",
          },
        ],
        activationEvaluationWindow: "PT1S",
        activationSignalOffset: "PT0S",
        minimumActivationTime: "PT30S",
        maximumActivationTime: "PT30S",
      },
    ],
    sinks: [{
        "@type": "#Microsoft.Media.MediaGraphAssetSink",
        name: "assetSink",
        assetNamePattern: "sampleAssetFromEVR-LVAEdge-${System.DateTime}",
        segmentLength: "PT0M30S",
        localMediaCacheMaximumSizeMiB: "2048",
        localMediaCachePath: "/var/lib/azuremediaservices/tmp/",
        inputs: [{
          nodeName: "signalGateProcessor",
        }, ],
      },
      {
        "@type": "#Microsoft.Media.MediaGraphIoTHubMessageSink",
        name: "hubSink",
        hubOutputName: "${hubSinkOutputName}",
        inputs: [{
          nodeName: "motionDetection",
        }, ],
      },
    ],
  },
};

export const sampleTopology2 = {
  "@apiVersion": "1.0",
  name: "MotionDetection",
  properties: {
    description: "Analyzing live video to detect motion and emit events",
    parameters: [{
        name: "rtspUserName",
        type: "String",
        description: "rtsp source user name.",
        default: "dummyUserName",
      },
      {
        name: "rtspPassword",
        type: "String",
        description: "rtsp source password.",
        default: "dummyPassword",
      },
      {
        name: "rtspUrl",
        type: "String",
        description: "rtsp Url",
      },
    ],
    sources: [{
      "@type": "#Microsoft.Media.MediaGraphRtspSource",
      name: "rtspSource",
      endpoint: {
        "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
        url: "${rtspUrl}",
        credentials: {
          "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
          username: "${rtspUserName}",
          password: "${rtspPassword}",
        },
      },
    }, ],
    processors: [{
      "@type": "#Microsoft.Media.MediaGraphMotionDetectionProcessor",
      name: "motionDetection",
      sensitivity: "medium",
      inputs: [{
        nodeName: "rtspSource",
      }, ],
    }, ],
    sinks: [{
      "@type": "#Microsoft.Media.MediaGraphIoTHubMessageSink",
      name: "hubSink",
      hubOutputName: "inferenceOutput",
      inputs: [{
        nodeName: "motionDetection",
      }, ],
    }, ],
  },
};

export const evrHubMessageAssets = {
  "@apiVersion": "1.0",
  "name": "EVRtoAssetsOnObjDetect",
  "properties": {
    "description": "Event-based video recording to Assets based on specific objects being detected by external inference engine",
    "parameters": [{
        "name": "rtspUserName",
        "type": "String",
        "description": "rtsp source user name.",
        "default": "dummyUserName"
      },
      {
        "name": "rtspPassword",
        "type": "String",
        "description": "rtsp source password.",
        "default": "dummyPassword"
      },
      {
        "name": "rtspUrl",
        "type": "String",
        "description": "rtsp Url"
      },
      {
        "name": "hubSourceInput",
        "type": "String",
        "description": "input name for hub source",
        "default": "recordingTrigger"
      },
      {
        "name": "inferencingUrl",
        "type": "String",
        "description": "inferencing Url",
        "default": "http://yolov3/score"
      },
      {
        "name": "inferencingUserName",
        "type": "String",
        "description": "inferencing endpoint user name.",
        "default": "dummyUserName"
      },
      {
        "name": "inferencingPassword",
        "type": "String",
        "description": "inferencing endpoint password.",
        "default": "dummyPassword"
      },
      {
        "name": "imageEncoding",
        "type": "String",
        "description": "image encoding for frames",
        "default": "bmp"
      },
      {
        "name": "hubSinkOutputName",
        "type": "String",
        "description": "hub sink output name",
        "default": "detectedObjects"
      }
    ],
    "sources": [{
        "@type": "#Microsoft.Media.MediaGraphRtspSource",
        "name": "rtspSource",
        "endpoint": {
          "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
          "url": "${rtspUrl}",
          "credentials": {
            "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
            "username": "${rtspUserName}",
            "password": "${rtspPassword}"
          }
        }
      },
      {
        "@type": "#Microsoft.Media.MediaGraphIoTHubMessageSource",
        "name": "iotMessageSource",
        "hubInputName": "${hubSourceInput}"
      }
    ],
    "processors": [{
        "@type": "#Microsoft.Media.MediaGraphSignalGateProcessor",
        "name": "signalGateProcessor",
        "inputs": [{
            "nodeName": "iotMessageSource"
          },
          {
            "nodeName": "rtspSource"
          }
        ],
        "activationEvaluationWindow": "PT1S",
        "activationSignalOffset": "-PT5S",
        "minimumActivationTime": "PT30S",
        "maximumActivationTime": "PT30S"
      },
      {
        "@type": "#Microsoft.Media.MediaGraphFrameRateFilterProcessor",
        "name": "frameRateFilter",
        "maximumFps": "1.0",
        "inputs": [{
          "nodeName": "rtspSource"
        }]
      },
      {
        "@type": "#Microsoft.Media.MediaGraphHttpExtension",
        "name": "inferenceClient",
        "endpoint": {
          "@type": "#Microsoft.Media.MediaGraphUnsecuredEndpoint",
          "url": "${inferencingUrl}",
          "credentials": {
            "@type": "#Microsoft.Media.MediaGraphUsernamePasswordCredentials",
            "username": "${inferencingUserName}",
            "password": "${inferencingPassword}"
          }
        },
        "image": {
          "scale": {
            "mode": "preserveAspectRatio",
            "width": "416",
            "height": "416"
          },
          "format": {
            "@type": "#Microsoft.Media.MediaGraphImageFormatEncoded",
            "encoding": "${imageEncoding}"
          }
        },
        "inputs": [{
          "nodeName": "frameRateFilter"
        }]
      }
    ],
    "sinks": [{
        "@type": "#Microsoft.Media.MediaGraphIoTHubMessageSink",
        "name": "hubSink",
        "hubOutputName": "${hubSinkOutputName}",
        "inputs": [{
          "nodeName": "inferenceClient"
        }]
      },
      {
        "@type": "#Microsoft.Media.MediaGraphAssetSink",
        "name": "assetSink",
        "assetNamePattern": "sampleAssetFromEVR-LVAEdge-${System.DateTime}",
        "segmentLength": "PT30S",
        "LocalMediaCacheMaximumSizeMiB": "2048",
        "localMediaCachePath": "/var/lib/azuremediaservices/tmp/",
        "inputs": [{
          "nodeName": "signalGateProcessor"
        }]
      }
    ]
  }
};