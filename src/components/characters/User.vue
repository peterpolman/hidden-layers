<template>
    <base-character
        :img="img[marker.class]"
        :object="`./objects/${marker.class}/${marker.class}.gltf`"
        :marker="marker"
        @update:position="updatePosition($event)"
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
