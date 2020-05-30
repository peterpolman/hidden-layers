import { Component, Vue, Prop } from 'vue-property-decorator';
import { Goblin } from '@/models/Enemies';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress } from 'bootstrap-vue';

const ImgGoblin = require('../../assets/img/goblin-1.png');

@Component({
    name: 'Goblin',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
    },
})
export default class CharacterUser extends Vue {
    @Prop() marker!: Goblin;

    img = ImgGoblin;
}
