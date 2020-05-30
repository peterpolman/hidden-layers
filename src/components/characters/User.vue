<template>
    <base-character
        :show="marker.target"
        :img="img[marker.class]"
        :object="`./objects/${this.marker.class}/${this.marker.class}.gltf`"
        :id="marker.id"
        :position="marker.position"
    >
        <div slot="level">
            <span>{{ marker.lvl }}</span>
        </div>
        <div slot="name">
            <span>{{ marker.name }}</span>
        </div>
        <div slot="progress">
            <b-progress class="profile-hp" variant="success" :value="marker.hp" :max="100" />
        </div>
    </base-character>
</template>
<script src="./User.ts" lang="ts"></script>
