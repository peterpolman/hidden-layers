<template>
    <base-character :img="img" object="./objects/goblin/goblin.gltf" :character="character">
        <div slot="level">
            {{ character.lvl }}
        </div>
        <div slot="name">
            Goblin
        </div>
        <div slot="progress">
            <b-progress class="profile-hp" variant="success" :value="character.hp" :max="100" />
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
