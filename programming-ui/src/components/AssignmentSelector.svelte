<script>
    import { onMount } from "svelte";
    import { userUuid } from "../stores/stores.js";
    import { selectedAssignment } from "../stores/assignments.svelte.js";
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
        console.log("Submission store updated:", localSubmissions);
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

    function selectAssignment(assignment, pageNumber) {
        if (pageNumber === 1 || pageNumber <= maxResolvedAssignmentId + 1) {
            selectedAssignment.set(assignment);
            changeUrl(pageNumber);
        }
    }

    async function fetchSubmissions() {
        try {
            await submissionStore.initSubmissions();
            console.log("Submissions fetched and store updated");
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    }

    // Console log for debugging
    $: console.log("Current submission store value:", $submissionStore);
</script>

<p>Resolved assignment IDs: {$resolvedAssignmentIds.join(", ")}</p>

<ul class="timeline">
    {#each assignments as assignment, index}
        <li>
            <hr class:bg-primary={index <= maxResolvedAssignmentId} />
            <div class="timeline-start">{index + 1}</div>
            <div class="timeline-middle">
                {#if index <= maxResolvedAssignmentId}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-primary h-5 w-5"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clip-rule="evenodd"
                        />
                    </svg>
                {:else if submissionStore.hasPendingSolution(assignment.id)}
                    <span class="loading loading-ball loading-lg text-accent"
                    ></span>
                {:else if submissionStore.hasCorrectSolution(assignment.id)}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-green-500 h-5 w-5"
                    >
                        <circle cx="10" cy="10" r="8" />
                    </svg>
                {:else if submissionStore.hasIncorrectSolution(assignment.id)}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="text-red-500 h-5 w-5"
                    >
                        <circle cx="10" cy="10" r="8" />
                    </svg>
                {:else}
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
                class:selected={$selectedAssignment === assignment}
                class:disabled={index !== 0 && index > maxResolvedAssignmentId}
            >
                {assignment.title}
            </div>
            <hr class:bg-primary={index <= maxResolvedAssignmentId} />
        </li>
    {/each}
</ul>

<!--  list of submissions for the selected assignment -->
{#if selectedAssignment_value}
    <h2>Submissions for {selectedAssignment_value.title}</h2>
    {#if submissions.length > 0}
        <ul>
            {#each submissions as submission}
                <li>
                    {submission.code ? "Code submission" : "No code"} - {submission.status}
                </li>
            {/each}
        </ul>
    {:else}
        <p>No submissions for this assignment yet.</p>
    {/if}
{/if}

<style>
    .selected {
        background-color: #e0e0e0;
    }
    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
