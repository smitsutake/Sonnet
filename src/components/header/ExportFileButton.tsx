import {useState} from "react";
import {Graph} from "@maxgraph/core";
import {Canvg} from 'canvg';
import * as d3 from 'd3';
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ErrorModal, {ErrorModalProps} from "../ErrorModal";
import {useFileContext} from "../context/FileProvider";
import {useGraph} from "../context/GraphContext";
import {returnFocusToGraph} from "../utils/GraphUtils";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import {useFeedbackContext} from "../feedback/feedbackContext";
import {buildColourMap} from "../feedback/feedbackColours";
import {hasGrade} from "../feedback/feedbackTypes";
import {buildAnnotationLayout, buildGradeBanner, collectAnnotations} from "../feedback/feedbackExport";
import {graphRectForInstanceId} from "../feedback/graphAnchors";

const PNG_EXPORT_SCALE = 3;

// Add showGraphSection prop to control Export button enablement
// This ensures Export is only available when user is in "Render Model" interface
const ExportFileButton = ({showGraphSection}: { showGraphSection: boolean }) => {
    const {graph} = useGraph(); // Use the context to get the graph instance
    const {cluster} = useFileContext(); // Get goals and cluster from file context
    const {items: feedbackItems, grade} = useFeedbackContext();
    const [errorModal, setErrorModal] = useState<ErrorModalProps>({
        show: false,
        title: "",
        message: "",
        onHide: () => setErrorModal(prev => ({...prev, show: false}))
    });

    // Simplified logic: Export is only available when showGraphSection is true
    // This means user must be in "Render Model" interface (after clicking "Arrange Hierarchy / Render Model")
    // Produces a copy of the graph's SVG with the feedback comments and their
    // arrows drawn into it.
    //
    // The on-screen overlay is a separate SVG layered above the canvas, so it
    // is never part of what gets serialised. Rather than try to capture two
    // elements, the annotations are rebuilt inside a clone of the graph's own
    // SVG, which keeps the export a single self-contained document.
    const withFeedbackAnnotations = (
        svgElement: SVGSVGElement,
        graphInstance: Graph
    ): SVGSVGElement => {
        const clone = svgElement.cloneNode(true) as SVGSVGElement;
        const gradeToDraw = hasGrade(grade) ? grade : null;
        if (feedbackItems.length === 0 && !gradeToDraw) {
            return clone;
        }

        const container = graphInstance.getContainer();
        const containerRect = container.getBoundingClientRect();

        // graphRectForInstanceId reports page coordinates; the exported SVG is
        // measured from the container's own origin, so shift them across.
        const toSvgSpace = (rect: {left: number; top: number; right: number; width: number; height: number}) => ({
            left: rect.left - containerRect.left + container.scrollLeft,
            top: rect.top - containerRect.top + container.scrollTop,
            right: rect.right - containerRect.left + container.scrollLeft,
            width: rect.width,
            height: rect.height,
        });

        const colourMap = buildColourMap(feedbackItems.map((item) => item.id));
        const annotations = collectAnnotations(
            feedbackItems,
            (itemId) => colourMap[itemId] ?? "#1c5a92",
            (instanceId) => {
                const rect = graphRectForInstanceId(graphInstance, instanceId);
                return rect ? toSvgSpace(rect) : null;
            }
        );

        const width = Number(clone.getAttribute("width")) || container.clientWidth;
        const height = Number(clone.getAttribute("height")) || container.clientHeight;

        const layout = buildAnnotationLayout(annotations, width, 10);
        const newWidth = width + layout.extraWidth;

        // The banner is built at the final width so it spans the comment
        // column too, and everything below it is pushed down by its height.
        const banner = buildGradeBanner(gradeToDraw, newWidth);

        if (layout.markup === "" && banner.markup === "") {
            return clone;
        }

        if (banner.height > 0) {
            // Shift the existing drawing down. maxGraph renders into top-level
            // groups, so moving those moves the whole diagram without touching
            // any of its internal coordinates.
            Array.from(clone.children).forEach((child) => {
                if (child.tagName.toLowerCase() === "defs") {
                    return;
                }
                const existing = child.getAttribute("transform");
                child.setAttribute(
                    "transform",
                    `translate(0, ${banner.height})${existing ? ` ${existing}` : ""}`
                );
            });
        }

        if (layout.markup !== "") {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("data-feedback-annotations", "true");
            group.setAttribute("transform", `translate(0, ${banner.height})`);
            group.innerHTML = layout.markup;
            clone.appendChild(group);
        }

        if (banner.markup !== "") {
            const bannerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            bannerGroup.setAttribute("data-grade-banner", "true");
            bannerGroup.innerHTML = banner.markup;
            clone.appendChild(bannerGroup);
        }

        const newHeight =
            Math.max(height, layout.requiredHeight + 20) + banner.height;
        clone.setAttribute("width", String(newWidth));
        clone.setAttribute("height", String(newHeight));
        // Deliberately no viewBox.
        //
        // The graph's SVG has none, so its contents are drawn at 1:1. Adding
        // one here made Canvg scale the contents to fill a canvas that had
        // already been scaled by PNG_EXPORT_SCALE, so the export came out
        // magnified by the square of that factor and showed only a corner of
        // the diagram.
        // A white backdrop, so the comment column is legible in a PNG.
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("x", "0");
        background.setAttribute("y", "0");
        background.setAttribute("width", String(newWidth));
        background.setAttribute("height", String(newHeight));
        background.setAttribute("fill", "#ffffff");
        clone.insertBefore(background, clone.firstChild);

        return clone;
    };

    const isModelReadyForExport = (): boolean => {
        // Only enable export when user is in Render Model interface
        // AND there are functional goals in the cluster
        return showGraphSection && cluster.ClusterGoals.some((goal) => goal.GoalType === "Functional");
    };

    // Function to get tooltip message based on current state
    const getTooltipMessage = (): string => {
        if (!showGraphSection) {
            return "Please click 'Arrange Hierarchy / Render Model' to enable export.";
        }
        if (cluster.ClusterGoals.length === 0) {
            return "Please add goals to the hierarchy before exporting.";
        }
        if (!cluster.ClusterGoals.some((goal) => goal.GoalType === "Functional")) {
            return "Please add at least one functional goal (Do type) to the hierarchy before exporting.";
        }
        return "Export is ready.";
    };

    const recentreView = (graph: Graph) => {
        if (graph) {
            graph.fit();
            graph.center();
        }
    };

    const findSVGElementInGraph = (graph: Graph) => {
        // Check if the model is ready before proceeding
        if (!isModelReadyForExport()) {
            setErrorModal({
                show: true,
                title: "Cannot Export Model",
                message: getTooltipMessage(),
                onHide: () => setErrorModal(prev => ({...prev, show: false}))
            });
            return null;
        }

        if (!graph) {
            return null;
        }

        recentreView(graph);

        // Clear all selection for no green bounding box
        graph.clearSelection();
        // Get the html holding the SVG
        const svgElement = graph.getContainer().querySelector('svg');

        if (!svgElement) {
            console.error('Failed to find SVG element in the graph container.');
            return null;
        }
        return svgElement;
    };

    // Function to export graph as an image
    const exportGraphAsSVG = async (graph: Graph, includeFeedback = false) => {
        const found = (graph) && findSVGElementInGraph(graph);
        const svgElement = found && includeFeedback
            ? withFeedbackAnnotations(found as SVGSVGElement, graph)
            : found;
        if (!svgElement) {
            return;
        }

        // Serialize the SVG element to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        try {
            // If chromium browser
            if ('showSaveFilePicker' in self) {
                const options: SaveFilePickerOptions = {
                    id: 'exportImage',
                    suggestedName: 'Graph.svg',
                    startIn: 'downloads',
                    types: [{
                        description: 'SVG Image',
                        accept: {'image/svg+xml': ['.svg']}
                    }]
                };
                const handle = await self.showSaveFilePicker(options);
                const writable = await handle.createWritable();
                await writable.write(new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'}));
                await writable.close();
            }
            // Fallback for non chromium browsers
            else {
                // Create a Blob and trigger download
                const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = 'graph.svg';
                link.click();

                // Clean up
                URL.revokeObjectURL(url);
            }
        }

        catch (error) {
            console.error('Failed to save file: ', error);
        }
        // Return focus to graph container to enable keyboard shortcuts
        returnFocusToGraph();
    };

    // Function to export graph as PNG
    const exportGraphAsPNG = async (graph: Graph, includeFeedback = false) => {
        const found = (graph) && findSVGElementInGraph(graph);
        if (!found) {
            return;
        }
        // The annotated variant works on a detached clone, so the white
        // background inserted below never touches what is on screen.
        const svgElement = includeFeedback
            ? withFeedbackAnnotations(found as SVGSVGElement, graph)
            : found;

        // Append a white background rect to the SVG
        // Use D3 to select the SVG and append a white background rect
        const svg = d3.select(svgElement);
        svg.insert("rect", ":first-child")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white");

        // Serialize the SVG element to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Create a canvas element
        //
        // clientWidth/clientHeight are only meaningful for an element that is
        // in the document. The annotated export works on a detached clone,
        // where both read 0, which produced a zero-sized canvas and an empty
        // PNG that the browser refused to download. Fall back to the width and
        // height attributes, which the clone always carries.
        const exportWidth =
            svgElement.clientWidth || Number(svgElement.getAttribute('width')) || 0;
        const exportHeight =
            svgElement.clientHeight || Number(svgElement.getAttribute('height')) || 0;

        if (exportWidth === 0 || exportHeight === 0) {
            console.error('Could not determine export dimensions.');
            return;
        }

        const canvas = document.createElement('canvas');
        // Render at a higher pixel density for a sharper PNG export
        canvas.width = Math.round(exportWidth * PNG_EXPORT_SCALE);
        canvas.height = Math.round(exportHeight * PNG_EXPORT_SCALE);

        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Failed to get canvas context.');
            return;
        }
        context.scale(PNG_EXPORT_SCALE, PNG_EXPORT_SCALE);

        // Use Canvg to render SVG onto the canvas
        const v = Canvg.fromString(context, svgString, {
            ignoreDimensions: true
        });

        // Render SVG onto the canvas
        await v.render();

        // Convert the canvas content to a Blob (PNG format)
        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    if ('showSaveFilePicker' in self) {
                        const options: SaveFilePickerOptions = {
                            id: 'exportImage',
                            suggestedName: 'Graph.png',
                            startIn: 'downloads',
                            types: [{
                                description: 'PNG Image',
                                accept: {'image/png': ['.png']}
                            }]
                        };
                        const handle = await self.showSaveFilePicker(options);
                        const writable = await handle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                    } else {
                        // Fallback for non-Chromium browsers
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'graph.png';
                        link.click();
                        URL.revokeObjectURL(url);
                    }
                } catch (error) {
                    console.error('Failed to save file: ', error);
                }
            }
        }, 'image/png');

        // Return focus to graph container to enable keyboard shortcuts
        returnFocusToGraph();
    };

    // Check if the model is ready for export
    const isReady = isModelReadyForExport();
    const tooltipMessage = getTooltipMessage();

    // Create tooltip overlay for disabled state
    const tooltip = (
        <Tooltip id="export-tooltip">
            {tooltipMessage}
        </Tooltip>
    );

    return (
        <>
            <OverlayTrigger placement="bottom"
                            overlay={tooltip}
                            trigger={(!isReady) ? ['hover', 'focus'] : []}>
                <DropdownButton as={ButtonGroup}
                                title="Export"
                                variant="outline-primary"
                                disabled={!isReady}>
                    <Dropdown.Item onClick={() => exportGraphAsPNG(graph!)}
                                   disabled={!graph}>
                        Export as PNG
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => exportGraphAsSVG(graph!)}
                                   disabled={!graph}>
                        Export as SVG
                    </Dropdown.Item>
                    {/* Only offered when there is feedback to draw, so the menu
                        stays as it was for anyone not using the feature. */}
                    {(feedbackItems.length > 0 || hasGrade(grade)) && (
                        <>
                            <Dropdown.Divider/>
                            <Dropdown.Item onClick={() => exportGraphAsPNG(graph!, true)}
                                           disabled={!graph}>
                                Export as PNG with feedback
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => exportGraphAsSVG(graph!, true)}
                                           disabled={!graph}>
                                Export as SVG with feedback
                            </Dropdown.Item>
                        </>
                    )}
                </DropdownButton>
            </OverlayTrigger>
            <ErrorModal {...errorModal} />
        </>
    );
};

export default ExportFileButton;
