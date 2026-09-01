// src/pages/UserManualWeb.tsx
import React from "react";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
import "./UserManualWeb.css";

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
const UserManualWeb: React.FC = () => {
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
                {/* side bar*/}
                <div className="sidebar">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <a href="#introduction" className="nav-link active">
                                1.Introduction
                            </a>
                            <ul className="sub-nav">
                                <li><a href="#about-motivational-models">1.1.About Motivational Models</a></li>
                                <li><a href="#benefits">1.2.Benefits</a></li>
                                <li><a href="#what-is-ammber">1.3.What is AMMBER?</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#getting-started" className="nav-link">2.Getting Started</a>
                            <ul className="sub-nav">
                                <li><a href="#how-to-access">2.1.How to access AMMBER</a></li>
                                <li>
                                    <a href="#navigating">2.2.Navigating the Interface</a>
                                    <ul className="sub-sub-nav">

                                        <li><a href="#landing-page">2.2.1.Landing Page (Home)</a></li>
                                        <li><a href="#landing-elements">2.2.1.1.Main elements</a></li>
                                        <li><a href="#editor-goals">2.2.2.Editor — Enter Goals / Arrange Hierarchy</a></li>
                                        <li><a href="#header">2.2.2.1.Header</a></li>
                                        <li><a href="#navigation-bar">2.2.2.2.Navigation Bar</a></li>
                                        <li><a href="#goal-list-panel">2.2.2.3.Goal List Panel</a></li>
                                        <li><a href="#hierarchy-panel">2.2.2.4.Hierarchy Panel</a></li>
                                        <li><a href="#editor-render">2.2.3.Editor — Arrange Hierarchy / Render Model</a></li>
                                        <li><a href="#render-header">2.2.3.1.Header</a></li>
                                        <li><a href="#render-navbar">2.2.3.2.Navigation Bar</a></li>
                                        <li><a href="#render-hierarchy-panel">2.2.3.3.Hierarchy Panel</a></li>
                                        <li><a href="#model-panel">2.2.3.4.Model Panel</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#core-features" className="nav-link">3.Core Features</a>
                            <ul className="sub-nav">
                                <li><a href="#create-model">3.1.Creating a new model</a></li>
                                <li>
                                    <a href="#editing-goals">3.2.Editing the goals</a>
                                    <ul className="sub-sub-nav">
                                        <li><a href="#adding-new-goal">3.2.1.Adding a new goal</a></li>
                                        <li><a href="#adding-via-goal-list">3.2.1.1.Adding via goal list</a></li>
                                        <li><a href="#adding-via-toolbar">3.2.1.2.Adding via model toolbar</a></li>
                                        <li><a href="#deleting-goals">3.2.2.Deleting existing goal(s)</a></li>
                                        <li><a href="#deleting-via-goal-list">3.2.2.1.Deleting via goal list</a></li>
                                        <li><a href="#deleting-via-hierarchy">3.2.2.2.Deleting via hierarchy</a></li>
                                        <li><a href="#deleting-via-model">3.2.2.3.Deleting via rendered model</a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#editing-model">3.3.Editing the model</a>
                                    <ul className="sub-sub-nav">
                                        <li><a href="#changing-color">3.3.1.Changing the colour</a></li>
                                        <li><a href="#changing-font">3.3.2.Changing the font size</a></li>
                                    </ul>
                                </li>
                                <li><a href="#exporting">3.4.Exporting the model</a></li>
                                <li><a href="#saving">3.5.Saving the model</a></li>
                                <li><a href="#opening">3.6.Opening a saved model</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#bibliography" className="nav-link">Bibliography</a>
                        </li>
                    </ul>
                </div>

                {/* main content */}
                <div className="main-content">
                    <h1 id="introduction">Chapter 1: Introduction</h1>

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

                    <h2 id="what-is-ammber">1.3.What is AMMBER?</h2>
                    <p>
                        AMMBER is a tool to help you create motivational models. The acronym
                        is <strong>A Motivational Model Builder for Essential Requirements</strong>.
                        AMMBER is a refactored and enhanced version of a motivational model
                        editor which was originally developed by a student software engineering
                        team at the University of Melbourne in 2018.
                    </p>

                    <hr />

                    <h1 id="getting-started">Chapter 2:Getting Started</h1>

                    <h2 id="how-to-access">2.1.How to access AMMBER</h2>
                    <p>
                        Everyone is welcome to use AMMBER by accessing the AMMBER website at
                        <a href="https://motivationalmodelling.github.io/mm-local-editor" target="_blank" rel="noopener noreferrer">
                            https://motivationalmodelling.github.io/mm-local-editor
                        </a>
                    </p>

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
                    <h4 id="landing-elements">Main elements:</h4>
                    <ul className="manual-elements-list">
                        <li>
                            <img src={images["2.2.1-createmodel"]} alt="Create Model button" className="inline-icon" />
                            {" "}– Creates a new motivational model. If this is your first time using
                            the builder, a default model will be loaded. Clicking this button navigates
                            to the <a href="#editing-goals">Editor – Enter Goals / Arrange Hierarchy</a> page.
                        </li>
                        <li>
                            <img src={images["2.2.1-openmodel"]} alt="Open Model button" className="inline-icon" />
                            {" "}– Allows you to open a model that was created and saved using this
                            builder, stored on your device in JSON format.
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
                            <a href="#model-panel">Model Builder — Arrange Hierarchy / Render Model</a> page.
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
                            Navigate to  <a href="#model-panel">Editor – Enter Goals /Arrange Hierarchy </a> page.
                        </li>
                        <li>
                            <img src={images["2.2.4-navigatemodel"]} alt="navigate model" className="inline-icon" />
                             Navigate to <a href="#model-panel">Editor – Arrange Hierarchy / Render Model </a> page. Clicking this button creates a model based on the goals and hierarchy defined in the hierarchy view.
                        </li>
                        <li className="inline-buttons-line">
                            <span className="button-group">
                                <img src={images["2.2.4-hidegoalist"]} alt="Hide goal list button" className="inline-icon" />
                                <img src={images["2.2.4-showgoalist"]} alt="Show goal list button" className="inline-icon" />
                            </span>
                            – Click to show/hide the <a href="#goal-list-panel">goal list</a>.
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
                        See <a href="#header">subsubsection 2.2.2.1</a> for more information.
                    </p>

                    <h4 id="render-navbar">2.2.3.2 Navigation Bar</h4>
                    <p>
                        See <a href="#navigation-bar">subsubsection 2.2.2.2</a> for more information.
                    </p>

                    <h4 id="render-hierarchy-panel">2.2.3.3 Hierarchy Panel (Left)</h4>
                    <p>
                        See <a href="#hierarchy-panel">subsubsection 2.2.2.4</a> for more information.
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
                        ⋄ To change the color or font size, you must first select goal(s). See here for a more detailed guide.
                        <br />
                        ⋄ Use the Zoom Toolbar to adjust the view of your model. You can zoom in to see details, fit the model to the screen for an overview, or zoom out to see the overall structure
                    </div>


                    <h1 id="core-features">Chapter 3:Core Features</h1>

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

                    <p>⋄To delete goals as a group: select the goals you want to delete and click <img src={images["3.2.3-deleteselect"]} alt="deleteselect3" className="inline-icon" />
                        at the bottom of the goal list. Note that you can only delete selected goal groups from one category at a time.</p>
                    <figure className="manual-figure">
                        <img src={images["3.2.3-deleteselect2"]} alt="deleteselect2" />
                    </figure>

                    <h4 id="deleting-via-hierarchy">3.2.2.2.Deleting existing goal(s) via hierachy</h4>
                    <ol>
                        <li>In the hierarchy panel, hover over a goal to reveal its action buttons. Click the delete button to remove it.</li>
                        <figure className="manual-figure">
                            <img src={images["3.2.4-delectdo"]} alt="delectdo" />
                        </figure>
                        <li>A warning window will pop up if you are trying to delete a goal with child goals. Click <img src={images["3.2.4-confirmicon"]} alt="confirmicon" className="inline-icon" />
                            to perform the deletion.</li>
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
                        <li>Click <img src={images["3.4-export"]} alt="export2" className="inline-icon" />in the header and choose your desired format (PNG or SVG).</li>
                        <li>A dialogue box will appear for you to select a save location on your local machine.</li>
                        <li>The file will now be saved to the location you selected.</li>
                    </ol>

                    <h2 id="saving">3.5.Saving the model</h2>
                    <ol>
                        <li>Create your model.</li>
                        <li>In the editor page, click <img src={images["3.5-save"]} alt="save2" className="inline-icon" /> in the header and choose your desired format.</li>
                        <li>A dialogue box will appear for you to select a save location on your local machine.</li>
                        <li>A JSON file will now be saved to your selected location for future use.</li>
                    </ol>

                    <h2 id="opening">3.6.Opening a saved model</h2>
                    <ol>
                        <li>You should have saved a model made by AMMBER on your local machine first.
                            Follow this guide if you don’t know how to save the model.</li>

                        <li>Go to AMMBER landing (home) page.</li>
                        <figure className="manual-figure">
                            <img src={images["3.6-home"]} alt="home2" />
                        </figure>
                        <li>Click <img src={images["3.6-openicon"]} alt="openicon" className="inline-icon" /> </li>
                        <li>Click "Drop JSON file here" to open a dialogue box to select the saved model in your local machine.</li>
                        <figure className="manual-figure">
                            <img src={images["3.6-dragfile"]} alt="dragfile" />
                        </figure>
                        <li>After selecting the saved model, click <img src={images["3.6-uploadicon"]} alt="uploadicon" className="inline-icon" /> .</li>
                        <li>You will be navigated to the "Enter Goals / Arrange Hierarchy" page with your saved model.</li>
                        <figure className="manual-figure">
                            <img src={images["3.2.1-edit"]} alt="edit" />
                        </figure>
                    </ol>

                    <hr />

                    <h1 id="bibliography">Bibliography</h1>
                    <ul className="bibliography">
                        <li>
                            <strong>Sterling and Taveter (2009)</strong> — Leon S. Sterling and Kuldar Taveter.
                            <em>The Art of Agent-Oriented Modeling</em>. The MIT Press, 07 2009.
                            ISBN 9780262259217. doi: 10.7551/mitpress/7682.001.0001.
                        </li>
                        <li>
                            <strong>Marshall (2018)</strong> — James Marshall. Agent-based modelling of emotional goals
                            in digital media design projects. In <em>Innovative Methods, User-Friendly Tools, Coding,
                            and Design Approaches in People-Oriented Programming</em>, pages 262–284. IGI Global, 2018.
                        </li>
                        <li>
                            <strong>Lopez Lorca et al. (2018)</strong> — Antonio Lopez Lorca, Rachel Burrows, and Leon Sterling.
                            Teaching motivational models in agile requirements engineering. In <em>2018 IEEE 8th International
                            Workshop on Requirements Engineering Education and Training (REET)</em>, pages 30–39, 2018.
                        </li>
                        <li>
                            <strong>Sterling L. (2017)</strong> — Motivational goal models — the big picture.
                            <a href="https://static1.squarespace.com/static/61136f0c2dddc2734b652409/t/66a9c295d2a1e377d82b0c3c/1722401441685/2%2BMotivational%2BGoal%2BModels%2B%E2%80%93%2BThe%2BBig%2BPicture.pdf" target="_blank" rel="noopener noreferrer">
                                View PDF
                            </a>
                        </li>
                    </ul>
                </div>
            </Container>
        </div>
    );
};

export default UserManualWeb;