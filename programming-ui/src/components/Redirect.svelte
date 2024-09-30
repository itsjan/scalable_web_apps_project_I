<script>
    import { userUuid } from "../stores/stores.js";
    import { selectedAssignment } from "../stores/assignments.svelte.js";
    import { get } from "svelte/store";
    import { onMount } from "svelte";
    
    const currentUserUuid = get(userUuid);
    const currentSelectedAssignment = get(selectedAssignment) || 1;

    onMount(() => {
        
        window.location.href = `/${currentUserUuid}/${currentSelectedAssignment}`
    });



</script>

<p>
    Redirecting to assignment {currentSelectedAssignment} for user {currentUserUuid}...
</p>