<script>
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';
    import {selectedAssignment} from "../stores/selectedAssignment.js";

    export let assignments;
    export let lastOneCompleted;
    let selectedAssignment_value;
    
    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    })

    onMount(() => {
        console.log("AssignmentSelector mounted");
        console.log("Assignments:", assignments);

        
    });


</script>

<div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each assignments as assignment}
      <AssignmentCard
        {assignment}
        {lastOneCompleted}
      />
    {/each}
  </div>
</div>

<p> Selector: Selected assignment: {selectedAssignment_value}</p>
