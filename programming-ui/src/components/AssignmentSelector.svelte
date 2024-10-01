<script>
    import { onMount } from "svelte";
    import { userUuid } from "../stores/stores.js";
    import { selectedAssignment } from "../stores/assignments.store.js";
    import * as assignmentsApi from "../lib/http-actions/assignments-api.js";
    import { submissionStore, resolvedAssignmentIds } from "../stores/submissions.store.js";
    import CodeEditor from "../components/CodeEditor.svelte";

    let selectedAssignment_value;
    let submissions = [];
    let localSubmissions = []; // Store for local submission data
    let maxResolvedAssignmentId = 0;

    function changeUrl(pageNumber) {
      let newUrl = `/${$userUuid}/${pageNumber}`;
      // Change the URL without reloading the page
      window.history.pushState({}, '', newUrl);
    }

    // Subscribe to submissionStore and resolvedAssignmentIds
    $: {
        localSubmissions = $submissionStore;
        maxResolvedAssignmentId = Math.max(0, ...$resolvedAssignmentIds);
    }

    let assignments = [];
    onMount(async () => {
        assignments = await assignmentsApi.getAssignments();
        console.log("Assignments initialized");
        if (assignments.length > 0) {
            selectAssignment(assignments[0], 1);
        }
        await fetchSubmissions();
    });

    // The user clicks on one of the assignments .. 
    function selectAssignment(assignment, pageNumber) {
        if (pageNumber === 1 || pageNumber <= maxResolvedAssignmentId + 1) {
            // Update the selectedAssignment store
            selectedAssignment.set(assignment);
            // and update the URL in the browser location bar
            changeUrl(pageNumber);
        }
    }

    // We use this to track the user's progress
    // so that Assignments can be displayed in the correct order
    async function fetchSubmissions() {
        try {
            await submissionStore.initSubmissions();
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    }
    // Console log for debugging
    $: console.log("Current submission store value:", $submissionStore);
</script>

<div class="flex justify-center bg-inherit ">
<ul class="timeline">
    {#each assignments as assignment, index}
        <!-- Only show assignments the user has solved, and the next to be solved -->
        {#if index <= maxResolvedAssignmentId }
        <li>
            <hr class:bg-primary={index <= maxResolvedAssignmentId} />
            <div class="timeline-start">{index + 1}</div>
            <div class="timeline-middle">
                {#if $resolvedAssignmentIds.includes(assignment.id)}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-primary h-5 w-5"
                    >
                        <circle cx="10" cy="10" r="8" fill="currentColor" />
                        <path fill="white" d="M14.293 6.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l5.293-5.293z" />
                    </svg>

                {:else }
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-gray-400 h-5 w-5"
                    >
                        <circle cx="10" cy="10" r="8" />
                    </svg>
                {/if}
            </div>
            <div
                on:click={() => selectAssignment(assignment, index + 1)}
                class="timeline-end timeline-box cursor-pointer"
                class:bg-primary={$selectedAssignment === assignment}
            >
                {assignment.title}
                {#if index === maxResolvedAssignmentId}
                    <span class="badge badge-accent ml-2">new</span>
                {/if}
            </div>
            <hr class:bg-primary={index <= maxResolvedAssignmentId} />
        </li>
        {/if}
    {/each}
</ul>
</div>

