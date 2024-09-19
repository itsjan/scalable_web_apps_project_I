<script>
    import { onMount } from 'svelte';
    //import AssignmentCard from './AssignmentCard.svelte';
    import {  selectedAssignment } from "../stores/assignments.svelte.js";
    import * as assignmentsApi from "../lib/http-actions/assignments-api.js";
    import { authStore } from "../stores/authStore.js";

    export let lastOneCompleted = 1;
    let selectedAssignment_value;

    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    });

    let assignments = [];
    onMount(async () => {
        assignments = (await assignmentsApi.getAssignments());
        console.log('Assignments initialized');
        if (assignments.length > 0 && lastOneCompleted < assignments.length) {
            selectAssignment(assignments[lastOneCompleted]);
        }
    });

    function selectAssignment(assignment) {
        selectedAssignment.set(assignment);
    }

</script>
<p> last one completed: {lastOneCompleted}</p>
{#if $authStore.isAuthenticated}

    <ul class="timeline">
    {#each assignments as assignment, index}
        <li on:click={() => selectAssignment(assignment)}>
            <hr class:bg-primary={index < lastOneCompleted} />
            <div class="timeline-start">Assignment {index + 1}</div>
            <div class="timeline-middle">
                {#if index < lastOneCompleted}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-primary h-5 w-5">
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clip-rule="evenodd" />
                    </svg>
                {:else}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-gray-400 h-5 w-5">
                        <circle cx="10" cy="10" r="8" />
                    </svg>
                {/if}
            </div>
            <div class="timeline-end timeline-box" class:selected={selectedAssignment_value === assignment}>{assignment.title}</div>
            <hr class:bg-primary={index < lastOneCompleted} />
        </li>
    {/each}
    </ul>
{:else}
    <p>Please log in to view assignments.</p>
{/if}

<style>
    .selected {
        background-color: #e0e0e0;
    }
</style>
