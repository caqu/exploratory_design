<script>
  /**
   * In order to animate the recommendation buttons, we need to
   * set them to position:absolute and give them a left, top, width, and height.
   * This grid sets the positions_for_recommendations observable
   * based on drawing a CSS grid that captures
   * the bounding rectangles for the placeholders.
   */
  import { afterUpdate, tick } from "svelte";
  import { positions_for_recommendations } from "../app_state.js";

  let areasNode; // Parent Node Ref
  let layout_is_visible = true;
  afterUpdate(async () => {
    if (areasNode) {
      const updated_positions = {};
      areasNode.querySelectorAll("div").forEach(area => {
        const d = area.getBoundingClientRect();
        if (!d.height) debugger;
        updated_positions[area.dataset.id] = {
          className: area.dataset.id,
          width: Math.floor(d.width),
          height: Math.floor(d.height),
          left: Math.floor(d.x),
          top: Math.floor(d.y)
        };
      });
      positions_for_recommendations.set(updated_positions);
    }
    await tick;
    layout_is_visible = false;
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

{#if layout_is_visible}
  <div class="areas" bind:this={areasNode}>
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
{/if}
