<script>
  import { userUuid } from "../stores/stores.js";
  export let code;
  export let selectedAssignment;

  const doSimpleGradingDemo = async () => {
    const data = {
      assignment: "selectedAssignment.id,",
      user: $userUuid,
      code: "code",
      testCode: "testi",
    };

    const response = await fetch("/api/grade/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log(response);

    //const jsonData = await response.json();
    //console.log(jsonData);
    //alert(JSON.stringify(jsonData));
  };
</script>

<p> {selectedAssignment.id}</p>
<button
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
  on:click={doSimpleGradingDemo}
>
  Do grading demo!
</button>

