import {Graph} from "@maxgraph/core";
import ColorButtons from "./ColorButtons";
import LineButtons from "./LineButtons";
import ZoomButtons from "./ZoomButtons";
import ScaleTextButton from "../ScaleTextButton";
import {CollapsibleSidebarCard} from "./CollapsibleSidebarCard";

interface SidebarProps {
    graph: Graph | null
    recentreView: () => void
    className?: string
}

const SidebarBody = ({graph, recentreView, className}: SidebarProps) => {
    if (!graph) return null;

    return (
        <div className={`border border-black p-1 rounded ${className}`}>
            <CollapsibleSidebarCard isOpen title="Zoom" tourAnchor="tool-zoom">
                <ZoomButtons recentreView={recentreView}/>
            </CollapsibleSidebarCard>
            <CollapsibleSidebarCard title="Colour" tourAnchor="tool-colour">
                <ColorButtons graph={graph}/>
            </CollapsibleSidebarCard>
            <CollapsibleSidebarCard title="Font size" tourAnchor="tool-font-size">
                <ScaleTextButton/>
            </CollapsibleSidebarCard>
            <CollapsibleSidebarCard title="Line visibility" tourAnchor="tool-lines">
                <LineButtons/>
            </CollapsibleSidebarCard>
        </div>
    );
};

export default SidebarBody;
