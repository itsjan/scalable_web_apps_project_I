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

  const doSimpleGradingDemo = async () => {
    const data = {
      assignment: assignment_value,
      user: $userUuid,
      code: editor.value,
      testCode: "testi",
    };

    const response = await fetch("/api/grade/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log(response);
  };

  const submitSolution = async () => {
    if ( assignment_value ) {
      const result = await submitSolutionForGrading(
        assignment_value.id,
        editor.value
      );
      console.log(result);
    } else {
      alert("Please select an assignment first");
    }

  };




</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">{$selectedAssignment.title}</h2>
    <p>{$selectedAssignment.handout}</p>


    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Submissions:</h3>
      {#if submissions && submissions.length > 0}
        <ul class="list-disc pl-5">
          {#each submissions as submission}
            <li>
              Status: {submission.status},
              ID: {submission.id},
              Assignment ID: {submission.programming_assignment_id},
              Code: {submission.code.substring(0, 20)}...
            </li>
          {/each}
        </ul>
      {:else}
        <p>No submissions available.</p>
      {/if}
    </div>
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Selected Assignment:</h3>
      <p>ID: {$selectedAssignment.id}</p>

    </div>


    <!-- Start of submission timeline -->
    <div class="overflow-x-auto">
      {#if assignment_value && assignment_value.id}
        <ul class="steps">
          {#each $submissionStore.filter(sub => sub.programming_assignment_id === assignment_value.id) as submission (submission.id)}
            <li
              data-content={submission.status === 'pending' ? '?' : submission.correct ? '✓' : '✕'}
              class={`step ${submission.correct ? 'step-accent' : submission.status === 'pending' ? '' : 'step-error'}`}
              on:click={() => loadSubmission(submission)}
              style="cursor: pointer; transition: background-color 0.3s;"
            ></li>
          {/each}
        </ul>
      {:else}
        <p>No assignment selected</p>
      {/if}
    </div>
    <!-- End of submission timeline -->
    <div
      bind:this={editorElement}
      class="textarea textarea-bordered editor-container mb-4 rounded"
    ></div>

    <div class="card-actions justify-end">
      <button class="btn btn-outline" on:click={doSimpleGradingDemo}>
        Do grading demo!
      </button>

      <button class="btn btn-primary" on:click={submitSolution}>
        Submit solution
      </button>
    </div>
  </div>
</div>

<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
