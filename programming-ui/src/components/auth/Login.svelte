<script>
  import { loginUser } from "../../lib/http-actions/assignments-api.js";

  let email = "";
  let password = "";

  async function handleSubmit() {
    try {
      await loginUser(email, password);
      console.log("LOGIN SUCCESS");
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="card bg-base-100">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="card-body">
      <h2 class="card-title">Login</h2>
      <input
          class="input input-bordered input-xs w-full max-w-xs"
          type="email" bind:value={email} placeholder="Email" required />
      <input
          class="input input-bordered input-xs w-full max-w-xs"
        type="password"
        bind:value={password}
        placeholder="Password"
        required
      />
      <div class="card-actions justify-end">
        <button class="btn btn-sm btn-secondary">Login</button>
      </div>
    </div>
  </form>
</div>
