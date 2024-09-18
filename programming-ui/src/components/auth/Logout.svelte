  <script>
  import { logoutUser } from "../../lib/http-actions/assignments-api.js";

  let email = '';
  let password = '';

  async function handleSubmit() {
    console.log('Logging out user...');
    try {
      await logoutUser();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }
  </script>

  <form on:submit|preventDefault={handleSubmit}>
    <button class="btn btn-sm btn-secondary" type="submit">Logout</button>
  </form>
