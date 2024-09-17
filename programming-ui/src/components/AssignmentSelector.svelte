<script>
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';
    import {useAssignmentsStore, selectedAssignment} from "../stores/assignments.svelte";


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


{#each assignments as assignment}
    <div class="collapse bg-base-200">
      <input type="radio" name="my-accordion-1" checked="checked" />
      <div class="collapse-title text-xl font-medium">{assignment.title}</div>
      <div class="collapse-content">
        <p>{assignment.handout}</p>

      </div>
    </div>
{/each}
