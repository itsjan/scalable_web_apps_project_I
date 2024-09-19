<script>
  import { userUuid } from "../stores/stores.js";
  import { onMount } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import {selectedAssignment} from "../stores/assignments.svelte";
  import { submitSolutionForGrading } from "../lib/http-actions/assignments-api.js";
  import "prism-code-editor/prism/languages/markup";
  import "prism-code-editor/prism/languages/python";

  let editorElement;
  let editor;
  let assignment_value;

  selectedAssignment.subscribe((value) => {
    assignment_value = value;
  })

  onMount(() => {
    if (editorElement) {
      editor = basicEditor(
        editorElement,
        {
          language: "python",
          theme: "github-dark",
          value: "// code here",
        },
        () => console.log("ready")
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
    const result = await submitSolutionForGrading(assignment_value.id, editor.value);
    console.log(result);

  }

</script>

<p>selected assignment: {$selectedAssignment.handout}</p>
<div class="card bg-base-100 shadow-xl ">

  <div class="card-body">

    <div bind:this={editorElement} class="textarea textarea-bordered editor-container mb-4 rounded"></div>

    <div class="card-actions justify-end">
        <button
          class="btn btn-primary"
          on:click={doSimpleGradingDemo}
        >
          Do grading demo!
        </button>

        <button
          class="btn btn-primary"
          on:click={submitSolution}
        >
          Submit solution
        </button>
    </div>
  </div>
</div>


<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
