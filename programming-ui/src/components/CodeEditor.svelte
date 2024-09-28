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

  const loadSubmission = (submission) => {
    if (editor && submission.code) {
      insertText(editor, submission.code, 0, editor.value.length, 0, 0);
    }
  };

  selectedAssignment.subscribe((value) => {
    assignment_value = value;
    if (submissionStore.hasSubmissions(assignment_value.id)) {
      loadSubmission(submissionStore.lastSubmission(assignment_value.id));
    }
    else {
      if (editor ) {
        insertText(editor, "# Write your code here", 0, editor.value.length, 0, 0);
      }
    }
  });

  let submissions

  onMount(() => {

    submissions = [];
    submissionStore.subscribe((value) => {
      console.log("SUBMISSIONS STORE UPDATED", value);
      submissions = value;
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
      console.log(result);
    }
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
            <div
              class={`badge gap-2 ${
                submission.status === 'pending'
                  ? 'badge-warning'
                  : submission.correct
                    ? 'badge-success'
                    : 'badge-error'
              }`}
              on:click={() => loadSubmission(submission)}
              style="cursor: pointer; transition: background-color 0.3s;"
            >

              {submission.status === 'pending' ? 'Pending' : submission.correct ? 'Pass' : 'Fail'}
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
    ></div>
    <!-- Buttons: -->
    <div class="card-actions justify-end">
      <button class="btn btn-primary" on:click={submitSolution}>
        Submit solution
      </button>
    </div>
  </div>
</div>
