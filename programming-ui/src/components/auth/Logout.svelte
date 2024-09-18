  <script>
  import { logoutUser } from "../../lib/http-actions/assignments-api.js";

  let email = '';
  let password = '';

  async function handleSubmit() {
    await logoutUser();
  }
  </script>

  <form on:submit|preventDefault={handleSubmit}>
    <button class="btn" type="submit">Logout</button>
  </form>
