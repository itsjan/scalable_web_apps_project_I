<script>
  import { onMount } from "svelte";
  import { basicEditor } from "prism-code-editor/setups";
  import "prism-code-editor/prism/languages/markup";
  import "prism-code-editor/prism/languages/python";
  let editorElement;
  let editor;

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
</script>

<h2>Code Editor</h2>
<button class="btn" on:click={() => console.log(editor.value)}>Log code</button>
<div bind:this={editorElement} class="editor-container"></div>

<style>
  .editor-container {
    height: 30em;
    overflow: hidden;
  }
</style>
