<script>
    import { fade, scale } from "svelte/transition";
    import { cubicIn, cubicOut } from "svelte/easing";
    import { userUuid } from "../stores/stores.js";
    import { pointsEarned } from "../stores/submissions.store.js";

</script>

<div class="navbar bg-black text-primary-content  px-10 mx-auto max-w-7xl">
    <div class="flex-1">
        <p class="topbarlogo text-2xl">Programming Assignments</p>
    </div>
    <div class="flex-none gap-2">
        {#if $userUuid}

            <div class="tooltip tooltip-left" data-tip="ooo{$userUuid}">

                <span class="badge badge-lg badge-accent silkscreen-bold">XP{$pointsEarned}</span>
            </div>
        {/if}
    </div>
</div>
