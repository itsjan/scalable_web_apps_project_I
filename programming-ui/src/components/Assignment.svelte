<script>
    import { onMount } from 'svelte';
    import { userUuid } from "../stores/stores.js";
    import AssignmentSelector from "./AssignmentSelector.svelte";
    import {selectedAssignment} from "../stores/selectedAssignment.js";

    let selectedAssignment_value;
    
    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    })

    let assignments = [];
    let lastOneCompleted = -1;
    let correctSolutions = [];
   

    onMount(async () => {
      const response = await fetch(`/api/user/${$userUuid}/assignments`);
      const data = await response.json();
      console.log(data)
      assignments = data.assignments;
      lastOneCompleted = data.lastOneCompleted[0].max_completed ?? 0;

      if ( selectedAssignment_value === 0 ) {
        selectedAssignment.update(1);
        
      }
      
      correctSolutions = data.correctSolutions;

      console.log( "onMount: ", assignments, lastOneCompleted[0], correctSolutions);
    });
</script>

<AssignmentSelector {assignments} {lastOneCompleted} />


