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

  let submissions = [];
  submissionStore.subscribe((value) => {
    submissions = value;
  });

  const loadSubmission = (submission) => {
    if (editor && submission.code) {
      insertText(editor, submission.code, 0, editor.value.length, 0, 0);
    }
  };

  onMount(() => {
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
    const result = await submitSolutionForGrading(
      assignment_value.id,
      editor.value
    );
    console.log(result);
    // Add submitted solution to the store
    submissionStore.addSubmission({
      assignmentId: assignment_value.id,
      code: editor.value,
      result: result,
    });
  };

  const fetchUserSubmissions = async () => {
    const submissions = await getSubmissionsByUser(
      $userUuid,
      assignment_value.id
    );
    console.log("User submissions:", submissions);
    // Update the submission store with fetched submissions
    submissionStore.set(submissions);
  };

  const updateEditorForDebugging = () => {
    const code = editor.value;
    console.log("Original Code:", code);

    // New code to insert
    const newCode =
      "# New code\ndef example():\n    print('Hello, World!')\n\nexample()";

    // Replace the entire content and set cursor to the start
    insertText(editor, newCode, 0, code.length, 0, 0);

    console.log("Updated Code:", editor.value);
  };
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">{$selectedAssignment.title}</h2>
    <p>{$selectedAssignment.handout}</p>

    <!-- Start of submission dropdown -->
    <div class="dropdown dropdown-hover flex-1">
      <div tabindex="0" role="button" class="btn btn-accent btn-xs m-1">
        {#if submissionStore.hasSubmissions(assignment_value.id)}
          Choose a submission
        {:else}
          No submissions for this assignment yet.
        {/if}
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
      >
        {#each submissions.filter((submission) => submission.programming_assignment_id === assignment_value.id) as submission}
          <li>
            <a on:click={() => loadSubmission(submission)}>
              Submission {submission.id} - {submission.status}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    <!-- End of submission dropdown -->
    <div
      bind:this={editorElement}
      class="textarea textarea-bordered editor-container mb-4 rounded"
    ></div>

    <div class="card-actions justify-end">
      <button class="btn btn-primary" on:click={doSimpleGradingDemo}>
        Do grading demo!
      </button>

      <button class="btn btn-primary" on:click={submitSolution}>
        Submit solution
      </button>

      <button class="btn btn-secondary" on:click={fetchUserSubmissions}>
        Fetch Submissions
      </button>

      <button class="btn btn-warning" on:click={updateEditorForDebugging}>
        Debug Update
      </button>
    </div>
  </div>
</div>

<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
