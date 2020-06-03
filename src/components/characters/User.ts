import { mapGetters } from 'vuex';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { User } from '@/models/User';
import BaseCharacter from '@/components/BaseCharacter.vue';
import { BProgress } from 'bootstrap-vue';

const ImgAccountClass = {
    wizard: require('../../assets/img/wizard-1.png'),
    knight: require('../../assets/img/knight-1.png'),
    archer: require('../../assets/img/archer-1.png'),
};

@Component({
    name: 'User',
    components: {
        'base-character': BaseCharacter,
        'b-progress': BProgress,
    },
    computed: {
        ...mapGetters('inventory', {
            inventory: 'items',
        }),
    },
})
export default class CharacterUser extends Vue {
    @Prop() marker!: User;

    img = ImgAccountClass;
}
