<script>
    import { fade, scale } from "svelte/transition";
    import { cubicIn, cubicOut } from "svelte/easing";
    import { userUuid } from "../stores/stores.js";
    import { pointsEarned } from "../stores/submissions.store.js";

</script>

<div class="navbar bg-primary text-primary-content">
    <div class="flex-1">
        <p class="font-mono text-xl">Programming UI</p>
    </div>
    <div class="flex-none gap-2">
        {#if $userUuid}
            <p>Hello, {$userUuid}</p>
            <span class="badge badge-accent">{$pointsEarned}</span>
        {/if}
    </div>
</div>
