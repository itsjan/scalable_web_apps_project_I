 <script>
  export let selectedAssignment = null;
  export let assignment;
  export let selectAssignment;
  
 </script>


 <div
   class="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 {selectedAssignment && selectedAssignment.id === assignment.id ? 'ring-2 ring-indigo-500' : ''}"
   on:click={() => selectAssignment(assignment)}
   role="button"
   tabindex="0"
 >
   <h3 class="text-lg font-semibold mb-2">{assignment.title}</h3>
    <p class="text-sm text-gray-600">{assignment.handout}</p>
   
   {#if selectedAssignment && selectedAssignment.id === assignment.id}
     <div class="absolute top-2 right-2 text-indigo-600">
       <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
         <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
       </svg>
     </div>
   {/if}
 </div>
