<script>
    import { onMount } from 'svelte';

    let assignments = [];

    onMount(async () => {
        const response = await fetch('/api/assignments');
        assignments = await response.json();
    });
    import AssignmentSelector from "./AssignmentSelector.svelte";



</script>

<AssignmentSelector {assignments} />
