<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  export let dimensionMine = {};
  $: top = dimensionMine.top || 0;
  $: left = dimensionMine.left + dimensionMine.width  || 0;
  onMount(() => {
    console.log("dimensionMine", dimensionMine);
  });
</script>

<style>
  .configurator2-header-buy-button {
    all: unset;
    cursor: pointer;
    background: #c9192e;
    font-weight: bold;
    font-size: 20px;
    color: #fefefe;
    position: absolute;
    padding: 10px;
    transform: translate(-100%, 0);
  }
</style>

<button
  class="configurator2-header-buy-button"
  in:fade
  style="top:{top}px;left:{left}px">
  <span class="configurator2-header-buy-button-price">$75.00</span>
  BUY
</button>
