<template>
    <base-character
        :img="img[character.class]"
        :object="`./objects/${character.class}/${character.class}.gltf`"
        :character="character"
    >
        <div slot="level">
            <span>{{ character.lvl }}</span>
        </div>
        <div slot="name">
            <span>{{ character.name }}</span>
        </div>
        <div slot="progress">
            <b-progress class="profile-hp" variant="success" :value="character.hp" :max="100" />
        </div>
    </base-character>
</template>
<script src="./User.ts" lang="ts"></script>
