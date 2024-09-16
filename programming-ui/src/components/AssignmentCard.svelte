<script>
  export let selectedAssignment = null;
  export let assignment;
  export let selectAssignment;
  export let lastOneCompleted;

  $: disabled = assignment.assignment_order > lastOneCompleted + 1;
</script>
<div
  class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 {selectedAssignment &&
  selectedAssignment.id === assignment.id
    ? 'ring-2 ring-indigo-500'
    : ''} {disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}"
  on:click={() => !disabled && selectAssignment(assignment) }
  on:keypress={() => !disabled && selectAssignment(assignment) }
  role="button"
  tabindex="0"
>
  <h3 class="text-lg font-semibold mb-2">
    {assignment.assignment_order}.
    {assignment.title}
    {#if assignment.completed}
      <span class="text-green-500 ml-2">✅✓</span>
    {/if}
    {#if disabled}
      <span class="text-red-500 ml-2">🔒</span>
    {/if}
  </h3>
  <p class="text-sm text-gray-600">{assignment.handout}</p>

  {#if selectedAssignment && selectedAssignment.id === assignment.id}
    <div class="absolute top-2 right-2 text-indigo-600">
      <svg
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  {/if}
</div>
