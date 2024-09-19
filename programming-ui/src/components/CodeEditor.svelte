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

    let editorElement;
    let editor;
    let assignment_value;

    selectedAssignment.subscribe((value) => {
        assignment_value = value;
    });

    onMount(() => {
        if (editorElement) {
            editor = basicEditor(
                editorElement,
                {
                    language: "python",
                    theme: "github-dark",
                    value: "// code here",
                },
                () => console.log("ready"),
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
            editor.value,
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
            assignment_value.id,
        );
        console.log("User submissions:", submissions);
        // Update the submission store with fetched submissions
        submissionStore.update((store) => {
            return submissions;
        });
    };

    const updateEditorForDebugging = () => {
      // this adds a new editor to the page , not what we want
      // replace this with a function that updates the editor value, text within the editor
      const newEditor = createEditor("#editor", {
        language: editor.options.language,
        value: newContent
      });
      // You might need to update any references to the old editor here
      editor = newEditor;
    };
</script>

<div class="card bg-base-100 shadow-xl">
    <div class="card-body">
        <h2 class="card-title">{$selectedAssignment.title}</h2>
        <p>{$selectedAssignment.handout}</p>
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
