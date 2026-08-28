import {Resizable, ResizeCallback} from "re-resizable";
import React, {useEffect, useRef, useState} from "react";

import ErrorModal from "./ErrorModal";
import FeedbackPanel from "./feedback/FeedbackPanel";
import FeedbackArrows from "./feedback/FeedbackArrows";
import {useFeedbackContext} from "./feedback/feedbackContext";
import GoalList from "./GoalList";
import Tree from "./Tree";
import {useFileContext} from "./context/FileProvider";

import GraphWorker from "./Graphs/GraphWorker";
import {addGoalToTree, updateTextForGoalId} from "./context/treeDataSlice.ts";
import {isEmptyGoal} from "./utils/GoalHint.tsx";
import {TreeGoal, InstanceId} from "./types.ts";

const defaultStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  borderStyle: "solid",
  borderColor: "lightgrey",
  borderWidth: "1px",
  borderRadius: "3px",
};

const DEFINED_PROPORTIONS = {
  maxWidth: "80%",
  minWidth: "10%",
};

const INITIAL_PROPORTIONS = {
  sectionOne: 0.5,
  sectionThree: 0.63,
  sectionsCombine: {
    sectionOne: 0.2,
    sectionThree: 0.5,
  },
};

const DEFAULT_HEIGHT = "800px";

// Starting width of the feedback column. Fixed rather than proportional so
// that turning feedback on does not reflow the three existing panels.
const FEEDBACK_PANEL_WIDTH = 300;



type SectionPanelProps = {
  showGoalSection: boolean;
  showGraphSection: boolean;
  setShowGoalSection: (showGoalSection: boolean) => void;
  paddingX: number;
};

const SectionPanel: React.FC<SectionPanelProps> = ({
  showGoalSection,
  showGraphSection,
  setShowGoalSection,
  paddingX,
}) => {
  const [sectionOneWidth, setSectionOneWidth] = useState(0);
  const [sectionThreeWidth, setSectionThreeWidth] = useState(0);
  const [parentWidth, setParentWidth] = useState(0);

  const [draggedItem, setDraggedItem] = useState<TreeGoal | null>(null);
  // Simply store ids of all items in the tree for fast check instead of recursive search
    const {dispatch, tree} = useFileContext();
    const {reviewerName, items: feedbackItems, fileHadFeedback, selectedItemId} =
    useFeedbackContext();
    // The panel appears for a reviewer, and also for anyone opening a file that
    // already carries feedback so students can read the comments left for them.
    const showFeedbackSection = reviewerName !== null || fileHadFeedback;

  const [groupSelected, setGroupSelected] = useState<TreeGoal[]>([]);

  const [existingItemIds, setExistingItemIds] = useState<number[]>([]);
    const [existingGoalReferenceInstanceId, setExistingGoalReferenceInstanceId] = useState<{goalId: TreeGoal["id"]; instanceId: InstanceId}[]>([])
  const [existingError, setExistingError] = useState<boolean>(false);

  // const [isHintVisible, setIsHintVisible] = useState(true);

  const sectionTwoRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const goalListRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle section one resize and section three auto resize
  const handleResizeSectionOne: ResizeCallback = (_event, _direction, ref) => {
    setSectionOneWidth(ref.offsetWidth);
        if (sectionTwoRef.current) {
            const totalWidth =
                ref.offsetWidth + sectionTwoRef.current.offsetWidth + sectionThreeWidth;

            if (totalWidth >= parentWidth) {
      setSectionThreeWidth(
        parentWidth - ref.offsetWidth - sectionTwoRef.current.offsetWidth
      );
    }
        }
  };
  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle section three resize and section one auto resize
  const handleResizeSectionThree: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    setSectionThreeWidth(ref.offsetWidth);
    // If the width sum exceeds the parent total width, auto resize the section one until reach the minimum
    if (
      sectionTwoRef.current &&
      sectionOneWidth + sectionTwoRef.current.offsetWidth + ref.offsetWidth >=
        parentWidth
    ) {
      setSectionOneWidth(
        parentWidth - ref.offsetWidth - sectionTwoRef.current.offsetWidth
      );
    }
    console.log(sectionOneWidth);
  };

  // Hide the drop error modal automatically after a set time
  const hideErrorModalTimeout = () => {
    const delayTime = 1500;

    // Clear previous timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setExistingItemIds([]);
      setGroupSelected([]);
      setExistingError(false);
    }, delayTime);
  };

  // Handle for goals drop on the nestable section
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      // Temporary Group drop
      if (groupSelected.length > 1) {
          handleDropGroupSelected();
          return;
      }

      if (draggedItem && draggedItem.content) {
            // the first hierachy does not contain the dragged item
            if (!tree.map((item) => item.id).includes(draggedItem.id)) {
              dispatch(addGoalToTree(draggedItem));
          } else {
              setExistingItemIds([...existingItemIds, draggedItem.id]);
              setExistingError(true);
              hideErrorModalTimeout();
          }
      }
  };

  // Add selected items where they are not in the tree to the tree and reset selected items, uncheck the checkboxes
  const handleDropGroupSelected = () => {
    
    // Filter groupSelected to get only objects whose IDs are not in treeData
    const newItemsToAdd = groupSelected.filter(
            // current hierachy
            (item) => !tree.some(
                ref => ref.id === item.id
            )
    );

    // If all items are in the tree, then show the warning
    if (newItemsToAdd.length === 0) {
      setExistingItemIds([...groupSelected.map((item) => item.id)]);
      setExistingError(true);
      hideErrorModalTimeout();
     
      return;
    }

     // Update treeData with new items, filter out the empty items
    const filteredNewItems = newItemsToAdd.filter((item) => !isEmptyGoal(item));
    filteredNewItems.forEach(item => {
      dispatch(addGoalToTree(item)); // Add each item individually
    });

    setGroupSelected([]);
  };

  const handleGroupDropModal = () => {
    setExistingItemIds([]);
    setExistingError(false);
    setGroupSelected([]);
  };

  // Handle synchronize data in table data and tree data
  const handleSynTableTree = (treeItem: TreeGoal, editedText: string) => {
    dispatch(updateTextForGoalId({id: treeItem.id, text: editedText}));
  };

  // Get the parent div inner width and set starter width for section one and section three
  useEffect(() => {
    if (parentRef.current) {
      const newParentWidth = parentRef.current.clientWidth - paddingX * 2;
      setParentWidth(newParentWidth);

      // The hierarchy tree column is dropped entirely while the feedback
      // panel is showing (see below), so the render section can claim the
      // width that column would otherwise have used.
      const remainingWidth = showFeedbackSection
        ? newParentWidth - FEEDBACK_PANEL_WIDTH
        : newParentWidth;

      if (showGoalSection && showGraphSection) {
        setSectionOneWidth(
          newParentWidth * INITIAL_PROPORTIONS.sectionsCombine.sectionOne
        );
        setSectionThreeWidth(
          remainingWidth * INITIAL_PROPORTIONS.sectionsCombine.sectionThree
        );
      }
      else if (showGoalSection) {
        setSectionOneWidth(newParentWidth * INITIAL_PROPORTIONS.sectionOne);
      }
      else if (showGraphSection) {
        setSectionThreeWidth(
          showFeedbackSection
            ? remainingWidth
            : newParentWidth * INITIAL_PROPORTIONS.sectionThree
        );
      }
      else {
        setSectionOneWidth(newParentWidth * INITIAL_PROPORTIONS.sectionOne);
        setSectionThreeWidth(remainingWidth * INITIAL_PROPORTIONS.sectionThree);
      }
    }
  }, [paddingX, showGoalSection, showGraphSection, showFeedbackSection]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: paddingX,
        // Positioning context for the feedback arrow overlay.
        position: "relative",
      }}
      ref={parentRef}
      // onClick={() => setIsHintVisible(false)}
    >
      {/* Additional helper components */}
      <ErrorModal
        show={existingError}
        title="Drop Failed"
        message={`The selected ${(groupSelected.length > 1) ? "goals" : "goal"
        } already ${groupSelected.length > 1 ? "exist" : "exists"}.`}
        onHide={handleGroupDropModal}
      />
      {/* <DragHint isHintVisible={isHintVisible} width={sectionOneWidth-paddingX*2} height={4}/> */}

      {/* Goal List Section */}
      <Resizable
        handleClasses={{right: "right-handler"}}
        enable={{right: true}}
        style={{
          ...defaultStyle,
          backgroundColor: "rgb(236, 244, 244)",
          display: showGoalSection ? "flex" : "none",
        }}
        size={{width: sectionOneWidth, height: "100%"}}
        maxWidth={DEFINED_PROPORTIONS.maxWidth}
        minWidth={DEFINED_PROPORTIONS.minWidth}
        minHeight={DEFAULT_HEIGHT}
        onResize={handleResizeSectionOne}
      >
        {/* First Panel Content */}
        <GoalList
          ref={goalListRef}
          setDraggedItem={setDraggedItem}
          groupSelected={groupSelected} 
          setGroupSelected={setGroupSelected}
          handleSynTableTree={(treeItem: TreeGoal, text: string) => dispatch(updateTextForGoalId({id: treeItem.id, text: text}))}
          handleDropGroupSelected={handleDropGroupSelected}
        />
      </Resizable>

      {/* Cluster Hierarchy Section. Dropped entirely once the feedback panel
          is showing: it is a drag-to-rearrange tool for building the model,
          and a reviewer or a student reading feedback is never doing that --
          the rendered model on the right already shows the same hierarchy. */}
      {!showFeedbackSection && (
        <div
          style={{
            ...defaultStyle,
            width: "100%",
            minWidth: DEFINED_PROPORTIONS.minWidth,
            minHeight: DEFAULT_HEIGHT,
            height: DEFAULT_HEIGHT,
            padding: "10px",
            backgroundColor: "rgba(35, 144, 231, 0.1)",
            overflow: "auto",
          }}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          ref={sectionTwoRef}
        >
          <Tree

            // existingItemIds={existingItemIds}
            // setTreeIds={setTreeIds}
            handleSynTableTree={handleSynTableTree}
            // setExistingItemIds={setExistingItemIds}
            existingGoalReferenceInstanceId={existingGoalReferenceInstanceId}
            setExistingGoalReferenceInstanceId={setExistingGoalReferenceInstanceId}
          />
        </div>
      )}

      {/* Graph Render Section */}
      <Resizable
        handleClasses={{left: "left-handler"}}
        enable={{left: true}}
        style={{
          ...defaultStyle,
          backgroundColor: "rgb(236, 244, 244)",
          display: showGraphSection ? "flex" : "none",
        }}
        size={{
          width: sectionThreeWidth,
          height: "100%",
        }}
        maxWidth={DEFINED_PROPORTIONS.maxWidth}
        minWidth={DEFINED_PROPORTIONS.minWidth}
        minHeight={DEFAULT_HEIGHT}
        onResize={handleResizeSectionThree}
      >
        {/* Third Panel Content */}
        <GraphWorker showGraphSection={showGraphSection}/>
      </Resizable>

      {/* Feedback Section */}
      {showFeedbackSection && (
        <Resizable
          handleClasses={{left: "left-handler"}}
          enable={{left: true}}
          style={{
            ...defaultStyle,
            display: "flex",
          }}
          defaultSize={{width: FEEDBACK_PANEL_WIDTH, height: "100%"}}
          maxWidth={DEFINED_PROPORTIONS.maxWidth}
          minWidth={DEFINED_PROPORTIONS.minWidth}
          minHeight={DEFAULT_HEIGHT}
        >
          <FeedbackPanel/>
        </Resizable>
      )}

      {showFeedbackSection && (
        <FeedbackArrows
          items={feedbackItems}
          containerRef={parentRef}
          selectedItemId={selectedItemId}
        />
      )}
    </div>
  );
};

export default SectionPanel;
