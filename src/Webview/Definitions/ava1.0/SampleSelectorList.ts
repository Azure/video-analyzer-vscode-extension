import Localizer from "../../Localization/Localizer";

export class SamplesList {
    public static gitHubInfo = {
        apiUrl: "https://api.github.com/repos/azure/video-analyzer/git/trees/main?recursive=1"
    };
    public static getCommandBarItems = (menuItemOnClick: () => void) => {
        return [
            {
                text: Localizer.l("sample.group.continuousRecording"),
                key: "sample.group.continuousRecording",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.cvr-video-sink"),
                            key: "pipelines/live/topologies/cvr-video-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-grpcExtension"),
                            key: "pipelines/live/topologies/cvr-with-grpcExtension/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-httpExtension"),
                            key: "pipelines/live/topologies/cvr-with-httpExtension/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-motion"),
                            key: "pipelines/live/topologies/cvr-with-motion/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.audio-video"),
                            key: "pipelines/live/topologies/audio-video/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.eventBasedVideRecording"),
                key: "sample.group.eventBasedVideRecording",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.evr-grpcExtension-video-sink"),
                            key: "pipelines/live/topologies/evr-grpcExtension-video-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-httpExtension-video-sink"),
                            key: "pipelines/live/topologies/evr-httpExtension-video-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-hubMessage-video-sink"),
                            key: "pipelines/live/topologies/evr-hubMessage-video-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-hubMessage-file-sink"),
                            key: "pipelines/live/topologies/evr-hubMessage-file-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-video-sink-file-sink"),
                            key: "pipelines/live/topologies/evr-motion-video-sink-file-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-video-sink"),
                            key: "pipelines/live/topologies/evr-motion-video-sink/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-file-sink"),
                            key: "pipelines/live/topologies/evr-motion-file-sink/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.motionDetection"),
                key: "sample.group.motionDetection",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.motion-detection"),
                            key: "pipelines/live/topologies/motion-detection/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.motion-with-grpcExtension"),
                            key: "pipelines/live/topologies/motion-with-grpcExtension/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.motion-with-httpExtension"),
                            key: "pipelines/live/topologies/motion-with-httpExtension/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.extensions"),
                key: "sample.group.extensions",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.grpcExtension"),
                            key: "pipelines/live/topologies/grpcExtension/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.httpExtension"),
                            key: "pipelines/live/topologies/httpExtension/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.httpExtensionOpenVINO"),
                            key: "pipelines/live/topologies/httpExtensionOpenVINO/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.computerVision"),
                key: "sample.group.computerVision",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.ava-spatial-analysis-person-count"),
                            key: "pipelines/live/topologies/spatial-analysis/person-count-operation-topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.ava-spatial-analysis-person-crossing-line"),
                            key: "pipelines/live/topologies/spatial-analysis/person-line-crossing-operation-topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.ava-spatial-analysis-person-crossing-zone"),
                            key: "pipelines/live/topologies/spatial-analysis/person-zone-crossing-operation-topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.ava-spatial-analysis-person-distance"),
                            key: "pipelines/live/topologies/spatial-analysis/person-distance-operation-topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.ava-spatial-analysis-custom"),
                            key: "pipelines/live/topologies/spatial-analysis/custom-operation-topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.aiComposition"),
                key: "sample.group.aiComposition",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.ai-composition"),
                            key: "pipelines/live/topologies/ai-composition/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            },
            {
                text: Localizer.l("sample.group.miscellaneous"),
                key: "sample.group.miscellaneous",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.object-tracking"),
                            key: "pipelines/live/topologies/object-tracking/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.line-crossing"),
                            key: "pipelines/live/topologies/line-crossing/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            }
        ];
    };
}
