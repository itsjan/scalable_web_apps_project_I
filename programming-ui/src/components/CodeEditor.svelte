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
      console.log("SUBMISSIONS STORE UPDATED", value);
      submissions = value;
      console.log('Current selectedSubmissions:', selectedSubmissions);
      if (submissions.length === 1 && !selectedSubmissions.has(submissions[0].programming_assignment_id)) {
        console.log('Loading single submission:', submissions[0]);
        loadSubmission(submissions[0]);
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
      console.log('Submitting solution for assignment:', assignment_value.id);
      const result = await submitSolutionForGrading(
        assignment_value.id,
        editor.value
      );
      console.log('Submission result:', result);
    }
  };

  const handleSubmissionClick = (submission) => {
    console.log('Submission clicked:', submission);
    loadSubmission(submission);
    selectedSubmissions.set(submission.programming_assignment_id, submission);
    selectedSubmissions = selectedSubmissions;
    console.log('Updated selectedSubmissions after click:', selectedSubmissions);
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
        <div class="flex flex-wrap gap-2">
          {#each $submissionStore.filter(sub => sub.programming_assignment_id === assignment_value.id) as submission (submission.id)}
            <!-- Debug log to check filtered submissions -->

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
          {/each}
        </div>
        {#if selectedSubmissions.get(assignment_value.id)}
          <p class="mt-4">Grader Feedback: {selectedSubmissions.get(assignment_value.id).grader_feedback}</p>
        {/if}
      {:else}
        <p>No assignment selected</p>
      {/if}
    </div>
    <!-- End of submission timeline -->
    <div
      bind:this={editorElement}
      class="textarea textarea-bordered editor-container mb-4 rounded"
    ></div>
    <!-- Buttons: -->
    <div class="card-actions justify-end">
      <button class="btn btn-primary" on:click={submitSolution}>
        Submit solution
      </button>
    </div>
  </div>
</div>
