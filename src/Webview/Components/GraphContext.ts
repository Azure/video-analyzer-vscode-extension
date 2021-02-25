import { createContext } from "react";
import { GraphData } from "../Models/GraphData";

interface GraphContextInterface {
    graph: GraphData;
}

const GraphContext = createContext(<GraphContextInterface>{ graph: new GraphData() });

export default GraphContext;
