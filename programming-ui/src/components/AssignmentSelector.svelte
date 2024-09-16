<script>
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';
    import {useAssignmentsStore} from "../stores/assignments.svelte";
    import {selectedAssignment} from "../stores/selectedAssignment.js";




    export let lastOneCompleted;
    let selectedAssignment_value;

    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    })

    const assignmentsStore = useAssignmentsStore();
    let assignments = [];
    assignmentsStore.subscribe(value => {
        console.log("Assignments updated:", value);
        assignments = value;
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
