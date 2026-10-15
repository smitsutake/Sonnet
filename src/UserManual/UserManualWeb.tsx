// src/pages/UserManualWeb.tsx
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
import "./UserManualWeb.css";
import React, { useState, useEffect } from "react";


/* Navigation tree  */


type Anchor = { id: string; title: string };
type Section = {
    id: string;
    title: string;
    anchors?: Anchor[]; // in-page sub-sections (scroll within the section page)
};
type Chapter = {
    id: string;
    title: string;
    heading: string;
    children: Section[];
};

const nav: Chapter[] = [
    {
        id: "introduction",
        title: "1. Introduction",
        heading: "Chapter 1: Introduction",
        children: [
            { id: "about-motivational-models", title: "1.1. About Motivational Models" },
            { id: "benefits", title: "1.2. Benefits" },
            { id: "what-is-ammber", title: "1.3. What is AMMBER?" },
        ],
    },
    {
        id: "getting-started",
        title: "2. Getting Started",
        heading: "Chapter 2: Getting Started",
        children: [
            { id: "how-to-access", title: "2.1. How to access AMMBER" },
            {
                id: "navigating",
                title: "2.2. Navigating the Interface",
                anchors: [
                    { id: "landing-page", title: "2.2.1. Landing Page (Home)" },
                    { id: "landing-staffmode", title: "2.2.1.1. Staff Home Page" },
                    { id: "editor-goals", title: "2.2.2. Editor — Enter Goals / Arrange Hierarchy" },
                    { id: "header", title: "2.2.2.1. Header" },
                    { id: "navigation-bar", title: "2.2.2.2. Navigation Bar" },
                    { id: "goal-list-panel", title: "2.2.2.3. Goal List Panel" },
                    { id: "hierarchy-panel", title: "2.2.2.4. Hierarchy Panel" },
                    { id: "editor-render", title: "2.2.3. Editor — Arrange Hierarchy / Render Model" },
                    { id: "render-header", title: "2.2.3.1. Header" },
                    { id: "render-navbar", title: "2.2.3.2. Navigation Bar" },
                    { id: "render-hierarchy-panel", title: "2.2.3.3. Hierarchy Panel" },
                    { id: "model-panel", title: "2.2.3.4. Model Panel" },
                    { id: "feedback-panel", title: "2.2.3.5. Feedback Panel (Staff Review)" },
                ],
            },
        ],
    },
    {
        id: "core-features",
        title: "3. Core Features",
        heading: "Chapter 3: Core Features",
        children: [
            { id: "create-model", title: "3.1. Creating a new model" },
            {
                id: "editing-goals",
                title: "3.2. Editing the goals",
                anchors: [
                    { id: "adding-new-goal", title: "3.2.1. Adding a new goal" },
                    { id: "adding-via-goal-list", title: "3.2.1.1. Adding via goal list" },
                    { id: "adding-via-toolbar", title: "3.2.1.2. Adding via model toolbar" },
                    { id: "deleting-goals", title: "3.2.2. Deleting existing goal(s)" },
                    { id: "deleting-via-goal-list", title: "3.2.2.1. Deleting via goal list" },
                    { id: "deleting-via-hierarchy", title: "3.2.2.2. Deleting via hierarchy" },
                    { id: "deleting-via-model", title: "3.2.2.3. Deleting via rendered model" },
                ],
            },
            {
                id: "editing-model",
                title: "3.3. Editing the model",
                anchors: [
                    { id: "changing-color", title: "3.3.1. Changing the colour" },
                    { id: "changing-font", title: "3.3.2. Changing the font size" },
                ],
            },
            { id: "exporting", title: "3.4. Exporting the model" },
            { id: "saving", title: "3.5. Saving the model" },
            { id: "opening", title: "3.6. Opening a saved model" },
            {
                id: "staffm",
                title: "3.7. Staff Mode Instruction",
                anchors: [{ id: "feedbacking", title: "3.7.1. Adding feedback comments to model" }],
            },
            { id: "viewm", title: "3.8. Student Reviewing Feedback" },
        ],
    },
    { id: "bibliography", title: "Bibliography", heading: "Bibliography", children: [] },
];

// which chapter does a page id belong to?
const chapterOf = (pageId: string) =>
    nav.find((c) => c.id === pageId || c.children.some((s) => s.id === pageId))!;

// flat list of all section pages, used for the Previous / Next buttons
const allSections: Section[] = nav.flatMap((c) => c.children);

/* Images  */


// import all images from the image folder.
const imageModules = import.meta.glob<{ default: string }>(
    "./images/*.png",
    { eager: true }
);

// Create a mapping of { "2.2.1-createmodel": "packaged URL", ... }
const images: Record<string, string> = {};
for (const path in imageModules) {
    // path  "./image/2.2.1-createmodel.png"
    const fileName = path.split("/").pop()!.replace(".png", "");
    images[fileName] = imageModules[path].default;
}


/* Component  */


const UserManualWeb: React.FC = () => {
    const [page, setPage] = useState<string>("introduction");
    const [anchor, setAnchor] = useState<string | null>(null);
    const [navKey, setNavKey] = useState(0); // bumps on every navigation so the scroll effect always runs

    const goTo = (id: string, anchorId?: string) => {
        setPage(id);
        setAnchor(anchorId ?? null);
        setNavKey((k) => k + 1);
    };

    // after the page renders, scroll to the anchor (or back to top)
    useEffect(() => {
        if (anchor) {
            document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0 });
        }
    }, [navKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // in-content link helper: `to` = page (section) id, `anchorId` = heading id inside that page
    const link = (to: string, anchorId: string | undefined, text: React.ReactNode) => (
        <a
            href={`#${anchorId ?? to}`}
            onClick={(e) => {
                e.preventDefault();
                goTo(to, anchorId);
            }}
        >
            {text}
        </a>
    );

    /*  page content */

    const content: Record<string, React.ReactNode> = {
        /*  Chapter 1*/
        "about-motivational-models": (
            <>
                <h2 id="about-motivational-models">1.1.About Motivational Models</h2>
                <p>
                    Motivational models are diagrams that depict the goals and motivations
                    of a system or a service. They present a hierarchical structure of the
                    goals of the system at a high-level of abstraction. The models capture
                    roles of system stakeholders, the functional goals of the system -
                    what the system will do, the quality goals of the system - how the
                    system will be, and emotional goals, which represent both the desired
                    positive feelings of people when interacting with the system, and
                    possible concerns.
                </p>
                <p>
                    Motivational models have evolved from goal models as presented in
                    agent-oriented modelling (Sterling and Taveter, 2009). The models have
                    their roots in goal models from the early agent-oriented methodologies,
                    notably Gaia (Wooldridge et al., 2000). ROADMAP as described in (Juan et al, 2002)
                    extended Gaia and was part of significant research in agent-oriented
                    software engineering. In agent-oriented methodologies, goals were used
                    to specify what behaviours agents needed to achieve, though not how
                    the behaviour operated. As described in Sterling and Taveter (2009),
                    goals become increasingly more abstract and needed to be depicted at a
                    high level of abstraction.
                </p>
            </>
        ),

        "benefits": (
            <>
                <h2 id="benefits">1.2.Benefits of Motivational Modelling</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <h4>Enhancing Communication</h4>
                        <p>
                            A motivational model facilitates communication between diverse
                            stakeholders. Our high-level models are easy to understand and
                            have been tested across hundreds of projects, ensuring clarity
                            and effectiveness.
                        </p>
                    </div>
                    <div className="benefit-card">
                        <h4>Allowing for Ambiguity</h4>
                        <p>
                            At the outset of a project, it can be difficult for stakeholders
                            to fully understand their differences. Allowing ambiguity during
                            initial discussions, with later resolution, supports positive
                            collaboration and helps participants align more effectively
                            over time.
                        </p>
                    </div>
                    <div className="benefit-card">
                        <h4>Encouraging Emotional Engagement</h4>
                        <p>
                            A key factor in project success is ensuring participants are
                            emotionally engaged. Being explicit about emotional expectations
                            from the start encourages positive participation and strengthens
                            commitment from all involved.
                        </p>
                    </div>
                </div>
            </>
        ),

        "what-is-ammber": (
            <>
                <h2 id="what-is-ammber">1.3.What is AMMBER?</h2>
                <p>
                    AMMBER is a tool to help you create motivational models. The acronym
                    is <strong>A Motivational Model Builder for Essential Requirements</strong>.
                    AMMBER is a refactored and enhanced version of a motivational model
                    editor which was originally developed by a student software engineering
                    team at the University of Melbourne in 2018.
                </p>
            </>
        ),

        /* Chapter 2 */
        "how-to-access": (
            <>
                <h2 id="how-to-access">2.1.How to access AMMBER</h2>
                <p>
                    Everyone is welcome to use AMMBER by accessing the AMMBER website at{" "}
                    <a href="https://motivationalmodelling.github.io/mm-local-editor" target="_blank" rel="noopener noreferrer">
                        https://motivationalmodelling.github.io/mm-local-editor
                    </a>
                </p>
            </>
        ),

        "navigating": (
            <>
                <h2 id="navigating">2.2.Navigating the Interface</h2>
                <p>
                    This section provides an overview of the three main pages of AMMBER.
                    Each page has a specific purpose and set of controls that guide you
                    through building/opening, editing, and visualising motivational models.
                </p>

                <h3 id="landing-page">2.2.1.Landing Page (Home)</h3>
                <p>The entry point where you can create a new model or open an existing one.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.1-ammberhomepage"]} alt="Ammber Homepage" />
                </figure>
                <h4>Main elements:</h4>
                <ul className="manual-elements-list">
                    <li>
                        <img src={images["2.2.1-createmodel"]} alt="Create Model button" className="inline-icon" />
                        {" "}– Creates a new motivational model. If this is your first time using
                        the builder, a default model will be loaded. Clicking this button navigates
                        to the {link("navigating", "editor-goals", "Editor – Enter Goals / Arrange Hierarchy")} page.
                    </li>
                    <li>
                        <img src={images["2.2.1-openmodel"]} alt="Open Model button" className="inline-icon" />
                        {" "}– Allows you to open a model that was created and saved using this
                        builder, stored on your device in JSON format.
                    </li>
                    <li>
                        <img src={images["2.2.1-staffmode"]} alt="staffmode" className="inline-icon" />
                        {" "}– Switch to Staff Mode for lecturer/client to reviewing and grading the model.
                    </li>
                    <li>
                        <img src={images["4.2-reviewmodelicon"]} alt="reviewmodel" className="inline-icon" />
                        {" "}– Allows students to view the graded model, including the feedback comments and grade
                        added by staff.
                    </li>
                </ul>

                <h4 id="landing-staffmode">2.2.1.1.Staff Home Page</h4>
                <p>When a user clicks the "Staff Mode" button, the system displays a "Name Input Page," requiring the staff member (instructor or client) to enter their name before accessing Staff Mode to view and rate the model.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.1-entername"]} alt="entername" />
                </figure>
                <p>
                    Once the name is submitted, the user is taken to the Staff Mode homepage, shown below.
                </p>
                <figure className="manual-figure">
                    <img src={images["2.2.1-staffhomepage"]} alt="staff Homepage" />
                </figure>
                <h4>Main elements:</h4>
                <ul className="manual-elements-list">
                    <li>
                        <img src={images["2.2.1-createmodel"]} alt="CreateModelb" className="inline-icon" />
                        {" "}/{" "}
                        <img src={images["2.2.1-openmodel"]} alt="OpenModelb" className="inline-icon" />
                        {" "}– Same as in the standard homepage. See {link("navigating", "landing-page", "2.2.1 Landing Page (Home)")} for details.
                    </li>
                    <li>
                        <img src={images["2.2.1-markmodel"]} alt="MarkModel" className="inline-icon" />
                        {" "}– Allows staff to open and grade an existing model. Clicking this button navigates to the marking/review interface, where staff can view the model and assign scores or feedback.
                    </li>
                    <li>
                        <img src={images["2.2.1-staffchange"]} alt="Staff change" className="inline-icon" />
                        {" "}– Once Staff Mode is activated, the staffmode button turns grey and displays "Staff mode: on", with the staff member's entered name shown beside it, confirming the current staff identity.
                    </li>
                </ul>

                <h3 id="editor-goals">2.2.2.Editor — Enter Goals / Arrange Hierarchy</h3>
                <p>This page is to enter goals, classify them by type, and arrange them into a hierarchy as the basis of your motivational model.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.2-editmodel"]} alt="Edit model" />
                </figure>

                <h4 id="header">2.2.2.1.Header</h4>
                <p>There is a header included 4 buttons on top of each page, where the user could click to do a specific task.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.3-header"]} alt="header" />
                </figure>
                <h4>Buttons in the Header:</h4>
                <ul>
                    <li>
                        <img src={images["2.2.3-reset"]} alt="Reset button" className="inline-icon" />
                        <strong>Reset</strong> — Resets the model to either the default model or an empty model.
                    </li>
                    <li>
                        <img src={images["2.2.3-export"]} alt="Export button" className="inline-icon" />
                        <strong>Export</strong> — Allows you to export the graph in PNG or SVG format. Only available in{" "}
                        {link("navigating", "editor-render", "Model Builder — Arrange Hierarchy / Render Model")} page.
                    </li>
                    <li>
                        <img src={images["2.2.3-save"]} alt="Save button" className="inline-icon" />
                        <strong>Save</strong> — Allows you to save the model in JSON format for future use.
                    </li>
                    <li>
                        <img src={images["2.2.3-home"]} alt="Home button" className="inline-icon" />
                        <strong>Home</strong> — Navigates back to AMMBER home page.
                    </li>
                </ul>

                <h4 id="navigation-bar">2.2.2.2.Navigation Bar</h4>
                <p>Below the header, there is a navigation bar with two buttons that take the user to the corresponding subpages. Note that if a button is blue, it indicates the current page.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.4-navigatebar"]} alt="navigatebar" />
                </figure>
                <h4>Main elements in the Navigation Bar:</h4>
                <ul>
                    <li>
                        <img src={images["2.2.4-arrangehierachy"]} alt="arrange hierachy" className="inline-icon" />
                        Navigate to {link("navigating", "editor-goals", "Editor – Enter Goals / Arrange Hierarchy")} page.
                    </li>
                    <li>
                        <img src={images["2.2.4-navigatemodel"]} alt="navigate model" className="inline-icon" />
                        Navigate to {link("navigating", "editor-render", "Editor – Arrange Hierarchy / Render Model")} page. Clicking this button creates a model based on the goals and hierarchy defined in the hierarchy view.
                    </li>
                    <li className="inline-buttons-line">
                        <span className="button-group">
                            <img src={images["2.2.4-hidegoalist"]} alt="Hide goal list button" className="inline-icon" />
                            <img src={images["2.2.4-showgoalist"]} alt="Show goal list button" className="inline-icon" />
                        </span>
                        – Click to show/hide the {link("navigating", "goal-list-panel", "goal list")}.
                    </li>
                </ul>
                <div className="note">
                    <strong>Note:</strong> The model is only created after the first time you click this button
                    and only the goals in the hierarchy view will be included (goals in the goal list won’t be included).
                </div>

                {/* 2.2.2.3 Goal List Panel */}
                <h4 id="goal-list-panel">2.2.2.3 Goal List Panel (Left)</h4>
                <figure className="manual-figure">
                    <img src={images["2.2.5-goalistpanel"]} alt="Goal List Panel" />
                </figure>
                <p>
                    In the goal list panel, there are five categories into which items can be
                    entered: do, be, feel, concern, and who. Do, be, feel are goals, who is a
                    stakeholder, and concern is effectively an 'anti-goal,' which correspond
                    to the elements of the do–be–feel framework.
                </p>
                <p>
                    Entering items into these lists is straightforward. Goals can be dragged
                    from the goal list on the left and dropped into the hierarchy view to
                    include them in the model and manage the hierarchy.
                </p>
                <h4>Main elements in the Goal List Panel:</h4>
                <ul className="manual-elements-list">
                    <li>
                        <img src={images["2.2.5-addtogoal"]} alt="Add goal button" className="inline-icon" />
                        {" "}– Adds a new goal to the goal list.
                    </li>
                    <li>
                        <img src={images["2.2.5-deletegoal"]} alt="Delete goal button" className="inline-icon" />
                        {" "}– Deletes an existing goal in the goal list.
                    </li>
                    <li>
                        <img src={images["2.2.5-addgroup"]} alt="Add Group button" className="inline-icon" />
                        {" "}– Allows you to add a group of selected goals to the hierarchy.
                    </li>
                    <li>
                        <img src={images["2.2.5-delectselect"]} alt="Delete Selected button" className="inline-icon" />
                        {" "}– Allows you to delete a group of selected goals from the goal list.
                    </li>
                </ul>

                {/* 2.2.2.4 Hierarchy Panel */}
                <h4 id="hierarchy-panel">2.2.2.4 Hierarchy Panel (Right)</h4>
                <p>
                    Goals from the goal list can be transferred into the hierarchy view to
                    support the organisation of hierarchical relationships. Within this view,
                    the relative positions of goals inside a cluster can be adjusted to
                    refine the hierarchical structure. For instance, repositioning a goal
                    horizontally within a cluster enables the construction or modification
                    of parent–child relationships.
                </p>
                <p>
                    To incorporate goals into the hierarchy, you may drag a goal from the
                    goal list and drop it into a cluster. Alternatively, one or more goals
                    can be selected, and the Add Group function can be used to add them
                    simultaneously.
                </p>
                <p>
                    To organise the graph hierarchy, you can drag the goals to different
                    positions. Adjust their positions within a cluster (left or right) to
                    refine the hierarchical structure. Drag left to deepen the hierarchy and
                    right to bring it up a level. You can also hide/expand the sub-goals by
                    clicking on the –/+ sign.
                </p>
                <figure className="manual-figure">
                    <img src={images["2.2.6-hierachypanel"]} alt="Hierarchy Panel" />
                </figure>

                <h3 id="editor-render">2.2.3.Editor — Arrange Hierarchy / Render Model</h3>
                <p>View your motivational model as a diagram for analysis or presentation.</p>
                <figure className="manual-figure">
                    <img src={images["2.2.7-modelbuilder"]} alt="Model Builder" />
                </figure>

                <hr />
                <h4 id="render-header">2.2.3.1 Header</h4>
                <p>
                    See {link("navigating", "header", "subsubsection 2.2.2.1")} for more information.
                </p>

                <h4 id="render-navbar">2.2.3.2 Navigation Bar</h4>
                <p>
                    See {link("navigating", "navigation-bar", "subsubsection 2.2.2.2")} for more information.
                </p>

                <h4 id="render-hierarchy-panel">2.2.3.3 Hierarchy Panel (Left)</h4>
                <p>
                    See {link("navigating", "hierarchy-panel", "subsubsection 2.2.2.4")} for more information.
                </p>

                <h4 id="model-panel">2.2.3.4.Model Panel (Right)</h4>
                <p>
                    In the model panel, goals are represented as a structured hierarchical model. The layout of the model is generated automatically to enhance efficiency and reduce manual effort. Nonetheless, users retain the ability to select and drag individual goals to manually adjust their positions when finer control is required.
                </p>
                <p>
                    A toolbar positioned adjacent to the model provides controls for adjusting the model view and modifying goal presentation styles.
                    Additionally, new goals can be introduced directly into the model by dragging the goal symbol from the toolbar into the hierarchy view.
                </p>
                <p>
                    Once the model has been finalised, AMMBER offers functionality to export the model in PNG or SVG formats, as well as to save the model as a JSON file to support future editing or collaborative use.
                </p>
                <figure className="manual-figure">
                    <img src={images["2.2.8-modelpanel"]} alt="Model Panel" />
                </figure>
                <div className="note">
                    <strong>Note:</strong>
                    <br />
                    ⋄ To change the color or font size, you must first select goal(s). See{" "}
                    {link("editing-model", "changing-color", "here")} for a more detailed guide.
                    <br />
                    ⋄ Use the Zoom Toolbar to adjust the view of your model. You can zoom in to see details, fit the model to the screen for an overview, or zoom out to see the overall structure
                </div>

                <h4 id="feedback-panel">2.2.3.5 Feedback Panel (Staff Review)</h4>
                <p>
                    When AMMBER is opened in staff review mode, a <strong>Feedback panel</strong> appears
                    on the right-hand side of the editor, alongside the goal list or hierarchy view. It
                    remains visible across both the "Enter Goals / Arrange Hierarchy" and "Arrange
                    Hierarchy / Render Model" stages, allowing staff to leave comments on a student's
                    model at any point while reviewing it.
                </p>
                <p>
                    The panel header shows who is currently reviewing the model (e.g. "Reviewing as
                    staff1"). If no comments have been added yet, a placeholder message "No feedback
                    yet. Use + to add the first comment." is displayed.
                </p>
                <figure className="manual-figure">
                    <img src={images["4.1-markmodelpage"]} alt="markmodelpage" />
                </figure>
                <figure className="manual-figure">
                    <img src={images["4.1-markmodelpage2"]} alt="markmodelpage2" />
                </figure>
                <h4>New elements in the Feedback Panel:</h4>
                <ul className="manual-elements-list">
                    <li>
                        <img src={images["4.1-addfeedbackicon"]} alt="Addfeedbackbutton" className="inline-icon" />
                        {" "}– Adds a new comment to the panel.
                    </li>
                </ul>
            </>
        ),

        /*  Chapter 3 */
        "create-model": (
            <>
                <h2 id="create-model">3.1.Creating a new model (with default goals)</h2>
                <ol>
                    <li>Click the 'Create Model' button in the landing page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.1-creatmodel"]} alt="c model" />
                    </figure>
                    <li>The default goals should appear. Click "Arrange Hierarchy / Render Model" button to generate the model, or edit the goals if needed.</li>
                    <figure className="manual-figure">
                        <img src={images["3.1-rendermodel"]} alt="r model" />
                    </figure>
                    <li>You can now see the rendered model on the right.</li>
                    <figure className="manual-figure">
                        <img src={images["3.1-rendermodel2"]} alt="r model2" />
                    </figure>
                </ol>
            </>
        ),

        "editing-goals": (
            <>
                <h2 id="editing-goals">3.2.Editing the goals</h2>

                <h3 id="adding-new-goal">3.2.1.Adding a new goal</h3>
                <p>You can add a new goal to the model via the goal list or the model toolbar directly.</p>

                <h4 id="adding-via-goal-list">3.2.1.1.Adding a new goal via goal list</h4>
                <ol>
                    <li>If you have not already, go to the "Enter Goals / Arrange Hierarchy" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-edit"]} alt="edit" />
                    </figure>
                    <li>Choose the category of the new goal you want to create.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-category"]} alt="category" />
                    </figure>
                    <li>Add a new goal to the goal list by clicking <img src={images["3.2.1-add"]} alt="add" className="inline-icon" /> and entering the goal name.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-newgoal"]} alt="newgoal" />
                    </figure>
                    <li>Drag the goal to the hierarchy panel on the left.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-goalierachy"]} alt="goalhierachy" />
                    </figure>
                    <li>The goal will now appear in the rendered model if you go to the model panel.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-appear"]} alt="appear" />
                    </figure>
                </ol>

                <h4 id="adding-via-toolbar">3.2.1.2.Adding a new goal via model toolbar</h4>
                <ol>
                    <li>If you have not already, go to the "Arrange Hierarchy / Render Model" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.2-arrangehierachy"]} alt="arrangehierachy" />
                    </figure>
                    <li>Drag a goal from the toolbar to the model.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.2-drag"]} alt="drag" />
                    </figure>
                </ol>

                <h3 id="deleting-goals">3.2.2.Deleting existing goal(s)</h3>
                <p>You can delete existing goals individually or as a group. Similar to adding goals, the deletion can be done by multiple ways: via the goal list, the hierarchy view or the rendered model.</p>
                <div className="note">
                    <strong>Note:</strong> Deleting a goal also deletes its child goals and any copies of it.
                </div>

                <h4 id="deleting-via-goal-list">3.2.2.1.Deleting existing goal(s) via goal list</h4>
                <p>⋄To delete a single goal from the list: click <img src={images["3.2.3-deleteicon"]} alt="deleteicon" className="inline-icon" /> in its row.</p>
                <figure className="manual-figure">
                    <img src={images["3.2.3-delete"]} alt="delete" />
                </figure>
                <p>
                    ⋄To delete goals as a group: select the goals you want to delete and click{" "}
                    <img src={images["3.2.3-deleteselect"]} alt="deleteselect3" className="inline-icon" />
                    {" "}at the bottom of the goal list. Note that you can only delete selected goal groups from one category at a time.
                </p>
                <figure className="manual-figure">
                    <img src={images["3.2.3-deleteselect2"]} alt="deleteselect2" />
                </figure>

                <h4 id="deleting-via-hierarchy">3.2.2.2.Deleting existing goal(s) via hierachy</h4>
                <ol>
                    <li>In the hierarchy panel, hover over a goal to reveal its action buttons. Click the delete button to remove it.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.4-delectdo"]} alt="delectdo" />
                    </figure>
                    <li>
                        A warning window will pop up if you are trying to delete a goal with child goals. Click{" "}
                        <img src={images["3.2.4-confirmicon"]} alt="confirmicon" className="inline-icon" />
                        {" "}to perform the deletion.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["3.2.4-deletewarning"]} alt="delectwarning" />
                    </figure>
                </ol>

                <h4 id="deleting-via-model">3.2.2.3.Deleting existing goal(s) via rendered model</h4>
                <ol>
                    <li>If you have not already, go to the "Arrange Hierarchy / Render Model" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.5-hier"]} alt="hier" />
                    </figure>
                    <li>Select goals in the model by clicking on them or dragging a selection box. To select multiple individual goals, hold down the Ctrl key (or Cmd on Mac) and click on them.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.5-ctrl"]} alt="ctrl" />
                    </figure>
                    <li>Press the Delete key on your keyboard to remove them.</li>
                </ol>
            </>
        ),

        "editing-model": (
            <>
                <h2 id="editing-model">3.3.Editing the model</h2>

                <h3 id="changing-color">3.3.1.Changing the colour of a goal in the model</h3>
                <ol>
                    <li>If you haven't already, go to "Arrange Hierarchy / Render Model" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.5-hier"]} alt="hier" />
                    </figure>
                    <li>Select goal(s) in the model by clicking on them or dragging a selection box. To select multiple individual goals, hold down the <kbd>Ctrl</kbd> key (or <kbd>Cmd</kbd> on Mac) and click on them.</li>
                    <figure className="manual-figure">
                        <img src={images["3.3.1-selectgoal"]} alt="selectgoal" />
                    </figure>
                    <li>Click the <img src={images["3.3.1-coloricon"]} alt="coloricon" className="inline-icon" /> in the toolbar to explore the colour options.</li>
                    <li>Pick a colour option.</li>
                    <figure className="manual-figure">
                        <img src={images["3.3.1-coloroption"]} alt="coloroption" />
                    </figure>
                    <li>Changes will be applied to the selected goal(s).</li>
                    <figure className="manual-figure">
                        <img src={images["3.3.1-selectgoal"]} alt="selectgoal" />
                    </figure>
                </ol>

                <h3 id="changing-font">3.3.2.Changing the font size within a goal in the model</h3>
                <ol>
                    <li>If you haven't already, go to "Arrange Hierarchy / Render Model" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.5-hier"]} alt="hier" />
                    </figure>
                    <li>Select goal(s) in the model by clicking on them or dragging a selection box. To select multiple individual goals, hold down the <kbd>Ctrl</kbd> key (or <kbd>Cmd</kbd> on Mac) and click on them.</li>
                    <figure className="manual-figure">
                        <img src={images["3.3.1-selectgoal"]} alt="selectgoal" />
                    </figure>
                    <li>Click <img src={images["3.3.2-fonticon"]} alt="fonticon" className="inline-icon" /> in the toolbar to reveal the font controller.</li>
                    <li>Enter a new font size for the goal(s) you selected.</li>
                    <figure className="manual-figure">
                        <img src={images["3.3.2-font"]} alt="font" />
                    </figure>
                </ol>
            </>
        ),

        "exporting": (
            <>
                <h2 id="exporting">3.4.Exporting the model</h2>
                <div className="note">
                    <strong>Note:</strong> You can only export a model after it has been rendered. Empty models cannot be exported.
                </div>
                <ol>
                    <li>Create and render your model.</li>
                    <li>Go to the "Arrange Hierarchy / Render Model" page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.5-hier"]} alt="hier" />
                    </figure>
                    <li>Click <img src={images["3.4-export"]} alt="export2" className="inline-icon" /> in the header and choose your desired format (PNG or SVG).</li>
                    <li>A dialogue box will appear for you to select a save location on your local machine.</li>
                    <li>The file will now be saved to the location you selected.</li>
                </ol>
            </>
        ),

        "saving": (
            <>
                <h2 id="saving">3.5.Saving the model</h2>
                <ol>
                    <li>Create your model.</li>
                    <li>In the editor page, click <img src={images["3.5-save"]} alt="save2" className="inline-icon" /> in the header and choose your desired format.</li>
                    <li>A dialogue box will appear for you to select a save location on your local machine.</li>
                    <li>A JSON file will now be saved to your selected location for future use.</li>
                </ol>
            </>
        ),

        "opening": (
            <>
                <h2 id="opening">3.6.Opening a saved model</h2>
                <ol>
                    <li>
                        You should have saved a model made by AMMBER on your local machine first.
                        Follow {link("saving", undefined, "this guide")} if you don’t know how to save the model.
                    </li>
                    <li>Go to AMMBER landing (home) page.</li>
                    <figure className="manual-figure">
                        <img src={images["3.6-home"]} alt="home2" />
                    </figure>
                    <li>Click <img src={images["3.6-openicon"]} alt="openicon" className="inline-icon" /></li>
                    <li>Click "Drop JSON file here" to open a dialogue box to select the saved model in your local machine.</li>
                    <figure className="manual-figure">
                        <img src={images["3.6-dragfile"]} alt="dragfile" />
                    </figure>
                    <li>After selecting the saved model, click <img src={images["3.6-uploadicon"]} alt="uploadicon" className="inline-icon" />.</li>
                    <li>You will be navigated to the "Enter Goals / Arrange Hierarchy" page with your saved model.</li>
                    <figure className="manual-figure">
                        <img src={images["3.2.1-edit"]} alt="edit" />
                    </figure>
                </ol>
            </>
        ),

        "staffm": (
            <>
                <h2 id="staffm">3.7.Staff Mode Instruction</h2>
                <ol>
                    <li>
                        Click <img src={images["2.2.1-staffmode"]} alt="Staffmode" className="inline-icon" />
                        {" "}in the top-right corner of the homepage.
                    </li>
                    <li>Enter your name to enter Staff Mode.</li>
                    <figure className="manual-figure">
                        <img src={images["2.2.1-entername"]} alt="Entername" />
                    </figure>
                    <li>Now you are in Staff mode page.</li>
                    <figure className="manual-figure">
                        <img src={images["2.2.1-staffhomepage"]} alt="staffppage" />
                    </figure>
                </ol>

                <h3 id="feedbacking">3.7.1.Adding feedback comments to model</h3>
                <ol>
                    <li>After enter staff page, click <img src={images["2.2.1-markmodel"]} alt="markmodel" className="inline-icon" />.</li>
                    <li>
                        Upload or drag and drop the JSON file into the drop zone, then click
                        {" "}<img src={images["3.6-uploadicon"]} alt="Upload button" className="inline-icon" />
                        {" "}to confirm.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["4.1-dropmodel"]} alt="dropmodel" />
                    </figure>
                    <li>Once in the feedback panel interface, click "Arrange Hierarchy / Render Model" to view the complete model diagram.</li>
                    <figure className="manual-figure">
                        <img src={images["4.1-arrangehier"]} alt="arrangehier" />
                    </figure>
                    <li>
                        Click the <img src={images["4.1-addfeedbackicon"]} alt="Add feedback button" className="inline-icon" />
                        {" "}button under "Feedback" to create a new feedback entry (multiple entries can be created at once).
                    </li>
                    <li>Enter your feedback in the text box.</li>
                    <figure className="manual-figure">
                        <img src={images["4.1-newfeedback"]} alt="Feedbackcomment" />
                    </figure>
                    <li>
                        Click <img src={images["4.1-linkgoalicon"]} alt="Link goal button" className="inline-icon" />
                        {" "}to link the feedback to the corresponding goal.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["4.1-linkgoal"]} alt="linkgoal" />
                    </figure>
                    <li>
                        Click <img src={images["4.1-deleteicon"]} alt="Delete button" className="inline-icon" />
                        {" "}to remove the feedback.
                    </li>
                </ol>
            </>
        ),

        "viewm": (
            <>
                <h2 id="viewm">3.8.Student Reviewing Feedback</h2>
                <ol>
                    <li>
                        Click <img src={images["4.2-reviewmodelicon"]} alt="reviewi" className="inline-icon" />
                        {" "}in the homepage.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["4.2-reviewmodel"]} alt="reviewmo" />
                    </figure>
                    <li>
                        Upload the model that have been revied by teacher/staff then click{" "}
                        <img src={images["3.6-uploadicon"]} alt="Upload button" className="inline-icon" />
                        {" "}to confirm.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["4.2-upload"]} alt="uploadr" />
                    </figure>
                    <li>Now you can reviewing your feedback. Click "Arrange Hierarchy / Render Model" in the navigation bar to view the model diagram.</li>
                    <figure className="manual-figure">
                        <img src={images["4.2-enter"]} alt="reviewpage" />
                    </figure>
                    <figure className="manual-figure">
                        <img src={images["4.2-arrange"]} alt="reviewpage2" />
                    </figure>
                    <li>
                        Click a feedback comment in the Feedback panel. A dashed arrow will point from the
                        comment to the goal(s) it refers to.
                    </li>
                    <figure className="manual-figure">
                        <img src={images["4.2-link"]} alt="feedbacklink" />
                    </figure>
                    <li>Click the same comment again to hide the arrow.</li>
                </ol>
            </>
        ),

        /*  Bibliography  */
        "bibliography": (
            <>
                <h1 id="bibliography">Bibliography</h1>
                <ul className="bibliography">
                    <li>
                        <strong>Sterling and Taveter (2009)</strong> — Leon S. Sterling and Kuldar Taveter.{" "}
                        <em>The Art of Agent-Oriented Modeling</em>. The MIT Press, 07 2009.
                        ISBN 9780262259217. doi: 10.7551/mitpress/7682.001.0001.
                    </li>
                    <li>
                        <strong>Marshall (2018)</strong> — James Marshall. Agent-based modelling of emotional goals
                        in digital media design projects. In{" "}
                        <em>Innovative Methods, User-Friendly Tools, Coding,
                            and Design Approaches in People-Oriented Programming</em>, pages 262–284. IGI Global, 2018.
                    </li>
                    <li>
                        <strong>Lopez Lorca et al. (2018)</strong> — Antonio Lopez Lorca, Rachel Burrows, and Leon Sterling.
                        Teaching motivational models in agile requirements engineering. In{" "}
                        <em>2018 IEEE 8th International
                            Workshop on Requirements Engineering Education and Training (REET)</em>, pages 30–39, 2018.
                    </li>
                    <li>
                        <strong>Sterling L. (2017)</strong> — Motivational goal models — the big picture.{" "}
                        <a
                            href="https://static1.squarespace.com/static/61136f0c2dddc2734b652409/t/66a9c295d2a1e377d82b0c3c/1722401441685/2%2BMotivational%2BGoal%2BModels%2B%E2%80%93%2BThe%2BBig%2BPicture.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View PDF
                        </a>
                    </li>
                </ul>
            </>
        ),
    };

    /*  what to show  */

    const activeChapter = chapterOf(page);
    const isChapterPage = activeChapter.id === page;
    const isBibliography = page === "bibliography";

    const renderMain = () => {
        if (isBibliography) return content["bibliography"];

        // chapter page: chapter title + list of its sections
        if (isChapterPage) {
            return (
                <>
                    <h1 id={activeChapter.id}>{activeChapter.heading}</h1>
                    <ul className="chapter-index">
                        {activeChapter.children.map((s) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goTo(s.id);
                                    }}
                                >
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            );
        }

        // section page: full content of that section only
        return content[page];
    };

    // previous / next section (across chapters)
    const idx = allSections.findIndex((s) => s.id === page);
    const prev = idx > 0 ? allSections[idx - 1] : null;
    const next = idx >= 0 && idx < allSections.length - 1 ? allSections[idx + 1] : null;

    /*  render*/

    return (
        <div className="user-manual-web">
            <div className="manual-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            <span className="logo-icon">📘</span>
                            <span className="logo-text">AMMBER</span>
                            <span className="version-tag">v2026.1</span>
                        </div>
                        <Link to="/" className="back-link">← Back to Home</Link>
                    </div>
                </div>
            </div>

            <Container className="manual-content">
                {/* side bar */}
                <div className="sidebar">
                    <ul className="nav-list">
                        {nav.map((ch) => {
                            const chapterActive = activeChapter.id === ch.id;
                            return (
                                <li className="nav-item" key={ch.id}>
                                    <a
                                        href={`#${ch.id}`}
                                        className={`nav-link ${page === ch.id ? "active" : ""}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            goTo(ch.id);
                                        }}
                                    >
                                        {ch.title}
                                    </a>

                                    {/* only the active chapter is expanded */}
                                    {chapterActive && ch.children.length > 0 && (
                                        <ul className="sub-nav">
                                            {ch.children.map((s) => (
                                                <li key={s.id}>
                                                    <a
                                                        href={`#${s.id}`}
                                                        className={page === s.id ? "active" : ""}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            goTo(s.id);
                                                        }}
                                                    >
                                                        {s.title}
                                                    </a>

                                                    {/* only the active section shows its in-page anchors */}
                                                    {page === s.id && s.anchors && (
                                                        <ul className="sub-sub-nav">
                                                            {s.anchors.map((a) => (
                                                                <li key={a.id}>
                                                                    <a
                                                                        href={`#${a.id}`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            goTo(s.id, a.id);
                                                                        }}
                                                                    >
                                                                        {a.title}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* main content */}
                <div className="main-content">
                    {renderMain()}

                    {!isChapterPage && !isBibliography && (
                        <div className="page-nav">
                            {prev ? (
                                <button type="button" onClick={() => goTo(prev.id)}>← {prev.title}</button>
                            ) : (
                                <span />
                            )}
                            {next ? (
                                <button type="button" onClick={() => goTo(next.id)}>{next.title} →</button>
                            ) : (
                                <span />
                            )}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default UserManualWeb;