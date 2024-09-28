<script>
  import { userUuid } from "../stores/stores.js";
  import { onMount, tick } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import { selectedAssignment } from "../stores/assignments.svelte";
  import { submitSolutionForGrading } from "../lib/http-actions/submissions-api.js";
  import { submissionStore, resolvedAssignmentIds } from "../stores/submissions.store.js";
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
    console.log("Loading submission:", submission);
    if (editor && submission.code) {
      insertText(editor, submission.code, 0, editor.value.length, 0, 0);
    }
    selectedSubmissions?.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
    console.log("Updated selectedSubmissions:", selectedSubmissions);
  };

  selectedAssignment.subscribe((value) => {
    console.log("Selected assignment changed:", value);
    assignment_value = value;
    if (submissionStore.hasSubmissions(assignment_value.id)) {
      const selectedSubmission = selectedSubmissions?.get(assignment_value.id);
      if (selectedSubmission) {
        console.log("Loading selected submission:", selectedSubmission);
        loadSubmission(selectedSubmission);
      } else {
        const lastSubmission = submissionStore.lastSubmission(
          assignment_value.id
        );
        if (lastSubmission) {
          console.log("Loading last submission:", lastSubmission);
          loadSubmission(lastSubmission);
        } else {
          console.log(
            "No submission found for assignment:",
            assignment_value.id
          );
        }
      }
    } else {
      console.log("No submissions found for assignment:", assignment_value.id);
      if (editor) {
        insertText(
          editor,
          "",0, editor.value.length, 0, 0


        );
      }
    }
  });

  let submissions;

  onMount(() => {
    console.log("Component mounted");
    selectedSubmissions = new Map();

    submissions = [];
    submissionStore.subscribe(async (value) => {
      console.log("SUBMISSIONS STORE UPDATED*****", value);
      submissions = value;
      // take the last submission in the submissions array,
      // when the user clicks on the "submit solution" button
      // this bring the new submission to the focus
      const lastSubmission = submissions[submissions.length - 1];
      if (lastSubmission) {
        loadSubmission(lastSubmission);
        await tick();
        if (submissionTimelineElement) {
          submissionTimelineElement.scrollTo({
            left: submissionTimelineElement.scrollWidth,
            behavior: "smooth",
          });
        }
      }
    });

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

  const submitSolution = async () => {

    if ($submissionStore.some(
      (submission) => submission.status === "pending"
    )) return;
    if (assignment_value) {
      const result = await submitSolutionForGrading(
        assignment_value.id,
        editor.value
      );
    }
  };

  const handleSubmissionClick = (submission) => {
    loadSubmission(submission);
    selectedSubmissions.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
  };
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <!-- Assignment -->
    <h2 class="card-title">{$selectedAssignment.title}</h2>
    <p class="handout">
      {$selectedAssignment.handout}
    </p>
    <!-- Editor -->

        <div bind:this={editorElement}
        class="editor-container mb-4 text-xl"
        on:keydown={(e) => e.ctrlKey && e.key === "Enter" && submitSolution()}
        ></div>
    <!-- End of editor -->
    <!-- Buttons: -->
    <div class="card-actions place-content-center">
      <button
        class="btn btn-primary"
        disabled={$submissionStore.some(
          (submission) => submission.status === "pending"
        )}
        on:click={submitSolution}
      >
        Submit solution
        <kbd class="kbd">ctrl</kbd>
        +
        <kbd class="kbd">enter</kbd>
      </button>

      {#if $resolvedAssignmentIds.includes($selectedAssignment.id)  }
          <button>Next</button>
      {/if}


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
                {@html selectedSubmissions.get(assignment_value.id).grader_feedback.replace(/\n/g, '<br />')}
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

<style>

</style>
