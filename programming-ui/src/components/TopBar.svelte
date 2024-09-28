<script>
    import { fade, scale } from "svelte/transition";
    import { cubicIn, cubicOut } from "svelte/easing";
    //import PointsDisplay from '../components/PointsDisplay.svelte';
    import { userUuid } from "../stores/stores.js";
    import { pointsEarned } from "../stores/submissions.store.js";

    $ : console.log("Points earned:", $pointsEarned);
</script>

<div class="navbar bg-primary text-primary-content">
    <div class="flex-1">
        <a class="btn btn-ghost text-xl">Programming UI</a>
    </div>
    <div class="flex-none gap-2">
        {#if $userUuid}
            <p>Hello, {$userUuid}</p>
            <span class="badge badge-accent">{$pointsEarned}</span>
        {/if}
    </div>
</div>
