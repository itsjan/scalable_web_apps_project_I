<script>
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';

    export let assignments;
    export let selectedAssignment;


    onMount(() => {
        console.log("AssignmentSelector mounted");
        console.log("Assignments:", assignments);
    });

    function selectAssignment(assignment) {
        console.log("Select assignment called", assignment);
        selectedAssignment = assignment;
    }
</script>

<div>
  <label id="listbox-label" class="block text-sm font-medium leading-6 text-gray-900 mb-4">Select assignment:</label>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each assignments as assignment}
      <AssignmentCard {assignment} {selectedAssignment} {selectAssignment} />
    {/each}
  </div>
</div>
