<script>
  import Login from "./Login.svelte";
  import Register from "./Register.svelte";
  let activeComponent = "login";
</script>

<div min-h-full>
  <div class="join grid grid-cols-2">
    <button
      class="join-item btn btn-sm"
      class:btn-active={activeComponent === "login"}
      on:click={() => (activeComponent = "login")}>Login</button
    >
    <button
      class="join-item btn btn-sm"
      class:btn-active={activeComponent === "register"}
      on:click={() => (activeComponent = "register")}>Register</button
    >
  </div>

  <div>
    {#if activeComponent === "login"}
      <Login />
    {:else}
      <Register />
    {/if}
  </div>
</div>
