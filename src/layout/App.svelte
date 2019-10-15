<script>
  import Variant from "./Variant.svelte";
  import Error from "./Error.svelte";
  
  export let name;
  export let variant0;
  export let variant1;
  export let variant2;
  export let variant3;
  export let variant4;
  export let variant5;
  export let variant6;
  export let variant7;
  export let variant8;
  function handleClick() {
    // promise = getVariantList();
    console.log("handleClick");
    variant0 = "./images/shoe-2-1.png";
    variant1 = "./images/shoe-2-2.png";
    variant2 = "./images/shoe-2-3.png";
    variant3 = "./images/shoe-2-4.png";
    variant4 = "./images/shoe7.png";
    variant5 = "./images/shoe-2-5.png";
    variant6 = "./images/shoe-2-6.png";
    variant7 = "./images/shoe-2-7.png";
    variant8 = "./images/shoe-2-8.png";
  }

  export let variantsPromise = getVariantList();
  async function getVariantList() {
    const res = await fetch(`/api/v0/variants.json?seeds=`);
    const text = await res.text();
    console.log(text);
    if (res.ok) {
      return JSON.parse(text);
    } else {
      throw new Error(text);
    }
  }
</script>

<style>
  .variants {
    display: flex;
    flex-flow: row wrap;
    flex: 1 100%;
    background: #f1f2ed;
    justify-content: center;
    align-items: center;
    align-content: center;
    grid-gap: 0 30px;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    height: 100vh;
  }
</style>

{#await variantsPromise}
  <div>Waiting...</div>
{:then data}
  <div class="variants">
    {#each data.variants as variant}
      <Variant src={variant.src} {handleClick} />
    {/each}
  </div>
{:catch error}
  <Error {error} />
{/await}
