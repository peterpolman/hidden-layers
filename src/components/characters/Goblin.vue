<template>
    <base-character :img="img" object="./objects/goblin/goblin.gltf" :marker="marker">
        <div slot="level">
            {{ marker.lvl }}
        </div>
        <div slot="name">
            Goblin
        </div>
        <div slot="progress">
            <b-progress class="profile-hp" variant="success" :value="marker.hp" :max="marker.totalHitpoints" />
        </div>
    </base-character>
</template>
<script src="./Goblin.ts" lang="ts"></script>
<style>
.image {
    width: auto;
    height: 25px;
}
</style>
