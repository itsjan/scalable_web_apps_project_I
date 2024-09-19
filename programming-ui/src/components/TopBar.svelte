<script>
    import { fade, scale } from "svelte/transition";
    import { cubicIn, cubicOut } from "svelte/easing";
    //import PointsDisplay from '../components/PointsDisplay.svelte';
    import { userUuid } from "../stores/stores.js";

    let showDropdownMenu = false;
    let showProfileDropdown = false;

    function toggleDropdownMenu() {
        showDropdownMenu = !showDropdownMenu;
    }

    function toggleProfileDropdown() {
        showProfileDropdown = !showProfileDropdown;
    }
</script>

<div class="navbar bg-primary text-primary-content">
    <div class="flex-1">
        <a class="btn btn-ghost text-xl">Programming UI</a>
    </div>
    <div class="flex-none gap-2">
        {#if $userUuid}
            <p>Hello, {$userUuid}</p>
            <span class="badge badge-accent">100 points</span>
        {/if}
    </div>
</div>
