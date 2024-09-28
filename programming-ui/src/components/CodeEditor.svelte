<script>
  import { userUuid } from "../stores/stores.js";
  import { onMount } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import { selectedAssignment } from "../stores/assignments.svelte";
  import {
    submitSolutionForGrading,
    getSubmissionsByUser,
  } from "../lib/http-actions/submissions-api.js";
  import { submissionStore } from "../stores/submissions.store.js";
  import "prism-code-editor/prism/languages/markup";
  import "prism-code-editor/prism/languages/python";
  import { insertText } from "prism-code-editor/utils";

  let editorElement;

  let editor;
  let assignment_value;
  // Map to keep track of which submissions are selected for each assignment.
  // selectedAssignment.id -> submission
  let selectedSubmissions;

  const loadSubmission = (submission) => {
    console.log('Loading submission:', submission);
    if (editor && submission.code) {
      insertText(editor, submission.code, 0, editor.value.length, 0, 0);
    }
    selectedSubmissions.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
    console.log('Updated selectedSubmissions:', selectedSubmissions);
  };

  selectedAssignment.subscribe((value) => {
    console.log('Selected assignment changed:', value);
    assignment_value = value;
    if (submissionStore.hasSubmissions(assignment_value.id)) {
      const selectedSubmission = selectedSubmissions.get(assignment_value.id);
      if (selectedSubmission) {
        console.log('Loading selected submission:', selectedSubmission);
        loadSubmission(selectedSubmission);
      } else {
        const lastSubmission = submissionStore.lastSubmission(assignment_value.id);
        if (lastSubmission) {
          console.log('Loading last submission:', lastSubmission);
          loadSubmission(lastSubmission);
        } else {
          console.log('No submission found for assignment:', assignment_value.id);
        }
      }
    }
    else {
      console.log('No submissions found for assignment:', assignment_value.id);
      if (editor) {
        insertText(editor, "# Write your code here", 0, editor.value.length, 0, 0);
      }
    }
  });

  let submissions

  onMount(() => {
    console.log('Component mounted');
    selectedSubmissions = new Map();

    submissions = [];
    submissionStore.subscribe((value) => {
      console.log("SUBMISSIONS STORE UPDATED*****", value);
      submissions = value;
      // take the last submission in the submissions array,
      // when the user clicks on the "submit solution" button
      // this bring the new submission to the focus
      const lastSubmission = submissions[submissions.length - 1];
      if (lastSubmission) {
        loadSubmission(lastSubmission);
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
    if ( assignment_value ) {
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
    <p>{$selectedAssignment.handout}</p>
    <!-- Start of submission timeline -->
    <div class="overflow-x-auto">
      {#if assignment_value && assignment_value.id}
        <div class="join join-vertical w-full">
            {#each submissionStore.getSubmissionsForAssignment(assignment_value.id) as submission (submission.id)}
                  <div class="collapse collapse-arrow join-item border border-base-300">
                    <input type="radio" name="my-accordion-4" checked={selectedSubmissions.get(assignment_value.id)?.id === submission.id} />
                    <div class="collapse-title text-xl font-medium">
                      <div
                        class={`badge gap-2 ${
                          submission.status === 'pending'
                            ? 'badge-warning'
                            : submission.correct
                              ? 'badge-success'
                              : 'badge-error'
                        } ${selectedSubmissions.get(assignment_value.id) && selectedSubmissions.get(assignment_value.id).id === submission.id ? 'badge-primary' : 'badge-outline'}`}
                        on:click={() => handleSubmissionClick(submission)}
                        style="cursor: pointer; transition: background-color 0.3s;"
                      >
                        {submission.status === 'pending' ? 'Pending' : submission.correct ? 'Pass' : 'Fail'}
                      </div>
                      { submission.id }
                    </div>
                    <div class="collapse-content">
                        {#if submission.status !== 'pending' }
                      <p>Grader Feedback: {submission.grader_feedback }</p>
                      {/if}
                    </div>
                  </div>
                {/each}

        </div>
      {:else}
        <p>No assignment selected</p>
      {/if}
    </div>
    <!-- End of submission timeline -->
    <div
      bind:this={editorElement}
      class="textarea textarea-bordered editor-container mb-4 rounded"
      on:keydown={(e) => e.ctrlKey && e.key === 'Enter' && submitSolution()}
    ></div>
    <!-- Buttons: -->
    <div class="card-actions justify-end">
      <button class="btn btn-primary" on:click={submitSolution} >
        Submit solution
        <kbd class="kbd">ctrl</kbd>
        +
        <kbd class="kbd">enter</kbd>
      </button>
    </div>

  </div>
</div>
