<script>
  import { userUuid } from "../stores/stores.js";
  import { onMount } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import {selectedAssignment} from "../stores/assignments.svelte";
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


</script>

<h2>Code Editor</h2>
<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
<div bind:this={editorElement} class="editor-container mb-4 rounded shadow"></div>

<button
  class="btn btn-secondary"
  on:click={doSimpleGradingDemo}
>
  Do grading demo!
</button>

<button class="btn btn-primary">Button</button>


<style>
  .editor-container {
    height: 10em;
    overflow: hidden;
    border: 1px solid #ccc;
  }
</style>
