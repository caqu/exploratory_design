<script>
  import { afterUpdate } from "svelte";
  let areas; // Parent Node Ref
  let dimensions = []; // Array to return
  export let setDimensions = dimensionsObject => {
    console.log("Implement this IOC in the parent");
    console.log(dimensionsObject);
  };
  afterUpdate(() => {
    areas.querySelectorAll("div").forEach(area => {
      dimensions[area.dataset.id] = {
        className: area.dataset.id,
        width: area.clientWidth, // offsetWidth?
        height: area.clientHeight, // offsetHeight?
        left: area.offsetLeft,
        top: area.offsetTop
      };
    });
    setDimensions(dimensions);
  });
</script>

<style>
  .areas {
    display: grid;
    height: 100vh;
    grid-template-areas:
      "area0  area1 area2 area3"
      "area11  mine mine  area4"
      "area10  mine mine  area5"
      "area9  area8 area7 area6";
  }
  .mine {
    /* background-color: #f1f2ed; */
    grid-area: mine;
  }
  .area0 {
    /* background-color: green; */
    grid-area: area0;
  }
  .area1 {
    /* background-color: orange; */
    grid-area: area1;
  }
  .area2 {
    /* background-color: magenta; */
    grid-area: area2;
  }
  .area3 {
    /* background-color: teal; */
    grid-area: area3;
  }
  .area4 {
    /* background-color: brown; */
    grid-area: area4;
  }
  .area5 {
    /* background-color: greenyellow; */
    grid-area: area5;
  }
  .area6 {
    /* background-color: blueviolet; */
    grid-area: area6;
  }
  .area7 {
    /* background-color: blue; */
    grid-area: area7;
  }
  .area8 {
    /* background-color: olive; */
    grid-area: area8;
  }
  .area9 {
    /* background-color: peru; */
    grid-area: area9;
  }
  .area10 {
    /* background-color: mediumpurple; */
    grid-area: area10;
  }
  .area11 {
    /* background-color: violet; */
    grid-area: area11;
  }
</style>

<div class="areas" bind:this={areas}>
  <div class="mine" data-id="mine" />
  <div class="area0" data-id="area0" />
  <div class="area1" data-id="area1" />
  <div class="area2" data-id="area2" />
  <div class="area3" data-id="area3" />
  <div class="area4" data-id="area4" />
  <div class="area5" data-id="area5" />
  <div class="area6" data-id="area6" />
  <div class="area7" data-id="area7" />
  <div class="area8" data-id="area8" />
  <div class="area9" data-id="area9" />
  <div class="area10" data-id="area10" />
  <div class="area11" data-id="area11" />
</div>
