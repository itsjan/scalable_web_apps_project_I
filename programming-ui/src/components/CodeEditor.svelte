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

    //const jsonData = await response.json();
    //console.log(jsonData);
    //alert(JSON.stringify(jsonData));
  };


</script>

<h2>Code Editor</h2>
<p> Code editor ... Selected assignment : {assignment_value}</p>
<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
<div bind:this={editorElement} class="editor-container mb-4 rounded shadow"></div>

<button
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
  on:click={doSimpleGradingDemo}
>
  Do grading demo!
</button>

<style>
  .editor-container {
    height: 10em;
    overflow: hidden;
    border: 1px solid #ccc;
  }
</style>
