  <script>
  import { loginUser } from "../../lib/http-actions/assignments-api.js";

  let email = '';
  let password = '';

  async function handleSubmit() {
    try {
      await loginUser(email, password);
      console.log("LOGIN SUCCESS");
    } catch (error) {
      console.error(error);
    }
  }
  </script>

  <form on:submit|preventDefault={handleSubmit}>
    <input type="email" bind:value={email} placeholder="Email" required>
    <input type="password" bind:value={password} placeholder="Password" required>
    <button type="submit">Login</button>
  </form>
