<script>
    import { onMount } from 'svelte';
    import AssignmentCard from './AssignmentCard.svelte';
    import { assignmentsStore, selectedAssignment } from "../stores/assignments.svelte.js";
    import { authStore } from "../stores/authStore.js";

    export let lastOneCompleted;
    let selectedAssignment_value;

    selectedAssignment.subscribe((value) => {
        selectedAssignment_value = value;
    });

    let assignments = [];
    $: assignments = $assignmentsStore;
</script>

{#if $authStore.isAuthenticated}
    <p>Your assignments:</p>
    {#each assignments as assignment}
        <div class="collapse bg-base-200">
          <input type="radio" name="my-accordion-1" checked="checked" />
          <div class="collapse-title text-xl font-medium">{assignment.title}</div>
          <div class="collapse-content">
            <p>{assignment.handout}</p>
          </div>
        </div>
    {/each}
{:else}
    <p>Please log in to view assignments.</p>
{/if}
