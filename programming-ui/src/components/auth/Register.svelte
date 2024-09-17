   <script>
   import { registerUser } from "../../lib/http-actions/assignments-api.js";

   let email = '';
   let password = '';
   let verification = '';

   async function handleSubmit() {
     if (password !== verification) {
       alert("Passwords don't match");
       return;
     }
     await registerUser(email, password, verification);
   }
   </script>

   <form on:submit|preventDefault={handleSubmit}>
     <input type="email" bind:value={email} placeholder="Email" required>
     <input type="password" bind:value={password} placeholder="Password" required>
     <input type="password" bind:value={verification} placeholder="Verify Password" required>
     <button type="submit">Register</button>
   </form>
