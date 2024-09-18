<script>
  import { registerUser } from "../../lib/http-actions/assignments-api.js";

  let email = "";
  let password = "";
  let verification = "";

  async function handleSubmit() {
    if (password !== verification) {
      alert("Passwords don't match");
      return;
    }
    await registerUser(email, password, verification);
  }
</script>

<div class="card bg-base-100">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="card-body">
      <h2 class="card-title">Register</h2>

      <input class="input input-bordered input-xs w-full max-w-xs" type="email" bind:value={email} placeholder="Email" required />
      <input
        type="password"
        class="input input-bordered input-xs w-full max-w-xs"
        bind:value={password}
        placeholder="Password"
        required
      />
      <input
        type="password"
        class="input input-bordered input-xs w-full max-w-xs"
        bind:value={verification}
        placeholder="Verify Password"
        required
      />
      <div class="card-actions justify-end">
        <button class="btn btn-sm btn-secondary">Register</button>
      </div>

    </div>
  </form>
</div>
