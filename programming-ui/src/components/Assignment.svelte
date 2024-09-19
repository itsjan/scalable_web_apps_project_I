<script>
    import { onMount } from "svelte";
    import { userUuid } from "../stores/stores.js";
    import AssignmentSelector from "./AssignmentSelector.svelte";
    import {
        assignmentsStore,
        selectedAssignment,
    } from "../stores/assignments.svelte.js";
    //import AssignmentCard from './AssignmentCard.svelte';

    let selectedAssignment_value;

    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    });

    let assignments = [];
    assignmentsStore.subscribe((value) => {
        console.log("Assignments updated:", value);
        assignments = value;
    });

    let lastOneCompleted = -1;
</script>

<AssignmentSelector />
