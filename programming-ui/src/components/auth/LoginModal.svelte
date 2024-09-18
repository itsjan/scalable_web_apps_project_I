<script>
 import Login from "./Login.svelte";
 import Register from "./Register.svelte";
</script>


<div class="chat chat-start">
  <div class="chat-bubble">
    Please login with your details
  </div>
</div>
<div class="chat chat-start">
<div class="card bg-base-100 w-96 shadow-xl">
<Login client:load />
</div>
</div>
<div class="chat chat-end">
  <div class="chat-bubble">Or register a new account</div>
</div>

<div class="chat chat-end">
<div class="card bg-base-100 w-96 shadow-xl">
<Register client:load />
</div>
</div>
