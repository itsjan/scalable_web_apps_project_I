<script>
 import Login from "./Login.svelte";
 import Register from "./Register.svelte";
</script>


<div class="chat chat-start">
  <div class="chat-bubble">
    Please login with your details
  </div>
</div>
<Login client:load />
<div class="chat chat-end">
  <div class="chat-bubble">Or register a new account</div>
</div>
<Register client:load />
