<script>
    import { onMount } from 'svelte';
    import { userUuid } from "../stores/stores.js";
    import AssignmentSelector from "./AssignmentSelector.svelte";



    let assignments = [];
    let lastOneCompleted = -1;
    let correctSolutions = [];
    let selectedAssignment;

    onMount(async () => {
      const response = await fetch(`/api/user/${$userUuid}/assignments`);
      const data = await response.json();
      console.log(data)
      assignments = data.assignments;
      lastOneCompleted = data.lastOneCompleted[0].max_completed ?? 0;
      selectedAssignment = assignments[0];
      correctSolutions = data.correctSolutions;

      console.log( "onMount: ", assignments, lastOneCompleted[0], correctSolutions);
    });
</script>

<AssignmentSelector {assignments} {selectedAssignment} {lastOneCompleted} />


