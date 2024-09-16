<script>
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';

    export let assignments;
    export let lastOneCompleted;
    export let selectedAssignment;

    onMount(() => {
        console.log("AssignmentSelector mounted");
        console.log("Assignments:", assignments);
        
    });

    function selectAssignment(assignment) {
        selectedAssignment = assignment;
    }
</script>

<div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each assignments as assignment}
      <AssignmentCard
        {assignment}
        {selectedAssignment}
        {selectAssignment},
        {lastOneCompleted}
      />
    {/each}
  </div>
</div>
