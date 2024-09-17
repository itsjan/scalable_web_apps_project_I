<script>
    import { onMount } from 'svelte';
    import { userUuid } from "../stores/stores.js";
    import AssignmentSelector from "./AssignmentSelector.svelte";
    //import {selectedAssignment} from "../stores/selectedAssignment.js";
    import {initAssignments, useAssignmentsStore, selectedAssignment} from "../stores/assignments.svelte";
    import AssignmentCard from './AssignmentCard.svelte';

    let selectedAssignment_value;

    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    });

    const assignmentsStore = useAssignmentsStore();
    let assignments = [];
    assignmentsStore.subscribe(value => {
        console.log("Assignments updated:", value);
        assignments = value;
    });

    let lastOneCompleted = -1;

    onMount(async () => {
      console.log("onMount start in Assignment.svelte");
      await initAssignments();
      console.log("onMount end in Assignment.svelte, assignments:", assignments);
    });

    console.log("Assignment.svelte script executed");
</script>


<AssignmentSelector />
