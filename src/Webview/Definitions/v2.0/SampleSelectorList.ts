import Localizer from "../../Localization/Localizer";

export class SamplesList {
    public static gitHubInfo = {
        apiUrl: "https://api.github.com/repos/azure/live-video-analytics/git/trees/master?recursive=1"
    };
    public static getCommandBarItems = (menuItemOnClick: () => void) => {
        return [
            {
                text: Localizer.l("sample.group.continuousRecording"),
                key: "sample.group.continuousRecording",
                subMenuProps: {
                    items: [
                        {
                            text: Localizer.l("sample.cvr-asset"),
                            key: "MediaGraph/topologies/cvr-asset/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-grpcExtension"),
                            key: "MediaGraph/topologies/cvr-with-grpcExtension/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-httpExtension"),
                            key: "MediaGraph/topologies/cvr-with-httpExtension/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.cvr-with-motion"),
                            key: "MediaGraph/topologies/cvr-with-motion/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.audio-video"),
                            key: "MediaGraph/topologies/audio-video/2.0/topology.json",
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
                            text: Localizer.l("sample.evr-grpcExtension-assets"),
                            key: "MediaGraph/topologies/evr-grpcExtension-assets/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-httpExtension-assets"),
                            key: "MediaGraph/topologies/evr-httpExtension-assets/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-hubMessage-assets"),
                            key: "MediaGraph/topologies/evr-hubMessage-assets/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-hubMessage-files"),
                            key: "MediaGraph/topologies/evr-hubMessage-files/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-assets-files"),
                            key: "MediaGraph/topologies/evr-motion-assets-files/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-assets"),
                            key: "MediaGraph/topologies/evr-motion-assets/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.evr-motion-files"),
                            key: "MediaGraph/topologies/evr-motion-files/2.0/topology.json",
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
                            key: "MediaGraph/topologies/motion-detection/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.motion-with-grpcExtension"),
                            key: "MediaGraph/topologies/motion-with-grpcExtension/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.motion-with-httpExtension"),
                            key: "MediaGraph/topologies/motion-with-httpExtension/2.0/topology.json",
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
                            key: "MediaGraph/topologies/grpcExtension/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.httpExtension"),
                            key: "MediaGraph/topologies/httpExtension/2.0/topology.json",
                            onClick: menuItemOnClick
                        },
                        {
                            text: Localizer.l("sample.httpExtensionOpenVINO"),
                            key: "MediaGraph/topologies/httpExtensionOpenVINO/2.0/topology.json",
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
                            text: Localizer.l("sample.lva-spatial-analysis"),
                            key: "MediaGraph/topologies/lva-spatial-analysis/2.0/topology.json",
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
                            key: "MediaGraph/topologies/ai-composition/2.0/topology.json",
                            onClick: menuItemOnClick
                        }
                    ]
                }
            }
        ];
    };
}
