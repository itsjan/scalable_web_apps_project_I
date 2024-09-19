<script>
  import { fade, scale } from 'svelte/transition';
  import { cubicIn, cubicOut } from 'svelte/easing';
  //import PointsDisplay from '../components/PointsDisplay.svelte';
  import { userUuid } from "../stores/stores.js";
  import { authStore } from "../stores/authStore.js";
  import Login from "./auth/Login.svelte";
  import Logout from "./auth/Logout.svelte";
  import Register from "./auth/Register.svelte";
  import LoginModal from "./auth/LoginModal.svelte";


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
      {#if $authStore.isAuthenticated}
          <p>Hello, {$authStore.user.user.split('@')[0]}</p>
        <span class="badge badge-accent">100 points</span>
      {/if}

      {#if $authStore.isAuthenticated}
        <Logout />
        {:else}
        <!-- Open the modal using ID.showModal() method -->
        <button class="btn btn-sm btn-secondary" onclick="my_modal_1.showModal()">Login</button>
        <dialog id="my_modal_1" class="modal">
          <div class="modal-box min-h-96 max-w-96">
              <form method="dialog">
                <button class="btn btn-sm  btn-ghost absolute right-2 top-2">✕</button>
              </form>
            <!-- LOGIN MODAL CONTENT -->
            <LoginModal />
          </div>
        </dialog>
      {/if}
  </div>
</div>

{#if !$authStore.isAuthenticated}


{/if}
