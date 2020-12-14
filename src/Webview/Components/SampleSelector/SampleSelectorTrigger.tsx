import * as React from "react";
import {
    ActionButton,
    CommandBarButton,
    IContextualMenuItem,
    IContextualMenuProps
} from "@fluentui/react";
import { useConst } from "@uifabric/react-hooks";
import { MediaGraphTopology } from "../../../Common/Types/LVASDKTypes";
import Localizer from "../../Localization/Localizer";
import { OverwriteConfirmation } from "./OverwriteConfirmation";
import { SampleSelector } from "./SampleSelector";
import { Status } from "./statusEnum";

interface ISampleSelectorTriggerProps {
    setTopology: (topology: MediaGraphTopology) => void;
    hasUnsavedChanges: boolean;
}

export const SampleSelectorTrigger: React.FunctionComponent<ISampleSelectorTriggerProps> = (props) => {
    const [status, setStatus] = React.useState<Status>(Status.NoDisplay);
    const [selectedSample, setSelectedSample] = React.useState<string>("");

    const menuItemOnClick = (e: any, item: any) => {
        setStatus(props.hasUnsavedChanges ? Status.ConfirmOverwrite : Status.SelectSample);
        setSelectedSample(item.key);
        setStatus(Status.ConfirmOverwrite);
    };

    const loadTopology = (selectedSample: string) => {
        setStatus(Status.WaitingOnSampleLoad);

        fetch("https://api.github.com/repos/azure/live-video-analytics/git/trees/master?recursive=1")
            .then((response) => response.json() as any)
            .then((data) => data.tree.filter((entry: any) => entry.path === selectedSample)[0].url)
            .then((apiUrl) => fetch(apiUrl))
            .then((response) => response.json() as any)
            .then((data) => atob(data.content))
            .then((topology) => {
                setStatus(Status.NoDisplay);
                props.setTopology(JSON.parse(topology));
            });
    };

    const dismissSelector = () => {
        setStatus(Status.NoDisplay);
    };

    const confirmedOverwrite = () => {
        setStatus(Status.SelectSample);
        loadTopology(selectedSample);
    };

    const menuProps = useConst<IContextualMenuProps>(() => ({
        shouldFocusOnMount: true,
        items: [
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
        ]
    }));

    return (
        <>
            <CommandBarButton iconProps={{ iconName: "Flow" }} menuProps={menuProps}>
                {Localizer.l("sampleSelectorButtonText")}
            </CommandBarButton>

            <OverwriteConfirmation shown={status === Status.ConfirmOverwrite} confirm={confirmedOverwrite} dismiss={dismissSelector} />
        </>
    );
};
