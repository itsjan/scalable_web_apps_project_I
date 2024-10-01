<script>
  import { userUuid } from "../stores/stores.js";
  import { onMount, tick } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import { selectedAssignment } from "../stores/assignments.store.js";
  import { submitSolutionForGrading } from "../lib/http-actions/submissions-api.js";
  import {
    submissionStore,
    resolvedAssignmentIds,
  } from "../stores/submissions.store.js";
  // https://github.com/FIameCaster/prism-code-editor
  import "prism-code-editor/prism/languages/markup";
  import "prism-code-editor/prism/languages/python";
  import { insertText } from "prism-code-editor/utils";

  let editorElement;
  let submissionTimelineElement;

  let editor;
  let assignment_value;
  // Map to keep track of which submissions are selected for each assignment.
  // selectedAssignment.id -> submission
  let selectedSubmissions;

  const loadSubmission = (submission) => {
    // Loads code from a previous submission to the editor.
    // This happends when the user clicks one of the Fail/Pass badges.
    if (editor && submission.code) {
      insertText(editor, submission.code, 0, editor.value.length, 0, 0);
    }
    // Keeps track of which submissions are selected for each assignment.
    selectedSubmissions?.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
  };

  selectedAssignment.subscribe((value) => {
    // When user selects an assignment using the AssignmentSelector component
    assignment_value = value;
    if (submissionStore.hasSubmissions(assignment_value.id)) {
      const selectedSubmission = selectedSubmissions?.get(assignment_value.id);
      if (selectedSubmission) {
        // User has selected a submission for the assignment,
        // keep the UI consistent by loading that submission to the editor
        loadSubmission(selectedSubmission);
      } else {
        // .. otherwise show the latest submission for the assignment
        const lastSubmission = submissionStore.lastSubmission(
          assignment_value.id
        );
        if (lastSubmission) {
          loadSubmission(lastSubmission);
        }
      }
    } else {
      // No submissions found for the selected assignment
      if (editor) {
        insertText(
          // Add placeholder text
          editor,
          "# Your code goes here",
          0,
          editor.value.length,
          0,
          0
        );
      }
    }
  });

  let submissions;

  onMount(() => {
    // Initialize the selectedSubmissions Map
    // This is not persisted in the back-end ..
    // The user is shown the latest submission for each assignment, if any exist
    selectedSubmissions = new Map();
    submissions = [];
    submissionStore.subscribe(async (value) => {
      // User has submitted a new solution
      // the updates come through the web socket
      submissions = value;
      // take the last submission in the submissions array,
      // when the user clicks on the "submit solution" button
      // this brings the new submission to the focus
      const lastSubmission = submissions[submissions.length - 1];
      if (lastSubmission) {
        loadSubmission(lastSubmission);
        // Scroll the timeline to the latest submission
        await tick();
        if (submissionTimelineElement) {
          submissionTimelineElement.scrollTo({
            left: submissionTimelineElement.scrollWidth,
            behavior: "smooth",
          });
        }
      }
    });

    // configure the editor with Python and a dark theme
    if (editorElement) {
      editor = basicEditor(
        editorElement,
        {
          language: "python",
          theme: "github-dark",
        },
        () => {
          console.log("editor ready");
        }
      );
    }
  });

  // Submit button handler (also ctrl + enter)
  const submitSolution = async () => {
    // We check that there is not a submission in progress
    if ($submissionStore.some((submission) => submission.status === "pending"))
      return;
    // This submits the solution
    if (assignment_value) {
      const result = await submitSolutionForGrading(
        assignment_value.id,
        editor.value
      );
    }
  };

  // Submission timeline handler, user clicks on a badge
  const handleSubmissionClick = (submission) => {
    // load submitted code to the editor
    loadSubmission(submission);
    selectedSubmissions.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
  };
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <!-- Assignment -->
    <h2 class="card-title justify-center rounded-sm text-2xl">
      ::: {$selectedAssignment.title} :::
    </h2>
    <p class="handout">
      {$selectedAssignment.handout}
    </p>
    <!-- Editor -->
    <div
      name="code-editor"
      bind:this={editorElement}
      class="editor-container mb-4 text-xl"
      on:keydown={(e) => e.ctrlKey && e.key === "Enter" && submitSolution()}
    ></div>
    <!-- End of editor -->
    <!-- Buttons: -->
    <div class="card-actions place-content-center">
      <!-- Submit solution button -->
      <button
        class="btn btn-primary"
        name="submit-solution"
        disabled={$submissionStore.some(
          (submission) => submission.status === "pending"
        )}
        on:click={submitSolution}
      >
        Submit solution
        <kbd class="kbd kbd-xs">ctrl</kbd>
        <span class="text-xs">+</span>
        <kbd class="kbd kbd-xs">enter</kbd>
      </button>
    </div>
    <!-- End of buttons -->
    <!-- Start of submission timeline -->
    <div class="overflow-x-auto">
      {#if assignment_value && assignment_value.id}
        <div
          bind:this={submissionTimelineElement}
          class="flex overflow-x-auto whitespace-nowrap"
          style="scroll-behavior: smooth;"
        >
          <!-- Submission badges -->
          {#each submissionStore.getSubmissionsForAssignment(assignment_value.id) as submission (submission.id)}
            <div
              class={`badge badge-lg gap-2 mr-2 ${
                submission.status === "pending"
                  ? "skeleton"
                  : submission.correct
                    ? "badge-success"
                    : "badge-error"
              } ${selectedSubmissions.get(assignment_value.id) && selectedSubmissions.get(assignment_value.id).id === submission.id ? "badge-primary" : "badge-outline"}`}
              on:click={() => handleSubmissionClick(submission)}
              on:keydown={(e) =>
                e.key === "Enter" && handleSubmissionClick(submission)}
              style="cursor: pointer; transition: background-color 0.3s;"
            >
              {#if submission.status === "pending"}
                Pending
              {:else if submission.correct}
                Pass
              {:else}
                Fail
              {/if}
            </div>
          {/each}
        </div>
        <!-- Grader feedback -->
        <div
          class="mt-4 p-4 bg-base-200 rounded-lg
              ${selectedSubmissions?.get(assignment_value.id)?.status ===
          'pending'
            ? ' skeleton'
            : ''}"
        >
          <h2 class="text-lg font-semibold mb-2">Grader Feedback:</h2>

          {#if selectedSubmissions?.get(assignment_value.id) && selectedSubmissions.get(assignment_value.id).status !== "pending"}
            <p class="feedback">
              {@html selectedSubmissions
                .get(assignment_value.id)
                .grader_feedback.replace(/\n/g, "<br />")}
            </p>
          {/if}
        </div>
        <!-- End of grader feedback -->
      {:else}
        <p>No assignment selected</p>
      {/if}
    </div>
    <!-- End of submission timeline -->
  </div>
</div>
