<script>
    import { userUuid } from "../stores/stores.js";
    import { onMount } from "svelte";

    let points = 100;

    onMount(async () => {
      const response = await fetch(`/api/points?user=${$userUuid}`);
      const data = await response.json();
      points = data.points;
    });
  </script>


<div class="bg-gray-800 rounded-lg w-60  shadow block p-4">
    <div class="w-full h-4 bg-gray-400 rounded-full">
        <div class="w-1/3 h-full text-center text-xs text-white bg-violet-500 rounded-full">
            Points: {points}
        </div>
    </div>
</div>
