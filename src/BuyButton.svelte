<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  
  export let dimensionMine = {};
  export let handleClick = () => {};
  
  $: top = dimensionMine.top || 0;
  $: left = dimensionMine.left + dimensionMine.width || 0;
  
  onMount(() => {
    console.log("dimensionMine", dimensionMine);
  });
</script>

<style>
  @keyframes shake {
    0% {
      opacity: 0;
    }
    10% {
      transform: translate3d(-106%, 0, 0);
    }
    20% {
      transform: translate3d(-94%, 0, 0);
    }
    30% {
      transform: translate3d(-104%, 0, 0);
    }
    40% {
      transform: translate3d(-96%, 0, 0);
    }
    50% {
      transform: translate3d(-104%, 0, 0);
    }
    60% {
      transform: translate3d(-97%, 0, 0);
    }
    70% {
      opacity: 1;
      transform: translate3d(-103%, 0, 0);
    }
    80% {
      transform: translate3d(-98%, 0, 0);
    }
    90% {
      transform: translate3d(-101%, 0, 0);
    }
  }
  .configurator2-header-buy-button {
    all: unset;
    user-select: none;
    cursor: pointer;
    background: #c9192e;
    font-weight: bold;
    font-size: 20px;
    color: #fefefe;
    position: absolute;
    padding: 10px;
    transform: translate(-100%, 0);
  }
  .configurator2-header-buy-button:active {
    animation: shake 0.6s;
  }
</style>

<button
  on:click={handleClick}
  class="configurator2-header-buy-button"
  in:fade={{delay: 2000, duration: 2000}}
  style="top:{top}px;left:{left}px">
  <span class="configurator2-header-buy-button-price">$75.00</span>
  BUY
</button>
